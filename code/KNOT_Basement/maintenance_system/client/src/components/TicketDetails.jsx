import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, User, Check, Users, CheckCircle2,
  Camera, Save, RefreshCcw, UploadCloud, X, AlertTriangle,
  Clock, Loader2, Shield, Eye
} from 'lucide-react';
import { CampusMap } from './Dashboard';

// Real World Map component using Leaflet
function TicketMap({ locationString }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Peradeniya Engineering coordinates
  const defaultCoords = [7.2584, 80.5968]; 
  
  useEffect(() => {
    if (!window.L || !mapContainerRef.current) return;

    // Parse coordinates from location string
    let coords = defaultCoords;
    let hasCoords = false;
    if (locationString) {
      const match = locationString.match(/Map Coordinates:\s*([-\d.]+),\s*([-\d.]+)/);
      if (match) {
        coords = [parseFloat(match[1]), parseFloat(match[2])];
        hasCoords = true;
      }
    }

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = window.L.map(mapContainerRef.current).setView(coords, 16);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
      
      markerRef.current = window.L.marker(coords).addTo(mapInstanceRef.current);
      if (hasCoords) {
        markerRef.current.bindPopup("<b>Reported Location Pin</b>").openPopup();
      } else {
        markerRef.current.bindPopup("<b>Peradeniya Engineering (Default Location)</b>").openPopup();
      }
    } else {
      // Update map center and marker if location changes
      mapInstanceRef.current.setView(coords, 16);
      markerRef.current.setLatLng(coords);
      if (hasCoords) {
        markerRef.current.bindPopup("<b>Reported Location Pin</b>").openPopup();
      } else {
        markerRef.current.bindPopup("<b>Peradeniya Engineering (Default Location)</b>").openPopup();
      }
    }

    return () => {
      // Clean up map on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [locationString]);

  return (
    <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-200 relative z-0">
      <div ref={mapContainerRef} style={{ height: '100%', width: '100%', zIndex: 0 }} />
    </div>
  );
}

export default function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [technicians, setTechnicians] = useState([]);
  const [assignedTechId, setAssignedTechId] = useState('');
  const [uploadedPhotoBase64, setUploadedPhotoBase64] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [adminVerified, setAdminVerified] = useState(false);
  const photoInputRef = useRef(null);

  useEffect(() => {
    fetchTicket();
    fetchTechnicians();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const res = await fetch(`http://localhost:5003/api/tickets/${id}`);
      const data = await res.json();
      setTicket(data);
      setStatus(data.status);
      setNotes(data.maintenance_notes || '');
      setAssignedTechId(data.assigned_technician_id || '');
      setUploadedPhotoBase64(null); // reset on reload
      setAdminVerified(data.admin_verified || false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const res = await fetch('http://localhost:5003/api/admin/technicians');
      if (res.ok) {
        const data = await res.json();
        setTechnicians(data);
      }
    } catch (err) {
      console.error('Error fetching technicians:', err);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedPhotoBase64(reader.result);
      setPhotoUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      // Use either newly uploaded photo or keep existing
      const photoToSave = uploadedPhotoBase64 || undefined;

      const res = await fetch(`http://localhost:5003/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          maintenance_notes: notes,
          assigned_technician_id: assignedTechId ? parseInt(assignedTechId, 10) : null,
          admin_verified: adminVerified,
          ...(photoToSave !== undefined && { photo_url: photoToSave }),
        })
      });
      if (res.ok) {
        setSaveSuccess(true);
        await fetchTicket();
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Error saving ticket', err);
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyCompletion = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`http://localhost:5003/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Resolved',
          admin_verified: true,
        })
      });
      if (res.ok) {
        setAdminVerified(true);
        setStatus('Resolved');
        setSaveSuccess(true);
        await fetchTicket();
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Error verifying ticket', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCcw className="animate-spin text-primary" size={32} />
          <p className="text-sm font-semibold text-slate-500">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle size={40} className="text-red-400 mx-auto mb-3" />
          <p className="text-slate-700 font-bold">Ticket not found</p>
          <button onClick={() => navigate('/')} className="mt-4 text-primary font-bold text-sm hover:underline">← Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const steps = ['Open', 'In Progress', 'Resolved'];
  const currentStepIndex = steps.indexOf(status);

  const priorityStyle =
    ticket.priority === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
    ticket.priority === 'Medium' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
    'bg-slate-700 text-slate-300 border-slate-600';

  // The currently active photo for this ticket
  const activePhoto = uploadedPhotoBase64 || ticket.photo_url;

  return (
    <>
      {/* Sticky Nav */}
      <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 px-4 py-4 flex items-center justify-between text-white shadow-xl">
        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span className="font-bold">Ticket Details</span>
        </button>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${priorityStyle}`}>
            {ticket.priority} Priority
          </span>
        </div>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 pt-6 pb-32">
        {/* Ticket Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="text-sm font-bold text-slate-500 bg-slate-200 px-2.5 py-0.5 rounded-lg uppercase">
              #{ticket.ticket_number || ticket.id}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
              <Clock size={12} />
              Reported <span className="text-primary ml-1">
                {new Date(ticket.reported_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-bold leading-tight mt-1 text-slate-900">{ticket.title}</h1>
          {ticket.description && (
            <p className="text-sm text-slate-600 mt-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </p>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
              <MapPin size={18} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
              <p className="text-sm font-bold text-slate-900 leading-snug mt-0.5">{ticket.location}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col gap-2">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <User size={18} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reported By</label>
              <p className="text-sm font-bold text-slate-900 leading-snug mt-0.5">{ticket.reported_by}</p>
            </div>
          </div>
        </div>

        {/* ─── CAMPUS MAP VISUALIZATION ─── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <h2 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            <MapPin size={15} className="text-primary" />
            Real-World Location Map
          </h2>
          <TicketMap locationString={ticket.location} />
        </div>

        {/* ─── REPORTER PHOTO SECTION ─── */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <h2 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            <Camera size={15} className="text-primary" />
            Issue Photo (Reporter Evidence)
          </h2>

          {activePhoto ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
              <img
                src={activePhoto}
                alt="Reported issue"
                className="w-full max-h-72 object-contain"
              />
              {uploadedPhotoBase64 && (
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow">New Upload</span>
                  <button
                    onClick={() => { setUploadedPhotoBase64(null); if (photoInputRef.current) photoInputRef.current.value = ''; }}
                    className="bg-red-500 text-white rounded-full p-1.5 shadow hover:bg-red-600 transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors group">
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              {photoUploading ? (
                <Loader2 size={28} className="text-primary animate-spin mb-2" />
              ) : (
                <>
                  <UploadCloud size={28} className="text-slate-300 group-hover:text-primary mb-2 transition-colors" />
                  <span className="text-sm font-semibold text-slate-500 group-hover:text-primary transition-colors">Attach Issue Photo</span>
                  <span className="text-[11px] text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                </>
              )}
            </label>
          )}

          {/* Replace photo option when existing photo exists */}
          {activePhoto && !uploadedPhotoBase64 && (
            <label className="mt-3 flex items-center justify-center gap-2 py-2.5 border border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors text-xs font-bold text-slate-400 hover:text-primary">
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              <Camera size={13} /> Replace / Update Photo
            </label>
          )}
        </section>

        {/* ─── TECHNICIAN ASSIGNMENT ─── */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <h2 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            <Users size={15} className="text-primary" />
            Assign Technician
          </h2>
          <select
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            value={assignedTechId}
            onChange={(e) => setAssignedTechId(e.target.value)}
          >
            <option value="">— Unassigned —</option>
            {technicians.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.department || 'Facilities'})</option>
            ))}
          </select>
          {ticket.assigned_technician_name && (
            <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-600 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
              <Users size={14} className="text-primary" />
              Currently: <span className="text-primary font-bold">{ticket.assigned_technician_name}</span>
            </div>
          )}
        </section>

        {/* ─── WORKER COMPLETION EVIDENCE ─── */}
        {ticket.worker_photo ? (
          <section className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-xs font-bold text-green-600 uppercase tracking-wider">
                <CheckCircle2 size={16} className="text-green-500" />
                Work Completion Verification
              </h2>
              <span className="bg-green-600 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Check size={9} strokeWidth={3} /> Submitted
              </span>
            </div>

            {/* Before / After Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Eye size={11} /> Before (Reported)
                </span>
                {ticket.photo_url ? (
                  <div className="h-44 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden">
                    <img src={ticket.photo_url} alt="Before" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="h-44 flex items-center justify-center bg-slate-50 text-xs text-slate-400 font-semibold border border-slate-100 rounded-xl">
                    No issue photo
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 size={11} /> After (Completed)
                </span>
                <div className="h-44 rounded-xl border-2 border-green-200 bg-slate-50 overflow-hidden shadow-sm">
                  <img src={ticket.worker_photo} alt="After" className="h-full w-full object-cover" />
                </div>
              </div>
            </div>

            {/* Worker Info Banner */}
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider block">Resolution Worker</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">
                    {ticket.assigned_technician_name || 'Assigned Technician'}
                  </p>
                </div>
                {adminVerified ? (
                  <div className="bg-green-600 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0">
                    <Shield size={9} /> Verified by Admin
                  </div>
                ) : (
                  <div className="bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0">
                    <Clock size={9} /> Awaiting Verification
                  </div>
                )}
              </div>

              {ticket.maintenance_notes && (
                <div className="mt-3 pt-3 border-t border-green-100">
                  <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider block mb-1.5">Worker Notes</span>
                  <p className="text-xs text-slate-700 leading-relaxed bg-white border border-slate-100 p-3 rounded-lg italic">
                    "{ticket.maintenance_notes}"
                  </p>
                </div>
              )}

              {!adminVerified && (
                <div className="mt-4 pt-4 border-t border-green-100 flex justify-end">
                  <button
                    onClick={handleVerifyCompletion}
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-100"
                  >
                    {saving ? (
                      <><Loader2 size={13} className="animate-spin" /> Verifying...</>
                    ) : (
                      <><CheckCircle2 size={13} /> Verify Completion</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </section>
        ) : (
          /* Pending verification placeholder */
          ticket.status !== 'Open' && (
            <section className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <Camera size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-800">Awaiting Worker Photo</p>
                  <p className="text-xs text-amber-600 mt-0.5">The assigned technician hasn't uploaded a completion photo yet.</p>
                </div>
              </div>
            </section>
          )
        )}

        {/* ─── STATUS TRACKER ─── */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Progress Tracker</h2>

          {/* Step indicators */}
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute left-6 right-6 top-5 h-1 bg-slate-100 -z-10 rounded-full">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${currentStepIndex === 0 ? 0 : currentStepIndex === 1 ? 50 : 100}%` }}
              ></div>
            </div>
            {steps.map((s, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={s} className="flex flex-col items-center gap-2 bg-white px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all ${
                    isCompleted ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' :
                    isCurrent ? 'bg-white border-primary text-primary shadow-md' :
                    'bg-slate-100 border-slate-200 text-slate-400'
                  }`}>
                    {isCompleted ? <Check size={16} strokeWidth={3} /> :
                     idx === 1 ? <Users size={15} /> : <CheckCircle2 size={15} />}
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider font-bold ${isCurrent || isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                    {s}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Status Buttons */}
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Update Status</h2>
          <div className="flex flex-wrap gap-2">
            {steps.map(s => (
              <button
                key={s}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                  status === s
                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25 scale-105'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
                onClick={() => setStatus(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        {/* ─── MAINTENANCE NOTES ─── */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <h2 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            Admin Notes
          </h2>
          <textarea
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 min-h-[120px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 resize-y"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about the maintenance performed..."
          />
        </section>

        {/* Save Button */}
        <button
          className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
            saveSuccess
              ? 'bg-green-500 text-white shadow-green-500/25'
              : 'bg-primary hover:bg-primary/90 text-white shadow-primary/25 hover:scale-[1.01] active:scale-100'
          } disabled:opacity-50`}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <><Loader2 size={20} className="animate-spin" /> Saving Changes...</>
          ) : saveSuccess ? (
            <><CheckCircle2 size={20} /> Changes Saved!</>
          ) : (
            <><Save size={20} /> Save Changes</>
          )}
        </button>
      </main>
    </>
  );
}
