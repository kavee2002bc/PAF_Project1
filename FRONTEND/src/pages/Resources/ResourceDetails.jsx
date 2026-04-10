import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getResourceById } from '../../services/resourceService';
import { useAuth } from '../../context/AuthContext';
import { Building2, ArrowLeft, Pencil, CalendarDays, ClipboardList, Wrench, AlertTriangle } from 'lucide-react';

const ResourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isUser } = useAuth();
  const [resource, setResource] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    getResourceById(id)
      .then(setResource)
      .catch(() => setError('Resource not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-state"><div className="spinner" /></div>;
  if (error)   return <div className="alert alert-error">{error}</div>;

  const { resourceName, resourceCode, type, description, capacity, location, floor,
           status, availabilityStart, availabilityEnd, imageUrl, createdByName, createdAt } = resource;

  const statusColor = status === 'ACTIVE' ? 'success' : status === 'UNDER_MAINTENANCE' ? 'warning' : 'danger';

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>{resourceName}</h1>
          <p>Resource code: <strong style={{ color: 'var(--accent-light)' }}>{resourceCode}</strong></p>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <Link to="/resources" className="btn btn-ghost"><ArrowLeft size={14} /> Back</Link>
          {isAdmin && <Link to={`/resources/${id}/edit`} className="btn btn-secondary"><Pencil size={14} /> Edit</Link>}
          {isUser && status === 'ACTIVE' && (
            <Link to={`/resources/${id}/book`} className="btn btn-primary"><CalendarDays size={14} /> Book This Resource</Link>
          )}
        </div>
      </div>

      <div className="grid-2" style={{ gap: '20px', alignItems: 'flex-start' }}>
        {/* Details Card */}
        <div className="card" style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h3>Details</h3>
            <span className={`badge badge-${statusColor}`}>{status.replace('_',' ')}</span>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
            {[
              { label:'Type',     value: type?.replace('_',' ') },
              { label:'Capacity', value: capacity > 0 ? `${capacity} people` : 'N/A' },
              { label:'Location', value: location },
              { label:'Floor',    value: floor || 'N/A' },
              { label:'Opens',    value: availabilityStart || 'N/A' },
              { label:'Closes',   value: availabilityEnd   || 'N/A' },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding:'12px', background:'var(--bg-surface)', borderRadius:'var(--radius-md)', border:'1px solid var(--border-subtle)' }}>
                <div style={{ fontSize:'11px', color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'4px' }}>{label}</div>
                <div style={{ fontSize:'14px', color:'var(--text-primary)', fontWeight:600 }}>{value}</div>
              </div>
            ))}
          </div>

          {description && (
            <div style={{ padding:'14px', background:'var(--bg-surface)', borderRadius:'var(--radius-md)', border:'1px solid var(--border-subtle)' }}>
              <div style={{ fontSize:'11px', color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px' }}>Description</div>
              <p style={{ fontSize:'13.5px', lineHeight:1.7, margin:0 }}>{description}</p>
            </div>
          )}

          <div style={{ fontSize:'12px', color:'var(--text-muted)', borderTop:'1px solid var(--border-subtle)', paddingTop:'12px' }}>
            Added by {createdByName || 'Admin'} · {new Date(createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Action Card */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {imageUrl && (
            <div className="card" style={{ padding:'12px' }}>
              <img src={imageUrl} alt={resourceName} style={{ width:'100%', borderRadius:'var(--radius-md)', objectFit:'cover', maxHeight:'220px' }} />
            </div>
          )}
          <div className="card">
            <h3 style={{ marginBottom:'14px' }}>Quick Actions</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {isUser && status === 'ACTIVE' ? (
                <Link to={`/resources/${id}/book`} className="btn btn-primary">
                  <CalendarDays size={14} /> Make a Booking
                </Link>
              ) : status !== 'ACTIVE' ? (
                <div className="alert alert-warning"><AlertTriangle size={16} /> This resource is currently unavailable for booking.</div>
              ) : null}
              <Link to="/tickets/new" className="btn btn-secondary"><Wrench size={14} /> Report an Issue</Link>
              <Link to="/resources"   className="btn btn-ghost"><ArrowLeft size={14} /> All Resources</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetails;
