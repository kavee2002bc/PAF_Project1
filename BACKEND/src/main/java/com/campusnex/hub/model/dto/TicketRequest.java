package com.campusnex.hub.model.dto;

import com.campusnex.hub.model.enums.TicketCategory;
import com.campusnex.hub.model.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketRequest {
    private Long resourceId;            // optional
    private String location;            // free-text fallback

    @NotNull(message = "Category is required")
    private TicketCategory category;

    @NotBlank(message = "Description is required")
    private String description;

    private TicketPriority priority;

    private String preferredContact;
}
