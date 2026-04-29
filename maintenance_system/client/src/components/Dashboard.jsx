import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, User, Filter, ChevronLeft, ChevronRight, ClipboardList, RefreshCcw, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        fetch('http://localhost:5003/api/tickets/stats'),
        fetch('http://localhost:5003/api/tickets?limit=4') // fetch top 4 as per mockup
      ]);
      const statsData = await statsRes.json();
      const ticketsData = await ticketsRes.json();

      setStats(statsData);
      setTickets(ticketsData.data);
      setPagination(ticketsData.pagination);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    setSearch(e.target.value);
    try {
      const res = await fetch(`http://localhost:5003/api/tickets?limit=4&search=${e.target.value}`);
      const data = await res.json();
      setTickets(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <RefreshCcw className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-slate-900 backdrop-blur-md border-b border-slate-800 px-4 py-3 text-white">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
             <img src="/knot_logo_white.png" alt="KNOT Logo" className="h-20 scale-[1.7] origin-left object-contain -ml-2 -my-4" />
          </div>
          <div className="flex items-center gap-4">
             <button className="relative text-slate-300 hover:text-white transition-colors">
               <Bell size={22} />
               <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>
             </button>
             <button className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold hover:opacity-90 transition-opacity shadow-md">
                 <User size={20} />
             </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pb-24 pt-8">
        <section className="py-2 mb-4">
          <h1 className="text-3xl font-bold leading-tight">Maintenance<br />Management</h1>
          <p className="text-sm text-slate-500 mt-2">Manage and update active service tickets.</p>
        </section>

        {stats && (
          <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-orange-100 text-orange-500 flex items-center justify-center shrink-0">
                  <ClipboardList size={24} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Open Tickets</h3>
                  <p className="text-2xl font-bold text-slate-900 leading-none">{stats.open}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-500 flex items-center justify-center shrink-0">
                  <RefreshCcw size={24} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">In Progress</h3>
                  <p className="text-2xl font-bold text-slate-900 leading-none">{stats.inProgress}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 text-green-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Resolved Today</h3>
                  <p className="text-2xl font-bold text-slate-900 leading-none">{stats.resolvedToday}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Active Tickets</h2>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                className="w-full border border-slate-200 bg-white rounded-xl py-3 pl-4 pr-10 text-sm focus:border-primary shadow-sm outline-none transition-colors"
                placeholder="Search locations or issues..."
                value={search}
                onChange={handleSearch}
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
              <Filter size={18} /> <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="hidden sm:flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <div className="flex-[2]">Location & Issue</div>
              <div className="flex-1 text-center">Priority</div>
              <div className="flex-1 text-right">Reported By</div>
            </div>

            {tickets.map((ticket, index) => (
              <Link to={`/ticket/${ticket.id}`} key={ticket.id} className={`block p-4 sm:flex items-center justify-between transition-colors hover:bg-slate-50 ${index !== tickets.length - 1 ? 'border-b border-slate-50' : ''}`}>
                <div className="flex-[2] mb-3 sm:mb-0">
                  <p className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span> {ticket.location}</p>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">{ticket.title}</h3>
                </div>
                
                <div className="flex-1 flex sm:justify-center mb-3 sm:mb-0">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                    ticket.priority === 'High' ? 'bg-red-100 text-red-700' :
                    ticket.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {ticket.priority}
                  </span>
                </div>
                
                <div className="flex-1 flex flex-col sm:items-end text-left sm:text-right">
                  <span className="text-sm font-bold text-slate-900">{ticket.reported_by}</span>
                  <span className="text-[11px] font-medium text-slate-500 mt-0.5">{new Date(ticket.reported_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </Link>
            ))}
            
            {tickets.length === 0 && (
                <div className="p-8 text-center text-slate-500">No tickets found matching your search.</div>
            )}
          </div>

          {pagination && tickets.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-2">
              <span className="text-xs font-bold text-slate-500">Showing {tickets.length} of {pagination.total} tickets</span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <button className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 disabled:opacity-50" disabled><ChevronLeft size={16} /></button>
                <button className="w-8 h-8 rounded-md bg-primary text-white text-sm font-bold flex items-center justify-center">1</button>
                <button className="w-8 h-8 rounded-md text-slate-600 text-sm font-bold flex items-center justify-center hover:bg-slate-100">2</button>
                <button className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </section>

        {stats && (
          <section className="mb-8">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg> Resolution Rate</h2>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
              <div className="space-y-5">
                {stats.resolutionRates.map((rate, idx) => {
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500'];
                  return (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-bold text-slate-700">{rate.category}</span>
                        <span className="text-sm font-bold text-slate-900">{rate.rate}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${colors[idx]} rounded-full`} style={{ width: `${rate.rate}%` }}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <button className="w-full mt-6 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 transition-colors">View Detailed Reports</button>
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


