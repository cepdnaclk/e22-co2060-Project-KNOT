import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, User, Filter, ChevronLeft, ChevronRight,
  ClipboardList, RefreshCcw, CheckCircle2, Plus, X,
  MapPin, Camera, AlertTriangle, UploadCloud, Loader2,
  Search, LogOut
} from 'lucide-react';

// Comprehensive KNOT campus location list for autocomplete
const KNOT_LOCATIONS = [
  'EOE Hall - Main Entrance',
  'EOE Hall - Level 2',
  'EOE Hall - Level 3',
  'EOE Hall - Auditorium',
  'D01 Seminar Room',
  'D02 Seminar Room',
  'D03 Seminar Room',
  'D04 Lecture Hall',
  'Library Level 1 - Reading Area',
  'Library Level 2 - Quiet Zone',
  'Library Level 3 - Computer Lab',
  'Cafeteria Annex',
  'Cafeteria Main Hall',
  'AB1 Computer Lab',
  'AB2 Computer Lab',
  'AB3 Engineering Workshop',
  'Science Lab Block A',
  'Science Lab Block B',
  'Main Lecture Hall - Block C',
  'Admin Block - Ground Floor',
  'Admin Block - Level 1',
  'Student Services Block',
  'Sports Complex - Indoor',
  'Sports Complex - Outdoor',
  'Student Lounge - Block A',
  'Parking Level 1',
  'Parking Level 2',
  'Server Room - IT Block',
  'Medical Centre',
  'Gymnasium',
];

