package com.campusnex.hub.service;

import com.campusnex.hub.model.dto.NotificationDTO;
import com.campusnex.hub.model.entity.Booking;
import com.campusnex.hub.model.entity.Notification;
import com.campusnex.hub.model.entity.Ticket;
import com.campusnex.hub.model.entity.User;
import com.campusnex.hub.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<NotificationDTO> getForUser(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream().map(NotificationDTO::from).collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    public NotificationDTO markRead(Long notifId, Long userId) {
        Notification n = notificationRepository.findById(notifId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!n.getRecipient().getId().equals(userId))
            throw new RuntimeException("Not your notification");
        n.setRead(true);
        return NotificationDTO.from(notificationRepository.save(n));
    }

    public int markAllRead(Long userId) {
        return notificationRepository.markAllReadForUser(userId);
    }

    public int clearRead(Long userId) {
        return notificationRepository.deleteReadByUser(userId);
    }

    // Internal helpers — called by other services
    public void createBookingNotification(Booking booking, String type, String title, String message) {
        push(booking.getUser(), title, message, type, booking.getId(), "BOOKING");
    }

    public void createTicketNotification(Ticket ticket, String type, String title, String message) {
        push(ticket.getCreatedBy(), title, message, type, ticket.getId(), "TICKET");
    }

    private void push(User recipient, String title, String message,
                      String type, Long refId, String refType) {
        Notification n = Notification.builder()
                .recipient(recipient)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(refId)
                .referenceType(refType)
                .read(false)
                .build();
        notificationRepository.save(n);
    }
}
