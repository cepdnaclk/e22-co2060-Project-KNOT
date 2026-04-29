import React, { useState, useEffect } from 'react';
import { Calendar, Wrench, RefreshCcw, MapPin, Clock, Info, CheckSquare } from 'lucide-react';

// ─── DashboardOverview ─────────────────────────────────────────────────────
export function DashboardOverview({ stats, autoBookingEnabled, setAutoBookingEnabled }) {
  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome back, Administrator</h2>
          <p className="text-slate-500 mt-1">Here's an overview of today's bookings.</p>
        </div>
        <div className="text-sm text-slate-500 font-medium bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm self-start">
          <Calendar size={16} className="inline mr-2 text-blue-600" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-blue-400/50 transition-colors cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar size={24} />
            </div>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">↑ Tracking</span>
          </div>
          <div>
            <span className="text-4xl font-bold text-slate-900 block mb-1">{stats.totalBookingsToday}</span>
            <p className="text-slate-500 font-medium">Total Bookings Today</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-amber-400/50 transition-colors cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench size={24} />
            </div>
            <span className="bg-amber-50 text-amber-600 text-xs font-bold px-2.5 py-1 rounded-full">
              {stats.pendingBookings > 0 ? 'Action Required' : 'All Clear'}
            </span>
          </div>
          <div>
            <span className="text-4xl font-bold text-slate-900 block mb-1">{stats.pendingBookings}</span>
            <p className="text-slate-500 font-medium">Pending Bookings</p>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <RefreshCcw size={24} />
            </div>
            <button
              className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${autoBookingEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
              onClick={() => setAutoBookingEnabled(!autoBookingEnabled)}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${autoBookingEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Automated System</h3>
            <p className="text-slate-500 text-sm mt-1 leading-snug">
              Automatically approve requests based on pre-defined room availability rules.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PendingApprovals ───────────────────────────────────────────────────────
export function PendingApprovals({ approvals, loadingId, handleAction }) {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Pending Approvals</h2>
        <p className="text-slate-500 mt-1">Review and action booking requests forwarded by lecturers.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-slate-900">Requests</h3>
            <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">{approvals.length}</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {approvals.map((req) => (
            <div key={req.id} className="p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-center hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-4 w-full lg:w-1/4 shrink-0">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-slate-600 font-bold text-lg">{req.role?.charAt(0) || 'U'}</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{req.user_name}</h3>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase tracking-wide">{req.role}</span>
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
                    <strong className="text-slate-900">{req.booking_date}</strong>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-start gap-2">
                    <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider mb-0.5">Status</span>
                      <span className="font-bold text-amber-500">{req.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex lg:flex-col gap-3 w-full lg:w-40 shrink-0">
                <button
                  onClick={() => handleAction(req.id, 'approve')}
                  disabled={loadingId === req.id}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 active:scale-95 transition-all text-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingId === req.id
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : '✓ Approve'}
                </button>
                <button
                  onClick={() => handleAction(req.id, 'reject')}
                  disabled={loadingId === req.id}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white text-red-600 border border-red-200 font-bold hover:bg-red-50 active:scale-95 transition-all text-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingId === req.id
                    ? <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    : '✕ Reject'}
                </button>
              </div>
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
    </div>
  );
}

// ─── AllBookings ────────────────────────────────────────────────────────────
export function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetch('http://localhost:5001/api/admin/all-bookings')
      .then(r => r.json())
      .then(data => { setBookings(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const statusColors = {
    Approved: 'bg-green-100 text-green-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    'Pending AR': 'bg-amber-100 text-amber-700',
    Rejected: 'bg-red-100 text-red-700',
  };

  const statuses = ['All', 'Approved', 'Pending AR', 'Pending', 'Rejected'];
  const filtered = filter === 'All' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">All Bookings</h2>
        <p className="text-slate-500 mt-1">Complete history of all room booking requests in the system.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
              filter === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading bookings…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No bookings found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Room / Space</th>
                <th className="px-6 py-4">Requested By</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{b.room_name || b.title}</td>
                  <td className="px-6 py-4 text-slate-600">{b.user_name || '—'}</td>
                  <td className="px-6 py-4 text-slate-600">{b.booking_date || b.time_display}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[b.status] || 'bg-slate-100 text-slate-600'}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── RoomManagement ─────────────────────────────────────────────────────────
const ROOMS = [
  { id: 1, name: 'EOE - Main Lab', type: 'Laboratory', capacity: 40, floor: 'Ground', status: 'Available' },
  { id: 2, name: 'DO1 - Seminar Hall', type: 'Seminar Hall', capacity: 80, floor: '1st', status: 'Occupied' },
  { id: 3, name: 'Lab A - Computer Science', type: 'Laboratory', capacity: 30, floor: '2nd', status: 'Available' },
  { id: 4, name: 'Conference Room 2', type: 'Conference Room', capacity: 20, floor: '3rd', status: 'Under Maintenance' },
  { id: 5, name: 'Lecture Hall B', type: 'Lecture Hall', capacity: 120, floor: '1st', status: 'Available' },
  { id: 6, name: 'Library Study Room 1', type: 'Study Room', capacity: 10, floor: 'Ground', status: 'Available' },
];

export function RoomManagement() {
  const statusColors = {
    Available: 'bg-green-100 text-green-700',
    Occupied: 'bg-amber-100 text-amber-700',
    'Under Maintenance': 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Room Management</h2>
        <p className="text-slate-500 mt-1">View and manage all bookable spaces across campus.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {ROOMS.map(room => (
          <div key={room.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4 hover:border-blue-300 transition-colors group">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">{room.name}</h3>
                <p className="text-slate-500 text-sm mt-0.5">{room.type} · Floor {room.floor}</p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${statusColors[room.status]}`}>
                {room.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">👥</span>
              Capacity: <span className="font-semibold text-slate-700">{room.capacity} people</span>
            </div>
            <button className="mt-auto w-full py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all">
              Manage Room
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
