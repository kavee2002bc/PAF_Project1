import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Building2, CalendarDays, Wrench, Settings2 } from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard',   roles: ['USER','ADMIN','TECHNICIAN'] },
  { to: '/resources', icon: Building2,       label: 'Resources',    roles: ['USER','ADMIN','TECHNICIAN'] },
  { to: '/bookings',  icon: CalendarDays,    label: 'My Bookings',  roles: ['USER','ADMIN'] },
  { to: '/tickets',   icon: Wrench,          label: 'Tickets',      roles: ['USER','ADMIN','TECHNICIAN'] },
  { to: '/admin',     icon: Settings2,       label: 'Admin Panel',  roles: ['ADMIN'] },
];

const Sidebar = ({ isOpen }) => {
  const { user } = useAuth();

  const visibleItems = navItems.filter(
    item => item.roles.includes(user?.role)
  );

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      <nav className="sidebar-nav">
        <div className="nav-section-label">NAVIGATION</div>
        {visibleItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon"><item.icon size={18} /></span>
            {isOpen && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {isOpen && (
        <div className="sidebar-footer">
          <div className="system-status">
            <span className="status-dot" />
            <span>System Online</span>
          </div>
          <div className="sidebar-version">v1.0.0 · CampusNex</div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
