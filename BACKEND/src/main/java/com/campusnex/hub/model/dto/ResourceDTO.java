package com.campusnex.hub.model.dto;

import com.campusnex.hub.model.entity.Resource;
import com.campusnex.hub.model.enums.ResourceStatus;
import com.campusnex.hub.model.enums.ResourceType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class ResourceDTO {
    private Long id;
    private String resourceName;
    private String resourceCode;
    private ResourceType type;
    private String description;
    private Integer capacity;
    private String location;
    private String floor;
    private ResourceStatus status;
    private String availabilityStart;
    private String availabilityEnd;
    private String imageUrl;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ResourceDTO from(Resource r) {
        return ResourceDTO.builder()
                .id(r.getId())
                .resourceName(r.getResourceName())
                .resourceCode(r.getResourceCode())
                .type(r.getType())
                .description(r.getDescription())
                .capacity(r.getCapacity())
                .location(r.getLocation())
                .floor(r.getFloor())
                .status(r.getStatus())
                .availabilityStart(r.getAvailabilityStart())
                .availabilityEnd(r.getAvailabilityEnd())
                .imageUrl(r.getImageUrl())
                .createdByName(r.getCreatedBy() != null ? r.getCreatedBy().getName() : null)
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
