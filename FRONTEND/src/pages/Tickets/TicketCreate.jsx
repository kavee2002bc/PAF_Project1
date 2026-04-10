import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createTicket } from '../../services/ticketService';
import { getResources } from '../../services/resourceService';
import { AlertCircle, Camera, Send, ArrowLeft, X } from 'lucide-react';

const CATEGORIES = ['HARDWARE','SOFTWARE','ELECTRICAL','PLUMBING','HVAC','SAFETY','CLEANING','OTHER'];
const PRIORITIES  = ['LOW','MEDIUM','HIGH','CRITICAL'];

const TicketCreate = () => {
  const navigate = useNavigate();
  const [resources,   setResources]   = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [files,       setFiles]       = useState([]);
  const [previews,    setPreviews]    = useState([]);

  const [form, setForm] = useState({
    resourceId: '', location: '', category: 'HARDWARE',
    description: '', priority: 'MEDIUM', preferredContact: '',
  });

  useEffect(() => {
    getResources().then(setResources).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files).slice(0, 3);
    if (selected.length > 3) { setError('Maximum 3 attachments allowed.'); return; }
    setFiles(selected);
    const urls = selected.map(f => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const removeFile = (idx) => {
    const nf = files.filter((_, i) => i !== idx);
    const np = previews.filter((_, i) => i !== idx);
    URL.revokeObjectURL(previews[idx]);
    setFiles(nf); setPreviews(np);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) { setError('Description is required.'); return; }
    setLoading(true); setError('');
    try {
      const payload = {
        resourceId:        form.resourceId ? Number(form.resourceId) : null,
        location:          form.location || null,
        category:          form.category,
        description:       form.description,
        priority:          form.priority,
        preferredContact:  form.preferredContact || null,
      };
      await createTicket(payload, files);
      navigate('/tickets');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket.');
    } finally { setLoading(false); }
  };

  const priorityColors = { LOW:'var(--text-muted)', MEDIUM:'var(--info)', HIGH:'var(--warning)', CRITICAL:'var(--danger)' };

  return (
    <div style={{ maxWidth:'680px', margin:'0 auto' }}>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Report an Issue</h1>
          <p>Submit a maintenance or incident ticket for a campus facility.</p>
        </div>
        <Link to="/tickets" className="btn btn-ghost"><ArrowLeft size={14} /> Back</Link>
      </div>

      <div className="card">
        {error && <div className="alert alert-error" style={{ marginBottom:'16px' }}><AlertCircle size={16} /> {error}</div>}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {/* Location */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Related Resource (optional)</label>
              <select className="form-control" name="resourceId" value={form.resourceId} onChange={handleChange}>
                <option value="">— None / Not applicable —</option>
                {resources.map(r => <option key={r.id} value={r.id}>{r.resourceName} ({r.resourceCode})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Location / Room</label>
              <input className="form-control" name="location" value={form.location}
                onChange={handleChange} placeholder="e.g. Lab C, 2nd Floor" />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-control" name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_',' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-control" name="priority" value={form.priority} onChange={handleChange}
                style={{ color: priorityColors[form.priority] }}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-control" name="description" value={form.description}
              onChange={handleChange} rows={4}
              placeholder="Describe the issue in detail — what happened, when you noticed it, any error messages..." required />
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Contact</label>
            <input className="form-control" name="preferredContact" value={form.preferredContact}
              onChange={handleChange} placeholder="email@campus.edu or phone number" />
          </div>

          {/* File Upload */}
          <div className="form-group">
            <label className="form-label">Photo Evidence (up to 3 images)</label>
            <label style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              padding:'24px', border:'2px dashed var(--border)', borderRadius:'var(--radius-md)',
              cursor:'pointer', background:'var(--bg-surface)', transition:'var(--transition)' }}
              onMouseOver={e => e.currentTarget.style.borderColor='var(--accent)'}
              onMouseOut={e  => e.currentTarget.style.borderColor='var(--border)'}
            >
              <input type="file" multiple accept="image/*" style={{ display:'none' }} onChange={handleFiles} />
              <div style={{ fontSize:'28px', marginBottom:'8px' }}><Camera size={28} /></div>
              <div style={{ fontSize:'13px', color:'var(--text-secondary)', fontWeight:600 }}>Click to upload images</div>
              <div style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'4px' }}>JPEG, PNG, GIF · Max 5MB each · Up to 3 files</div>
            </label>
            {previews.length > 0 && (
              <div style={{ display:'flex', gap:'10px', marginTop:'12px', flexWrap:'wrap' }}>
                {previews.map((url, i) => (
                  <div key={i} style={{ position:'relative' }}>
                    <img src={url} alt="" style={{ width:'80px', height:'80px', objectFit:'cover', borderRadius:'var(--radius-md)', border:'1px solid var(--border)' }} />
                    <button type="button" onClick={() => removeFile(i)}
                      style={{ position:'absolute', top:'-6px', right:'-6px', background:'var(--danger)', color:'#fff',
                        border:'none', borderRadius:'50%', width:'18px', height:'18px', cursor:'pointer', fontSize:'10px', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={10} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display:'flex', gap:'12px', paddingTop:'8px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : <><Send size={16} /> Submit Ticket</>}
            </button>
            <Link to="/tickets" className="btn btn-ghost">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketCreate;
