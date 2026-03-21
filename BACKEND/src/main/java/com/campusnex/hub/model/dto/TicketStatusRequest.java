package com.campusnex.hub.model.dto;

import com.campusnex.hub.model.enums.TicketStatus;
import lombok.Data;

@Data
public class TicketStatusRequest {
    private TicketStatus status;
    private String notes;          // resolution notes
    private String rejectionReason;
    private Long assignedToId;     // optional reassign
}
