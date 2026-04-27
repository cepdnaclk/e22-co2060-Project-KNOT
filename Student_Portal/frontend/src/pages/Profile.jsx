import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [faults, setFaults] = useState([]);
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  const userString = localStorage.getItem('knot_user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if(!user) return;
    const fetchData = async () => {
      try {
        const [faultsRes, bookingsRes] = await Promise.all([
          axios.get(`http://localhost:5001/api/faults/${user.id}`),
          axios.get(`http://localhost:5001/api/bookings/${user.id}`)
        ]);
        setFaults(faultsRes.data);
        setBookings(bookingsRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('knot_user');
    navigate('/login');
  };

  if(!user) return null;

  return (
    <div className="text-slate-900 min-h-screen flex flex-col items-center w-full bg-background-light">
      <header className="flex items-center justify-between p-4 z-10 w-full bg-slate-900 text-white border-b border-slate-800">
        <img src="/knot_logo_white.png" alt="KNOT Logo" className="h-20 scale-[1.7] origin-left object-contain -ml-2 -my-4" />
        <div className="flex gap-2">
          <button onClick={handleLogout} className="p-2 text-red-400 hover:bg-red-500/20 rounded-full transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl text-center pb-20">
        <div className="h-32 bg-gradient-to-b from-blue-50 to-background-light w-full"></div>
        <div className="flex flex-col items-center px-6 -mt-16 z-10 relative">
          <div className="relative w-32 h-32 mb-4">
            <div className="w-full h-full rounded-full border-4 border-white shadow-lg bg-cover bg-center flex items-center justify-center bg-primary text-white text-5xl font-bold">
               {user.name.charAt(0)}
            </div>
            <div className="absolute bottom-2 right-1 w-6 h-6 bg-secondary rounded-full border-[3px] border-white"></div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">{user.name}</h2>
          <p className="text-primary font-bold text-xs uppercase tracking-widest mb-2">{user.role}</p>
          <p className="text-sm text-slate-500 max-w-[250px] leading-relaxed mb-6">{user.department}</p>

          <div className="grid grid-cols-2 gap-4 w-full mb-8">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col items-start gap-1">
              <div className="flex items-center gap-2 mb-2 text-primary">
                <span className="material-symbols-outlined text-[20px]">event_available</span>
                <span className="text-[11px] font-bold uppercase tracking-wider">Bookings</span>
              </div>
              <span className="text-4xl font-bold text-slate-900">{bookings.length}</span>
              <span className="text-[11px] text-slate-500">Active this semester</span>
            </div>
            <div className="bg-[#f2faee] rounded-2xl p-5 shadow-sm border border-[#e2f1dd] flex flex-col items-start gap-1">
              <div className="flex items-center gap-2 mb-2 text-[#28a745]">
                <span className="material-symbols-outlined text-[20px] font-variation-fill">warning</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#28a745]">Issues</span>
              </div>
              <span className="text-4xl font-bold text-slate-900">{faults.length}</span>
              <span className="text-[11px] text-slate-500">Pending resolution</span>
            </div>
          </div>
        </div>

        <div className="px-6 text-left w-full mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">My Dashboard Analytics</h3>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-sm text-slate-500 italic pb-12">
               Refer to Dashboard tab for recent reports.
            </div>
        </div>
      </main>

      {/* Basic Navigation map to React router */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
            <button className="flex flex-col items-center gap-1 text-slate-400" onClick={() => navigate('/')}>
                <span className="material-symbols-outlined font-variation-fill">home</span>
                <span className="text-[10px] font-bold">Home</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-400" onClick={() => navigate('/book-space')}>
                <span className="material-symbols-outlined">calendar_today</span>
                <span className="text-[10px] font-bold">Bookings</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-400" onClick={() => navigate('/report-fault')}>
                <span className="material-symbols-outlined">build</span>
                <span className="text-[10px] font-bold">Fix</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-primary">
                <span className="material-symbols-outlined font-variation-fill">person</span>
                <span className="text-[10px] font-bold">Profile</span>
            </button>
        </div>
      </nav>
    </div>
  );
}
