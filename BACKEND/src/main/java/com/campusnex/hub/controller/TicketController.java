package com.campusnex.hub.controller;

import com.campusnex.hub.model.dto.CommentDTO;
import com.campusnex.hub.model.dto.CommentRequest;
import com.campusnex.hub.model.dto.TicketDTO;
import com.campusnex.hub.model.dto.TicketRequest;
import com.campusnex.hub.model.dto.TicketStatusRequest;
import com.campusnex.hub.model.entity.User;
import com.campusnex.hub.service.FileStorageService;
import com.campusnex.hub.service.TicketService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final FileStorageService fileStorageService;
    private final ObjectMapper objectMapper;

    /** GET /api/tickets — all tickets (ADMIN / TECHNICIAN) */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TECHNICIAN')")
    public ResponseEntity<List<TicketDTO>> getAll() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    /** GET /api/tickets/my */
    @GetMapping("/my")
    public ResponseEntity<List<TicketDTO>> getMy(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ticketService.getMyTickets(user.getId()));
    }

    /** GET /api/tickets/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<TicketDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getById(id));
    }

    /**
     * POST /api/tickets — multipart: "data" (JSON TicketRequest) + optional "files" (up to 3 images)
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketDTO> create(
            @RequestPart("data") String ticketJson,
            @RequestPart(value = "files", required = false) MultipartFile[] files,
            @AuthenticationPrincipal User user) throws Exception {

        TicketRequest req = objectMapper.readValue(ticketJson, TicketRequest.class);

        List<String> attachments = List.of();
        if (files != null && files.length > 3) {
            throw new IllegalArgumentException("Maximum 3 attachments allowed.");
        }
        if (files != null) {
            attachments = fileStorageService.storeFiles(files);
        }
        return ResponseEntity.status(201).body(ticketService.create(req, user, attachments));
    }

    /** PATCH /api/tickets/{id}/status */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','TECHNICIAN')")
    public ResponseEntity<TicketDTO> updateStatus(
            @PathVariable Long id,
            @RequestBody TicketStatusRequest req,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ticketService.updateStatus(id, req, user));
    }

    /** POST /api/tickets/{id}/comments */
    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentDTO> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest req,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(201).body(ticketService.addComment(id, req, user));
    }

    /** PUT /api/tickets/{ticketId}/comments/{commentId} */
    @PutMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<CommentDTO> editComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest req,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ticketService.editComment(ticketId, commentId, req, user));
    }

    /** DELETE /api/tickets/{ticketId}/comments/{commentId} */
    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal User user) {
        ticketService.deleteComment(ticketId, commentId, user);
        return ResponseEntity.noContent().build();
    }
}
