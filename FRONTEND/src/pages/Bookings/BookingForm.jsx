import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getResourceById } from '../../services/resourceService';
import { createBooking } from '../../services/bookingService';
import { Building2, MapPin, Clock3, Users, Info, ArrowLeft, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

const BookingForm = () => {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    bookingDate: today, startTime: '09:00', endTime: '11:00',
    purpose: '', expectedAttendees: 1,
  });

  useEffect(() => {
    getResourceById(resourceId)
      .then(setResource)
      .catch(() => setError('Resource not found.'))
      .finally(() => setLoading(false));
  }, [resourceId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: name === 'expectedAttendees' ? Number(value) : value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.startTime >= form.endTime) { setError('End time must be after start time.'); return; }
    setSubmitting(true); setError('');
    try {
      await createBooking({ resourceId: Number(resourceId), ...form });
      setSuccess('Booking submitted! It is now pending admin approval.');
      setTimeout(() => navigate('/bookings'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking. Time slot may be unavailable.');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading-state"><div className="spinner" /></div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Book Resource</h1>
          <p>Complete the form to submit a booking request.</p>
        </div>
        <Link to={`/resources/${resourceId}`} className="btn btn-ghost"><ArrowLeft size={14} /> Back</Link>
      </div>

      {/* Resource Summary */}
      {resource && (
        <div className="card card-glass" style={{ marginBottom:'20px', display:'flex', gap:'14px', alignItems:'center' }}>
          <div style={{ fontSize:'36px' }}><Building2 size={32} /></div>
          <div>
            <div style={{ fontWeight:700, fontSize:'15px', color:'var(--text-primary)' }}>{resource.resourceName}</div>
            <div style={{ fontSize:'13px', color:'var(--text-muted)' }}>
              <MapPin size={14} style={{ display:'inline', marginRight: 6 }} /> {resource.location} · <Clock3 size={14} style={{ display:'inline', marginRight: 6 }} /> {resource.availabilityStart}–{resource.availabilityEnd}
              {resource.capacity > 0 && <span> · <Users size={14} style={{ display:'inline', marginRight: 6 }} /> Max {resource.capacity}</span>}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        {error   && <div className="alert alert-error"   style={{ marginBottom:'16px' }}><AlertCircle size={16} /> {error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom:'16px' }}><CheckCircle2 size={16} /> {success}</div>}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div className="form-group">
            <label className="form-label">Booking Date *</label>
            <input className="form-control" type="date" name="bookingDate" value={form.bookingDate}
              onChange={handleChange} min={today} required />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Start Time *</label>
              <input className="form-control" type="time" name="startTime" value={form.startTime} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">End Time *</label>
              <input className="form-control" type="time" name="endTime" value={form.endTime} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Purpose / Event Name *</label>
            <input className="form-control" name="purpose" value={form.purpose} onChange={handleChange}
              placeholder="e.g. Team Meeting, Lecture, Workshop..." required />
          </div>

          {resource?.capacity > 0 && (
            <div className="form-group">
              <label className="form-label">Expected Attendees</label>
              <input className="form-control" type="number" name="expectedAttendees" value={form.expectedAttendees}
                onChange={handleChange} min={1} max={resource.capacity} />
              <span className="form-hint">Maximum capacity: {resource.capacity}</span>
            </div>
          )}

          <div className="alert alert-info" style={{ fontSize:'12.5px' }}>
            <Info size={16} /> Your booking will be <strong>PENDING</strong> until an administrator reviews and approves it.
            You will receive a notification when a decision is made.
          </div>

          <div style={{ display:'flex', gap:'12px' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : <><Send size={16} /> Submit Booking Request</>}
            </button>
            <Link to={`/resources/${resourceId}`} className="btn btn-ghost">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
