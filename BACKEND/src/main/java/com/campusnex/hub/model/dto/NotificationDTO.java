package com.campusnex.hub.model.dto;

import com.campusnex.hub.model.entity.Notification;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class NotificationDTO {
    private Long id;
    private String title;
    private String message;
    private String type;
    private Long referenceId;
    private String referenceType;
    private boolean read;
    private LocalDateTime createdAt;

    public static NotificationDTO from(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .referenceId(n.getReferenceId())
                .referenceType(n.getReferenceType())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
