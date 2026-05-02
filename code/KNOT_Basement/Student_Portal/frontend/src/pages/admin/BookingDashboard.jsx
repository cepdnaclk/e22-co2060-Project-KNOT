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

      if (activeView === 'rooms') {
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
        </div>
      </main>
    </div>
  );
}
