package com.campusnex.hub.model.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BookingRequest {

    @NotNull(message = "Resource ID is required")
    private Long resourceId;

    @NotNull(message = "Booking date is required")
    @FutureOrPresent(message = "Booking date must be today or in the future")
    private LocalDate bookingDate;

    @NotBlank(message = "Start time is required")              // "HH:mm"
    private String startTime;

    @NotBlank(message = "End time is required")
    private String endTime;

    @NotBlank(message = "Purpose is required")
    @Size(max = 500)
    private String purpose;

    @Min(value = 0, message = "Expected attendees cannot be negative")
    private Integer expectedAttendees;
}
