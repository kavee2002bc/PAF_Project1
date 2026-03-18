package com.campusnex.hub.model.dto;

import com.campusnex.hub.model.enums.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingStatusRequest {
    @NotNull(message = "Status is required")
    private BookingStatus status;

    private String reason; // required for REJECTED
}
