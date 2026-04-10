import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyBookings, getAllBookings, updateBookingStatus } from '../../services/bookingService';
import { CalendarDays, CircleCheck, CircleX, Ban, TriangleAlert, ArrowLeftRight, X } from 'lucide-react';

const STATUS_COLORS = { PENDING:'warning', APPROVED:'success', REJECTED:'danger', CANCELLED:'muted' };

const BookingList = () => {
  const { isAdmin } = useAuth();
  const [bookings,  setBookings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal,     setModal]     = useState(null); // { booking, action }
  const [reason,    setReason]    = useState('');
  const [submitting,setSubmitting]= useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const data = isAdmin ? await getAllBookings() : await getMyBookings();
      setBookings(data);
    } catch { setError('Failed to load bookings.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [isAdmin]);

  const filtered = filterStatus ? bookings.filter(b => b.status === filterStatus) : bookings;

  const handleAction = async () => {
    const { booking, action } = modal;
    if (action === 'REJECTED' && !reason.trim()) { alert('Rejection reason is required.'); return; }
    setSubmitting(true);
    try {
      await updateBookingStatus(booking.id, action, reason);
      setModal(null); setReason('');
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.');
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>{isAdmin ? 'All Bookings' : 'My Bookings'}</h1>
          <p>{isAdmin ? 'Review, approve or reject booking requests.' : 'Track your resource bookings and their status.'}</p>
        </div>
        {!isAdmin && <Link to="/resources" className="btn btn-primary">New Booking</Link>}
      </div>

      {/* Filter */}
      <div className="filter-bar">
        {['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-ghost'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {error   && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><CalendarDays size={28} /></div>
          <h3>No bookings found</h3>
          <p>Book a campus resource to get started.</p>
          <Link to="/resources" className="btn btn-primary" style={{ marginTop:'12px' }}>Browse Resources</Link>
        </div>
      ) : (
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Resource</th>
                {isAdmin && <th>Requested By</th>}
                <th>Date & Time</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td style={{ color:'var(--text-muted)', fontSize:'12px' }}>#{b.id}</td>
                  <td>
                    <div style={{ fontWeight:600, color:'var(--text-primary)' }}>{b.resourceName}</div>
                    <div style={{ fontSize:'12px', color:'var(--text-muted)' }}>{b.resourceLocation}</div>
                  </td>
                  {isAdmin && <td style={{ fontSize:'13px' }}>{b.userName}</td>}
                  <td>
                    <div style={{ fontSize:'13px', fontWeight:500 }}>{b.bookingDate}</div>
                    <div style={{ fontSize:'12px', color:'var(--text-muted)' }}>{b.startTime?.slice(0,5)} – {b.endTime?.slice(0,5)}</div>
                  </td>
                  <td style={{ fontSize:'13px', maxWidth:'180px' }}>
                    <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.purpose}</div>
                  </td>
                  <td><span className={`badge badge-${STATUS_COLORS[b.status]}`}>{b.status}</span></td>
                  <td>
                    <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                      {isAdmin && b.status === 'PENDING' && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => { setModal({booking:b, action:'APPROVED'}); setReason(''); }}><CircleCheck size={14} /> Approve</button>
                          <button className="btn btn-danger btn-sm"  onClick={() => { setModal({booking:b, action:'REJECTED'}); setReason(''); }}><CircleX size={14} /> Reject</button>
                        </>
                      )}
                      {(b.status === 'APPROVED' || b.status === 'PENDING') && !isAdmin && (
                        <button className="btn btn-ghost btn-sm" onClick={() => { setModal({booking:b, action:'CANCELLED'}); setReason(''); }}><Ban size={14} /> Cancel</button>
                      )}
                      {b.rejectionReason && (
                        <span title={b.rejectionReason} style={{ fontSize:'11px', color:'var(--danger)', cursor:'help' }}><TriangleAlert size={12} style={{ display:'inline', marginRight: 4 }} /> Reason</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Action Modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth:'420px' }}>
            <div className="modal-header">
              <div className="modal-title">
                {modal.action === 'APPROVED' ? 'Approve Booking' :
                 modal.action === 'REJECTED' ? 'Reject Booking' : 'Cancel Booking'}
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(null)}><X size={14} /></button>
            </div>
            <p style={{ fontSize:'13.5px', marginBottom:'16px' }}>
              {modal.action === 'APPROVED' ? `Approve the booking for "${modal.booking.resourceName}" on ${modal.booking.bookingDate}?` :
               modal.action === 'REJECTED' ? `Reject the booking request from ${modal.booking.userName}?` :
               `Cancel your booking for "${modal.booking.resourceName}" on ${modal.booking.bookingDate}?`}
            </p>
            {modal.action === 'REJECTED' && (
              <div className="form-group" style={{ marginBottom:'16px' }}>
                <label className="form-label">Rejection Reason *</label>
                <textarea className="form-control" rows={3} value={reason}
                  onChange={e => setReason(e.target.value)} placeholder="Explain why this booking cannot be approved..." />
              </div>
            )}
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button
                className={`btn ${modal.action === 'APPROVED' ? 'btn-success' : modal.action === 'REJECTED' ? 'btn-danger' : 'btn-secondary'}`}
                onClick={handleAction} disabled={submitting}>
                {submitting ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingList;
