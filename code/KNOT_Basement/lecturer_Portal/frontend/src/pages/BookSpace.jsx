import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function BookSpace() {
  const [location, setLocation] = useState('EOE Hall');
  const [purpose, setPurpose] = useState('');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('11:00 AM');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const userString = localStorage.getItem('knot_lecturer');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if(!user) navigate('/login');
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    const dateStr = tmrw.toISOString().split('T')[0];
    setDate(dateStr);
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        title: location,
        time_display: `${date}, ${startTime} - ${endTime}`,
        user_id: user.id,
        icon: 'meeting_room',
        status: 'Pending AR', 
        purpose
      };
      await axios.post('http://localhost:5002/api/lecturer/bookings', payload);
      navigate('/');
    } catch (err) {
      alert("Failed to submit booking");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background-light min-h-screen text-slate-900 flex flex-col w-full">
      <header className="flex items-center justify-between p-4 bg-slate-900 shadow-sm z-10 w-full relative text-white">
        <button className="flex items-center gap-1 text-slate-300 hover:text-white" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined text-[20px]">arrow_back_ios</span>
          <span className="font-bold text-sm">Back</span>
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 font-bold text-lg">Book a Resource</h1>
        <img src="/knot_logo_white.png" alt="KNOT Logo" className="h-20 scale-[1.7] origin-right object-contain -mr-2 -my-4" />
      </header>

      <main className="flex-1 w-full max-w-2xl px-4 py-6 mx-auto">
         <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 mb-6">
            <span className="material-symbols-outlined text-primary">info</span>
            <p className="text-[13px] text-blue-800 leading-tight">As a staff member, your resource bookings are sent directly to the <b>AR office</b> for final approval.</p>
         </div>

        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
              <h3 className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2">Resource Details</h3>
              
              <div>
                <label className="block text-sm font-semibold mb-1.5">Select Location</label>
                <div className="relative">
                  <select 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl py-3 pl-4 pr-10 appearance-none text-sm text-slate-700 font-medium focus:bg-white focus:border-primary outline-none"
                  >
                    <option value="EOE Hall">EOE Hall - Engineering</option>
                    <option value="DO1">DO1 - Drawing Office 1</option>
                    <option value="LH1">LH01 - Lecture Hall 01</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none">expand_more</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Purpose of Booking</label>
                <textarea 
                  value={purpose} onChange={(e) => setPurpose(e.target.value)} required
                  placeholder="e.g., Make-up lecture, Club meeting" 
                  className="w-full border border-slate-200 rounded-xl py-3 px-4 h-24 resize-none text-sm placeholder:text-slate-400 text-slate-700 bg-slate-50 focus:bg-white focus:border-primary outline-none" 
                />
              </div>
           </div>

           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
              <h3 className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2">Schedule Info</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-semibold mb-1.5 uppercase text-[10px] text-slate-400 tracking-wider">Date</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full border border-slate-200 bg-slate-50 rounded-xl py-2.5 px-4 font-bold text-sm text-slate-700 focus:bg-white focus:border-primary outline-none" />
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm font-semibold mb-1.5 uppercase text-[10px] text-slate-400 tracking-wider">Start</label>
                        <select value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="w-full border border-slate-200 bg-slate-50 rounded-xl py-2.5 px-3 font-bold text-sm text-slate-700 focus:bg-white focus:border-primary outline-none">
                            <option>08:00 AM</option><option>09:00 AM</option><option>10:00 AM</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1.5 uppercase text-[10px] text-slate-400 tracking-wider">End</label>
                        <select value={endTime} onChange={(e) => setEndTime(e.target.value)} required className="w-full border border-slate-200 bg-slate-50 rounded-xl py-2.5 px-3 font-bold text-sm text-slate-700 focus:bg-white focus:border-primary outline-none">
                            <option>10:00 AM</option><option>11:00 AM</option><option>12:00 PM</option>
                        </select>
                    </div>
                 </div>
              </div>
           </div>

           <button type="submit" disabled={isLoading} className="w-full bg-[#2d7dd2] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
              <span>{isLoading ? 'Submitting...' : 'Confirm Booking'}</span>
              <span className="material-symbols-outlined font-variation-fill">send</span>
           </button>
        </form>
      </main>
    </div>
  );
}
