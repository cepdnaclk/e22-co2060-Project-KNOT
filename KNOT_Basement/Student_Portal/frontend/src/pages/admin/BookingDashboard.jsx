import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Bell, Home, CheckSquare, Calendar,
  DoorOpen, Settings, Search, Menu, X,
  LogOut, User, ChevronRight, Clock, CheckCircle
} from 'lucide-react';

// ── Click-outside hook ─────────────────────────────────────────────────────
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => { if (ref.current && !ref.current.contains(e.target)) handler(); };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

export default function BookingDashboard() {
  const [stats, setStats]                       = useState({ totalBookingsToday: 0, pendingBookings: 0 });
  const [approvals, setApprovals]               = useState([]);
  const [autoBookingEnabled, setAutoBookingEnabled] = useState(true);
  const [sidebarOpen, setSidebarOpen]           = useState(true);
  const [toast, setToast]                       = useState(null);
  const [loadingId, setLoadingId]               = useState(null);

  // Dropdown state
  const [notifOpen, setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Refs for click-outside
  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  useClickOutside(notifRef,   () => setNotifOpen(false));
  useClickOutside(profileRef, () => setProfileOpen(false));

  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    try {
      const [statsRes, approvalsRes] = await Promise.all([
        fetch('http://localhost:5001/api/admin/bookings/stats'),
        fetch('http://localhost:5001/api/admin/pending-bookings'),
      ]);
      if (statsRes.ok)     setStats(await statsRes.json());
      if (approvalsRes.ok) setApprovals(await approvalsRes.json());
    } catch {
      showToast('Could not connect to server.', 'error');
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (id, action) => {
    setLoadingId(id);
    try {
      const res = await fetch(`http://localhost:5001/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setApprovals(prev => prev.filter(a => a.id !== id));
        setStats(prev => ({ ...prev, pendingBookings: Math.max(0, prev.pendingBookings - 1) }));
        showToast(
          action === 'approve' ? '✅ Booking approved successfully!' : '❌ Booking has been rejected.',
          action === 'approve' ? 'success' : 'error'
        );
      } else {
        showToast('Server error. Please try again.', 'error');
      }
    } catch {
      showToast('Failed to update booking. Check connection.', 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('knot_user');
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-sm font-semibold ${
      isActive
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  const navItems = [
    { to: '/booking-admin/dashboard',         icon: <Home size={20} className="shrink-0" />,        label: 'Dashboard Overview' },
    { to: '/booking-admin/pending-approvals', icon: <CheckSquare size={20} className="shrink-0" />, label: 'Pending Approvals', badge: approvals.length },
    { to: '/booking-admin/all-bookings',      icon: <Calendar size={20} className="shrink-0" />,    label: 'All Bookings' },
    { to: '/booking-admin/room-management',   icon: <DoorOpen size={20} className="shrink-0" />,    label: 'Room Management' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">

      {/* ── Toast ──────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-xl shadow-2xl border flex items-center gap-3 text-sm font-medium transition-all
          ${toast.type === 'success' ? 'bg-white border-green-200 text-green-700' : 'bg-white border-red-200 text-red-700'}`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)}><X size={15} /></button>
        </div>
      )}

      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside className={`
        ${sidebarOpen ? 'w-64' : 'w-0 md:w-20'}
        shrink-0 h-full transition-all duration-300 bg-[#0f172a] border-r border-slate-800
        flex flex-col z-20 overflow-hidden
      `}>
        <div className="h-16 flex items-center px-4 border-b border-slate-800 shrink-0">
          {sidebarOpen
            ? <img src="/knot_logo_white.png" alt="KNOT" className="h-24 scale-[1.8] object-contain ml-2" />
            : <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mx-auto">K</div>
          }
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.icon}
              {sidebarOpen && (
                <span className="flex-1 flex items-center justify-between">
                  {item.label}
                  {item.badge > 0 && (
                    <span className="ml-2 bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors text-sm font-semibold"
          >
            <Settings size={20} className="shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Top Header */}
        <header className="h-16 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between px-4 md:px-8 shrink-0 z-30 relative">

          {/* Left: hamburger + search */}
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-300 hover:text-white transition-colors">
              <Menu size={20} />
            </button>
            <div className="relative hidden sm:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search bookings or students..."
                className="pl-10 pr-4 py-2 bg-slate-800/50 text-white placeholder-slate-400 border border-slate-700 rounded-full text-sm w-48 md:w-64 focus:ring-2 focus:ring-blue-500/50 outline-none"
              />
            </div>
          </div>

          {/* Right: Notification + Profile */}
          <div className="flex items-center gap-2">

            {/* ── Notification Bell ── */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
                className="relative p-2.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                <Bell size={20} />
                {approvals.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0f172a] flex items-center justify-center">
                    <span className="sr-only">{approvals.length} notifications</span>
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                      <p className="text-xs text-slate-500">{approvals.length} pending request{approvals.length !== 1 ? 's' : ''}</p>
                    </div>
                    {approvals.length > 0 && (
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{approvals.length} new</span>
                    )}
                  </div>

                  {/* Notification list */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {approvals.length === 0 ? (
                      <div className="px-5 py-8 text-center">
                        <CheckCircle size={28} className="mx-auto text-green-400 mb-2" />
                        <p className="text-sm text-slate-500 font-medium">All caught up!</p>
                        <p className="text-xs text-slate-400 mt-1">No pending booking requests</p>
                      </div>
                    ) : (
                      approvals.map(req => (
                        <div key={req.id} className="px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => { navigate('/booking-admin/pending-approvals'); setNotifOpen(false); }}>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-amber-600 font-bold text-xs">{req.user_name?.charAt(0) || 'U'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">
                                {req.room_name}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5 truncate">
                                Requested by <span className="font-medium text-slate-700">{req.user_name}</span>
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <Clock size={10} className="text-slate-400" />
                                <span className="text-[10px] text-slate-400">{req.booking_date}</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full shrink-0">Pending</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {approvals.length > 0 && (
                    <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
                      <button
                        onClick={() => { navigate('/booking-admin/pending-approvals'); setNotifOpen(false); }}
                        className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        View all pending approvals
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Profile Button ── */}
            <div className="relative pl-2 border-l border-slate-700" ref={profileRef}>
              <button
                onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
                className="flex items-center gap-3 hover:opacity-90 transition-opacity"
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-white leading-tight">Booking Admin</p>
                  <p className="text-xs text-slate-400">AR Office</p>
                </div>
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all
                  ${profileOpen ? 'bg-blue-600 border-blue-400 text-white' : 'bg-blue-500/20 border-blue-500/30 text-blue-400'}`}>
                  BA
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                  {/* Profile info */}
                  <div className="px-5 py-4 bg-gradient-to-br from-blue-600 to-blue-700">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white font-bold text-lg">
                        BA
                      </div>
                      <div>
                        <p className="font-bold text-white">Booking Admin</p>
                        <p className="text-xs text-blue-100">bookadmin</p>
                        <p className="text-xs text-blue-200 mt-0.5">AR Office</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-2">
                    <button
                      onClick={() => { navigate('/booking-admin/dashboard'); setProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                    >
                      <Home size={16} className="text-slate-400" />
                      Dashboard
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User size={16} className="text-slate-400" />
                      My Profile
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Settings size={16} className="text-slate-400" />
                      Settings
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-slate-100 py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold"
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* ── Content Area ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <Outlet context={{ stats, approvals, autoBookingEnabled, setAutoBookingEnabled, loadingId, handleAction }} />
        </div>
      </main>
    </div>
  );
}