function LocationAutocomplete({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    onChange(val);
    if (val.trim().length > 0) {
      const filtered = KNOT_LOCATIONS.filter(loc =>
        loc.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
      setOpen(filtered.length > 0);
    } else {
      setSuggestions(KNOT_LOCATIONS);
      setOpen(true);
    }
  };

  const handleFocus = () => {
    const filtered = value.trim()
      ? KNOT_LOCATIONS.filter(loc => loc.toLowerCase().includes(value.toLowerCase()))
      : KNOT_LOCATIONS;
    setSuggestions(filtered);
    setOpen(true);
  };

  const selectLocation = (loc) => {
    onChange(loc);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={handleInput}
          onFocus={handleFocus}
          placeholder="Type to search campus location..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-9 pr-4 text-sm text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          required
        />
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
          {suggestions.map((loc) => (
            <button
              type="button"
              key={loc}
              onMouseDown={() => selectLocation(loc)}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2"
            >
              <MapPin size={13} className="text-slate-400 shrink-0" />
              {loc}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const detectLocationFromText = (text) => {
  if (!text) return '';
  const lowerText = text.toLowerCase();
  
  // Sort locations by length descending to match longest substring first (e.g. "EOE Hall - Auditorium" before "EOE Hall")
  const sortedLocations = [...KNOT_LOCATIONS].sort((a, b) => b.length - a.length);
  
  for (const loc of sortedLocations) {
    if (lowerText.includes(loc.toLowerCase())) {
      return loc;
    }
  }
  
  // Try sub-parts if no exact match, e.g. "Science Lab" -> "Science Lab Block A"
  const shorthands = {
    'eoe': 'EOE Hall - Main Entrance',
    'auditorium': 'EOE Hall - Auditorium',
    'seminar': 'D01 Seminar Room',
    'lecture hall': 'D04 Lecture Hall',
    'library': 'Library Level 1 - Reading Area',
    'cafeteria': 'Cafeteria Main Hall',
    'science lab': 'Science Lab Block A',
    'admin': 'Admin Block - Ground Floor',
    'sports': 'Sports Complex - Indoor',
    'gym': 'Gymnasium',
    'parking': 'Parking Level 1',
    'server': 'Server Room - IT Block',
    'medical': 'Medical Centre'
  };
  
  for (const [key, loc] of Object.entries(shorthands)) {
    if (lowerText.includes(key)) {
      return loc;
    }
  }
  
  return '';
};

export function CampusMap({ selectedLocation, onSelectLocation }) {
  const buildings = [
    { id: 'admin', label: 'Admin Block', desc: 'Admin Block - Ground Floor', x: 10, y: 10, w: 90, h: 45, color: '#3b82f6', locs: ['Admin Block - Ground Floor', 'Admin Block - Level 1', 'Medical Centre'] },
    { id: 'sports', label: 'Sports & Gym', desc: 'Sports Complex - Indoor', x: 10, y: 65, w: 90, h: 60, color: '#f97316', locs: ['Sports Complex - Indoor', 'Sports Complex - Outdoor', 'Gymnasium'] },
    { id: 'parking', label: 'Parking Area', desc: 'Parking Level 1', x: 10, y: 135, w: 90, h: 40, color: '#64748b', locs: ['Parking Level 1', 'Parking Level 2'] },
    
    { id: 'eoe', label: 'EOE Hall', desc: 'EOE Hall - Main Entrance', x: 115, y: 10, w: 120, h: 80, color: '#2d7dd2', locs: ['EOE Hall - Main Entrance', 'EOE Hall - Level 2', 'EOE Hall - Level 3', 'EOE Hall - Auditorium'] },
    { id: 'library', label: 'Library', desc: 'Library Level 1 - Reading Area', x: 115, y: 100, w: 120, h: 75, color: '#10b981', locs: ['Library Level 1 - Reading Area', 'Library Level 2 - Quiet Zone', 'Library Level 3 - Computer Lab'] },
    
    { id: 'science', label: 'Science Labs', desc: 'Science Lab Block A', x: 250, y: 10, w: 95, h: 50, color: '#14b8a6', locs: ['Science Lab Block A', 'Science Lab Block B', 'Main Lecture Hall - Block C'] },
    { id: 'seminars', label: 'Seminars', desc: 'D01 Seminar Room', x: 250, y: 70, w: 95, h: 50, color: '#6366f1', locs: ['D01 Seminar Room', 'D02 Seminar Room', 'D03 Seminar Room', 'D04 Lecture Hall'] },
    { id: 'cafeteria', label: 'Cafeteria', desc: 'Cafeteria Main Hall', x: 250, y: 130, w: 95, h: 45, color: '#ef4444', locs: ['Cafeteria Main Hall', 'Cafeteria Annex'] },
  ];

  const getSelectedBuildingId = () => {
    if (!selectedLocation) return null;
    const b = buildings.find(b => b.locs.some(loc => loc.toLowerCase() === selectedLocation.toLowerCase() || selectedLocation.toLowerCase().includes(b.label.toLowerCase())));
    if (b) return b.id;
    if (selectedLocation.includes('EOE')) return 'eoe';
    if (selectedLocation.includes('Library')) return 'library';
    if (selectedLocation.includes('Cafeteria')) return 'cafeteria';
    if (selectedLocation.includes('Science')) return 'science';
    if (selectedLocation.includes('Seminar') || selectedLocation.includes('D0')) return 'seminars';
    if (selectedLocation.includes('Admin') || selectedLocation.includes('Medical')) return 'admin';
    if (selectedLocation.includes('Sports') || selectedLocation.includes('Gym')) return 'sports';
    if (selectedLocation.includes('Parking')) return 'parking';
    return null;
  };

  const selectedBuildingId = getSelectedBuildingId();

  return (
    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
          Interactive Campus Map
        </span>
        <span className="text-[10px] text-slate-400">Click a building to select location</span>
      </div>
      <div className="relative aspect-[355/185] w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
        <svg viewBox="0 0 355 185" className="w-full h-full select-none">
          <path d="M 0,145 L 355,145" stroke="#1e293b" strokeWidth="18" fill="none" />
          <path d="M 107,0 L 107,185" stroke="#1e293b" strokeWidth="14" fill="none" />
          <path d="M 242,0 L 242,185" stroke="#1e293b" strokeWidth="14" fill="none" />
          
          {buildings.map((b) => {
            const isSelected = selectedBuildingId === b.id;
            return (
              <g 
                key={b.id} 
                onClick={() => onSelectLocation(b.desc)} 
                className="group cursor-pointer"
              >
                {isSelected && (
                  <rect
                    x={b.x - 2}
                    y={b.y - 2}
                    width={b.w + 4}
                    height={b.h + 4}
                    rx="8"
                    ry="8"
                    fill="none"
                    stroke={b.color}
                    strokeWidth="3"
                    className="animate-pulse"
                  />
                )}
                <rect
                  x={b.x}
                  y={b.y}
                  width={b.w}
                  height={b.h}
                  rx="6"
                  ry="6"
                  fill={isSelected ? `${b.color}25` : '#1e293b'}
                  stroke={isSelected ? b.color : '#334155'}
                  strokeWidth={isSelected ? '2' : '1'}
                  className="transition-all duration-200 group-hover:fill-slate-800/80 group-hover:stroke-slate-400"
                />
                {isSelected && (
                  <circle cx={b.x + b.w / 2} cy={b.y + b.h / 2 - 10} r="4" fill={b.color} />
                )}
                <text
                  x={b.x + b.w / 2}
                  y={b.y + b.h / 2 + (isSelected ? 6 : 4)}
                  textAnchor="middle"
                  fill={isSelected ? '#ffffff' : '#94a3b8'}
                  fontSize="10"
                  fontWeight={isSelected ? 'bold' : '600'}
                  className="transition-all duration-200 group-hover:fill-white font-display"
                >
                  {b.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function ReportModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [photoBase64, setPhotoBase64] = useState(null);
  const [photoName, setPhotoName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const processPhotoFile = (file) => {
    setError('');
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be under 5MB.');
      return;
    }
    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoBase64(reader.result);
    reader.readAsDataURL(file);
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) processPhotoFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processPhotoFile(file);
    }
  };

  const removePhoto = () => {
    setPhotoBase64(null);
    setPhotoName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTitleChange = (val) => {
    setTitle(val);
    const detected = detectLocationFromText(val);
    if (detected) {
      setLocation(detected);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title || !location) { setError('Title and location are required.'); return; }
    setSubmitting(true);
    try {
      const adminId = localStorage.getItem('admin_id') || null;
      const res = await fetch('http://localhost:5003/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, description, location, priority,
          photo_url: photoBase64,
          user_id: adminId ? parseInt(adminId) : null
        })
      });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create ticket.');
      }
    } catch (err) {
      setError('Connection failed. Ensure the server is running.');
    } finally {
      setSubmitting(false);
    }
  };

  const priorityColors = {
    High: 'bg-red-100 text-red-700 border-red-200',
    Medium: 'bg-orange-100 text-orange-700 border-orange-200',
    Low: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between rounded-t-3xl shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-0.5">New Issue</p>
            <h3 className="text-lg font-bold">Report Maintenance Issue</h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl flex items-center gap-2 font-medium">
              <AlertTriangle size={16} className="shrink-0" />{error}
            </div>
          )}

          <form id="report-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Issue Title */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Issue Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="e.g. AC not working in EOE Hall"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>

            {/* Location with Autocomplete */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location *</label>
              <LocationAutocomplete value={location} onChange={setLocation} />
              {location && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-primary font-semibold">
                  <MapPin size={12} />
                  <span>Selected: {location}</span>
                </div>
              )}
            </div>

            {/* Visual Map Selector */}
            <CampusMap selectedLocation={location} onSelectLocation={setLocation} />

            {/* Priority */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Priority</label>
              <div className="grid grid-cols-3 gap-2">
                {['High', 'Medium', 'Low'].map(p => (
                  <button
                    key={p} type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                      priority === p
                        ? priorityColors[p] + ' ring-2 ring-offset-1 ' + (p === 'High' ? 'ring-red-400' : p === 'Medium' ? 'ring-orange-400' : 'ring-slate-400')
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {p === 'High' && '🔴 '}{p === 'Medium' && '🟡 '}{p === 'Low' && '🟢 '}{p}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <Camera size={12} className="inline mr-1" />Attach Photo (Optional)
              </label>
              {!photoBase64 ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer relative group ${
                    dragOver ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <input ref={fileInputRef} type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handlePhoto} />
                  <UploadCloud size={28} className={`mb-2 transition-colors ${dragOver ? 'text-primary' : 'text-slate-300 group-hover:text-primary'}`} />
                  <span className={`text-sm font-semibold transition-colors ${dragOver ? 'text-primary' : 'text-slate-500 group-hover:text-primary'}`}>
                    Click or drag &amp; drop photo here
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP up to 5MB</span>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img src={photoBase64} alt="Preview" className="w-full max-h-48 object-contain" />
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <button type="button" onClick={removePhoto}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-colors flex items-center justify-center">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="px-3 py-2 bg-white border-t border-slate-100 text-xs font-medium text-slate-500 flex items-center gap-1.5">
                    <Camera size={12} />{photoName}
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-100 flex gap-3 shrink-0 rounded-b-3xl">
          <button onClick={onClose} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors">
            Cancel
          </button>
          <button
            form="report-form" type="submit" disabled={submitting}
            className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? <><Loader2 size={18} className="animate-spin" />Submitting...</> : <><Plus size={18} />Submit Report</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const LIMIT = 6;

  const adminName = localStorage.getItem('admin_name') || 'Admin';

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, filterStatus, filterPriority]);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      let ticketUrl = `http://localhost:5003/api/tickets?limit=${LIMIT}&page=${page}`;
      if (search) ticketUrl += `&search=${encodeURIComponent(search)}`;
      if (filterStatus) ticketUrl += `&status=${encodeURIComponent(filterStatus)}`;
      if (filterPriority) ticketUrl += `&priority=${encodeURIComponent(filterPriority)}`;

      const [statsRes, ticketsRes] = await Promise.all([
        fetch('http://localhost:5003/api/tickets/stats'),
        fetch(ticketUrl)
      ]);
      const statsData = await statsRes.json();
      const ticketsData = await ticketsRes.json();
      setStats(statsData);
      setTickets(ticketsData.data);
      setPagination(ticketsData.pagination);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const val = e.target.value;
    setSearch(val);
    setCurrentPage(1);
    try {
      let url = `http://localhost:5003/api/tickets?limit=${LIMIT}&page=1&search=${encodeURIComponent(val)}`;
      if (filterStatus) url += `&status=${filterStatus}`;
      if (filterPriority) url += `&priority=${filterPriority}`;
      const res = await fetch(url);
      const data = await res.json();
      setTickets(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_name');
    localStorage.removeItem('admin_id');
    window.location.reload();
  };

  const totalPages = pagination ? Math.ceil(pagination.total / LIMIT) : 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCcw className="animate-spin text-primary" size={32} />
          <p className="text-sm font-semibold text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showReportModal && (
        <ReportModal
          onClose={() => setShowReportModal(false)}
          onSuccess={() => { fetchData(1); setCurrentPage(1); }}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900 backdrop-blur-md border-b border-slate-800 px-4 py-3 text-white shadow-xl">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/knot_logo_white.png" alt="KNOT Logo" className="h-20 scale-[1.7] origin-left object-contain -ml-2 -my-4" />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative text-slate-300 hover:text-white transition-colors p-2">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>
            </button>
            <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-1.5">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <User size={14} />
              </div>
              <span className="text-sm font-bold hidden sm:block">{adminName}</span>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-white transition-colors" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pb-28 pt-8">
        {/* Page Title + Report Button */}
        <section className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold leading-tight text-slate-900">Maintenance<br />Management</h1>
            <p className="text-sm text-slate-500 mt-2">Manage and update active service tickets.</p>
          </div>
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-100 shrink-0"
          >
            <Plus size={18} />
            <span className="hidden sm:block">Report Issue</span>
          </button>
        </section>

        {/* Stats Cards */}
        {stats && (
          <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center shrink-0">
                  <ClipboardList size={22} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Open Tickets</p>
                  <p className="text-3xl font-bold text-slate-900 leading-none">{stats.open}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-500 flex items-center justify-center shrink-0">
                  <RefreshCcw size={22} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">In Progress</p>
                  <p className="text-3xl font-bold text-slate-900 leading-none">{stats.inProgress}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-green-100 text-green-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Resolved</p>
                  <p className="text-3xl font-bold text-slate-900 leading-none">{stats.resolvedToday}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tickets Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Active Tickets</h2>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              {pagination?.total || 0} total
            </span>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                className="w-full border border-slate-200 bg-white rounded-xl py-3 pl-9 pr-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm outline-none transition-all"
                placeholder="Search locations or issues..."
                value={search}
                onChange={handleSearch}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-xl shadow-sm text-sm font-bold transition-colors ${showFilters ? 'bg-primary text-white border-primary' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
            >
              <Filter size={16} /> <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {/* Filter Chips */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 mb-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider self-center mr-1">Status:</span>
                {['', 'Open', 'In Progress', 'Resolved'].map(s => (
                  <button key={s} onClick={() => { setFilterStatus(s); setCurrentPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${filterStatus === s ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                    {s || 'All'}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider self-center mr-1">Priority:</span>
                {['', 'High', 'Medium', 'Low'].map(p => (
                  <button key={p} onClick={() => { setFilterPriority(p); setCurrentPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${filterPriority === p ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                    {p || 'All'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tickets List */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="hidden sm:flex items-center p-4 border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <div className="flex-[2]">Location &amp; Issue</div>
              <div className="flex-1 text-center">Priority</div>
              <div className="flex-1 text-center">Status</div>
              <div className="flex-1 text-right">Reported By</div>
            </div>

            {tickets.map((ticket, index) => {
              const priorityStyle =
                ticket.priority === 'High' ? 'bg-red-100 text-red-700' :
                ticket.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
                'bg-slate-100 text-slate-600';
              const statusStyle =
                ticket.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                'bg-orange-100 text-orange-700';

              return (
                <Link
                  to={`/ticket/${ticket.id}`}
                  key={ticket.id}
                  className={`block p-4 sm:flex items-center justify-between transition-colors hover:bg-primary/5 ${index !== tickets.length - 1 ? 'border-b border-slate-50' : ''}`}
                >
                  <div className="flex-[2] mb-3 sm:mb-0 flex items-center gap-3">
                    {ticket.photo_url && (
                      <img src={ticket.photo_url} alt="Issue" className="w-10 h-10 rounded-lg object-cover border border-slate-100 shrink-0" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-400 mb-0.5 flex items-center gap-1">
                        <MapPin size={11} className="text-primary" />{ticket.location}
                      </p>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">{ticket.title}</h3>
                    </div>
                  </div>

                  <div className="flex-1 flex sm:justify-center mb-2 sm:mb-0">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${priorityStyle}`}>
                      {ticket.priority}
                    </span>
                  </div>

                  <div className="flex-1 flex sm:justify-center mb-2 sm:mb-0">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${statusStyle}`}>
                      {ticket.status}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col sm:items-end text-left sm:text-right">
                    <span className="text-sm font-bold text-slate-900">{ticket.reported_by}</span>
                    <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                      {new Date(ticket.reported_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </Link>
              );
            })}

            {tickets.length === 0 && (
              <div className="p-12 text-center">
                <ClipboardList size={40} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 font-semibold">No tickets found.</p>
                <p className="text-slate-300 text-sm mt-1">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <span className="text-xs font-bold text-slate-400">
                Showing {tickets.length} of {pagination.total} tickets
              </span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${currentPage === p ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                  >{p}</button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Resolution Rate */}
        {stats && (
          <section className="mb-8">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              Resolution Rate
            </h2>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="space-y-5">
                {stats.resolutionRates.map((rate, idx) => {
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500'];
                  return (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-slate-700">{rate.category}</span>
                        <span className="text-sm font-bold text-slate-900">{rate.rate}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${colors[idx]} rounded-full transition-all duration-700`} style={{ width: `${rate.rate}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button className="w-full mt-6 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 transition-colors">
                View Detailed Reports
              </button>
            </div>
          </section>
        )}

        <div className="text-center text-xs font-medium text-slate-400 py-6">
          © 2026 KNOT Platform - Maintenance Management Portal.<br />All rights reserved.
        </div>
      </main>
    </>
  );
}
