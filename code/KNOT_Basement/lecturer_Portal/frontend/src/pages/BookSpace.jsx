import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function BookSpace() {
  const today = new Date().toISOString().split('T')[0];
  const [location, setLocation] = useState('EOE Hall');
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const navigate = useNavigate();

  const userString = localStorage.getItem('knot_lecturer');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const locationsData = {
    'EOE Hall': 'EOE Hall - Engineering South',
    'DO1':      'DO1 - Drawing Office 1',
    'LH1':      'LH01 - Lecture Hall 01',
  };

  const timeOptions = [8, 9, 10, 11, 12, 13, 14, 15, 16];

  const formatTime = (val) => {
    const hour = Math.floor(val);
    const mins = val % 1 !== 0 ? '30' : '00';
    const ampm = hour >= 12 ? 'PM' : 'AM';
    let displayHour = hour > 12 ? hour - 12 : hour;
    if (displayHour === 0) displayHour = 12;
    return `${displayHour.toString().padStart(2, '0')}:${mins} ${ampm}`;
  };

  // Fetch availability whenever date or location changes
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const title = locationsData[location] || location;
        const res = await axios.get(`http://localhost:5002/api/lecturer/availability?date=${date}&title=${title}`);
        setBookedSlots(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (date && location) {
      fetchAvailability();
      setStartTime(null);
    }
  }, [date, location]);

  const isSlotBooked = (t) => {
    const slotStart = t;
    const slotEnd = t + 1;
    return bookedSlots.some(b => {
      const timePart = b.time_display.split(' ').slice(1).join(' ');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (startTime === null) return alert("Please select a time slot.");
    if (!purpose.trim()) return alert("Please enter the purpose of booking.");
    if (date < today) return alert("Cannot book a past date.");

    setIsLoading(true);
    try {
      const title = locationsData[location] || location;
      const endHour = Number(startTime) + 1;
      const end_time = `${date} ${String(endHour).padStart(2, '0')}:00:00`;
      const time_display = `${date} ${formatTime(Number(startTime))} - ${formatTime(Number(startTime) + 1)}`;

      await axios.post('http://localhost:5002/api/lecturer/bookings', {
        title,
        time_display,
        user_id: user?.id,
        icon: 'meeting_room',
        status: 'Pending AR',
        end_time,
        purpose,
      });
      navigate('/');
    } catch (err) {
      if (err.response?.status === 409) {
        alert("This slot is already booked. Please choose another.");
        const title = locationsData[location] || location;
        const res = await axios.get(`http://localhost:5002/api/lecturer/availability?date=${date}&title=${title}`);
        setBookedSlots(res.data);
        setStartTime(null);
      } else {
        alert("Failed to submit booking.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 flex flex-col w-full pb-10">
      <header className="flex items-center justify-between p-4 bg-[#111827] shadow-sm z-10 w-full relative text-white h-16">
        <button className="flex items-center gap-1 text-slate-300 hover:text-white" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined text-[20px]">arrow_back_ios</span>
          <span className="font-bold text-sm">Back</span>
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 font-bold text-lg">Book a Resource</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 w-full max-w-3xl px-4 py-6 mx-auto space-y-6">

        {/* Info Alert */}
        <div className="bg-[#f0f7ff] border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-slate-800">info</span>
          <p className="text-sm text-[#3b82f6]">
            As a staff member, your resource bookings are sent directly to the <b>AR office</b> for final approval.
          </p>
        </div>

        {/* Filter Availability Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-4 text-slate-800">
            <span className="material-symbols-outlined">filter_alt</span>
            <h3 className="font-bold text-lg">Filter Availability</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 tracking-wider mb-2 uppercase">Date</label>
              <input
                type="date" min={today} value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 font-medium text-sm text-slate-700 focus:bg-white focus:border-slate-300 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 tracking-wider mb-2 uppercase">Venue</label>
              <div className="relative">
                <select
                  value={location} onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 pr-10 appearance-none font-medium text-sm text-slate-700 focus:bg-white focus:border-slate-300 outline-none"
                >
                  <option value="EOE Hall">EOE Hall</option>
                  <option value="DO1">DO1</option>
                  <option value="LH1">LH01</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>
        </div>

        {/* Available Slots Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-4 text-slate-800">
            <span className="material-symbols-outlined text-green-500">event_available</span>
            <h3 className="font-bold text-lg">Available Slots</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {timeOptions.map(t => {
              const booked = isSlotBooked(t);
              const isSelected = startTime === String(t);
              return (
                <button
                  key={t}
                  type="button"
                  disabled={booked}
                  onClick={() => setStartTime(String(t))}
                  className={`p-3.5 rounded-xl border text-sm font-bold transition-all text-left ${
                    booked
                      ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                      : isSelected
                        ? 'border-blue-500 bg-blue-50 text-[#1e3a8a] shadow-sm'
                        : 'border-slate-200 text-[#334155] hover:border-blue-300 hover:bg-blue-50/30'
                  }`}
                >
                  {formatTime(t)} – {formatTime(t + 1)}
                  {booked && <span className="ml-2 text-[10px] font-normal text-slate-400">(Unavailable)</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-4 text-slate-800">
            <span className="material-symbols-outlined">edit_document</span>
            <h3 className="font-bold text-lg">Booking Details</h3>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 tracking-wider mb-2 uppercase">Purpose of Booking</label>
            <textarea
              value={purpose} onChange={(e) => setPurpose(e.target.value)} required
              placeholder="e.g., Make-up lecture, Club meeting"
              className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 h-24 resize-none font-medium text-sm text-slate-700 focus:bg-white focus:border-slate-300 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading || startTime === null}
          className="w-full bg-[#90b4e0] hover:bg-[#7fa7d6] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md"
        >
          <span>{isLoading ? 'Submitting...' : 'Confirm Booking'}</span>
          <span className="material-symbols-outlined font-variation-fill">send</span>
        </button>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}
