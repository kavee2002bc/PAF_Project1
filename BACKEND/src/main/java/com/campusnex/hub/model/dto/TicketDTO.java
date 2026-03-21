package com.campusnex.hub.model.dto;

import com.campusnex.hub.model.entity.Comment;
import com.campusnex.hub.model.entity.Ticket;
import com.campusnex.hub.model.enums.TicketCategory;
import com.campusnex.hub.model.enums.TicketPriority;
import com.campusnex.hub.model.enums.TicketStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Data @Builder
public class TicketDTO {
    private Long id;
    private Long createdById;
    private String createdByName;
    private Long resourceId;
    private String resourceName;
    private String location;
    private TicketCategory category;
    private String description;
    private TicketPriority priority;
    private TicketStatus status;
    private String preferredContact;
    private List<String> attachmentUrls;
    private Long assignedToId;
    private String assignedToName;
    private String resolutionNotes;
    private String rejectionReason;
    private List<CommentDTO> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    public static TicketDTO from(Ticket t) {
        List<String> urls = (t.getAttachmentUrls() != null && !t.getAttachmentUrls().isBlank())
                ? Arrays.asList(t.getAttachmentUrls().split(","))
                : Collections.emptyList();

        List<CommentDTO> commentDTOs = t.getComments() == null ? Collections.emptyList() :
                t.getComments().stream().map(CommentDTO::from).collect(Collectors.toList());

        return TicketDTO.builder()
                .id(t.getId())
                .createdById(t.getCreatedBy().getId())
                .createdByName(t.getCreatedBy().getName())
                .resourceId(t.getResource() != null ? t.getResource().getId() : null)
                .resourceName(t.getResource() != null ? t.getResource().getResourceName() : null)
                .location(t.getLocation())
                .category(t.getCategory())
                .description(t.getDescription())
                .priority(t.getPriority())
                .status(t.getStatus())
                .preferredContact(t.getPreferredContact())
                .attachmentUrls(urls)
                .assignedToId(t.getAssignedTo() != null ? t.getAssignedTo().getId() : null)
                .assignedToName(t.getAssignedTo() != null ? t.getAssignedTo().getName() : null)
                .resolutionNotes(t.getResolutionNotes())
                .rejectionReason(t.getRejectionReason())
                .comments(commentDTOs)
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .resolvedAt(t.getResolvedAt())
                .build();
    }
}
