import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TimetableCalendar from '../components/TimetableCalendar';

export default function LecturerDashboard() {
  const [faults, setFaults] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [studentRequests, setStudentRequests] = useState([]);
  
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [showAllFaults, setShowAllFaults] = useState(false);
  const [showAllRequests, setShowAllRequests] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [activeBookingTab, setActiveBookingTab] = useState('approved'); // approved, pending, rejected
  const [activeRequestTab, setActiveRequestTab] = useState('pending'); // pending, endorsed, rejected
  const navigate = useNavigate();
  
  const userString = localStorage.getItem('knot_user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if(!user || user.role !== 'Lecturer') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [faultsRes, bookingsRes, requestsRes] = await Promise.all([
        axios.get('http://localhost:5001/api/faults/' + user?.id),
        axios.get('http://localhost:5001/api/bookings/' + user?.id),
        axios.get('http://localhost:5001/api/lecturer/requests/' + user?.id)
      ]);
      setFaults(faultsRes.data);
      setBookings(bookingsRes.data);
      setStudentRequests(requestsRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handleLogout = () => {
      localStorage.removeItem('knot_user');
      navigate('/login');
  };

  const forwardToAR = async (id) => {
    try {
      await axios.put('http://localhost:5001/api/lecturer/requests/' + id + '/forward');
      fetchData(); 
    } catch (err) {
      alert("Failed to forward request.");
    }
  };

  const rejectRequest = async (id) => {
    try {
      await axios.put('http://localhost:5001/api/lecturer/requests/' + id + '/reject', { reason: rejectReason });
      setRejectingId(null);
      setRejectReason('');
      fetchData(); 
    } catch (err) {
      alert("Failed to reject request.");
    }
  };

  if(!user) return null;

  return (
    <div className="bg-background-light text-slate-900 min-h-screen flex flex-col font-display">
      <header className="sticky top-0 z-50 bg-[#0f172a] border-b border-slate-800 px-4 py-3 text-white h-16 flex items-center shrink-0">
        <div className="max-w-5xl w-full mx-auto flex items-center justify-between overflow-visible">
          <div className="flex items-center gap-2">
             <img src="/knot_logo_white.png" alt="KNOT Logo" className="h-24 scale-[1.8] object-contain ml-2" />
          </div>
          <div className="flex items-center gap-3">
             <button onClick={handleLogout} className="p-2 text-red-400 rounded-full hover:bg-slate-800 transition-colors">
               <span className="material-symbols-outlined">logout</span>
             </button>
             <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 text-primary flex items-center justify-center font-bold text-base transition-opacity">
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
            <button className="flex flex-col items-center justify-center gap-3 p-4 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                onClick={() => navigate('/book-space')}>
              <span className="material-symbols-outlined text-3xl font-variation-fill">meeting_room</span>
              <span className="text-sm font-bold">Book Resource</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
               onClick={() => navigate('/report-fault')}>
              <span className="material-symbols-outlined text-3xl text-primary font-variation-fill">report_problem</span>
              <span className="text-sm font-bold text-slate-700">Report Fault</span>
            </button>
          </div>
        </section>

        {/* Student Endorsement Requests */}
        <section className="mb-8">
          {(() => {
            const pendingRequests = studentRequests.filter(req => req.status === 'Pending');
            const endorsedRequests = studentRequests.filter(req => req.status === 'Pending AR' || req.status === 'Approved');
            const rejectedRequests = studentRequests.filter(req => req.status === 'Rejected');

            const activeTabRequests = activeRequestTab === 'pending' 
              ? pendingRequests 
              : activeRequestTab === 'endorsed' 
              ? endorsedRequests 
              : rejectedRequests;

            return (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                     Student Requests
                  </h3>
                  {activeTabRequests.length > 3 && (
                     <button onClick={() => setShowAllRequests(!showAllRequests)} className="text-primary text-sm font-bold hover:underline">
                       {showAllRequests ? 'Show Less' : 'View All'}
                     </button>
                  )}
                </div>

                {/* Requests Tabs */}
                <div className="flex border border-slate-200/60 mb-4 bg-slate-100/50 p-1 rounded-2xl">
                  <button 
                    onClick={() => { setActiveRequestTab('pending'); setShowAllRequests(false); }}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${activeRequestTab === 'pending' ? 'bg-white text-secondary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Pending Action ({pendingRequests.length})
                  </button>
                  <button 
                    onClick={() => { setActiveRequestTab('endorsed'); setShowAllRequests(false); }}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${activeRequestTab === 'endorsed' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Approved/Endorsed ({endorsedRequests.length})
                  </button>
                  <button 
                    onClick={() => { setActiveRequestTab('rejected'); setShowAllRequests(false); }}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${activeRequestTab === 'rejected' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Rejected ({rejectedRequests.length})
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                   {activeTabRequests.length === 0 ? (
                       <div className="p-6 text-center text-sm text-slate-500">
                         {activeRequestTab === 'pending' && "No requests requiring endorsement."}
                         {activeRequestTab === 'endorsed' && "No approved/endorsed requests."}
                         {activeRequestTab === 'rejected' && "No rejected requests."}
                       </div>
                   ) : (
                      (showAllRequests ? activeTabRequests : activeTabRequests.slice(0, 3)).map((req, index, arr) => (
                          <div key={req.id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${index !== arr.length - 1 ? 'border-b border-slate-50' : ''}`}>
                               <div className="flex items-center gap-3 flex-1">
                                  <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center border border-amber-100 shrink-0">
                                      <span className="material-symbols-outlined font-variation-fill">{req.icon || 'school'}</span>
                                  </div>
                                  <div className="flex-1 overflow-hidden">
                                      <h4 className="font-bold text-[13px] truncate">{req.requestor_name || 'Student'} <span className="text-slate-400 font-normal">requested</span></h4>
                                      <p className="text-[12px] font-bold text-primary truncate">{req.title}</p>
                                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                                         <span className="material-symbols-outlined text-[14px]">schedule</span>
                                         {req.time_display}
                                      </p>
                                      {req.purpose && (
                                        <p className="text-[11px] text-slate-600 mt-1 italic font-medium leading-tight">
                                          Purpose: {req.purpose}
                                        </p>
                                      )}
                                  </div>
                               </div>
                               <div className="flex flex-col items-end gap-2 mt-2 sm:mt-0">
                                  {req.status === 'Pending' ? (
                                      rejectingId === req.id ? (
                                          <div className="flex flex-col gap-2 w-full sm:w-48 shrink-0">
                                              <input type="text" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection..." className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded outline-none focus:ring-1 focus:ring-red-500/50" autoFocus />
                                              <div className="flex gap-2">
                                                  <button onClick={() => rejectRequest(req.id)} className="flex-1 py-1 px-2 rounded bg-red-600 text-white font-bold hover:bg-red-700 transition-colors text-[10px]">Confirm</button>
                                                  <button onClick={() => { setRejectingId(null); setRejectReason(''); }} className="flex-1 py-1 px-2 rounded bg-slate-200 text-slate-700 font-bold hover:bg-slate-300 transition-colors text-[10px]">Cancel</button>
                                              </div>
                                          </div>
                                      ) : (
                                          <div className="flex items-center gap-2">
                                              <button onClick={() => { setRejectingId(req.id); setRejectReason(''); }} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[11px] font-bold hover:bg-red-100 transition-colors">Reject</button>
                                              <button onClick={() => forwardToAR(req.id)} className="px-3 py-1.5 bg-primary text-white rounded-lg text-[11px] font-bold hover:bg-primary/90 transition-colors flex items-center gap-1">
                                                  <span className="material-symbols-outlined text-[14px] font-variation-fill">verified</span> Approve & Forward
                                              </button>
                                          </div>
                                      )
                                  ) : (
                                       <div className="flex flex-col items-end gap-1">
                                           <div className={`px-3 py-1 rounded-full text-xs font-bold ${req.status === 'Approved' ? 'bg-secondary/10 text-secondary' : req.status === 'Rejected' ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                               {req.status === 'Pending AR' ? 'Endorsed' : req.status}
                                           </div>
                                           {req.status === 'Rejected' && req.rejection_reason && (
                                               <p className="text-[10px] text-red-500 italic max-w-[150px] text-right truncate" title={req.rejection_reason}>
                                                   Reason: {req.rejection_reason}
                                               </p>
                                           )}
                                       </div>
                                  )}
                               </div>
                          </div>
                      ))
                   )}
                </div>
              </>
            );
          })()}
        </section>

        <section className="mb-8">
          {(() => {
            const approvedBookings = bookings.filter(b => b.status === 'Approved');
            const pendingBookings = bookings.filter(b => b.status === 'Pending' || b.status === 'Pending AR');
            const rejectedBookings = bookings.filter(b => b.status === 'Rejected');

            const activeTabBookings = activeBookingTab === 'approved' 
              ? approvedBookings 
              : activeBookingTab === 'pending' 
              ? pendingBookings 
              : rejectedBookings;

            return (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Upcoming Bookings</h3>
                  {activeTabBookings.length > 3 && (
                     <button onClick={() => setShowAllBookings(!showAllBookings)} className="text-primary text-sm font-bold hover:underline">
                       {showAllBookings ? 'Show Less' : 'View All'}
                     </button>
                  )}
                </div>

                {/* Status Tabs */}
                <div className="flex border border-slate-200/60 mb-4 bg-slate-100/50 p-1 rounded-2xl">
                  <button 
                    onClick={() => { setActiveBookingTab('approved'); setShowAllBookings(false); }}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${activeBookingTab === 'approved' ? 'bg-white text-secondary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Approved ({approvedBookings.length})
                  </button>
                  <button 
                    onClick={() => { setActiveBookingTab('pending'); setShowAllBookings(false); }}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${activeBookingTab === 'pending' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Pending ({pendingBookings.length})
                  </button>
                  <button 
                    onClick={() => { setActiveBookingTab('rejected'); setShowAllBookings(false); }}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${activeBookingTab === 'rejected' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Rejected ({rejectedBookings.length})
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                   {activeTabBookings.length === 0 ? (
                       <div className="p-6 text-center text-sm text-slate-500">
                         {activeBookingTab === 'approved' && "No approved bookings."}
                         {activeBookingTab === 'pending' && "No pending requests."}
                         {activeBookingTab === 'rejected' && "No rejected requests."}
                       </div>
                   ) : (
                      (showAllBookings ? activeTabBookings : activeTabBookings.slice(0, 3)).map((b, index, arr) => (
                          <div key={b.id} className={`p-4 flex items-center justify-between ${index !== arr.length - 1 ? 'border-b border-slate-50' : ''}`}>
                               <div className="flex items-center gap-3">
                                  <div className={`w-12 h-12 ${b.status === 'Approved' ? 'bg-secondary/10 text-secondary' : b.status === 'Rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'} rounded-xl flex items-center justify-center`}>
                                      <span className="material-symbols-outlined font-variation-fill">{b.icon || 'meeting_room'}</span>
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-[13px] truncate">{b.title}</h4>
                                      <p className="text-[12px] text-slate-500 mt-0.5">{b.time_display}</p>
                                      {b.purpose && (
                                        <p className="text-[11px] text-slate-600 mt-1 italic font-medium leading-tight">
                                          Purpose: {b.purpose}
                                        </p>
                                      )}
                                  </div>
                               </div>
                               <div className="flex flex-col items-end gap-1">
                                   <div className={`px-3 py-1 rounded-full text-xs font-bold ${b.status === 'Approved' ? 'bg-secondary/10 text-secondary' : b.status === 'Rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                       {b.status === 'Pending AR' ? 'Pending AR' : b.status}
                                   </div>
                                   {b.status === 'Rejected' && b.rejection_reason && (
                                     <p className="text-[10px] text-red-500 italic max-w-[150px] text-right truncate" title={b.rejection_reason}>
                                       Reason: {b.rejection_reason}
                                     </p>
                                   )}
                               </div>
                          </div>
                      ))
                   )}
                </div>
              </>
            );
          })()}
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
                            <span className={`material-symbols-outlined font-variation-fill ${f.status === 'Resolved' ? 'text-secondary' : 'text-primary'}`}>{f.icon || 'build'}</span>
                            <div>
                                <p className="text-sm font-bold">{f.title}</p>
                                <p className="text-[11px] text-slate-500">{f.status === 'Resolved' && f.resolved_at ? 'Fixed at ' + new Date(f.resolved_at).toLocaleString() : 'Reported at ' + new Date(f.created_at).toLocaleString()}</p>
                            </div>
                         </div>
                         
                         {f.status === 'Resolved' ? (
                             <span className="material-symbols-outlined text-secondary font-variation-fill">check_circle</span>
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

        <section className="mb-8">
          <TimetableCalendar />
        </section>
      </main>
    </div>
  );
}
