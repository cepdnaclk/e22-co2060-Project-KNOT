import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, MapPin, User, Check, Users, CheckCircle2, Camera, Save, RefreshCcw } from 'lucide-react';

export default function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/tickets/${id}`);
      const data = await res.json();
      setTicket(data);
      setStatus(data.status);
      setNotes(data.maintenance_notes || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, maintenance_notes: notes })
      });
      if (res.ok) {
        navigate('/');
      }
    } catch (err) {
      console.error("Error saving ticket", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <RefreshCcw className="animate-spin" size={32} />
      </div>
    );
  }

  if (!ticket) {
    return <div style={{ padding: 20 }}>Ticket not found</div>;
  }

  const steps = ['Open', 'In Progress', 'Resolved'];
  const currentStepIndex = steps.indexOf(status);

  return (
    <>
      <nav className="details-nav">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} style={{ marginRight: 12 }} />
          <span className="details-title">Ticket Details</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className={`badge ${ticket.priority.toLowerCase()}`} style={{ textTransform: 'uppercase', fontSize: 10 }}>{ticket.priority} PRIORITY</span>
          <MoreVertical size={20} color="var(--text-secondary)" />
        </div>
      </nav>

      <main className="dashboard-content" style={{ paddingTop: 16 }}>
        <div className="ticket-header-info">
          <div className="ticket-id">#{ticket.ticket_number}</div>
          <div className="ticket-reported-on">
            REPORTED ON<br/>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              {new Date(ticket.reported_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <h1 className="ticket-full-title">{ticket.title}</h1>
        </div>

        <div className="info-cards">
          <div className="info-card">
            <div className="info-icon">
              <MapPin size={20} />
            </div>
            <div className="info-text">
              <label>LOCATION</label>
              <p>{ticket.location}</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">
              <User size={20} />
            </div>
            <div className="info-text">
              <label>REPORTED BY</label>
              <p>{ticket.reported_by}</p>
            </div>
          </div>
        </div>

        <section className="section-container" style={{ padding: '24px 20px' }}>
          <h2 className="section-title" style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 24 }}>Current Status</h2>
          
          <div className="stepper">
            {steps.map((s, idx) => (
              <div key={s} className={`step ${idx < currentStepIndex ? 'completed' : ''} ${idx === currentStepIndex ? 'current' : ''}`}>
                <div className="step-icon">
                  {idx < currentStepIndex ? <Check size={16} /> : (idx === 1 ? <Users size={16} /> : <CheckCircle2 size={16} />)}
                </div>
                <span className="step-label">{s}</span>
              </div>
            ))}
          </div>

          <h2 className="section-title" style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: 32, marginBottom: 8 }}>Update Status</h2>
          <div className="status-updater">
            {steps.map(s => (
              <button 
                key={s} 
                className={`status-btn ${status === s ? 'active' : ''}`}
                onClick={() => setStatus(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        <section className="section-container">
          <h2 className="section-title" style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            Maintenance Notes
          </h2>
          <textarea 
            className="notes-area"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about the maintenance performed..."
          />
        </section>

        <section className="section-container">
          <h2 className="section-title" style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Photos</h2>
          <div className="photos-grid">
            {ticket.photo_url && (
              <div className="photo-box">
                <img src={ticket.photo_url} alt="Issue" />
              </div>
            )}
            <div className="photo-box photo-add">
              <Camera size={24} />
              <span>ADD</span>
            </div>
          </div>
        </section>

        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </main>
    </>
  );
}
