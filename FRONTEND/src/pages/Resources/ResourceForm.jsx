import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createResource, updateResource, getResourceById } from '../../services/resourceService';
import { ArrowLeft, Pencil, CirclePlus, AlertCircle, CircleCheck, Save } from 'lucide-react';

const RESOURCE_TYPES   = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];
const RESOURCE_STATUSES = ['ACTIVE', 'OUT_OF_SERVICE', 'UNDER_MAINTENANCE'];

const ResourceForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [form, setForm] = useState({
    resourceName: '', resourceCode: '', type: 'LECTURE_HALL', description: '',
    capacity: 0, location: '', floor: '', status: 'ACTIVE',
    availabilityStart: '08:00', availabilityEnd: '20:00', imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!isAdmin) { navigate('/resources'); return; }
    if (isEdit) {
      setLoading(true);
      getResourceById(id)
        .then(r => setForm({ ...r }))
        .catch(()  => setError('Failed to load resource.'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, isAdmin, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: name === 'capacity' ? Number(value) : value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.resourceName.trim()) { setError('Resource name is required.'); return; }
    setLoading(true); setError('');
    try {
      if (isEdit) await updateResource(id, form);
      else        await createResource(form);
      navigate('/resources');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save resource.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-header-left">
          <h1>{isEdit ? 'Edit Resource' : 'Add New Resource'}</h1>
          <p>{isEdit ? 'Update resource information.' : 'Add a new bookable resource to the campus catalogue.'}</p>
        </div>
        <Link to="/resources" className="btn btn-ghost"><ArrowLeft size={14} /> Back</Link>
      </div>

      <div className="card">
        {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}><AlertCircle size={16} /> {error}</div>}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Resource Name *</label>
              <input className="form-control" name="resourceName" value={form.resourceName} onChange={handleChange} placeholder="e.g. Main Lecture Hall" required />
            </div>
            <div className="form-group">
              <label className="form-label">Resource Code *</label>
              <input className="form-control" name="resourceCode" value={form.resourceCode} onChange={handleChange} placeholder="e.g. LH-01" required />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select className="form-control" name="type" value={form.type} onChange={handleChange}>
                {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" name="status" value={form.status} onChange={handleChange}>
                {RESOURCE_STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Location *</label>
              <input className="form-control" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Engineering Building" required />
            </div>
            <div className="form-group">
              <label className="form-label">Floor</label>
              <input className="form-control" name="floor" value={form.floor} onChange={handleChange} placeholder="e.g. Ground, 1st, 2nd" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Capacity (0 = not applicable)</label>
            <input className="form-control" type="number" name="capacity" value={form.capacity} onChange={handleChange} min="0" />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" name="description" value={form.description} onChange={handleChange} placeholder="Brief description of the resource and its amenities..." rows={3} />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Available From</label>
              <input className="form-control" type="time" name="availabilityStart" value={form.availabilityStart} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Available Until</label>
              <input className="form-control" type="time" name="availabilityEnd" value={form.availabilityEnd} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Image URL (optional)</label>
            <input className="form-control" name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..." />
          </div>

          <div style={{ display:'flex', gap:'12px', paddingTop:'8px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Resource' : 'Create Resource'}
            </button>
            <Link to="/resources" className="btn btn-ghost">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceForm;
