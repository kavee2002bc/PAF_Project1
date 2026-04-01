import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationPanel from './NotificationPanel';
import { Bell, Settings2, LogOut, Landmark, UserCircle2 } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ onMenuClick }) => {
  const { user, logout, isAdmin, isUser } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={onMenuClick} aria-label="Toggle sidebar">
          <span /><span /><span />
        </button>
        <Link to="/dashboard" className="navbar-brand">
          <div className="brand-icon"><Landmark size={18} /></div>
          <div>
            <div className="brand-name">CampusNex</div>
            <div className="brand-sub">Operations Hub</div>
          </div>
        </Link>
      </div>

      <div className="navbar-right">
        {/* Notification Bell */}
        <button
          className="icon-btn notif-btn"
          onClick={() => { setShowNotif(!showNotif); setShowUserMenu(false); }}
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>

        {/* User Menu */}
        <div className="user-menu-wrap">
          <button
            className="user-btn"
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotif(false); }}
          >
            <img src={user?.profilePicture} alt={user?.name} className="avatar" onError={e => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`; }} />
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className={`role-badge ${user?.role?.toLowerCase()}`}>{user?.role}</span>
            </div>
            <span className="chevron">▾</span>
          </button>

          {showUserMenu && (
            <div className="dropdown-menu" onClick={() => setShowUserMenu(false)}>
              <div className="dropdown-header">
                <div className="user-name-full">{user?.name}</div>
                <div className="user-email">{user?.email}</div>
              </div>
              <div className="dropdown-divider" />
              {isUser && <Link to="/profile" className="dropdown-item"><UserCircle2 size={14} /> My Profile</Link>}
              {isAdmin && <Link to="/admin" className="dropdown-item"><Settings2 size={14} /> Admin Panel</Link>}
              <button className="dropdown-item danger" onClick={handleLogout}><LogOut size={14} /> Sign Out</button>
            </div>
          )}
        </div>
      </div>

      {/* Notification Panel */}
      {showNotif && <NotificationPanel onClose={() => setShowNotif(false)} />}
    </nav>
  );
};

export default Navbar;
