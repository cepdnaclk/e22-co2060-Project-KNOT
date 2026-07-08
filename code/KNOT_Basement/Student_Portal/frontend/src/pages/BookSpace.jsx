import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function BookSpace() {
  const today = new Date().toISOString().split('T')[0];
  const [location, setLocation] = useState('eoe');
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const navigate = useNavigate();

  const userString = localStorage.getItem('knot_user');
  const user = userString ? JSON.parse(userString) : null;

  const timeOptions = [8, 9, 10, 11, 12, 13, 14, 15, 16];
  const formatTime = (val) => {
      const hour = Math.floor(val);
      const mins = val % 1 !== 0 ? '30' : '00';
      const ampm = hour >= 12 ? 'PM' : 'AM';
      let displayHour = hour > 12 ? hour - 12 : hour;
      if (displayHour === 0) displayHour = 12;
      const formattedHour = displayHour.toString().padStart(2, '0');
      return `${formattedHour}:${mins} ${ampm}`;
  };

  const locationsData = {
    eoe: { title: "EOE Hall - Engineering South" },
    do1: { title: "DO1 - Drawing Office 1" }
  };

  useEffect(() => {
      const fetchAvailability = async () => {
          try {
              const res = await axios.get(`http://localhost:5001/api/availability?date=${date}&title=${locationsData[location]?.title || ''}`);
              setBookedSlots(res.data);
          } catch(err) {
              console.error(err);
          }
      };
      if (date && location) {
          fetchAvailability();
          setStartTime(null); // Reset selection on change
      }
  }, [date, location]);

  const isSlotBooked = (t) => {
      const slotStart = t;
      const slotEnd = t + 1;
      return bookedSlots.some(b => {
          const timePart = b.time_display.split(' ').slice(1).join(' '); // "08:30 AM - 10:30 AM"
          const [startStr, endStr] = timePart.split(' - ');
          
          const parseTime = (str) => {
              if (!str) return 0;
              const [time, ampm] = str.split(' ');
              let [h, m] = time.split(':').map(Number);
              if (ampm === 'PM' && h !== 12) h += 12;
              if (ampm === 'AM' && h === 12) h = 0;
              return h + (m / 60);
          };
          
          const bStart = parseTime(startStr);
          const bEnd = parseTime(endStr);
          return Math.max(slotStart, bStart) < Math.min(slotEnd, bEnd);
      });
  };

  const handleBooking = async () => {
    if (date < today) return alert("Cannot book past date.");
    if (startTime === null) return alert("Please select a time slot.");
    if (date === today) {
        const now = new Date();
        const currentHourFloat = now.getHours() + (now.getMinutes() / 60);
        if (parseFloat(startTime) < currentHourFloat) {
            return alert("Cannot book a passed time slot.");
        }
    }
    if (!purpose.trim()) return alert("Provide purpose.");
    if (!lecturer && user?.role !== 'Lecturer') return alert("Select lecturer.");

    setLoading(true);
    try {
      const endTime = String(Number(startTime) + 1);
      const endHour = Math.floor(parseFloat(endTime));
      const endMins = parseFloat(endTime) % 1 !== 0 ? '30' : '00';
      const end_time = `${date} ${endHour.toString().padStart(2, '0')}:${endMins}:00`;

      await axios.post('http://localhost:5001/api/bookings', {
        title: locationsData[location].title,
        time_display: `${date} ${formatTime(startTime)} - ${formatTime(Number(startTime)+1)}`,
        user_id: user?.id,
        icon: location === 'do1' ? 'architecture' : 'science',
        status: user?.role === 'Lecturer' ? 'Pending AR' : 'Pending',
        end_time: end_time,
        assigned_lecturer: user?.role === 'Lecturer' ? null : lecturer,
        purpose: purpose
      });
      
      setTimeout(() => {
        navigate(user?.role === 'Lecturer' ? '/lecturer' : '/');
      }, 500);
    } catch(err) {
        console.error(err);
        if (err.response?.status === 409) {
            alert("This slot is already booked. Please choose another one.");
            // Refetch availability
            const res = await axios.get(`http://localhost:5001/api/availability?date=${date}&title=${locationsData[location]?.title || ''}`);
            setBookedSlots(res.data);
            setStartTime(null);
        } else {
            alert("Failed to submit booking.");
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 flex flex-col w-full pb-20">
      <header className="flex items-center justify-between p-4 bg-[#111827] shadow-sm z-10 w-full relative text-white h-16">
        <button className="flex items-center gap-1 text-slate-300 hover:text-white" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined text-[20px]">arrow_back_ios</span>
          <span className="font-bold text-sm">Back</span>
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 font-bold text-lg">Book a Resource</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 w-full max-w-3xl px-4 py-6 mx-auto space-y-6">
         {/* Info Alert */}
         <div className="bg-[#f0f7ff] border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-slate-800">info</span>
            <p className="text-sm text-[#3b82f6]">
               {user?.role === 'Lecturer' ? 'Your request will be sent directly to the AR office for final approval.' : 'Your request will first be sent to the selected lecturer for endorsement, then to the AR office for final approval.'}
            </p>
         </div>

         {/* Filter Availability Card */}
         <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2 text-slate-800">
                <span className="material-symbols-outlined">filter_alt</span>
                <h3 className="font-bold text-lg">Filter Availability</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-slate-400 tracking-wider mb-2 uppercase">Date</label>
                   <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 font-medium text-sm text-slate-700 focus:bg-white focus:border-slate-300 outline-none" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-400 tracking-wider mb-2 uppercase">Venue</label>
                   <div className="relative">
                       <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 pr-10 appearance-none font-medium text-sm text-slate-700 focus:bg-white focus:border-slate-300 outline-none">
                           <option value="eoe">EOE Hall</option>
                           <option value="do1">DO1</option>
                       </select>
                       <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none">expand_more</span>
                   </div>
                </div>
            </div>
         </div>

         {/* Available Slots Card */}
         <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2 text-slate-800">
                <span className="material-symbols-outlined text-green-500">event_available</span>
                <h3 className="font-bold text-lg">Available Slots</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {timeOptions.map(t => {
                    const booked = isSlotBooked(t);
                    const isSelected = startTime === String(t);
                    return (
                        <button 
                            key={t}
                            type="button"
                            disabled={booked}
                            onClick={() => setStartTime(String(t))}
                            className={`p-3.5 rounded-xl border text-sm font-bold transition-all ${
                                booked 
                                    ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                                    : isSelected
                                        ? 'border-blue-500 bg-blue-50 text-[#1e3a8a] shadow-sm'
                                        : 'border-slate-200 text-[#334155] hover:border-blue-300 hover:bg-blue-50/30'
                            }`}
                        >
                            {formatTime(t)} - {formatTime(t+1)}
                        </button>
                    );
                })}
            </div>
         </div>

         {/* Booking Details Card */}
         <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4 mb-8">
            <div className="flex items-center gap-2 mb-2 text-slate-800">
                <span className="material-symbols-outlined">edit_document</span>
                <h3 className="font-bold text-lg">Booking Details</h3>
            </div>

            <div className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-slate-400 tracking-wider mb-2 uppercase">Purpose of Booking</label>
                   <textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g., Club meeting, Supplementary lecture" className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 h-20 resize-none font-medium text-sm text-slate-700 focus:bg-white focus:border-slate-300 outline-none placeholder:text-slate-400"></textarea>
                </div>

                {user?.role !== 'Lecturer' && (
                <div>
                   <label className="block text-xs font-bold text-slate-400 tracking-wider mb-2 uppercase">Select Lecturer in Charge</label>
                   <div className="relative">
                       <select value={lecturer} onChange={(e) => setLecturer(e.target.value)} className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 pr-10 appearance-none font-medium text-sm text-slate-700 focus:bg-white focus:border-slate-300 outline-none">
                           <option value="" disabled>Choose a lecturer</option>
                           <option value="Dr. Smith">Dr. Smith</option>
                           <option value="Prof. Johnson">Prof. Johnson</option>
                       </select>
                       <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none">expand_more</span>
                   </div>
                </div>
                )}
            </div>
         </div>

         <button disabled={loading || startTime === null} onClick={handleBooking} className="w-full bg-[#90b4e0] hover:bg-[#7fa7d6] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md">
             <span>{loading ? 'Processing...' : 'Confirm Booking'}</span>
             <span className="material-symbols-outlined font-variation-fill">send</span>
         </button>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
            <button className="flex flex-col items-center gap-1 text-slate-400" onClick={() => navigate(user?.role === 'Lecturer' ? '/lecturer' : '/')}>
                <span className="material-symbols-outlined font-variation-fill">home</span>
                <span className="text-[10px] font-bold">Home</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-blue-500">
                <span className="material-symbols-outlined font-variation-fill">calendar_today</span>
                <span className="text-[10px] font-bold">Bookings</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-400" onClick={() => navigate('/report-fault')}>
                <span className="material-symbols-outlined">build</span>
                <span className="text-[10px] font-bold">Fix</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-400" onClick={() => navigate('/profile')}>
                <span className="material-symbols-outlined">person</span>
                <span className="text-[10px] font-bold">Profile</span>
            </button>
        </div>
      </nav>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
