import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllBookings, updateBookingStatus } from '../../services/bookingService';
import { getAllTickets } from '../../services/ticketService';
import { getResources } from '../../services/resourceService';
import { Settings2, Hourglass, Ticket, Building2, BadgeCheck, CalendarDays, Wrench, CircleX, CheckCircle2, X } from 'lucide-react';

const AdminBookingDashboard = () => {
  const [bookings,   setBookings]  = useState([]);
  const [tickets,    setTickets]   = useState([]);
  const [resources,  setResources] = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [activeTab,  setActiveTab] = useState('bookings');
  const [modal,      setModal]     = useState(null);
  const [reason,     setReason]    = useState('');
  const [submitting, setSubmitting]= useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [b, t, r] = await Promise.all([getAllBookings(), getAllTickets(), getResources()]);
      setBookings(b); setTickets(t); setResources(r);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const openTickets     = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS');
  const activeResources = resources.filter(r => r.status === 'ACTIVE').length;

  const handleAction = async () => {
    const { booking, action } = modal;
    if (action === 'REJECTED' && !reason.trim()) { alert('Reason required'); return; }
    setSubmitting(true);
    try { await updateBookingStatus(booking.id, action, reason); setModal(null); setReason(''); load(); }
    catch (err) { alert(err.response?.data?.message || 'Action failed.'); }
    finally { setSubmitting(false); }
  };

  const STATUS_COLOR = { PENDING:'warning', APPROVED:'success', REJECTED:'danger', CANCELLED:'muted' };

  if (loading) return <div className="loading-state"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Admin Dashboard</h1>
          <p>Manage bookings, tickets, and campus resources.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom:'28px' }}>
        <div className="stat-card">
          <div className="stat-icon warning"><Hourglass size={18} /></div>
          <div className="stat-info">
            <div className="stat-value">{pendingBookings.length}</div>
            <div className="stat-label">Pending Approvals</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon danger"><Ticket size={18} /></div>
          <div className="stat-info">
            <div className="stat-value">{openTickets.length}</div>
            <div className="stat-label">Active Tickets</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon accent"><Building2 size={18} /></div>
          <div className="stat-info">
            <div className="stat-value">{activeResources}</div>
            <div className="stat-label">Active Resources</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success"><BadgeCheck size={18} /></div>
          <div className="stat-info">
            <div className="stat-value">{bookings.filter(b => b.status === 'APPROVED').length}</div>
            <div className="stat-label">Approved Bookings</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'20px', borderBottom:'1px solid var(--border)', paddingBottom:'0' }}>
        {[
          { key:'bookings', label:`Bookings (${pendingBookings.length} pending)` },
          { key:'tickets',  label:`Tickets (${openTickets.length} active)` },
          { key:'resources',label:`Resources (${resources.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ padding:'10px 18px', background:'none', border:'none', cursor:'pointer',
              fontSize:'13.5px', fontWeight:600, borderBottom:`2px solid ${activeTab === t.key ? 'var(--accent)' : 'transparent'}`,
              color: activeTab === t.key ? 'var(--accent-light)' : 'var(--text-muted)',
              transition:'var(--transition)', fontFamily:"'Inter', sans-serif" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <table className="data-table">
            <thead><tr>
              <th>#</th><th>User</th><th>Resource</th><th>Date & Time</th><th>Purpose</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:'40px', color:'var(--text-muted)' }}>No bookings</td></tr>
              ) : bookings.map(b => (
                <tr key={b.id}>
                  <td style={{ color:'var(--text-muted)', fontSize:'12px' }}>#{b.id}</td>
                  <td style={{ fontSize:'13px', fontWeight:500 }}>{b.userName}</td>
                  <td><div style={{ fontWeight:600 }}>{b.resourceName}</div><div style={{ fontSize:'12px', color:'var(--text-muted)' }}>{b.resourceLocation}</div></td>
                  <td><div style={{ fontSize:'13px' }}>{b.bookingDate}</div><div style={{ fontSize:'12px', color:'var(--text-muted)' }}>{b.startTime?.slice(0,5)}–{b.endTime?.slice(0,5)}</div></td>
                  <td style={{ fontSize:'13px', maxWidth:'150px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.purpose}</td>
                  <td><span className={`badge badge-${STATUS_COLOR[b.status]}`}>{b.status}</span></td>
                  <td>
                    {b.status === 'PENDING' && (
                      <div style={{ display:'flex', gap:'6px' }}>
                        <button className="btn btn-success btn-sm" onClick={() => { setModal({booking:b,action:'APPROVED'}); setReason(''); }}><CheckCircle2 size={14} /></button>
                        <button className="btn btn-danger btn-sm"  onClick={() => { setModal({booking:b,action:'REJECTED'}); setReason(''); }}><CircleX size={14} /></button>
                      </div>
                    )}
                    {b.status !== 'PENDING' && <span style={{ fontSize:'12px', color:'var(--text-muted)' }}>{b.approvedByName || '—'}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <table className="data-table">
            <thead><tr><th>#</th><th>Reported By</th><th>Category</th><th>Priority</th><th>Status</th><th>Assigned</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign:'center', padding:'40px', color:'var(--text-muted)' }}>No tickets</td></tr>
              ) : tickets.map(t => (
                <tr key={t.id}>
                  <td style={{ color:'var(--text-muted)', fontSize:'12px' }}>#{t.id}</td>
                  <td style={{ fontSize:'13px' }}>{t.createdByName}</td>
                  <td style={{ fontSize:'13px' }}>{t.category?.replace('_',' ')}</td>
                  <td><span className={`badge badge-${t.priority === 'CRITICAL' ? 'danger' : t.priority === 'HIGH' ? 'warning' : t.priority === 'MEDIUM' ? 'info' : 'muted'}`}>{t.priority}</span></td>
                  <td><span className={`badge badge-${t.status === 'OPEN' ? 'info' : t.status === 'IN_PROGRESS' ? 'warning' : t.status === 'RESOLVED' ? 'success' : 'muted'}`}>{t.status.replace('_',' ')}</span></td>
                  <td style={{ fontSize:'13px', color:'var(--text-muted)' }}>{t.assignedToName || 'Unassigned'}</td>
                  <td style={{ fontSize:'12px', color:'var(--text-muted)' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td><Link to={`/tickets/${t.id}`} className="btn btn-ghost btn-sm">View →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <div>
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'12px' }}>
            <Link to="/resources/new" className="btn btn-primary">+ Add Resource</Link>
          </div>
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <table className="data-table">
              <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Location</th><th>Capacity</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {resources.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontSize:'12px', color:'var(--accent-light)', fontWeight:600 }}>{r.resourceCode}</td>
                    <td style={{ fontWeight:600 }}>{r.resourceName}</td>
                    <td style={{ fontSize:'13px', color:'var(--text-muted)' }}>{r.type?.replace('_',' ')}</td>
                    <td style={{ fontSize:'13px' }}>{r.location}</td>
                    <td style={{ fontSize:'13px' }}>{r.capacity || 'N/A'}</td>
                    <td><span className={`badge badge-${r.status === 'ACTIVE' ? 'success' : 'danger'}`}>{r.status.replace('_',' ')}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:'6px' }}>
                        <Link to={`/resources/${r.id}`}       className="btn btn-ghost btn-sm">View</Link>
                        <Link to={`/resources/${r.id}/edit`}  className="btn btn-secondary btn-sm">Edit</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approve/Reject Modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth:'400px' }}>
            <div className="modal-header">
              <div className="modal-title">{modal.action === 'APPROVED' ? 'Approve' : 'Reject'} Booking #{modal.booking.id}</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(null)}><X size={14} /></button>
            </div>
            <p style={{ fontSize:'13px', marginBottom:'14px', color:'var(--text-secondary)' }}>
              {modal.booking.resourceName} — {modal.booking.bookingDate} {modal.booking.startTime?.slice(0,5)}–{modal.booking.endTime?.slice(0,5)}<br />
              <strong>Requested by:</strong> {modal.booking.userName}
            </p>
            {modal.action === 'REJECTED' && (
              <div className="form-group" style={{ marginBottom:'14px' }}>
                <label className="form-label">Rejection Reason *</label>
                <textarea className="form-control" rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Explain why..." />
              </div>
            )}
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className={`btn ${modal.action === 'APPROVED' ? 'btn-success' : 'btn-danger'}`} onClick={handleAction} disabled={submitting}>
                {submitting ? '...' : modal.action === 'APPROVED' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingDashboard;
