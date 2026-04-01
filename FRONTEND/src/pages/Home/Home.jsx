import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getResources } from '../../services/resourceService';
import { getMyBookings, getAllBookings } from '../../services/bookingService';
import { getMyTickets, getAllTickets } from '../../services/ticketService';

const StatCard = ({ icon, label, value, color, to }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="stat-info">
        <div className="stat-value">{value ?? '—'}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  </Link>
);

const Home = () => {
  const { user, isAdmin, isTechnician } = useAuth();
  const [resources, setResources] = useState([]);
  const [bookings,  setBookings]  = useState([]);
  const [tickets,   setTickets]   = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [r, b, t] = await Promise.all([
          getResources(),
          isAdmin ? getAllBookings() : getMyBookings(),
          (isAdmin || isTechnician) ? getAllTickets() : getMyTickets(),
        ]);
        setResources(r); setBookings(b); setTickets(t);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, [isAdmin, isTechnician]);

  const activeResources = resources.filter(r => r.status === 'ACTIVE').length;
  const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
  const openTickets     = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
  const approvedBookings= bookings.filter(b => b.status === 'APPROVED').length;

  const recentBookings = [...bookings].slice(0, 5);
  const recentTickets  = [...tickets].slice(0, 5);

  const statusBadge = (status) => {
    const map = {
      PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger', CANCELLED: 'muted',
      OPEN: 'info', IN_PROGRESS: 'warning', RESOLVED: 'success', CLOSED: 'muted',
    };
    return <span className={`badge badge-${map[status] || 'muted'}`}>{status}</span>;
  };

  if (loading) return <div className="loading-state"><div className="spinner" /><p>Loading dashboard...</p></div>;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>👋 Welcome, {user?.name?.split(' ')[0]}!</h1>
          <p>Here's your campus operations overview for today.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/resources" className="btn btn-secondary">🏢 Browse Resources</Link>
          <Link to="/tickets/new" className="btn btn-primary">🔧 Report Issue</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon="🏢" label="Active Resources" value={activeResources} color="accent" to="/resources" />
        <StatCard icon="⏳" label="Pending Bookings" value={pendingBookings} color="warning" to="/bookings" />
        <StatCard icon="✅" label="Approved Bookings" value={approvedBookings} color="success" to="/bookings" />
        <StatCard icon="🔧" label="Open Tickets" value={openTickets} color="danger" to="/tickets" />
      </div>

      {/* Recent Activity */}
      <div className="grid-2" style={{ marginTop: '24px' }}>
        {/* Recent Bookings */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
            <h3>📅 Recent Bookings</h3>
            <Link to="/bookings" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-icon">📅</div>
              <p>No bookings yet. <Link to="/resources">Book a resource</Link></p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentBookings.map(b => (
                <div key={b.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'10px 12px', background:'var(--bg-surface)', borderRadius:'var(--radius-md)',
                  border:'1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:'13.5px', color:'var(--text-primary)' }}>{b.resourceName}</div>
                    <div style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'2px' }}>
                      {b.bookingDate} · {b.startTime?.slice(0,5)}–{b.endTime?.slice(0,5)}
                    </div>
                  </div>
                  {statusBadge(b.status)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tickets */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
            <h3>🎫 Recent Tickets</h3>
            <Link to="/tickets" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          {recentTickets.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-icon">🎫</div>
              <p>No tickets yet. <Link to="/tickets/new">Report an issue</Link></p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentTickets.map(t => (
                <Link key={t.id} to={`/tickets/${t.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                    padding:'10px 12px', background:'var(--bg-surface)', borderRadius:'var(--radius-md)',
                    border:'1px solid var(--border-subtle)', transition:'var(--transition)' }}
                    onMouseOver={e => e.currentTarget.style.borderColor='var(--accent)'}
                    onMouseOut={e  => e.currentTarget.style.borderColor='var(--border-subtle)'}
                  >
                    <div>
                      <div style={{ fontWeight:600, fontSize:'13.5px', color:'var(--text-primary)', textTransform:'capitalize' }}>
                        {t.category?.replace('_',' ')} — #{t.id}
                      </div>
                      <div style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'2px' }}>
                        {t.description?.slice(0, 50)}{t.description?.length > 50 ? '…' : ''}
                      </div>
                    </div>
                    {statusBadge(t.status)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>⚡ Quick Actions</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/resources" className="btn btn-secondary">🏢 Browse Resources</Link>
          <Link to="/bookings"  className="btn btn-secondary">📅 My Bookings</Link>
          <Link to="/tickets/new" className="btn btn-primary">🔧 Report Maintenance Issue</Link>
          {isAdmin && <Link to="/admin" className="btn btn-secondary">⚙️ Admin Panel</Link>}
        </div>
      </div>
    </div>
  );
};

export default Home;
