import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, MapPin, User, Check, Users, CheckCircle2, Camera, Save, RefreshCcw } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default leaflet icon missing in React build
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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
      const res = await fetch(`http://localhost:5003/api/tickets/${id}`);
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
      const res = await fetch(`http://localhost:5003/api/tickets/${id}`, {
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
  const position = [ticket.lat || 7.2546, ticket.lng || 80.5912];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 px-4 py-4 flex items-center justify-between text-white">
        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span className="font-bold">Ticket Details</span>
        </button>
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${ticket.priority === 'High' ? 'bg-red-500/20 text-red-400' :
              ticket.priority === 'Medium' ? 'bg-orange-500/20 text-orange-400' :
                'bg-slate-700 text-slate-300'
            }`}>
            {ticket.priority} PRIORITY
          </span>
          <MoreVertical size={20} className="text-slate-400" />
        </div>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 pt-6 pb-24">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded uppercase">#{ticket.ticket_number || ticket.id}</span>
            <div className="text-xs font-bold text-slate-400 uppercase">
              Reported on <span className="text-primary">{new Date(ticket.reported_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold leading-tight mt-1 text-slate-900">{ticket.title}</h1>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-primary flex items-center justify-center">
              <MapPin size={16} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location</label>
              <p className="text-sm font-bold text-slate-900 leading-snug mt-0.5">{ticket.location}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
              <User size={16} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reported By</label>
              <p className="text-sm font-bold text-slate-900 leading-snug mt-0.5">{ticket.reported_by}</p>
            </div>
          </div>
        </div>

        <section className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
          <div className="h-64 w-full bg-slate-100 relative">
            <MapContainer center={position} zoom={16} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position}>
                <Popup>
                  <div className="font-bold text-sm">{ticket.location}</div>
                  <div className="text-xs text-slate-500 mt-1">{ticket.title}</div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 flex items-center gap-2">
              <MapPin size={14} /> Exact coordinates: {position[0].toFixed(4)}, {position[1].toFixed(4)}
            </p>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Current Status</h2>

          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-100 -z-10 rounded-full"></div>
            {steps.map((s, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={s} className="flex flex-col items-center gap-2 bg-white px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all ${isCompleted ? 'bg-primary text-white' :
                      isCurrent ? 'bg-white border-2 border-primary text-primary' :
                        'bg-slate-100 text-slate-400'
                    }`}>
                    {isCompleted ? <Check size={16} /> : (idx === 1 ? <Users size={16} /> : <CheckCircle2 size={16} />)}
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider font-bold ${isCurrent || isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>{s}</span>
                </div>
              );
            })}
          </div>

          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Update Status</h2>
          <div className="flex flex-wrap gap-2">
            {steps.map(s => (
              <button
                key={s}
                className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${status === s
                    ? 'bg-primary border-primary text-white shadow-md shadow-primary/20 transform scale-105'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                onClick={() => setStatus(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
          <h2 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            Maintenance Notes
          </h2>
          <textarea
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 min-h-[120px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 resize-y"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about the maintenance performed..."
          />
        </section>

        <button
          className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-50"
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </main>
    </>
  );
}
