package com.campusnex.hub.model.dto;

import com.campusnex.hub.model.enums.ResourceStatus;
import com.campusnex.hub.model.enums.ResourceType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ResourceRequest {

    @NotBlank(message = "Resource name is required")
    private String resourceName;

    @NotBlank(message = "Resource code is required")
    private String resourceCode;

    @NotNull(message = "Resource type is required")
    private ResourceType type;

    private String description;

    @Min(value = 0, message = "Capacity cannot be negative")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String floor;

    private ResourceStatus status;

    private String availabilityStart;
    private String availabilityEnd;
    private String imageUrl;
}
