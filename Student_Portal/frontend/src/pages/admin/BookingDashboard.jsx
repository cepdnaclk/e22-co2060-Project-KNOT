import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Calendar, Wrench, RefreshCcw,
  MapPin, Clock, Info, CheckCircle2,
  Home, CheckSquare, Settings, DoorOpen,
  Search, Menu
} from 'lucide-react';

export default function BookingDashboard() {
  const [stats, setStats] = useState({ totalBookingsToday: 0, pendingBookings: 0 });
  const [approvals, setApprovals] = useState([]);
  const [autoBookingEnabled, setAutoBookingEnabled] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsResponse = await fetch('http://localhost:5001/api/admin/bookings/stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

        const approvalsResponse = await fetch('http://localhost:5001/api/admin/pending-bookings');
        if (approvalsResponse.ok) {
          const approvalsData = await approvalsResponse.json();
          setApprovals(approvalsData);
        }
      } catch (error) {
        console.error("Error fetching database data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const handleAction = async (id, action) => {
    try {
      const response = await fetch(`http://localhost:5001/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: action }) 
      });

      if (response.ok) {
        setApprovals(approvals.filter(a => a.id !== id));
        setStats(prev => ({ ...prev, pendingBookings: Math.max(0, prev.pendingBookings - 1) }));
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };
  
  const handleLogout = () => {
      localStorage.removeItem('knot_user');
      navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark font-display overflow-hidden text-slate-900 dark:text-slate-100">

      {/* Sidebar - Made absolute for mobile, relative for md+ */}
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
          <button className="w-full flex items-center gap-3 px-3 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors">
            <Home size={20} className="shrink-0" />
            {sidebarOpen && <span className="font-semibold text-sm">Dashboard Overview</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-3 bg-primary text-white rounded-xl transition-colors shadow-lg shadow-primary/20">
            <CheckSquare size={20} className="shrink-0" />
            {sidebarOpen && <span className="font-semibold text-sm">Pending Approvals</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors">
            <Calendar size={20} className="shrink-0" />
            {sidebarOpen && <span className="font-semibold text-sm">All Bookings</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors">
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

        {/* Top Header */}
        <header className="h-16 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between px-4 md:px-8 shrink-0 z-10 relative">
          {/* Overlay for mobile when sidebar is open */}
          <div 
            className={`fixed inset-0 bg-black/50 z-10 md:hidden transition-opacity ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setSidebarOpen(false)}
          />

          <div className="flex items-center gap-4 z-20">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-300 hover:text-white transition-colors">
              <Menu size={20} />
            </button>
            <div className="relative hidden sm:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search bookings or students..."
                className="pl-10 pr-4 py-2 bg-slate-800/50 text-white placeholder-slate-400 border border-slate-700 rounded-full text-sm w-48 md:w-64 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 z-20">
            <button className="relative p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0f172a]"></span>
            </button>
            <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-slate-700 cursor-pointer">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-white">Booking Admin</p>
                <p className="text-xs text-slate-400 font-medium">AR Office</p>
              </div>
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm md:text-base shrink-0">
                BA
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">

          <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Welcome back, Administrator</h2>
              <p className="text-slate-500 mt-1">Manage today's booking applications.</p>
            </div>
            <div className="text-sm text-slate-500 font-medium bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm self-start">
              <Calendar size={16} className="inline mr-2 text-primary" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-primary/30 transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar size={24} />
                </div>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">↑ Tracking</span>
              </div>
              <div>
                <span className="text-4xl font-bold text-slate-900 block mb-1">{stats.totalBookingsToday}</span>
                <p className="text-slate-500 font-medium">Total Bookings Today</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-amber-500/30 transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wrench size={24} />
                </div>
                <span className="bg-amber-50 text-amber-600 text-xs font-bold px-2.5 py-1 rounded-full">{stats.pendingBookings > 0 ? "Action Required" : "All Clear"}</span>
              </div>
              <div>
                <span className="text-4xl font-bold text-slate-900 block mb-1">{stats.pendingBookings}</span>
                <p className="text-slate-500 font-medium">Pending Bookings</p>
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
                <p className="text-slate-500 text-sm mt-1 leading-snug">
                  Automatically approve requests based on pre-defined room availability rules.
                </p>
              </div>
            </div>
          </div>

          {/* Pending Approvals Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900">Pending Approvals</h2>
                <span className="bg-primary text-white text-xs font-bold px-2.5 py-0.5 rounded-full">{approvals.length}</span>
              </div>
              <button className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                View Full History
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {approvals.map((req) => (
                <div key={req.id} className="p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-center hover:bg-slate-50/50 transition-colors">

                  {/* User Info Column */}
                  <div className="flex items-center gap-4 w-full lg:w-1/4 shrink-0">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-slate-600 font-bold text-lg">{req.role?.charAt(0) || 'U'}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{req.user_name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase tracking-wide">
                          {req.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details Column */}
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
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-start gap-2">
                        <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider mb-0.5">Status</span>
                          <span className="font-medium text-amber-500 font-bold">{req.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex lg:flex-col gap-3 w-full lg:w-40 shrink-0 mt-4 lg:mt-0">
                    <button
                      onClick={() => handleAction(req.id, 'approve')}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors text-sm shadow-sm shadow-primary/20"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'reject')}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-white text-slate-700 border border-slate-200 font-bold hover:bg-slate-50 transition-colors text-sm shadow-sm"
                    >
                      Reject
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
      </main>
    </div>
  );
}
