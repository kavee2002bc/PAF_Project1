import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getTicketById, updateTicketStatus, addComment, editComment, deleteComment } from '../../services/ticketService';
import { Ticket, ClipboardList, Wrench, Paperclip, ArrowLeft, Sparkles, MessageSquare, Pencil, Trash2, Send, X, AlertTriangle, CheckCircle2, CircleX } from 'lucide-react';

const STATUS_COLOR = { OPEN:'info', IN_PROGRESS:'warning', RESOLVED:'success', CLOSED:'muted', REJECTED:'danger' };
const PRIORITY_COLOR = { LOW:'muted', MEDIUM:'info', HIGH:'warning', CRITICAL:'danger' };

const TicketDetails = () => {
  const { id } = useParams();
  const { user, isAdmin, isTechnician } = useAuth();
  const [ticket,   setTicket]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [comment,  setComment]  = useState('');
  const [editId,   setEditId]   = useState(null);
  const [editText, setEditText] = useState('');
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus,   setNewStatus]   = useState('');
  const [notes,       setNotes]       = useState('');
  const [submitting,  setSubmitting]  = useState(false);

  const load = () => getTicketById(id).then(setTicket).catch(() => setError('Ticket not found.')).finally(() => setLoading(false));
  useEffect(() => { load(); }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try { await addComment(id, comment); setComment(''); load(); }
    catch { alert('Failed to add comment.'); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async (cid) => {
    try { await editComment(id, cid, editText); setEditId(null); setEditText(''); load(); }
    catch { alert('Failed to edit comment.'); }
  };

  const handleDelete = async (cid) => {
    if (!window.confirm('Delete this comment?')) return;
    try { await deleteComment(id, cid); load(); }
    catch { alert('Failed to delete comment.'); }
  };

  const handleStatusUpdate = async () => {
    setSubmitting(true);
    try {
      await updateTicketStatus(id, newStatus, notes);
      setStatusModal(false); setNotes(''); load();
    } catch (err) { alert(err.response?.data?.message || 'Failed to update status.'); }
    finally { setSubmitting(false); }
  };

  const timeAgo = (d) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h/24)}d ago`;
  };

  if (loading) return <div className="loading-state"><div className="spinner" /></div>;
  if (error)   return <div className="alert alert-error">{error}</div>;

  const { status, priority, category, description, resourceName, location,
           createdByName, assignedToName, preferredContact, resolutionNotes,
           rejectionReason, attachmentUrls, comments, createdAt } = ticket;

  const canManage = isAdmin || isTechnician;
  const NEXT_STATUSES = { OPEN: ['IN_PROGRESS','REJECTED'], IN_PROGRESS: ['RESOLVED'], RESOLVED: ['CLOSED'] };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Ticket #{ticket.id}</h1>
          <p>{category?.replace('_',' ')} {resourceName && `· ${resourceName}`}</p>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          {canManage && NEXT_STATUSES[status] && (
            <button className="btn btn-primary" onClick={() => setStatusModal(true)}><Sparkles size={14} /> Update Status</button>
          )}
          <Link to="/tickets" className="btn btn-ghost"><ArrowLeft size={14} /> Back</Link>
        </div>
      </div>

      <div className="grid-2" style={{ gap:'20px', alignItems:'flex-start' }}>
        {/* Left: Details */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <h3>Details</h3>
              <div style={{ display:'flex', gap:'8px' }}>
                <span className={`badge badge-${PRIORITY_COLOR[priority]}`}>{priority}</span>
                <span className={`badge badge-${STATUS_COLOR[status]}`}>{status.replace('_',' ')}</span>
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'10px', fontSize:'13.5px' }}>
              <div style={{ padding:'10px', background:'var(--bg-surface)', borderRadius:'var(--radius-md)', border:'1px solid var(--border-subtle)', lineHeight:1.7 }}>
                {description}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                {[
                  { label:'Reported By', value: createdByName },
                  { label:'Location',    value: location || resourceName || 'N/A' },
                  { label:'Assigned To', value: assignedToName || 'Unassigned' },
                  { label:'Contact',     value: preferredContact || 'N/A' },
                  { label:'Submitted',   value: new Date(createdAt).toLocaleString() },
                  { label:'Category',    value: category?.replace('_',' ') },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding:'8px 10px', background:'var(--bg-surface)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize:'10px', color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</div>
                    <div style={{ color:'var(--text-primary)', fontSize:'13px', fontWeight:500, marginTop:'2px' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {resolutionNotes && (
              <div className="alert alert-success" style={{ marginTop:'12px' }}>
                <div><strong><CheckCircle2 size={14} style={{ display:'inline', marginRight: 4 }} /> Resolution Notes:</strong><br />{resolutionNotes}</div>
              </div>
            )}
            {rejectionReason && (
              <div className="alert alert-error" style={{ marginTop:'12px' }}>
                <div><strong><CircleX size={14} style={{ display:'inline', marginRight: 4 }} /> Rejection Reason:</strong><br />{rejectionReason}</div>
              </div>
            )}
          </div>

          {/* Attachments */}
          {attachmentUrls?.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom:'12px' }}>Attachments</h3>
              <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                {attachmentUrls.map((url, i) => (
                  <a key={i} href={`http://localhost:8080${url}`} target="_blank" rel="noreferrer">
                    <img src={`http://localhost:8080${url}`} alt={`attachment-${i+1}`}
                      style={{ width:'100px', height:'100px', objectFit:'cover', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', cursor:'pointer' }}
                      onError={e => { e.target.style.display='none'; }}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Comments */}
        <div className="card">
          <h3 style={{ marginBottom:'16px' }}>Comments ({comments?.length || 0})</h3>

          {/* Comment List */}
          <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'16px' }}>
            {comments?.length === 0 ? (
              <p style={{ color:'var(--text-muted)', fontSize:'13px' }}>No comments yet. Be the first to add one.</p>
            ) : comments.map(c => (
              <div key={c.id} style={{ padding:'12px', background:'var(--bg-surface)', borderRadius:'var(--radius-md)', border:'1px solid var(--border-subtle)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                  <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.authorName}`} alt=""
                      style={{ width:'24px', height:'24px', borderRadius:'50%' }} />
                    <span style={{ fontWeight:600, fontSize:'13px', color:'var(--text-primary)' }}>{c.authorName}</span>
                    <span className={`badge badge-${c.authorRole === 'ADMIN' ? 'accent' : c.authorRole === 'TECHNICIAN' ? 'warning' : 'muted'}`} style={{ fontSize:'9px' }}>
                      {c.authorRole}
                    </span>
                    {c.edited && <span style={{ fontSize:'10px', color:'var(--text-muted)' }}>(edited)</span>}
                  </div>
                  <span style={{ fontSize:'11px', color:'var(--text-muted)' }}>{timeAgo(c.createdAt)}</span>
                </div>

                {editId === c.id ? (
                  <div style={{ display:'flex', gap:'8px', marginTop:'8px' }}>
                    <input className="form-control" value={editText} onChange={e => setEditText(e.target.value)} style={{ fontSize:'13px' }} />
                    <button className="btn btn-success btn-sm" onClick={() => handleEdit(c.id)}>Save</button>
                    <button className="btn btn-ghost btn-sm"   onClick={() => setEditId(null)}>Cancel</button>
                  </div>
                ) : (
                  <div style={{ fontSize:'13.5px', color:'var(--text-secondary)', lineHeight:1.6 }}>{c.text}</div>
                )}

                {c.authorId === user?.id && editId !== c.id && (
                  <div style={{ display:'flex', gap:'6px', marginTop:'8px' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditId(c.id); setEditText(c.text); }}><Pencil size={14} /> Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}><Trash2 size={14} /> Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Comment */}
          <form onSubmit={handleComment} style={{ display:'flex', gap:'10px' }}>
            <input className="form-control" value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Add a comment..." style={{ flex:1 }} />
            <button type="submit" className="btn btn-primary" disabled={submitting || !comment.trim()}>
              {submitting ? '...' : <><Send size={14} /> Post</>}
            </button>
          </form>
        </div>
      </div>

      {/* Status Modal */}
      {statusModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth:'420px' }}>
            <div className="modal-header">
              <div className="modal-title">Update Ticket Status</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setStatusModal(false)}><X size={14} /></button>
            </div>
            <div className="form-group" style={{ marginBottom:'14px' }}>
              <label className="form-label">New Status</label>
              <select className="form-control" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                <option value="">— Select —</option>
                {(NEXT_STATUSES[status] || []).map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
            </div>
            {(newStatus === 'RESOLVED' || newStatus === 'CLOSED') && (
              <div className="form-group" style={{ marginBottom:'14px' }}>
                <label className="form-label">Resolution Notes</label>
                <textarea className="form-control" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Describe the steps taken to resolve this issue..." />
              </div>
            )}
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setStatusModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleStatusUpdate} disabled={!newStatus || submitting}>
                {submitting ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetails;
