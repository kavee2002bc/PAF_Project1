package com.campusnex.hub.controller;

import com.campusnex.hub.model.dto.BookingDTO;
import com.campusnex.hub.model.dto.BookingRequest;
import com.campusnex.hub.model.dto.BookingStatusRequest;
import com.campusnex.hub.model.entity.User;
import com.campusnex.hub.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    /** GET /api/bookings — all bookings (ADMIN) */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingDTO>> getAll() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    /** GET /api/bookings/my — own bookings (USER) */
    @GetMapping("/my")
    public ResponseEntity<List<BookingDTO>> getMy(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookingService.getMyBookings(user.getId()));
    }

    /** GET /api/bookings/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        BookingDTO dto = bookingService.getById(id);
        // Users can only view their own; admins can view all
        if (!dto.getUserId().equals(user.getId())
                && user.getRole().name().equals("USER")) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(dto);
    }

    /** POST /api/bookings — create booking request */
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<BookingDTO> create(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(201).body(bookingService.create(request, user));
    }

    /** PATCH /api/bookings/{id}/status — approve/reject/cancel */
    @PatchMapping("/{id}/status")
    public ResponseEntity<BookingDTO> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody BookingStatusRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookingService.updateStatus(id, request, user));
    }
}
