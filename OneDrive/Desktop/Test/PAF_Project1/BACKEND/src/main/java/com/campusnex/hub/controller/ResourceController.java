package com.campusnex.hub.controller;

import com.campusnex.hub.model.dto.ResourceDTO;
import com.campusnex.hub.model.dto.ResourceRequest;
import com.campusnex.hub.model.entity.User;
import com.campusnex.hub.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    /** GET /api/resources?type=LAB&status=ACTIVE&location=Science&minCapacity=20 */
    @GetMapping
    public ResponseEntity<List<ResourceDTO>> getAll(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity) {
        return ResponseEntity.ok(resourceService.getAllResources(type, status, location, minCapacity));
    }

    /** GET /api/resources/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<ResourceDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getById(id));
    }

    /** POST /api/resources (ADMIN only) */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceDTO> create(
            @Valid @RequestBody ResourceRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(201).body(resourceService.create(request, user));
    }

    /** PUT /api/resources/{id} (ADMIN only) */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.ok(resourceService.update(id, request));
    }

    /** DELETE /api/resources/{id} — soft delete sets OUT_OF_SERVICE (ADMIN only) */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        resourceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
