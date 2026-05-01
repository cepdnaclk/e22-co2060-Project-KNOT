import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Clock, User, AlertCircle, CheckCircle2, Save, Map as MapIcon, Camera, History, Wrench, RefreshCcw } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Re-center map component
function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export default function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const res = await fetch(`http://localhost:5003/api/tickets/${id}`);
      const data = await res.json();
      setTicket(data);
      setNotes(data.maintenance_notes || '');
      setStatus(data.status);
      setAssignedTo(data.assigned_to || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (status === 'Resolved' && notes.trim().length < 10) {
      setError('Please provide detailed maintenance notes (min 10 chars) before resolving.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await fetch(`http://localhost:5003/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          maintenance_notes: notes,
          photo_url: photo,
          assigned_to: assignedTo
        }),
      });
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen dark:bg-slate-950">
      <RefreshCcw className="animate-spin text-primary" size={32} />
    </div>
  );

  if (!ticket) return (
    <div className="p-8 text-center dark:bg-slate-950 min-h-screen pt-20">
      <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
      <h2 className="text-xl font-bold dark:text-white">Ticket Not Found</h2>
      <button onClick={() => navigate('/')} className="mt-4 text-primary font-bold">Return to Dashboard</button>
    </div>
  );

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-6 pb-24 animate-in fade-in duration-500">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 mb-6 transition-colors dark:text-slate-400 dark:hover:text-white"
      >
        <ChevronLeft size={18} /> Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-widest mb-1 block">#{ticket.ticket_number}</span>
                <h1 className="text-2xl font-bold text-slate-900 leading-tight dark:text-white">{ticket.title}</h1>
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${ticket.priority === 'High' ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                {ticket.priority} Priority
              </div>
            </div>

            <p className="text-slate-600 mb-6 dark:text-slate-300">{ticket.description}</p>

            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 dark:bg-slate-800">
                  <User size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Reporter</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{ticket.reported_by}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 dark:bg-slate-800">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Reported At</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{new Date(ticket.reported_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 dark:bg-slate-800 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 dark:text-white">
              <Wrench size={18} className="text-primary" /> Maintenance Actions
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Assigned Technician</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  <option value="Alex Technician">Alex Technician</option>
                  <option value="Sarah Engineer">Sarah Engineer</option>
                  <option value="John Repairman">John Repairman</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Current Status</label>
                <div className="flex gap-2">
                  {['Open', 'In Progress', 'Resolved'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${status === s ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Maintenance Notes</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-all min-h-[120px] dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  placeholder="Describe the work performed..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
                {error && <p className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1"><AlertCircle size={12} /> {error}</p>}
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Resolution Photos</label>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  <label className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-primary hover:text-primary transition-all shrink-0 dark:border-slate-700">
                    <Camera size={24} />
                    <span className="text-[10px] font-bold mt-1">Add Photo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                  </label>
                  {(photo || ticket.photo_url) && (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 group">
                      <img src={photo || ticket.photo_url} alt="Evidence" className="w-full h-full object-cover" />
                      <button onClick={() => setPhoto(null)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronLeft size={12} className="rotate-45" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden dark:bg-slate-800 dark:border-slate-700">
            <div className="p-4 border-b border-slate-50 flex items-center gap-2 dark:border-slate-700">
              <MapIcon size={18} className="text-primary" />
              <h3 className="font-bold text-sm dark:text-white">Fault Location</h3>
            </div>
            <div className="h-48 relative">
              <MapContainer center={[ticket.lat || 7.2546, ticket.lng || 80.5912]} zoom={17} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <ChangeView center={[ticket.lat || 7.2546, ticket.lng || 80.5912]} />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[ticket.lat || 7.2546, ticket.lng || 80.5912]} />
              </MapContainer>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50">
              <p className="text-xs font-bold text-slate-700 flex items-center gap-1 dark:text-slate-300">
                <MapPin size={14} className="text-primary" /> {ticket.location}
              </p>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 dark:bg-slate-800 dark:border-slate-700">
            <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2 dark:text-white">
              <History size={18} className="text-primary" /> Ticket History
            </h3>
            <div className="space-y-4">
              {ticket.history && ticket.history.length > 0 ? (
                ticket.history.map((log, i) => (
                  <div key={i} className="flex gap-3 relative">
                    {i !== ticket.history.length - 1 && <div className="absolute left-2 top-4 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-700"></div>}
                    <div className={`w-4 h-4 rounded-full mt-1 shrink-0 ${log.status === 'Resolved' ? 'bg-green-500' : log.status === 'In Progress' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{log.status}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{new Date(log.timestamp).toLocaleString()}</p>
                      <p className="text-[11px] text-slate-600 mt-1 dark:text-slate-300">{log.note}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No history logs yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="fixed bottom-24 left-4 right-4 max-w-4xl mx-auto z-[60]">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-2xl hover:bg-slate-800 transition-all disabled:opacity-50 dark:bg-primary dark:hover:bg-primary/90"
        >
          {saving ? <RefreshCcw className="animate-spin" size={20} /> : <Save size={20} />}
          Update Ticket Records
        </button>
      </div>
    </main>
  );
}
