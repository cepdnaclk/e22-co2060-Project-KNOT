import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Calendar, Wrench, RefreshCcw,
  MapPin, Clock, Info, CheckCircle2,
  Home, CheckSquare, Settings, DoorOpen,
  Search, Menu, Plus, Trash2, Edit2, Power
} from 'lucide-react';

export default function BookingDashboard() {
  const [activeView, setActiveView] = useState('overview'); // overview, pending, all-bookings, rooms
  const [stats, setStats] = useState({ totalBookingsToday: 0, pendingBookings: 0 });
  const [approvals, setApprovals] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  
  const [autoBookingEnabled, setAutoBookingEnabled] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', capacity: 30, type: 'Lecture Hall' });
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  
  const navigate = useNavigate();

  const [semesterStart, setSemesterStart] = useState(() => {
    const nextMon = new Date();
    nextMon.setDate(nextMon.getDate() + ((1 + 7 - nextMon.getDay()) % 7 || 7));
    return nextMon.toISOString().split('T')[0];
  });
  const [semesterEnd, setSemesterEnd] = useState(() => {
    const nextMon = new Date();
    nextMon.setDate(nextMon.getDate() + ((1 + 7 - nextMon.getDay()) % 7 || 7));
    nextMon.setDate(nextMon.getDate() + 15 * 7); // 15 weeks
    return nextMon.toISOString().split('T')[0];
  });
  const [bulkRows, setBulkRows] = useState([
    { roomName: '', dayOfWeek: 'Monday', startTime: '08:30', endTime: '10:30', purpose: '', lecturer: '' }
  ]);
  const [pasteData, setPasteData] = useState('');
  const [validationResults, setValidationResults] = useState(null);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [activeView]);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await fetch('http://localhost:5001/api/admin/bookings/stats');
      if (statsRes.ok) setStats(await statsRes.json());

      if (activeView === 'pending' || activeView === 'overview') {
        const approvalsRes = await fetch('http://localhost:5001/api/admin/pending-bookings');
        if (approvalsRes.ok) setApprovals(await approvalsRes.json());
      }
      
      if (activeView === 'all-bookings' || activeView === 'overview') {
        const bookingsRes = await fetch('http://localhost:5001/api/admin/all-bookings');
        if (bookingsRes.ok) setAllBookings(await bookingsRes.json());
      }

      if (activeView === 'rooms' || activeView === 'bulk-import' || activeView === 'overview') {
        const roomsRes = await fetch('http://localhost:5001/api/admin/rooms');
        if (roomsRes.ok) setRooms(await roomsRes.json());
      }
    } catch (error) {
      console.error("Error fetching database data:", error);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const payload = { action };
      if (action === 'reject') payload.reason = rejectReason;

      const response = await fetch(`http://localhost:5001/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) 
      });

      if (response.ok) {
        setRejectingId(null);
        setRejectReason('');
        fetchDashboardData();
      } else if (response.status === 409) {
        const errData = await response.json();
        alert(errData.error || 'Conflict detected: Room already booked.');
      } else {
        console.error("Failed to update booking status");
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5001/api/admin/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoom)
      });
      if (res.ok) {
        setIsAddingRoom(false);
        setNewRoom({ name: '', capacity: 30, type: 'Lecture Hall' });
        fetchDashboardData();
      }
    } catch (error) { console.error("Error adding room:", error); }
  };

  const handleToggleRoomStatus = async (room) => {
    const newStatus = room.status === 'Available' ? 'Maintenance' : 'Available';
    try {
      await fetch(`http://localhost:5001/api/admin/rooms/${room.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchDashboardData();
    } catch (error) { console.error("Error toggling room status:", error); }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      await fetch(`http://localhost:5001/api/admin/rooms/${id}`, { method: 'DELETE' });
      fetchDashboardData();
    } catch (error) { console.error("Error deleting room:", error); }
  };
  
  const handleLogout = () => {
      localStorage.removeItem('knot_user');
      navigate('/login');
  };

  const handleParsePaste = () => {
    if (!pasteData.trim()) return;
    const lines = pasteData.trim().split('\n');
    const parsed = lines
      .map(line => {
        const parts = line.includes('\t') ? line.split('\t') : line.split(',');
        if (parts.length === 1 && !parts[0].trim()) return null;
        return {
          roomName: parts[0]?.trim() || '',
          dayOfWeek: parts[1]?.trim() || 'Monday',
          startTime: parts[2]?.trim() || '08:30',
          endTime: parts[3]?.trim() || '10:30',
          purpose: parts[4]?.trim() || '',
          lecturer: parts[5]?.trim() || ''
        };
      })
      .filter(row => row !== null);

    if (parsed.length === 0) return;

    let newRows = [...bulkRows];
    if (newRows.length === 1 && !newRows[0].roomName && !newRows[0].purpose) {
      newRows = parsed;
    } else {
      newRows = [...newRows, ...parsed];
    }

    setBulkRows(newRows);
    setPasteData('');
  };

  const handleAddBulkRow = () => {
    setBulkRows([...bulkRows, { roomName: '', dayOfWeek: 'Monday', startTime: '08:30', endTime: '10:30', purpose: '', lecturer: '' }]);
  };

  const handleRemoveBulkRow = (index) => {
    const updated = [...bulkRows];
    updated.splice(index, 1);
    setBulkRows(updated);
  };

  const handleBulkRowChange = (index, field, value) => {
    const updated = [...bulkRows];
    updated[index][field] = value;
    setBulkRows(updated);
  };

  const handleValidateBulk = async () => {
    for (const r of bulkRows) {
      if (!r.roomName) {
        alert("Please select a room for all rows.");
        return;
      }
      if (!r.startTime || !r.endTime) {
        alert("Please select start and end times for all rows.");
        return;
      }
      if (!r.purpose) {
        alert("Please specify the purpose for all rows.");
        return;
      }
    }

    setValidating(true);
    setValidationResults(null);
    setImportSuccess(null);

    try {
      const res = await fetch('http://localhost:5001/api/admin/bookings/bulk-validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semesterStart,
          semesterEnd,
          rows: bulkRows
        })
      });
      if (res.ok) {
        const data = await res.json();
        setValidationResults(data);
      } else {
        alert("Validation request failed.");
      }
    } catch (error) {
      console.error("Error during bulk validation:", error);
    } finally {
      setValidating(false);
    }
  };

  const handleImportBulk = async () => {
    if (!validationResults) return;
    const validBookings = validationResults.filter(b => b.valid);
    if (validBookings.length === 0) {
      alert("No valid bookings to import.");
      return;
    }

    setImporting(true);
    try {
      const userString = localStorage.getItem('knot_user');
      const user = userString ? JSON.parse(userString) : null;

      const res = await fetch('http://localhost:5001/api/admin/bookings/bulk-insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookings: validBookings,
          userId: user?.id
        })
      });

      if (res.ok) {
        const data = await res.json();
        setImportSuccess({
          inserted: data.count,
          skipped: validationResults.length - data.count
        });
        setValidationResults(null);
        setBulkRows([{ roomName: '', dayOfWeek: 'Monday', startTime: '08:30', endTime: '10:30', purpose: '', lecturer: '' }]);
      } else {
        alert("Bulk import failed.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  const renderBulkImport = () => {
    return (
      <div className="flex flex-col gap-6 font-display pb-20">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Semester Pre-Bookings Bulk Sheet</h2>
          <p className="text-slate-500 mt-1">Directly paste schedules from Excel or manage weekly recurring bookings in the sheet below.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-1 flex flex-col gap-4">
            <h3 className="font-bold text-slate-900 text-sm">1. Semester Timeline</h3>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Start Date</label>
              <input 
                type="date" 
                value={semesterStart} 
                onChange={e => setSemesterStart(e.target.value)} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium text-slate-700" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">End Date</label>
              <input 
                type="date" 
                value={semesterEnd} 
                onChange={e => setSemesterEnd(e.target.value)} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium text-slate-700" 
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-2 flex flex-col gap-3">
            <h3 className="font-bold text-slate-900 text-sm">2. Fast Excel Paste</h3>
            <p className="text-xs text-slate-400 font-medium">Copy columns from Excel / Google Sheets and paste them here. Columns order must be: <br/>
              <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[10px] text-slate-600">Room Name (tab) Day of Week (tab) Start Time (tab) End Time (tab) Purpose (tab) Lecturer</span>
            </p>
            <textarea
              value={pasteData}
              onChange={e => setPasteData(e.target.value)}
              placeholder="Example:&#10;EOE Hall - Engineering South	Monday	08:30	10:30	CO324 Lecture	Dr. Smith"
              className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-xs font-mono resize-none"
            />
            <button 
              type="button" 
              onClick={handleParsePaste}
              className="self-end bg-slate-900 text-white text-xs font-bold py-2 px-4 rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
            >
              Parse & Append Rows
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-sm">3. Recurring Schedule Sheet</h3>
            <button 
              type="button" 
              onClick={handleAddBulkRow}
              className="flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold py-2 px-3 rounded-xl transition-all"
            >
              <Plus size={14} /> Add Row
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-650">
              <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 min-w-[200px]">Room</th>
                  <th className="px-4 py-3 min-w-[130px]">Day of Week</th>
                  <th className="px-4 py-3 min-w-[110px]">Start Time</th>
                  <th className="px-4 py-3 min-w-[110px]">End Time</th>
                  <th className="px-4 py-3 min-w-[180px]">Course / Purpose</th>
                  <th className="px-4 py-3 min-w-[150px]">Lecturer</th>
                  <th className="px-4 py-3 text-center w-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bulkRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-3 py-2">
                      <select
                        value={row.roomName}
                        onChange={e => handleBulkRowChange(idx, 'roomName', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-700 focus:ring-1 focus:ring-primary/50"
                      >
                        <option value="">-- Select Room --</option>
                        {rooms.map(room => (
                          <option key={room.id} value={room.name}>{room.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={row.dayOfWeek}
                        onChange={e => handleBulkRowChange(idx, 'dayOfWeek', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-700"
                      >
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input 
                        type="time" 
                        value={row.startTime} 
                        onChange={e => handleBulkRowChange(idx, 'startTime', e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-700" 
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input 
                        type="time" 
                        value={row.endTime} 
                        onChange={e => handleBulkRowChange(idx, 'endTime', e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-700" 
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input 
                        type="text" 
                        value={row.purpose} 
                        placeholder="e.g. CO324 Lecture"
                        onChange={e => handleBulkRowChange(idx, 'purpose', e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-750 placeholder:text-slate-400 focus:ring-1 focus:ring-primary/50" 
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input 
                        type="text" 
                        value={row.lecturer} 
                        placeholder="e.g. Dr. Smith"
                        onChange={e => handleBulkRowChange(idx, 'lecturer', e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-700" 
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button 
                        type="button" 
                        disabled={bulkRows.length <= 1}
                        onClick={() => handleRemoveBulkRow(idx)}
                        className="text-red-500 hover:text-red-700 disabled:opacity-30 p-1 rounded hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/30">
            <button 
              type="button" 
              onClick={handleValidateBulk} 
              disabled={validating}
              className="bg-primary text-white text-xs font-bold py-2.5 px-6 rounded-xl hover:bg-primary/95 transition-all shadow-md shadow-primary/10 disabled:opacity-50 flex items-center gap-1.5"
            >
              {validating ? 'Validating...' : 'Validate Schedule & Conflicts'}
            </button>
          </div>
        </div>

        {importSuccess && (
          <div className="bg-emerald-50 border border-emerald-250 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h4 className="font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 size={20} />
                Schedules Imported Successfully!
              </h4>
              <p className="text-emerald-700 text-xs mt-1 font-medium">
                Successfully inserted **{importSuccess.inserted}** recurring bookings for the semester. **{importSuccess.skipped}** bookings were skipped due to overlaps.
              </p>
            </div>
            <button 
              onClick={() => setImportSuccess(null)}
              className="text-xs bg-emerald-600 hover:bg-emerald-750 text-white font-bold py-2 px-4 rounded-xl shadow-sm transition-all shrink-0"
            >
              Clear Notice
            </button>
          </div>
        )}

        {validationResults && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4 animate-fade-in">
            <div className="flex justify-between items-end border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900">4. Generated Booking Dates</h3>
                <p className="text-slate-500 text-xs mt-1">Review validation output. Conflicts are highlighted in red and will be skipped.</p>
              </div>
              <button 
                type="button" 
                onClick={handleImportBulk}
                disabled={importing}
                className="bg-green-600 text-white text-xs font-bold py-2.5 px-5 rounded-xl hover:bg-green-700 transition-all shadow-md shadow-green-600/10"
              >
                {importing ? 'Importing...' : `Import ${validationResults.filter(b => b.valid).length} Valid Bookings`}
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-900 font-bold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Day</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Room</th>
                    <th className="px-4 py-3">Purpose</th>
                    <th className="px-4 py-3">Lecturer</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {validationResults.map((val, idx) => (
                    <tr key={idx} className={val.valid ? "hover:bg-slate-50" : "bg-red-50/20 hover:bg-red-50/30"}>
                      <td className="px-4 py-3 font-semibold text-slate-900">{val.date}</td>
                      <td className="px-4 py-3">{val.day_of_week}</td>
                      <td className="px-4 py-3">{val.time_display.split(' ').slice(1).join(' ')}</td>
                      <td className="px-4 py-3 font-medium text-slate-700">{val.room_name}</td>
                      <td className="px-4 py-3">{val.purpose}</td>
                      <td className="px-4 py-3">{val.assigned_lecturer}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${val.valid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {val.valid ? 'Valid' : 'Conflict'}
                        </span>
                        {val.conflict_details && (
                          <span className="block text-[10px] text-red-650 font-medium italic mt-0.5">{val.conflict_details}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOverview = () => (
    <>
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
          <p className="text-slate-500 mt-1">High-level summary of your booking system.</p>
        </div>
        <div className="text-sm text-slate-500 font-medium bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm self-start">
          <Calendar size={16} className="inline mr-2 text-primary" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <Calendar size={24} />
            </div>
          </div>
          <div>
            <span className="text-4xl font-bold text-slate-900 block mb-1">{stats.totalBookingsToday}</span>
            <p className="text-slate-500 font-medium">Total Bookings</p>
          </div>
        </div>

        <div onClick={() => setActiveView('pending')} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-amber-500/30 transition-colors cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench size={24} />
            </div>
            <span className="bg-amber-50 text-amber-600 text-xs font-bold px-2.5 py-1 rounded-full">{stats.pendingBookings > 0 ? "Action Required" : "All Clear"}</span>
          </div>
          <div>
            <span className="text-4xl font-bold text-slate-900 block mb-1">{stats.pendingBookings}</span>
            <p className="text-slate-500 font-medium">Pending Approvals</p>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="w-12 h-12 bg-blue-100 text-primary rounded-xl flex items-center justify-center">
              <RefreshCcw size={24} />
            </div>
            <button
              className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${autoBookingEnabled ? 'bg-primary' : 'bg-slate-300'}`}
              onClick={() => setAutoBookingEnabled(!autoBookingEnabled)}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${autoBookingEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Automated System</h3>
            <p className="text-slate-500 text-sm mt-1 leading-snug">Automatically approve requests based on availability.</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
         <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Bookings Snapshot</h3>
         <div className="divide-y divide-slate-100">
           {allBookings.slice(0, 5).map(b => (
             <div key={b.id} className="py-3 flex justify-between items-center">
               <div>
                 <p className="font-bold text-slate-900">{b.room_name}</p>
                 <p className="text-sm text-slate-500">{b.user_name} • {b.booking_date}</p>
               </div>
               <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${b.status === 'Approved' ? 'bg-green-100 text-green-700' : b.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                 {b.status}
               </span>
             </div>
           ))}
         </div>
      </div>
    </>
  );

  const renderPending = () => (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Pending Approvals</h2>
        <p className="text-slate-500 mt-1">Review and manage incoming booking requests.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="divide-y divide-slate-100">
          {approvals.map((req) => (
            <div key={req.id} className="p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-center hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-4 w-full lg:w-1/4 shrink-0">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-slate-600 font-bold text-lg">{req.role?.charAt(0) || 'U'}</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{req.user_name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase tracking-wide">{req.role}</span>
                    {req.assigned_lecturer && (
                        <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase tracking-wide flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px] font-variation-fill">verified</span>
                            Endorsed by {req.assigned_lecturer}
                        </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-900">{req.room_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-slate-400 shrink-0" />
                    <span><strong className="text-slate-900">{req.booking_date}</strong></span>
                  </div>
                </div>
              </div>
              {rejectingId === req.id ? (
                <div className="flex flex-col gap-2 w-full lg:w-48 shrink-0 mt-4 lg:mt-0">
                  <input type="text" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection..." className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500/50" autoFocus />
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(req.id, 'reject')} className="flex-1 py-2 px-3 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-colors text-xs">Confirm</button>
                    <button onClick={() => { setRejectingId(null); setRejectReason(''); }} className="flex-1 py-2 px-3 rounded-lg bg-slate-200 text-slate-700 font-bold hover:bg-slate-300 transition-colors text-xs">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex lg:flex-col gap-3 w-full lg:w-40 shrink-0 mt-4 lg:mt-0">
                  <button onClick={() => handleAction(req.id, 'approve')} className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors text-sm shadow-sm shadow-primary/20">Approve</button>
                  <button onClick={() => { setRejectingId(req.id); setRejectReason(''); }} className="flex-1 py-2.5 px-4 rounded-xl bg-white text-slate-700 border border-slate-200 font-bold hover:bg-slate-50 transition-colors text-sm shadow-sm">Reject</button>
                </div>
              )}
            </div>
          ))}
          {approvals.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckSquare size={24} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">All caught up!</h3>
              <p className="text-slate-500">There are no pending booking requests right now.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  const renderAllBookings = () => (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">All Bookings</h2>
        <p className="text-slate-500 mt-1">Complete history of all booking requests.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Room</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Date/Time</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allBookings.map(b => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{b.room_name}</td>
                  <td className="px-6 py-4">{b.user_name}</td>
                  <td className="px-6 py-4 text-xs"><span className="bg-slate-100 px-2 py-1 rounded">{b.role}</span></td>
                  <td className="px-6 py-4">{b.booking_date}</td>
                  <td className="px-6 py-4">
                     <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${b.status === 'Approved' ? 'bg-green-100 text-green-700' : b.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                       {b.status}
                     </span>
                     {b.status === 'Rejected' && b.rejection_reason && (
                       <p className="text-xs text-red-600 mt-1 italic max-w-xs truncate" title={b.rejection_reason}>
                         {b.rejection_reason}
                       </p>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {allBookings.length === 0 && <div className="p-8 text-center text-slate-500">No bookings found.</div>}
        </div>
      </div>
    </>
  );

  const renderRooms = () => (
    <>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Room Management</h2>
          <p className="text-slate-500 mt-1">Manage available rooms and capacities.</p>
        </div>
        <button onClick={() => setIsAddingRoom(!isAddingRoom)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-primary/90 transition-colors">
          <Plus size={18} /> Add Room
        </button>
      </div>

      {isAddingRoom && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
          <h3 className="font-bold text-slate-900 mb-4">Add New Room</h3>
          <form onSubmit={handleAddRoom} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Room Name</label>
              <input required type="text" value={newRoom.name} onChange={e => setNewRoom({...newRoom, name: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. EOE - Lab 2" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Capacity</label>
              <input required type="number" value={newRoom.capacity} onChange={e => setNewRoom({...newRoom, capacity: parseInt(e.target.value)})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
              <select value={newRoom.type} onChange={e => setNewRoom({...newRoom, type: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/50">
                <option>Lecture Hall</option>
                <option>Seminar Hall</option>
                <option>Lab</option>
                <option>Meeting Room</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700">Save</button>
              <button type="button" onClick={() => setIsAddingRoom(false)} className="flex-1 bg-slate-200 text-slate-700 font-bold py-2 rounded-lg hover:bg-slate-300">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => (
          <div key={room.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-slate-900">{room.name}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${room.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {room.status}
                </span>
              </div>
              <p className="text-slate-500 text-sm mb-4">{room.type} • Capacity: {room.capacity}</p>
            </div>
            <div className="flex gap-2 border-t border-slate-100 pt-4">
              <button onClick={() => handleToggleRoomStatus(room)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${room.status === 'Available' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                <Power size={16} />
                {room.status === 'Available' ? 'Disable' : 'Enable'}
              </button>
              <button onClick={() => handleDeleteRoom(room.id)} className="w-10 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark font-display overflow-hidden text-slate-900 dark:text-slate-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0 md:w-20 md:translate-x-0'} absolute md:relative h-full transition-all duration-300 bg-[#0f172a] border-r border-slate-800 flex flex-col z-20`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0 overflow-visible">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'md:justify-center w-full'}`}>
            {sidebarOpen ? (
              <img src="/knot_logo_white.png" alt="KNOT Logo" className="h-24 scale-[1.8] object-contain ml-2" />
            ) : (
              <div className="w-8 h-8 bg-blue-600 rounded-lg md:flex items-center justify-center text-white font-bold shrink-0 hidden">K</div>
            )}
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
          <button onClick={() => setActiveView('overview')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${activeView === 'overview' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <Home size={20} className="shrink-0" />
            {sidebarOpen && <span className="font-semibold text-sm">Dashboard Overview</span>}
          </button>
          <button onClick={() => setActiveView('pending')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${activeView === 'pending' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <CheckSquare size={20} className="shrink-0" />
            {sidebarOpen && <span className="font-semibold text-sm">Pending Approvals</span>}
            {sidebarOpen && stats.pendingBookings > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{stats.pendingBookings}</span>}
          </button>
          <button onClick={() => setActiveView('all-bookings')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${activeView === 'all-bookings' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <Calendar size={20} className="shrink-0" />
            {sidebarOpen && <span className="font-semibold text-sm">All Bookings</span>}
          </button>
          <button onClick={() => setActiveView('rooms')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${activeView === 'rooms' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <DoorOpen size={20} className="shrink-0" />
            {sidebarOpen && <span className="font-semibold text-sm">Room Management</span>}
          </button>
          <button onClick={() => setActiveView('bulk-import')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${activeView === 'bulk-import' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <svg className="w-5 h-5 shrink-0 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            {sidebarOpen && <span className="font-semibold text-sm">Bulk Import</span>}
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors">
            <Settings size={20} className="shrink-0" />
            {sidebarOpen && <span className="font-semibold text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between px-4 md:px-8 shrink-0 z-10 relative">
          <div className={`fixed inset-0 bg-black/50 z-10 md:hidden transition-opacity ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)} />
          <div className="flex items-center gap-4 z-20">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-300 hover:text-white transition-colors"><Menu size={20} /></button>
            <div className="relative hidden sm:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-slate-800/50 text-white placeholder-slate-400 border border-slate-700 rounded-full text-sm w-48 md:w-64 focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 z-20">
            <button className="relative p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
              <Bell size={20} />
              {stats.pendingBookings > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0f172a]"></span>}
            </button>
            <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-slate-700 cursor-pointer">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-white">Booking Admin</p>
                <p className="text-xs text-slate-400 font-medium">AR Office</p>
              </div>
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm md:text-base shrink-0">BA</div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          {activeView === 'overview' && renderOverview()}
          {activeView === 'pending' && renderPending()}
          {activeView === 'all-bookings' && renderAllBookings()}
          {activeView === 'rooms' && renderRooms()}
          {activeView === 'bulk-import' && renderBulkImport()}
        </div>
      </main>
    </div>
  );
}
