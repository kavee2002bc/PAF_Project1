import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyTickets, getAllTickets, updateTicketStatus } from '../../services/ticketService';
import { Ticket, User, Wrench, Clock3, ArrowLeftRight } from 'lucide-react';

const STATUS_COLOR = { OPEN:'info', IN_PROGRESS:'warning', RESOLVED:'success', CLOSED:'muted', REJECTED:'danger' };
const PRIORITY_COLOR = { LOW:'muted', MEDIUM:'info', HIGH:'warning', CRITICAL:'danger' };

const TicketList = () => {
  const { isAdmin, isTechnician } = useAuth();
  const canSeeAll = isAdmin || isTechnician;

  const [tickets,  setTickets]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [filter,   setFilter]   = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const data = canSeeAll ? await getAllTickets() : await getMyTickets();
      setTickets(data);
    } catch { setError('Failed to load tickets.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [canSeeAll]);

  const filtered = filter ? tickets.filter(t => t.status === filter) : tickets;

  const statusTabs = ['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>{canSeeAll ? 'All Tickets' : 'My Tickets'}</h1>
          <p>{canSeeAll ? 'Manage maintenance requests and incident reports.' : 'Track your reported issues and incidents.'}</p>
        </div>
        <Link to="/tickets/new" className="btn btn-primary">Report Issue</Link>
      </div>

      {/* Status Tabs */}
      <div className="filter-bar">
        {statusTabs.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`}>
            {s || 'All'} {s && <span className={`badge badge-${STATUS_COLOR[s]}`} style={{ marginLeft:'4px', fontSize:'10px' }}>
              {tickets.filter(t => t.status === s).length}
            </span>}
          </button>
        ))}
      </div>

      {error   && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Ticket size={28} /></div>
          <h3>No tickets found</h3>
          <p>Report a campus issue to create a ticket.</p>
          <Link to="/tickets/new" className="btn btn-primary" style={{ marginTop:'12px' }}>Report Issue</Link>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {filtered.map(t => (
            <Link key={t.id} to={`/tickets/${t.id}`} style={{ textDecoration:'none' }}>
              <div className="card" style={{ flexDirection:'row', display:'flex', alignItems:'flex-start', gap:'16px', padding:'16px 20px' }}>
                {/* Priority indicator */}
                <div style={{ width:'4px', alignSelf:'stretch', borderRadius:'4px', flexShrink:0,
                  background: t.priority === 'CRITICAL' ? 'var(--danger)' : t.priority === 'HIGH' ? 'var(--warning)' :
                               t.priority === 'MEDIUM' ? 'var(--info)' : 'var(--text-muted)' }} />

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px', flexWrap:'wrap' }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:'14px', color:'var(--text-primary)' }}>
                        #{t.id} — {t.category?.replace('_', ' ')}
                        {t.resourceName && <span style={{ color:'var(--text-muted)', fontWeight:400 }}> · {t.resourceName}</span>}
                      </div>
                      <div style={{ fontSize:'13px', color:'var(--text-secondary)', marginTop:'4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'500px' }}>
                        {t.description}
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:'6px', alignItems:'center', flexShrink:0 }}>
                      <span className={`badge badge-${PRIORITY_COLOR[t.priority]}`}>{t.priority}</span>
                      <span className={`badge badge-${STATUS_COLOR[t.status]}`}>{t.status.replace('_',' ')}</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'16px', marginTop:'8px', fontSize:'12px', color:'var(--text-muted)' }}>
                    {canSeeAll && <span><User size={12} style={{ display:'inline', marginRight: 4 }} /> {t.createdByName}</span>}
                    {t.assignedToName && <span><Wrench size={12} style={{ display:'inline', marginRight: 4 }} /> {t.assignedToName}</span>}
                    <span><ArrowLeftRight size={12} style={{ display:'inline', marginRight: 4 }} /> {t.comments?.length || 0} comments</span>
                    <span><Clock3 size={12} style={{ display:'inline', marginRight: 4 }} /> {new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketList;
