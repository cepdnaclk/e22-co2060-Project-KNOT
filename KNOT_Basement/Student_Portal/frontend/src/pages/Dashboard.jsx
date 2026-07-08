import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [faults, setFaults] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [showAllFaults, setShowAllFaults] = useState(false);
  const navigate = useNavigate();
  
  const userString = localStorage.getItem('knot_user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if(!user) return;

    // Fetch data from MySQL Backend
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
  }

  if(!user) return null;

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-slate-900 backdrop-blur-md border-b border-slate-800 px-4 py-3 text-white">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
             <img src="/knot_logo_white.png" alt="KNOT Logo" className="h-20 scale-[1.7] origin-left object-contain -ml-2 -my-4" />
          </div>
          <div className="flex items-center gap-3">
             <button onClick={handleLogout} className="p-2 text-red-400 rounded-full hover:bg-red-500/20">
               <span className="material-symbols-outlined">logout</span>
             </button>
             <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold hover:opacity-90 transition-opacity">
                 {user.name.charAt(0)}
             </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pb-24 pt-8">
        <section className="py-6">
          <h2 className="text-2xl font-bold">Hello, {user.name}</h2>
          <p className="text-slate-500 dark:text-slate-400">{user.department}</p>
        </section>

        <section className="mb-8">
          <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center gap-3 p-4 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                onClick={() => navigate('/book-space')}>
              <span className="material-symbols-outlined text-3xl">meeting_room</span>
              <span className="text-sm font-bold">Book a Hall</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
               onClick={() => navigate('/report-fault')}>
              <span className="material-symbols-outlined text-3xl text-primary">report_problem</span>
              <span className="text-sm font-bold">Report Fault</span>
            </button>
          </div>
        </section>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Upcoming Bookings</h3>
            {bookings.length > 3 && (
               <button onClick={() => setShowAllBookings(!showAllBookings)} className="text-primary text-sm font-bold hover:underline">
                 {showAllBookings ? 'Show Less' : 'View All'}
               </button>
            )}
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
             {bookings.length === 0 ? (
                 <div className="p-4 text-center text-sm text-slate-500">No upcoming bookings.</div>
             ) : (
                (showAllBookings ? bookings : bookings.slice(0, 3)).map((b, index, arr) => (
                    <div key={b.id} className={`p-4 flex items-center justify-between ${index !== arr.length - 1 ? 'border-b border-slate-50' : ''}`}>
                         <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 ${b.status === 'Approved' ? 'bg-secondary/10 text-secondary' : 'bg-amber-100 text-amber-600'} rounded-lg flex items-center justify-center`}>
                                <span className="material-symbols-outlined">{b.icon}</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-[13px] truncate">{b.title}</h4>
                                <p className="text-[12px] text-slate-500 mt-0.5">{b.time_display}</p>
                            </div>
                         </div>
                         <div className={`px-3 py-1 rounded-full text-xs font-bold ${b.status === 'Approved' ? 'bg-secondary/10 text-secondary' : 'bg-[#fff5e1] text-[#e09121]'}`}>
                             {b.status}
                         </div>
                    </div>
                ))
             )}
          </div>
        </section>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Recent Maintenance</h3>
            {faults.length > 3 && (
               <button onClick={() => setShowAllFaults(!showAllFaults)} className="text-primary text-sm font-bold hover:underline">
                 {showAllFaults ? 'Show Less' : 'View All'}
               </button>
            )}
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
             {faults.length === 0 ? (
                 <div className="p-4 text-center text-sm text-slate-500">No recent maintenance requested.</div>
             ) : (
                (showAllFaults ? faults : faults.slice(0, 3)).map((f, index, arr) => (
                    <div key={f.id} className={`p-4 flex items-center justify-between ${index !== arr.length - 1 ? 'border-b border-slate-50' : ''}`}>
                         <div className="flex items-center gap-3">
                            <span className={`material-symbols-outlined ${f.status === 'Resolved' ? 'text-secondary' : 'text-primary'}`}>{f.icon}</span>
                            <div>
                                <p className="text-sm font-bold">{f.title}</p>
                                <p className="text-xs text-slate-500">{f.status === 'Resolved' && f.resolved_at ? 'Fixed at ' + new Date(f.resolved_at).toLocaleString() : 'Reported at ' + new Date(f.created_at).toLocaleString()}</p>
                            </div>
                         </div>
                         
                         {f.status === 'Resolved' ? (
                             <span className="material-symbols-outlined text-secondary">check_circle</span>
                         ) : (
                             <div className="flex flex-col items-end">
                                 <span className="text-[10px] font-bold uppercase text-primary mb-1">{f.status}</span>
                                 <div className="w-16 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                     <div className="w-2/3 h-full bg-primary"></div>
                                 </div>
                             </div>
                         )}
                    </div>
                ))
             )}
          </div>
        </section>
      </main>
    </div>
  );
}
