package com.campusnex.hub.model.entity;

import com.campusnex.hub.model.enums.ResourceStatus;
import com.campusnex.hub.model.enums.ResourceType;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "resources")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "resource_name", nullable = false)
    private String resourceName;

    @NotBlank
    @Column(name = "resource_code", nullable = false, unique = true)
    private String resourceCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceType type;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Min(0)
    private Integer capacity;

    @NotBlank
    private String location;

    private String floor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ResourceStatus status = ResourceStatus.ACTIVE;

    @Column(name = "availability_start")
    private String availabilityStart;   // "HH:mm"

    @Column(name = "availability_end")
    private String availabilityEnd;     // "HH:mm"

    @Column(name = "image_url")
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
