package com.campusnex.hub.model.dto;

import com.campusnex.hub.model.entity.Booking;
import com.campusnex.hub.model.enums.BookingStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data @Builder
public class BookingDTO {
    private Long id;
    private Long userId;
    private String userName;
    private Long resourceId;
    private String resourceName;
    private String resourceLocation;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer expectedAttendees;
    private BookingStatus status;
    private String rejectionReason;
    private String approvedByName;
    private LocalDateTime actionAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BookingDTO from(Booking b) {
        return BookingDTO.builder()
                .id(b.getId())
                .userId(b.getUser().getId())
                .userName(b.getUser().getName())
                .resourceId(b.getResource().getId())
                .resourceName(b.getResource().getResourceName())
                .resourceLocation(b.getResource().getLocation())
                .bookingDate(b.getBookingDate())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .purpose(b.getPurpose())
                .expectedAttendees(b.getExpectedAttendees())
                .status(b.getStatus())
                .rejectionReason(b.getRejectionReason())
                .approvedByName(b.getApprovedBy() != null ? b.getApprovedBy().getName() : null)
                .actionAt(b.getActionAt())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }
}
