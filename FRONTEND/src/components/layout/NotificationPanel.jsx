import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, CheckCircle2, XCircle, Ban, Wrench, MessageCircle, Bookmark } from 'lucide-react';
import './NotificationPanel.css';

const typeIcon = {
  BOOKING_APPROVED: CheckCircle2,
  BOOKING_REJECTED: XCircle,
  BOOKING_CANCELLED: Ban,
  TICKET_UPDATED:   Wrench,
  NEW_COMMENT:      MessageCircle,
};

const NotificationPanel = ({ onClose }) => {
  const { notifications, markRead, markAllRead, clearRead } = useNotifications();
  const navigate  = useNavigate();
  const panelRef  = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleClick = async (notif) => {
    if (!notif.read) await markRead(notif.id);
    onClose();
    if (notif.referenceType === 'BOOKING') navigate('/bookings');
    if (notif.referenceType === 'TICKET')  navigate(`/tickets/${notif.referenceId}`);
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)   return 'just now';
    if (m < 60)  return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24)  return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="notif-panel" ref={panelRef}>
      <div className="notif-header">
        <span className="notif-title"><Bell size={16} /> Notifications</span>
        <div className="notif-actions">
          <button onClick={markAllRead} className="notif-action-btn">Mark all read</button>
          <button onClick={clearRead}   className="notif-action-btn muted">Clear read</button>
        </div>
      </div>

      <div className="notif-list">
        {notifications.length === 0 ? (
          <div className="notif-empty">
            <div className="empty-icon"><Bell size={24} /></div>
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`notif-item ${!n.read ? 'unread' : ''}`}
              onClick={() => handleClick(n)}
            >
              <div className="notif-icon">{typeIcon[n.type] ? React.createElement(typeIcon[n.type], { size: 16 }) : <Bookmark size={16} />}</div>
              <div className="notif-body">
                <div className="notif-item-title">{n.title}</div>
                <div className="notif-message">{n.message}</div>
                <div className="notif-time">{timeAgo(n.createdAt)}</div>
              </div>
              {!n.read && <div className="notif-dot" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
