import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getResources, deleteResource } from '../../services/resourceService';
import { Building2, Microscope, Handshake, Monitor, MapPin, Users, Clock3, Search, FilterX, Pencil, Trash2, Package } from 'lucide-react';

const TYPE_ICONS  = { LECTURE_HALL: Building2, LAB: Microscope, MEETING_ROOM: Handshake, EQUIPMENT: Monitor };
const TYPE_LABELS = { LECTURE_HALL: 'Lecture Hall', LAB: 'Lab', MEETING_ROOM: 'Meeting Room', EQUIPMENT: 'Equipment' };

const ResourceList = () => {
  const { isAdmin, isUser } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [filters,   setFilters]   = useState({ type: '', status: '', location: '', minCapacity: '' });

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const active = Object.fromEntries(Object.entries(filters).filter(([,v]) => v !== ''));
      setResources(await getResources(active));
    } catch { setError('Failed to load resources.'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Mark "${name}" as Out of Service?`)) return;
    try { await deleteResource(id); load(); }
    catch { alert('Failed to deactivate resource.'); }
  };

  const statusBadge = (s) => (
    <span className={`badge badge-${s === 'ACTIVE' ? 'success' : s === 'UNDER_MAINTENANCE' ? 'warning' : 'danger'}`}>{s.replace('_',' ')}</span>
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Campus Resources</h1>
          <p>Browse and filter available facilities and equipment.</p>
        </div>
        {isAdmin && <Link to="/resources/new" className="btn btn-primary">Add Resource</Link>}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select className="form-control" value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}>
          <option value="">All Types</option>
          {Object.entries(TYPE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="form-control" value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}>
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="OUT_OF_SERVICE">Out of Service</option>
          <option value="UNDER_MAINTENANCE">Under Maintenance</option>
        </select>
        <input className="form-control" placeholder="🔍 Location..." value={filters.location}
          onChange={e => setFilters(p => ({ ...p, location: e.target.value }))} />
        <input className="form-control" type="number" placeholder="Min Capacity" value={filters.minCapacity}
          onChange={e => setFilters(p => ({ ...p, minCapacity: e.target.value }))} style={{ maxWidth: '140px' }} />
        <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ type:'', status:'', location:'', minCapacity:'' })}>
          <FilterX size={14} /> Clear
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}
      {loading ? (
        <div className="loading-state"><div className="spinner" /><p>Loading resources...</p></div>
      ) : resources.length === 0 ? (
        <div className="empty-state"><div className="empty-icon"><Package size={28} /></div><h3>No resources found</h3><p>Try adjusting your filters.</p></div>
      ) : (
        <div className="grid-auto">
          {resources.map(r => (
            <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Header */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
                  <div style={{ fontSize:'28px' }}>{(() => {
                    const ResourceIcon = TYPE_ICONS[r.type];
                    return ResourceIcon ? <ResourceIcon size={28} /> : <Package size={28} />;
                  })()}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'15px', color:'var(--text-primary)' }}>{r.resourceName}</div>
                    <div style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'2px' }}>{r.resourceCode}</div>
                  </div>
                </div>
                {statusBadge(r.status)}
              </div>

              {/* Info */}
              <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                <div style={{ fontSize:'13px', color:'var(--text-secondary)' }}>
                  <MapPin size={14} style={{ display: 'inline', marginRight: 6 }} /> {r.location}{r.floor ? ` · Floor ${r.floor}` : ''}
                </div>
                {r.capacity > 0 && <div style={{ fontSize:'13px', color:'var(--text-secondary)' }}><Users size={14} style={{ display: 'inline', marginRight: 6 }} />Capacity: {r.capacity}</div>}
                {r.availabilityStart && (
                  <div style={{ fontSize:'13px', color:'var(--text-secondary)' }}><Clock3 size={14} style={{ display: 'inline', marginRight: 6 }} />{r.availabilityStart} – {r.availabilityEnd}</div>
                )}
              </div>

              {r.description && (
                <p style={{ fontSize:'12.5px', color:'var(--text-muted)', margin:0, lineHeight:1.5 }}>
                  {r.description.length > 80 ? r.description.slice(0,80) + '…' : r.description}
                </p>
              )}

              <span className={`badge badge-accent`} style={{ alignSelf:'flex-start' }}>{TYPE_LABELS[r.type]}</span>

              {/* Actions */}
              <div style={{ display:'flex', gap:'8px', marginTop:'auto', paddingTop:'8px', borderTop:'1px solid var(--border-subtle)' }}>
                <Link to={`/resources/${r.id}`} className="btn btn-secondary btn-sm" style={{ flex:1, justifyContent:'center' }}>Details</Link>
                {isUser && r.status === 'ACTIVE' && (
                  <Link to={`/resources/${r.id}/book`} className="btn btn-primary btn-sm" style={{ flex:1, justifyContent:'center' }}>Book</Link>
                )}
                {isAdmin && (
                  <>
                    <Link to={`/resources/${r.id}/edit`} className="btn btn-ghost btn-sm"><Pencil size={14} /></Link>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id, r.resourceName)}><Trash2 size={14} /></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceList;
