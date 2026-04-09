package com.campusnex.hub.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentRequest {
    @NotBlank(message = "Comment text cannot be blank")
    private String text;
}
