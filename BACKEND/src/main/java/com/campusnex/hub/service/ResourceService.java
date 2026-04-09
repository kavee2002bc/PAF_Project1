package com.campusnex.hub.service;

import com.campusnex.hub.exception.ResourceNotFoundException;
import com.campusnex.hub.model.dto.ResourceDTO;
import com.campusnex.hub.model.dto.ResourceRequest;
import com.campusnex.hub.model.entity.Resource;
import com.campusnex.hub.model.entity.User;
import com.campusnex.hub.model.enums.ResourceStatus;
import com.campusnex.hub.model.enums.ResourceType;
import com.campusnex.hub.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public List<ResourceDTO> getAllResources(String type, String status, String location, Integer minCapacity) {
        ResourceType rType = null;
        ResourceStatus rStatus = null;
        try { if (type   != null) rType   = ResourceType.valueOf(type.toUpperCase()); } catch (Exception ignored) {}
        try { if (status != null) rStatus = ResourceStatus.valueOf(status.toUpperCase()); } catch (Exception ignored) {}

        return resourceRepository.searchResources(rType, rStatus, location, minCapacity)
                .stream().map(ResourceDTO::from).collect(Collectors.toList());
    }

    public ResourceDTO getById(Long id) {
        return ResourceDTO.from(findOrThrow(id));
    }

    public ResourceDTO create(ResourceRequest req, User createdBy) {
        if (resourceRepository.existsByResourceCode(req.getResourceCode())) {
            throw new IllegalArgumentException("Resource code '" + req.getResourceCode() + "' already exists.");
        }
        Resource resource = Resource.builder()
                .resourceName(req.getResourceName())
                .resourceCode(req.getResourceCode())
                .type(req.getType())
                .description(req.getDescription())
                .capacity(req.getCapacity())
                .location(req.getLocation())
                .floor(req.getFloor())
                .status(req.getStatus() != null ? req.getStatus() : ResourceStatus.ACTIVE)
                .availabilityStart(req.getAvailabilityStart())
                .availabilityEnd(req.getAvailabilityEnd())
                .imageUrl(req.getImageUrl())
                .createdBy(createdBy)
                .build();
        return ResourceDTO.from(resourceRepository.save(resource));
    }

    public ResourceDTO update(Long id, ResourceRequest req) {
        Resource resource = findOrThrow(id);
        if (!resource.getResourceCode().equals(req.getResourceCode())
                && resourceRepository.existsByResourceCode(req.getResourceCode())) {
            throw new IllegalArgumentException("Resource code '" + req.getResourceCode() + "' is already taken.");
        }
        resource.setResourceName(req.getResourceName());
        resource.setResourceCode(req.getResourceCode());
        resource.setType(req.getType());
        resource.setDescription(req.getDescription());
        resource.setCapacity(req.getCapacity());
        resource.setLocation(req.getLocation());
        resource.setFloor(req.getFloor());
        if (req.getStatus() != null) resource.setStatus(req.getStatus());
        resource.setAvailabilityStart(req.getAvailabilityStart());
        resource.setAvailabilityEnd(req.getAvailabilityEnd());
        resource.setImageUrl(req.getImageUrl());
        return ResourceDTO.from(resourceRepository.save(resource));
    }

    public void delete(Long id) {
        Resource resource = findOrThrow(id);
        resource.setStatus(ResourceStatus.OUT_OF_SERVICE);
        resourceRepository.save(resource); // soft delete
    }

    private Resource findOrThrow(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }
}
