import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function BookSpace() {
  const today = new Date().toISOString().split('T')[0];
  const [location, setLocation] = useState('eoe');
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState('8');
  const [endTime, setEndTime] = useState('9');
  const [purpose, setPurpose] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const userString = localStorage.getItem('knot_user');
  const user = userString ? JSON.parse(userString) : null;

  const timeOptions = Array.from({ length: 19 }, (_, i) => 8 + (i * 0.5));
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
    eoe: { 
      title: "EOE Hall - Engineering South", 
      subtitle: "Level 2, Wing A", 
      price: "$45", 
      capacity: "120 Capacity", capacityIcon: "groups",
      amenity1: "4K Projector", amenity1Icon: "videocam",
      amenity2: "Central AC", amenity2Icon: "ac_unit"
    },
    do1: { 
      title: "DO1 - Drawing Office 1", 
      subtitle: "Level 1, North Wing", 
      price: "$30", 
      capacity: "40 Capacity", capacityIcon: "architecture",
      amenity1: "Drafting Tables", amenity1Icon: "desk",
      amenity2: "Natural Light", amenity2Icon: "light_mode"
    },
  };

  const calculateDuration = () => {
    const diff = parseFloat(endTime) - parseFloat(startTime);
    if (diff <= 0) return { valid: false, text: "Invalid Selection" };
    return { valid: true, text: `${diff} Hours` };
  };

  const duration = calculateDuration();

  const handleBooking = async () => {
    if (date < today) {
        alert("You cannot book a space for a past date.");
        return;
    }
    if (date === today) {
        const now = new Date();
        const currentHourFloat = now.getHours() + (now.getMinutes() / 60);
        if (parseFloat(startTime) < currentHourFloat) {
            alert("You cannot book a time slot that has already passed today.");
            return;
        }
    }
    if (!duration.valid) {
        alert("End time must be after start time");
        return;
    }
    if (!purpose.trim()) {
        alert("Please provide the purpose of booking");
        return;
    }
    if (!lecturer) {
        alert("Please select a lecturer in charge");
        return;
    }

    setLoading(true);
    try {
      const endHour = Math.floor(parseFloat(endTime));
      const endMins = parseFloat(endTime) % 1 !== 0 ? '30' : '00';
      const end_time = `${date} ${endHour.toString().padStart(2, '0')}:${endMins}:00`;

      await axios.post('http://localhost:5001/api/bookings', {
        title: locationsData[location].title,
        time_display: `${date} ${formatTime(startTime)} - ${formatTime(endTime)}`,
        user_id: user.id,
        icon: location === 'do1' ? 'architecture' : 'science',
        status: 'Pending',
        end_time: end_time
      });
      
      // Navigate once response is successful
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch(err) {
        console.error(err);
        setLoading(false);
    }
  };

  const loc = locationsData[location] || locationsData.eoe;

  return (
    <div className="text-slate-900 bg-background-light min-h-screen flex flex-col w-full pb-20">
      <header className="flex items-center p-4 bg-slate-900 shadow-sm z-10 w-full relative">
        <button className="flex items-center gap-1 text-slate-300 hover:text-white" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined text-[20px]">arrow_back_ios</span>
          <span className="font-bold text-sm">Back</span>
        </button>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <img src="/knot_logo_white.png" alt="KNOT Logo" className="h-20 scale-[1.7] object-contain -my-4" />
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-2xl px-4 py-4 mx-auto">
        <h2 className="text-2xl font-bold mb-1">Book a Space</h2>
        <p className="text-sm text-slate-500 mb-4">Find halls, labs, and study rooms across campus.</p>

        <div className="bg-white border-b border-slate-100 rounded-xl shadow-sm mb-4">
            <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-3.5 text-primary pointer-events-none">location_on</span>
                <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border border-slate-200 bg-white rounded-xl py-3.5 pl-10 pr-10 appearance-none text-sm text-slate-700 font-bold focus:border-primary shadow-sm focus:bg-white transition-colors">
                    <option value="eoe">EOE Hall - Engineering South</option>
                    <option value="do1">DO1 - Drawing Office 1</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-3.5 text-slate-400 pointer-events-none">expand_more</span>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-4">
             <div className="bg-slate-100 w-full py-4 text-center border-b border-slate-200 flex flex-col items-center justify-center min-h-[100px] relative">
                 <span className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-1">Lecture Hall</span>
                 <span className="material-symbols-outlined text-primary text-4xl">map</span>
                 <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded text-[10px] font-bold text-primary tracking-wider shadow-sm uppercase">AVAILABLE</div>
             </div>

             <div className="p-5">
                 <div className="flex justify-between items-start mb-1">
                     <div>
                         <h3 className="font-bold text-lg leading-tight">{loc.title}</h3>
                         <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                             <span className="material-symbols-outlined text-[14px]">location_on</span> 
                             <span>{loc.subtitle}</span>
                         </p>
                     </div>
                     <div className="text-right">
                         <span className="text-primary font-bold text-lg">{loc.price}</span><span className="text-xs text-slate-400">/hr</span>
                     </div>
                 </div>
                 
                 <div className="flex justify-between items-center py-4 border-b border-slate-100 mb-4 mt-2">
                     <div className="flex flex-col items-center gap-1 w-1/3 border-r border-slate-100">
                         <span className="material-symbols-outlined text-primary">{loc.capacityIcon}</span>
                         <span className="text-[10px] font-semibold text-center">{loc.capacity}</span>
                     </div>
                     <div className="flex flex-col items-center gap-1 w-1/3 border-r border-slate-100">
                         <span className="material-symbols-outlined text-primary">{loc.amenity1Icon}</span>
                         <span className="text-[10px] font-semibold text-center">{loc.amenity1}</span>
                     </div>
                     <div className="flex flex-col items-center gap-1 w-1/3">
                         <span className="material-symbols-outlined text-primary">{loc.amenity2Icon}</span>
                         <span className="text-[10px] font-semibold text-center">{loc.amenity2}</span>
                     </div>
                 </div>

                 <div className="space-y-4 pt-2">
                     <div>
                         <label className="block text-xs font-bold mb-1.5">Date <span className="text-red-500">*</span></label>
                         <input type="date" min={today} value={date} onChange={e => setDate(e.target.value)} className="w-full border border-slate-200 bg-white rounded-lg p-3 text-sm focus:border-primary shadow-sm" />
                     </div>

                     <div>
                         <label className="block text-xs font-bold mb-1.5">Purpose of Booking <span className="text-red-500">*</span></label>
                         <textarea value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="e.g., Club meeting, Supplementary lecture, etc." className="w-full border border-slate-200 bg-white rounded-lg p-3 h-20 placeholder:text-slate-400 focus:border-primary shadow-sm text-sm"></textarea>
                     </div>

                     <div>
                         <label className="block text-xs font-bold mb-1.5">Select Lecturer in Charge <span className="text-red-500">*</span></label>
                         <div className="relative">
                             <select value={lecturer} onChange={e => setLecturer(e.target.value)} className="w-full border border-slate-200 bg-white rounded-lg p-3 appearance-none text-sm focus:border-primary shadow-sm">
                                 <option value="" disabled>Choose a lecturer for endorsement</option>
                                 <option value="dr_smith">Dr. Smith</option>
                                 <option value="prof_johnson">Prof. Johnson</option>
                             </select>
                             <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none text-lg">expand_more</span>
                         </div>
                     </div>

                     <div className="flex justify-between items-center py-2">
                         <span className="font-bold text-xs text-slate-900 block">Time Slot <span className="text-red-500">*</span></span>
                         <div className="flex items-center gap-2">
                             <div className="relative">
                                 <select value={startTime} onChange={e => setStartTime(e.target.value)} className="border border-slate-200 bg-white rounded-lg p-2.5 appearance-none text-xs font-bold text-slate-700 pr-8 shadow-sm">
                                     {timeOptions.slice(0, -1).map(t => (
                                         <option key={`start-${t}`} value={t}>{formatTime(t)}</option>
                                     ))}
                                 </select>
                                 <span className="material-symbols-outlined absolute right-2 top-2.5 text-slate-400 pointer-events-none text-sm">expand_more</span>
                             </div>
                             <span className="text-slate-400 font-bold">-</span>
                             <div className="relative">
                                 <select value={endTime} onChange={e => setEndTime(e.target.value)} className="border border-slate-200 bg-white rounded-lg p-2.5 appearance-none text-xs font-bold text-slate-700 pr-8 shadow-sm">
                                     {timeOptions.slice(1).map(t => (
                                         <option key={`end-${t}`} value={t}>{formatTime(t)}</option>
                                     ))}
                                 </select>
                                 <span className="material-symbols-outlined absolute right-2 top-2.5 text-slate-400 pointer-events-none text-sm">expand_more</span>
                             </div>
                         </div>
                     </div>
                     
                     <div className="flex justify-between items-center text-sm pb-2">
                         <span className="text-slate-500">Total Duration</span>
                         <span className={`font-bold ${!duration.valid ? 'text-red-500' : ''}`}>{duration.text}</span>
                     </div>

                     <div className="bg-blue-50 border border-blue-100 p-3 flex gap-2 rounded-lg mt-2 items-start">
                         <span className="material-symbols-outlined text-primary text-lg">info</span>
                         <p className="text-[11px] text-slate-600 leading-tight">Your request will first be sent to the selected lecturer for endorsement, then to the AR office for final approval.</p>
                     </div>

                     <button disabled={loading} onClick={handleBooking} className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-colors hover:bg-primary/90 mt-4 outline-none">
                         {loading ? 'Processing...' : 'Confirm Booking'}
                     </button>
                 </div>
             </div>
        </div>
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
            <button className="flex flex-col items-center gap-1 text-slate-400" onClick={() => navigate('/')}>
                <span className="material-symbols-outlined font-variation-fill">home</span>
                <span className="text-[10px] font-bold">Home</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-primary">
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
    </div>
  );
}
