package com.campusnex.hub.controller;

import com.campusnex.hub.model.dto.NotificationDTO;
import com.campusnex.hub.model.entity.User;
import com.campusnex.hub.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /** GET /api/notifications */
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(notificationService.getForUser(user.getId()));
    }

    /** GET /api/notifications/unread-count */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(user.getId())));
    }

    /** PATCH /api/notifications/{id}/read */
    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markRead(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(notificationService.markRead(id, user.getId()));
    }

    /** PATCH /api/notifications/read-all */
    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, Integer>> markAllRead(@AuthenticationPrincipal User user) {
        int count = notificationService.markAllRead(user.getId());
        return ResponseEntity.ok(Map.of("markedRead", count));
    }

    /** DELETE /api/notifications/read — clear all read notifications */
    @DeleteMapping("/read")
    public ResponseEntity<Map<String, Integer>> clearRead(@AuthenticationPrincipal User user) {
        int count = notificationService.clearRead(user.getId());
        return ResponseEntity.ok(Map.of("deleted", count));
    }
}
