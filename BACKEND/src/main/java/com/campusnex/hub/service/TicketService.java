package com.campusnex.hub.service;

import com.campusnex.hub.exception.ResourceNotFoundException;
import com.campusnex.hub.model.dto.CommentDTO;
import com.campusnex.hub.model.dto.CommentRequest;
import com.campusnex.hub.model.dto.TicketDTO;
import com.campusnex.hub.model.dto.TicketRequest;
import com.campusnex.hub.model.dto.TicketStatusRequest;
import com.campusnex.hub.model.entity.Comment;
import com.campusnex.hub.model.entity.Resource;
import com.campusnex.hub.model.entity.Ticket;
import com.campusnex.hub.model.entity.User;
import com.campusnex.hub.model.enums.TicketPriority;
import com.campusnex.hub.model.enums.TicketStatus;
import com.campusnex.hub.repository.CommentRepository;
import com.campusnex.hub.repository.ResourceRepository;
import com.campusnex.hub.repository.TicketRepository;
import com.campusnex.hub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public List<TicketDTO> getAllTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(TicketDTO::from).collect(Collectors.toList());
    }

    public List<TicketDTO> getMyTickets(Long userId) {
        return ticketRepository.findByCreatedByIdOrderByCreatedAtDesc(userId)
                .stream().map(TicketDTO::from).collect(Collectors.toList());
    }

    public TicketDTO getById(Long id) {
        return TicketDTO.from(findOrThrow(id));
    }

    @Transactional
    public TicketDTO create(TicketRequest req, User user, List<String> attachmentPaths) {
        Resource resource = null;
        if (req.getResourceId() != null) {
            resource = resourceRepository.findById(req.getResourceId()).orElse(null);
        }

        Ticket ticket = Ticket.builder()
                .createdBy(user)
                .resource(resource)
                .location(req.getLocation())
                .category(req.getCategory())
                .description(req.getDescription())
                .priority(req.getPriority() != null ? req.getPriority() : TicketPriority.MEDIUM)
                .preferredContact(req.getPreferredContact())
                .attachmentUrls(attachmentPaths != null && !attachmentPaths.isEmpty()
                        ? String.join(",", attachmentPaths) : null)
                .build();

        return TicketDTO.from(ticketRepository.save(ticket));
    }

    @Transactional
    public TicketDTO updateStatus(Long id, TicketStatusRequest req, User actor) {
        Ticket ticket = findOrThrow(id);
        TicketStatus newStatus = req.getStatus();

        if (newStatus != null) {
            ticket.setStatus(newStatus);
            if (newStatus == TicketStatus.RESOLVED || newStatus == TicketStatus.CLOSED) {
                ticket.setResolvedAt(LocalDateTime.now());
                if (req.getNotes() != null) ticket.setResolutionNotes(req.getNotes());
            }
            if (newStatus == TicketStatus.REJECTED && req.getRejectionReason() != null) {
                ticket.setRejectionReason(req.getRejectionReason());
            }

            // Notify ticket creator
            notificationService.createTicketNotification(ticket, "TICKET_UPDATED",
                    "Ticket Status Updated",
                    "Your ticket #" + ticket.getId() + " is now " + newStatus.name()
                            + (req.getNotes() != null ? ". Notes: " + req.getNotes() : ""));
        }

        // Reassign technician
        if (req.getAssignedToId() != null) {
            User tech = userRepository.findById(req.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + req.getAssignedToId()));
            ticket.setAssignedTo(tech);
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }

        return TicketDTO.from(ticketRepository.save(ticket));
    }

    @Transactional
    public CommentDTO addComment(Long ticketId, CommentRequest req, User author) {
        Ticket ticket = findOrThrow(ticketId);
        Comment comment = Comment.builder()
                .ticket(ticket)
                .author(author)
                .text(req.getText())
                .build();
        Comment saved = commentRepository.save(comment);

        // Notify ticket owner if commenter is different
        if (!ticket.getCreatedBy().getId().equals(author.getId())) {
            notificationService.createTicketNotification(ticket, "NEW_COMMENT",
                    "New Comment on Your Ticket",
                    author.getName() + " commented on ticket #" + ticketId + ": \"" + req.getText() + "\"");
        }
        return CommentDTO.from(saved);
    }

    @Transactional
    public CommentDTO editComment(Long ticketId, Long commentId, CommentRequest req, User editor) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
        if (!comment.getTicket().getId().equals(ticketId))
            throw new IllegalArgumentException("Comment does not belong to this ticket.");
        if (!comment.getAuthor().getId().equals(editor.getId()))
            throw new AccessDeniedException("You can only edit your own comments.");
        comment.setText(req.getText());
        return CommentDTO.from(commentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(Long ticketId, Long commentId, User editor) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
        if (!comment.getTicket().getId().equals(ticketId))
            throw new IllegalArgumentException("Comment does not belong to this ticket.");
        if (!comment.getAuthor().getId().equals(editor.getId()))
            throw new AccessDeniedException("You can only delete your own comments.");
        commentRepository.delete(comment);
    }

    private Ticket findOrThrow(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
    }
}
