import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  User, 
  AlertTriangle, 
  X, 
  ChevronRight, 
  LogOut, 
  Coffee, 
  ClipboardList,
  Save,
  QrCode
} from 'lucide-react';
import axios from 'axios';

export default function TechnicianDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const userString = localStorage.getItem('knot_user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (!user || user.role !== 'Technician') {
      navigate('/login');
      return;
    }
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5001/api/technician/tickets/${user.id}`);
      setTickets(res.data);
    } catch (err) {
      console.error("Error fetching technician tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('knot_user');
    navigate('/login');
  };

  const openTicketModal = (ticket) => {
    setSelectedTicket(ticket);
    setUpdateStatus(ticket.status);
    setUpdateNotes(ticket.maintenance_notes || '');
    setModalOpen(true);
  };

  const handleSaveProgress = async () => {
    if (!selectedTicket) return;
    setSaving(true);
    try {
      await axios.put(`http://localhost:5001/api/technician/tickets/${selectedTicket.id}`, {
        status: updateStatus,
        maintenance_notes: updateNotes
      });
      setModalOpen(false);
      fetchTickets();
    } catch (err) {
      console.error("Error updating ticket progress:", err);
      alert("Failed to update progress.");
    } finally {
      setSaving(false);
    }
  };

  // KPIs
  const activeTickets = tickets.filter(t => t.status !== 'Resolved');
  const urgentTickets = tickets.filter(t => t.priority === 'High' && t.status !== 'Resolved');

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen pb-24 font-sans">
      
      {/* TopAppBar */}
      <header className="bg-white dark:bg-slate-900 w-full sticky top-0 z-40 border-b border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-center px-4 py-3 w-full max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 bg-slate-100 flex items-center justify-center text-primary font-bold">
              {user?.name?.charAt(0) || 'T'}
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary leading-tight">KNOT Operations</h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Worker ID: #KN-{1000 + (user?.id || 0)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleLogout}
              className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">
        
        {/* Welcome Header */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-md uppercase font-bold tracking-wider">{user?.department || 'Operations'}</span>
            <h2 className="text-2xl font-bold mt-2">Good Morning, {user?.name || 'Technician'}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold ml-1">Active Shift • University Engineering Precinct</span>
            </div>
          </div>
        </section>

        {/* Status Cards: Bento Layout */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-primary flex items-center justify-center mb-2">
              <Wrench size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Tasks</p>
              <p className="text-3xl font-extrabold mt-1 text-slate-800 dark:text-slate-200">
                {String(tickets.length).padStart(2, '0')}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-500 flex items-center justify-center mb-2">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Urgent Tasks</p>
              <p className="text-3xl font-extrabold mt-1 text-red-600 dark:text-red-400">
                {String(urgentTickets.length).padStart(2, '0')}
              </p>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-500 flex items-center justify-center mb-2">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Remaining Shift</p>
              <p className="text-3xl font-extrabold mt-1 text-slate-800 dark:text-slate-200">4h 20m</p>
            </div>
          </div>
        </section>

        {/* Today's Agenda */}
        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Today's Work Orders</h3>
            <span className="text-xs text-slate-400 font-bold">{activeTickets.length} Active Tickets</span>
          </div>

          {loading ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-12 flex justify-center items-center">
              <span className="animate-pulse text-slate-400 font-semibold">Retrieving work orders...</span>
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 className="font-bold">No tasks assigned</h4>
                <p className="text-xs text-slate-400 mt-1">Check back later or contact your supervisor.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {tickets.map(ticket => (
                <div 
                  key={ticket.id} 
                  onClick={() => openTicketModal(ticket)}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex gap-4 items-center hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer shadow-sm"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    ticket.status === 'Resolved' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500' :
                    ticket.status === 'In Progress' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-500' :
                    'bg-amber-50 dark:bg-amber-950/20 text-amber-500'
                  }`}>
                    <Wrench size={22} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{ticket.title}</h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                        ticket.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' :
                        ticket.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-slate-400 font-semibold">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" />
                        <span className="truncate max-w-[150px]">{ticket.location?.split('\n')[0] || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" />
                        <span>{new Date(ticket.reported_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${
                          ticket.status === 'Resolved' ? 'bg-emerald-500' :
                          ticket.status === 'In Progress' ? 'bg-blue-500' :
                          'bg-amber-500'
                        }`}></span>
                        <span>{ticket.status}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="flex flex-col gap-4">
          <h3 className="text-lg font-bold">Quick Tools</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              onClick={() => alert("Scanner Initializing... Camera permissions requested.")}
              className="flex items-center justify-center gap-3 bg-primary text-white py-4 px-6 rounded-2xl shadow-md hover:bg-primary/95 active:scale-95 transition-all text-sm font-bold animate-pulse"
            >
              <QrCode size={20} />
              <span>Scan QR Code</span>
            </button>
            <button 
              onClick={() => alert("Inventory levels normal. 3 spares remaining for AC-Model-D.")}
              className="flex items-center justify-center gap-3 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 py-4 px-6 rounded-2xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all text-sm font-bold"
            >
              <span>Checking Parts</span>
            </button>
            <button 
              onClick={() => alert("15-minute break logged.")}
              className="flex items-center justify-center gap-3 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 py-4 px-6 rounded-2xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all text-sm font-bold"
            >
              <Coffee size={18} className="text-amber-500" />
              <span>Log Break</span>
            </button>
          </div>
        </section>

        {/* Fleet Health box */}
        <section>
          <div className="bg-primary/5 dark:bg-primary/10 border border-primary/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-primary font-bold text-sm mb-1">Fleet Health Status</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
                94% of operational equipment in Building A is performing within normal parameters. 3 maintenance cycles due this week.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-[0.03] transform translate-y-1/4 translate-x-1/8 pointer-events-none">
              <Wrench size={160} />
            </div>
          </div>
        </section>

      </main>

      {/* Detail Update Modal */}
      {modalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">#{selectedTicket.ticket_number || selectedTicket.id}</span>
                <h3 className="text-lg font-bold mt-1.5">{selectedTicket.title}</h3>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-400 shrink-0" />
                <span className="font-semibold">{selectedTicket.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={14} className="text-slate-400 shrink-0" />
                <span>Reported by <span className="font-semibold">{selectedTicket.reported_by}</span></span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-105 dark:border-slate-850">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {selectedTicket.description || 'No description provided.'}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Update Status</h4>
              <div className="flex gap-2">
                {['Open', 'In Progress', 'Resolved'].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setUpdateStatus(s)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                      updateStatus === s
                        ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Maintenance Notes</h4>
              <textarea
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                placeholder="Log materials used, time spent, or remaining diagnostics..."
                className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none min-h-[80px] resize-none"
              />
            </div>

            <button
              onClick={handleSaveProgress}
              disabled={saving}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/10 flex items-center justify-center gap-2 hover:bg-primary/95 transition-all disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Saving updates...' : 'Save Updates'}
            </button>
          </div>
        </div>
      )}

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-45 flex justify-around items-center px-2 py-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-lg">
        <button className="flex flex-col items-center justify-center text-primary font-bold px-4 py-1">
          <Wrench size={18} />
          <span className="text-[9px] mt-1 font-bold">Dashboard</span>
        </button>
        <button 
          onClick={() => alert("Assigned tasks lists filtered.")}
          className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:text-primary px-4 py-1"
        >
          <CheckCircle2 size={18} />
          <span className="text-[9px] mt-1">My Tasks</span>
        </button>
        <button 
          onClick={() => alert("Checking spares inventory status...")}
          className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:text-primary px-4 py-1"
        >
          <Coffee size={18} />
          <span className="text-[9px] mt-1">Inventory</span>
        </button>
        <button 
          onClick={() => alert(`Department of ${user?.department || 'Operations'}`)}
          className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:text-primary px-4 py-1"
        >
          <User size={18} />
          <span className="text-[9px] mt-1">Profile</span>
        </button>
      </nav>
    </div>
  );
}
