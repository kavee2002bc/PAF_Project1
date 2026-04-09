package com.campusnex.hub.model.dto;

import com.campusnex.hub.model.entity.Comment;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class CommentDTO {
    private Long id;
    private Long authorId;
    private String authorName;
    private String authorRole;
    private String text;
    private boolean edited;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CommentDTO from(Comment c) {
        return CommentDTO.builder()
                .id(c.getId())
                .authorId(c.getAuthor().getId())
                .authorName(c.getAuthor().getName())
                .authorRole(c.getAuthor().getRole().name())
                .text(c.getText())
                .edited(c.isEdited())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
