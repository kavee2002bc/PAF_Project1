import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  UserCircle2,
  Mail,
  ShieldCheck,
  Hash,
  BookOpen,
  Ticket,
  CircleCheck,
  Hourglass,
  ArrowRight,
} from 'lucide-react';
import { getMyBookings } from '../../services/bookingService';
import { getMyTickets } from '../../services/ticketService';
import './StudentProfile.css';

const StudentProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    totalTickets: 0,
    openTickets: 0,
  });

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const [bookings, tickets] = await Promise.all([getMyBookings(), getMyTickets()]);
        setSummary({
          totalBookings: bookings.length,
          pendingBookings: bookings.filter((b) => b.status === 'PENDING').length,
          approvedBookings: bookings.filter((b) => b.status === 'APPROVED').length,
          totalTickets: tickets.length,
          openTickets: tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length,
        });
      } catch {
        // Keep profile usable even if summary calls fail.
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  const initials = useMemo(() => {
    const name = user?.name || 'Student User';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }, [user?.name]);

  const studentId = useMemo(() => {
    const email = user?.email || '';
    return email.split('@')[0] || 'N/A';
  }, [user?.email]);

  const emailDomain = useMemo(() => {
    const email = user?.email || '';
    return email.split('@')[1] || 'N/A';
  }, [user?.email]);

  return (
    <div className="student-profile-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Profile</h1>
          <p>Review your student account and activity snapshot.</p>
        </div>
      </div>

      <section className="card profile-hero">
        <div className="profile-hero-avatar">{initials || 'SU'}</div>
        <div className="profile-hero-main">
          <div className="profile-hero-title-row">
            <h3>{user?.name || 'Student User'}</h3>
            <span className="badge badge-accent">STUDENT</span>
          </div>
          <p>{user?.email || 'Not available'}</p>
          <div className="profile-hero-tags">
            <span className="badge badge-muted"><Hash size={12} /> {studentId}</span>
            <span className="badge badge-muted"><ShieldCheck size={12} /> {user?.role || 'USER'}</span>
          </div>
        </div>
      </section>

      <div className="student-profile-grid">
        <section className="card">
          <div className="profile-section-title">
            <UserCircle2 size={16} />
            <h4>Account Details</h4>
          </div>

          <div className="profile-detail-list">
            <div className="profile-detail-item">
              <span className="profile-detail-label"><Mail size={14} /> Email</span>
              <strong>{user?.email || 'Not available'}</strong>
            </div>

            <div className="profile-detail-item">
              <span className="profile-detail-label"><Hash size={14} /> Student ID</span>
              <strong>{studentId}</strong>
            </div>

            <div className="profile-detail-item">
              <span className="profile-detail-label"><ShieldCheck size={14} /> Role</span>
              <strong>{user?.role || 'USER'}</strong>
            </div>

            <div className="profile-detail-item">
              <span className="profile-detail-label"><Mail size={14} /> Campus Domain</span>
              <strong>{emailDomain}</strong>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="profile-section-title">
            <BookOpen size={16} />
            <h4>Activity Snapshot</h4>
          </div>

          {loading ? (
            <div className="loading-state" style={{ minHeight: '140px' }}>
              <div className="spinner" />
              <p>Loading your summary...</p>
            </div>
          ) : (
            <div className="profile-stats-grid">
              <div className="profile-stat-card">
                <div className="profile-stat-icon"><BookOpen size={15} /></div>
                <div className="profile-stat-value">{summary.totalBookings}</div>
                <div className="profile-stat-label">Total Bookings</div>
              </div>

              <div className="profile-stat-card">
                <div className="profile-stat-icon"><Hourglass size={15} /></div>
                <div className="profile-stat-value">{summary.pendingBookings}</div>
                <div className="profile-stat-label">Pending Bookings</div>
              </div>

              <div className="profile-stat-card">
                <div className="profile-stat-icon"><CircleCheck size={15} /></div>
                <div className="profile-stat-value">{summary.approvedBookings}</div>
                <div className="profile-stat-label">Approved Bookings</div>
              </div>

              <div className="profile-stat-card">
                <div className="profile-stat-icon"><Ticket size={15} /></div>
                <div className="profile-stat-value">{summary.openTickets}</div>
                <div className="profile-stat-label">Open Tickets</div>
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="card profile-actions">
        <div>
          <h4 style={{ marginBottom: '4px' }}>Quick Actions</h4>
          <p style={{ margin: 0 }}>Jump to your most-used student sections.</p>
        </div>
        <div className="profile-actions-row">
          <Link to="/bookings" className="btn btn-secondary">My Bookings <ArrowRight size={14} /></Link>
          <Link to="/tickets" className="btn btn-secondary">My Tickets <ArrowRight size={14} /></Link>
          <Link to="/resources" className="btn btn-primary">Browse Resources <ArrowRight size={14} /></Link>
          <span className="badge badge-muted">Tickets: {summary.totalTickets}</span>
          <span className="badge badge-muted">Bookings: {summary.totalBookings}</span>
        </div>
      </section>
    </div>
  );
};

export default StudentProfile;
