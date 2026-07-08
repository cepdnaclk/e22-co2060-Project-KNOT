import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [faults, setFaults] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [studentRequests, setStudentRequests] = useState([]);
  
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [showAllFaults, setShowAllFaults] = useState(false);
  const [showAllRequests, setShowAllRequests] = useState(false);
  const navigate = useNavigate();
  
  const userString = localStorage.getItem('knot_lecturer');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if(!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [faultsRes, bookingsRes, requestsRes] = await Promise.all([
        axios.get('http://localhost:5002/api/lecturer/faults/' + user?.id),
        axios.get('http://localhost:5002/api/lecturer/bookings/' + user?.id),
        axios.get('http://localhost:5002/api/lecturer/requests/' + user?.id)
      ]);
      setFaults(faultsRes.data);
      setBookings(bookingsRes.data);
      setStudentRequests(requestsRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handleLogout = () => {
      localStorage.removeItem('knot_lecturer');
      navigate('/login');
  };

  const forwardToAR = async (id) => {
    try {
      await axios.put('http://localhost:5002/api/lecturer/requests/' + id + '/forward');
      fetchData(); 
    } catch (err) {
      alert("Failed to forward request.");
    }
  };

  const rejectRequest = async (id) => {
    try {
      await axios.put('http://localhost:5002/api/lecturer/requests/' + id + '/reject');
      fetchData(); 
    } catch (err) {
      alert("Failed to reject request.");
    }
  };

  if(!user) return null;

  return (
    <div className="bg-background-light text-slate-900 min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 px-4 py-3 text-white">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
             <img src="/knot_logo_white.png" alt="KNOT Logo" className="h-20 scale-[1.7] origin-left object-contain -ml-2 -my-4" />
          </div>
          <div className="flex items-center gap-3">
             <button onClick={handleLogout} className="p-2 text-red-400 rounded-full hover:bg-red-500/20">
               <span className="material-symbols-outlined">logout</span>
             </button>
             <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold hover:opacity-90 transition-opacity">
                 {user.name.charAt(0)}
             </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pb-24 pt-8">
        <section className="py-6">
          <h2 className="text-2xl font-bold">Hello, {user.name}</h2>
          <p className="text-slate-500">{user.department}</p>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center gap-3 p-4 bg-[#2d7dd2] text-white rounded-xl shadow-lg shadow-blue-500/20 hover:opacity-90 transition-all"
                onClick={() => navigate('/book-space')}>
              <span className="material-symbols-outlined text-3xl">meeting_room</span>
              <span className="text-sm font-bold">Book Resource</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
               onClick={() => navigate('/report-fault')}>
              <span className="material-symbols-outlined text-3xl text-[#2d7dd2]">report_problem</span>
              <span className="text-sm font-bold text-slate-700">Report Fault</span>
            </button>
          </div>
        </section>

        {/* Student Endorsement Requests */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
               Student Requests
               {studentRequests.length > 0 && <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold">{studentRequests.length}</span>}
            </h3>
            {studentRequests.length > 3 && (
               <button onClick={() => setShowAllRequests(!showAllRequests)} className="text-primary text-sm font-bold hover:underline">
                 {showAllRequests ? 'Show Less' : 'View All'}
               </button>
            )}
          </div>
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
             {studentRequests.length === 0 ? (
                 <div className="p-4 text-center text-sm text-slate-500">No pending requests.</div>
             ) : (
                (showAllRequests ? studentRequests : studentRequests.slice(0, 3)).map((req, index, arr) => (
                    <div key={req.id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${index !== arr.length - 1 ? 'border-b border-slate-50' : ''}`}>
                         <div className="flex items-center gap-3 flex-1">
                            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center border border-amber-100">
                                <span className="material-symbols-outlined">{req.icon || 'school'}</span>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <h4 className="font-bold text-[13px] truncate">{req.requestor_name || 'Student'} <span className="text-slate-400 font-normal">requested</span></h4>
                                <p className="text-[12px] font-bold text-primary truncate">{req.title}</p>
                                <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                                   <span className="material-symbols-outlined text-[14px]">schedule</span>
                                   {req.time_display}
                                </p>
                            </div>
                         </div>
                         <div className="flex items-center gap-2 mt-2 sm:mt-0">
                            <button onClick={() => rejectRequest(req.id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[11px] font-bold hover:bg-red-100 transition-colors">Reject</button>
                            <button onClick={() => forwardToAR(req.id)} className="px-3 py-1.5 bg-primary text-white rounded-lg text-[11px] font-bold hover:bg-primary/90 transition-colors flex items-center gap-1">
                               <span className="material-symbols-outlined text-[14px]">verified</span> Approve & Forward
                            </button>
                         </div>
                    </div>
                ))
             )}
          </div>
        </section>

        {/* My Bookings */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Upcoming Bookings</h3>
            {bookings.length > 3 && (
               <button onClick={() => setShowAllBookings(!showAllBookings)} className="text-primary text-sm font-bold hover:underline">
                 {showAllBookings ? 'Show Less' : 'View All'}
               </button>
            )}
          </div>
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
             {bookings.length === 0 ? (
                 <div className="p-4 text-center text-sm text-slate-500">No upcoming bookings.</div>
             ) : (
                (showAllBookings ? bookings : bookings.slice(0, 3)).map((b, index, arr) => (
                    <div key={b.id} className={`p-4 flex items-center justify-between ${index !== arr.length - 1 ? 'border-b border-slate-50' : ''}`}>
                         <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 ${b.status === 'Approved' ? 'bg-secondary/10 text-secondary' : 'bg-amber-100 text-amber-600'} rounded-lg flex items-center justify-center`}>
                                <span className="material-symbols-outlined">{b.icon || 'meeting_room'}</span>
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

        {/* My Fault Reports */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">My Fault Reports</h3>
            {faults.length > 3 && (
               <button onClick={() => setShowAllFaults(!showAllFaults)} className="text-primary text-sm font-bold hover:underline">
                 {showAllFaults ? 'Show Less' : 'View All'}
               </button>
            )}
          </div>
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
             {faults.length === 0 ? (
                 <div className="p-4 text-center text-sm text-slate-500">No recent maintenance requested.</div>
             ) : (
                (showAllFaults ? faults : faults.slice(0, 3)).map((f, index, arr) => (
                    <div key={f.id} className={`p-4 flex items-center justify-between ${index !== arr.length - 1 ? 'border-b border-slate-50' : ''}`}>
                         <div className="flex items-center gap-3">
                            <span className={`material-symbols-outlined ${f.status === 'Resolved' ? 'text-secondary' : 'text-primary'}`}>{f.icon || 'build'}</span>
                            <div>
                                <p className="text-sm font-bold">{f.title}</p>
                                <p className="text-[11px] text-slate-500">{f.status === 'Resolved' && f.resolved_at ? 'Fixed at ' + new Date(f.resolved_at).toLocaleString() : 'Reported at ' + new Date(f.created_at).toLocaleString()}</p>
                            </div>
                         </div>
                         
                         {f.status === 'Resolved' ? (
                             <span className="material-symbols-outlined text-secondary">check_circle</span>
                         ) : (
                             <div className="flex flex-col items-end">
                                 <span className="text-[10px] font-bold uppercase text-primary mb-1">{f.status}</span>
                                 <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
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
