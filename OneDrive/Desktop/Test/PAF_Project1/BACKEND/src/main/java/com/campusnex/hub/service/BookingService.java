package com.campusnex.hub.service;

import com.campusnex.hub.exception.BookingConflictException;
import com.campusnex.hub.exception.ResourceNotFoundException;
import com.campusnex.hub.model.dto.BookingDTO;
import com.campusnex.hub.model.dto.BookingRequest;
import com.campusnex.hub.model.dto.BookingStatusRequest;
import com.campusnex.hub.model.entity.Booking;
import com.campusnex.hub.model.entity.Resource;
import com.campusnex.hub.model.entity.User;
import com.campusnex.hub.model.enums.BookingStatus;
import com.campusnex.hub.model.enums.Role;
import com.campusnex.hub.model.enums.ResourceStatus;
import com.campusnex.hub.repository.BookingRepository;
import com.campusnex.hub.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(BookingDTO::from).collect(Collectors.toList());
    }

    public List<BookingDTO> getMyBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(BookingDTO::from).collect(Collectors.toList());
    }

    public BookingDTO getById(Long id) {
        return BookingDTO.from(findOrThrow(id));
    }

    @Transactional
    public BookingDTO create(BookingRequest req, User user) {
        if (user.getRole() != Role.USER) {
            throw new IllegalStateException("Only USER role can create bookings.");
        }

        Resource resource = resourceRepository.findById(req.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + req.getResourceId()));

        if (resource.getStatus() == ResourceStatus.OUT_OF_SERVICE) {
            throw new IllegalStateException("Resource is currently out of service.");
        }

        LocalTime startTime = LocalTime.parse(req.getStartTime());
        LocalTime endTime   = LocalTime.parse(req.getEndTime());

        if (!endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("End time must be after start time.");
        }

        boolean conflict = bookingRepository.existsConflict(
                resource.getId(), req.getBookingDate(), startTime, endTime, -1L);
        if (conflict) {
            throw new BookingConflictException(
                    "This resource is already booked for the selected time slot. Please choose a different time.");
        }

        Booking booking = Booking.builder()
                .user(user)
                .resource(resource)
                .bookingDate(req.getBookingDate())
                .startTime(startTime)
                .endTime(endTime)
                .purpose(req.getPurpose())
                .expectedAttendees(req.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .build();

        return BookingDTO.from(bookingRepository.save(booking));
    }

    @Transactional
    public BookingDTO updateStatus(Long id, BookingStatusRequest req, User admin) {
        Booking booking = findOrThrow(id);

        switch (req.getStatus()) {
            case APPROVED -> {
                if (booking.getStatus() != BookingStatus.PENDING)
                    throw new IllegalStateException("Only PENDING bookings can be approved.");
                booking.setStatus(BookingStatus.APPROVED);
                booking.setApprovedBy(admin);
                booking.setActionAt(LocalDateTime.now());
                notificationService.createBookingNotification(booking, "BOOKING_APPROVED",
                        "Booking Approved 🎉",
                        "Your booking for " + booking.getResource().getResourceName()
                                + " on " + booking.getBookingDate() + " has been approved.");
            }
            case REJECTED -> {
                if (booking.getStatus() != BookingStatus.PENDING)
                    throw new IllegalStateException("Only PENDING bookings can be rejected.");
                if (req.getReason() == null || req.getReason().isBlank())
                    throw new IllegalArgumentException("Rejection reason is required.");
                booking.setStatus(BookingStatus.REJECTED);
                booking.setRejectionReason(req.getReason());
                booking.setApprovedBy(admin);
                booking.setActionAt(LocalDateTime.now());
                notificationService.createBookingNotification(booking, "BOOKING_REJECTED",
                        "Booking Rejected",
                        "Your booking for " + booking.getResource().getResourceName()
                                + " was rejected. Reason: " + req.getReason());
            }
            case CANCELLED -> {
                if (booking.getStatus() != BookingStatus.APPROVED && booking.getStatus() != BookingStatus.PENDING)
                    throw new IllegalStateException("Only APPROVED or PENDING bookings can be cancelled.");
                booking.setStatus(BookingStatus.CANCELLED);
                notificationService.createBookingNotification(booking, "BOOKING_CANCELLED",
                        "Booking Cancelled",
                        "Your booking for " + booking.getResource().getResourceName() + " has been cancelled.");
            }
            default -> throw new IllegalArgumentException("Invalid status transition.");
        }

        return BookingDTO.from(bookingRepository.save(booking));
    }

    private Booking findOrThrow(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
    }
}
