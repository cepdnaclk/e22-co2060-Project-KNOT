import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const getRoomDetails = (room) => {
  if (!room) return null;
  
  let subtitle = "Campus Main Block";
  if (room.name.includes("Engineering") || room.name.includes("EOE")) subtitle = "Level 2, Wing A";
  else if (room.name.includes("Drawing") || room.name.includes("DO")) subtitle = "Level 1, North Wing";
  else if (room.name.includes("Lecture Hall") || room.name.includes("LH")) subtitle = "Ground Floor, East Wing";
  else if (room.name.includes("Seminar")) subtitle = "Level 3, West Wing";
  else if (room.name.includes("Computer") || room.name.includes("Lab")) subtitle = "IT Center, Level 2";

  let price = "$25";
  if (room.type === 'Lecture Hall') price = "$45";
  else if (room.type === 'Lab') price = "$40";
  else if (room.type === 'Drawing Office') price = "$30";

  const capacityIcon = room.capacity > 100 ? "groups" : room.capacity > 50 ? "school" : "meeting_room";

  let amenity1 = "Whiteboard";
  let amenity1Icon = "co-present";
  if (room.type === 'Lecture Hall') {
    amenity1 = "4K Projector";
    amenity1Icon = "videocam";
  } else if (room.type === 'Lab') {
    amenity1 = "High-end PCs";
    amenity1Icon = "desktop_windows";
  }

  let amenity2 = "Natural Light";
  let amenity2Icon = "light_mode";
  if (room.type === 'Lecture Hall' || room.type === 'Lab') {
    amenity2 = "Central AC";
    amenity2Icon = "ac_unit";
  }

  return {
    title: room.name,
    subtitle,
    price,
    capacity: `${room.capacity} Capacity`,
    capacityIcon,
    amenity1,
    amenity1Icon,
    amenity2,
    amenity2Icon,
    icon: room.type === 'Lab' ? 'science' : room.type === 'Drawing Office' ? 'architecture' : 'school'
  };
};

export default function BookSpace() {
  const today = new Date().toISOString().split('T')[0];
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [date, setDate] = useState(today);
  const [purpose, setPurpose] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbLecturers, setDbLecturers] = useState([]);
  const navigate = useNavigate();

  const userString = localStorage.getItem('knot_user');
  const user = userString ? JSON.parse(userString) : null;

  // Availability Grid States
  const [existingBookings, setExistingBookings] = useState([]);
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);

  // Derived Selections
  const selectedRoom = rooms.find(r => r.id.toString() === selectedRoomId);
  const loc = getRoomDetails(selectedRoom);

  const formatTime = (val) => {
      const hour = Math.floor(val);
      const mins = val % 1 !== 0 ? '30' : '00';
      const ampm = hour >= 12 ? 'PM' : 'AM';
      let displayHour = hour > 12 ? hour - 12 : hour;
      if (displayHour === 0) displayHour = 12;
      const formattedHour = displayHour.toString().padStart(2, '0');
      return `${formattedHour}:${mins} ${ampm}`;
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch rooms dynamically
    axios.get('http://localhost:5001/api/rooms')
      .then(res => {
        setRooms(res.data);
        if (res.data.length > 0) {
          setSelectedRoomId(res.data[0].id.toString());
        }
      })
      .catch(err => {
        console.error("Failed to load rooms dynamically:", err);
      });
    
    // Fetch lecturers dynamically
    axios.get('http://localhost:5001/api/lecturers')
      .then(res => setDbLecturers(res.data))
      .catch(err => {
        console.error("Failed to load lecturers dynamically:", err);
        setDbLecturers([
          { id: 'static1', name: 'Dr. Smith', department: 'Computer Engineering' },
          { id: 'static2', name: 'Prof. Johnson', department: 'Electrical Engineering' }
        ]);
      });
  }, [user, navigate]);

  // Reset selected slot range on changes
  useEffect(() => {
    setSelectedStart(null);
    setSelectedEnd(null);
  }, [date, selectedRoomId]);

  // Fetch approved bookings for the selected room and date
  useEffect(() => {
    if (!selectedRoom) return;
    axios.get('http://localhost:5001/api/schedule/all')
      .then(res => {
        setExistingBookings(res.data);
      })
      .catch(err => {
        console.error("Failed to load existing bookings:", err);
      });
  }, [date, selectedRoomId]);

  const approvedBookingsForDay = existingBookings.filter(b => {
    if (!selectedRoom || b.room_name !== selectedRoom.name || b.status !== 'Approved') return false;
    const match = b.time_display.match(/^(\d{4}-\d{2}-\d{2})/);
    return match && match[1] === date;
  });

  const parseBookingTime = (timeDisplay) => {
    const standardRegex = /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}\s+(?:AM|PM))\s*-\s*(\d{2}:\d{2}\s+(?:AM|PM))$/i;
    const match = timeDisplay.match(standardRegex);
    if (match) {
      return {
        startTimeStr: match[2],
        endTimeStr: match[3],
        isValid: true
      };
    }
    return { isValid: false };
  };

  const timeToDecimal = (timeStr) => {
    const match = timeStr.match(/^(\d{2}):(\d{2})\s+(AM|PM)$/i);
    if (!match) return 8.0;
    let [_, hoursStr, minsStr, ampm] = match;
    let hours = parseInt(hoursStr, 10);
    let mins = parseInt(minsStr, 10);
    if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
    return hours + mins / 60;
  };

  const hourBlocks = Array.from({ length: 10 }, (_, i) => {
    const start = 8 + i;
    const end = start + 1;
    return { start, end };
  });

  const getBlockStatus = (start, end) => {
    if (!selectedRoom) return { status: 'disabled' };
    
    // Check if the slot has already passed today
    if (date === today) {
      const now = new Date();
      const currentHourFloat = now.getHours() + (now.getMinutes() / 60);
      if (start < currentHourFloat) {
        return { status: 'past', label: 'Already Passed' };
      }
    }

    // Find overlapping approved booking
    const overlapping = approvedBookingsForDay.find(b => {
      const parsed = parseBookingTime(b.time_display);
      if (!parsed.isValid) return false;
      const bStart = timeToDecimal(parsed.startTimeStr);
      const bEnd = timeToDecimal(parsed.endTimeStr);
      return !(end <= bStart || start >= bEnd);
    });

    if (overlapping) {
      return { status: 'booked', label: `Booked: ${overlapping.purpose || 'Reserved'}` };
    }

    return { status: 'available', label: 'Available' };
  };

  const handleBlockClick = (block) => {
    const blockStatus = getBlockStatus(block.start, block.end);
    if (blockStatus.status !== 'available') return;

    if (selectedStart === null) {
      setSelectedStart(block.start);
      setSelectedEnd(block.end);
    } else {
      if (block.start === selectedStart && block.end === selectedEnd) {
        setSelectedStart(null);
        setSelectedEnd(null);
        return;
      }
      
      if (block.start >= selectedStart) {
        let hasConflict = false;
        for (let s = selectedStart; s < block.end; s++) {
          if (getBlockStatus(s, s + 1).status !== 'available') {
            hasConflict = true;
            break;
          }
        }
        if (hasConflict) {
          alert("Cannot select a range that contains booked or unavailable slots.");
          return;
        }
        setSelectedEnd(block.end);
      } else {
        let hasConflict = false;
        for (let s = block.start; s < selectedEnd; s++) {
          if (getBlockStatus(s, s + 1).status !== 'available') {
            hasConflict = true;
            break;
          }
        }
        if (hasConflict) {
          setSelectedStart(block.start);
          setSelectedEnd(block.end);
        } else {
          setSelectedStart(block.start);
        }
      }
    }
  };

  const calculateDuration = () => {
    if (selectedStart === null || selectedEnd === null) return { valid: false, text: "No time selected" };
    const diff = parseFloat(selectedEnd) - parseFloat(selectedStart);
    if (diff <= 0) return { valid: false, text: "Invalid Selection" };
    return { valid: true, text: `${diff} Hours` };
  };

  const duration = calculateDuration();



  const handleBooking = async () => {
    if (!selectedRoom) {
      alert("No room selected");
      return;
    }
    if (date < today) {
        alert("You cannot book a space for a past date.");
        return;
    }
    if (selectedStart === null || selectedEnd === null) {
        alert("Please select a time slot from the availability grid.");
        return;
    }
    if (date === today) {
        const now = new Date();
        const currentHourFloat = now.getHours() + (now.getMinutes() / 60);
        if (selectedStart < currentHourFloat) {
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
    if (!lecturer && user?.role !== 'Lecturer') {
        alert("Please select a lecturer in charge");
        return;
    }

    setLoading(true);
    try {
      const endHour = Math.floor(selectedEnd);
      const endMins = selectedEnd % 1 !== 0 ? '30' : '00';
      const end_time = `${date} ${endHour.toString().padStart(2, '0')}:${endMins}:00`;

      // Set booking type for database analytics and dashboard compatibility
      const bookingType = user?.role === 'Lecturer' ? 'Lecture' : 'AR Office';

      await axios.post('http://localhost:5001/api/bookings', {
        title: loc.title,
        time_display: `${date} ${formatTime(selectedStart)} - ${formatTime(selectedEnd)}`,
        user_id: user.id,
        icon: loc.icon,
        status: user?.role === 'Lecturer' ? 'Pending AR' : 'Pending',
        end_time: end_time,
        assigned_lecturer: user?.role === 'Lecturer' ? null : lecturer,
        purpose: purpose,
        booking_type: bookingType
      });
      
      setTimeout(() => {
        navigate(user?.role === 'Lecturer' ? '/lecturer' : '/');
      }, 500);
    } catch(err) {
        console.error(err);
        setLoading(false);
    }
  };

  return (
    <div className="text-slate-900 bg-background-light min-h-screen flex flex-col w-full pb-20 font-sans">
      <header className="flex items-center p-4 bg-slate-900 shadow-sm z-10 w-full relative text-white">
        <button className="flex items-center gap-1 text-slate-300 hover:text-white bg-transparent border-0 cursor-pointer outline-none" onClick={() => navigate(-1)}>
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

        {rooms.length > 0 && (
          <div className="bg-white border-b border-slate-100 rounded-xl shadow-sm mb-4">
              <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-3.5 text-primary pointer-events-none">location_on</span>
                  <select value={selectedRoomId} onChange={(e) => setSelectedRoomId(e.target.value)} className="w-full border border-slate-200 bg-white rounded-xl py-3.5 pl-10 pr-10 appearance-none text-sm text-slate-700 font-bold focus:border-primary shadow-sm focus:bg-white transition-colors">
                      {rooms.map(r => (
                          <option key={r.id} value={r.id.toString()}>{r.name}</option>
                      ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-3.5 text-slate-400 pointer-events-none">expand_more</span>
              </div>
          </div>
        )}

        {loc && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-4">
               <div className="bg-slate-100 w-full py-4 text-center border-b border-slate-200 flex flex-col items-center justify-center min-h-[100px] relative">
                   <span className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-1">{selectedRoom?.type || 'Lecture Hall'}</span>
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

                        {user?.role !== 'Lecturer' && (
                          <div>
                              <label className="block text-xs font-bold mb-1.5">Select Lecturer in Charge <span className="text-red-500">*</span></label>
                              <div className="relative">
                                  <select value={lecturer} onChange={e => setLecturer(e.target.value)} className="w-full border border-slate-200 bg-white rounded-lg p-3 appearance-none text-sm focus:border-primary shadow-sm">
                                      <option value="" disabled>Choose a lecturer for endorsement</option>
                                      {dbLecturers.map(l => (
                                          <option key={l.id} value={l.name}>{l.name} - {l.department || 'Staff'}</option>
                                      ))}
                                  </select>
                                  <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none text-lg">expand_more</span>
                              </div>
                          </div>
                        )}

                        {/* Availability Hourly Selector */}
                        <div>
                            <label className="block text-xs font-bold mb-2">Available Time Slots <span className="text-red-500">*</span></label>
                            <p className="text-[10px] text-slate-500 mb-3">Click on a starting slot and then an ending slot to select a booking range (e.g. 09:00 AM - 11:00 AM).</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[250px] overflow-y-auto pr-1">
                                {hourBlocks.map((block) => {
                                    const statusObj = getBlockStatus(block.start, block.end);
                                    const isSelected = selectedStart !== null && selectedEnd !== null &&
                                        block.start >= selectedStart && block.end <= selectedEnd;

                                    let cardStyle = "border-slate-200 bg-white hover:border-blue-500/50 cursor-pointer";
                                    let badgeStyle = "bg-slate-100 text-slate-500 border-slate-200";
                                    let labelText = statusObj.label;

                                    if (statusObj.status === 'booked') {
                                        cardStyle = "border-red-200 bg-red-50/20 opacity-75 cursor-not-allowed";
                                        badgeStyle = "bg-red-100 text-red-700 border-red-200";
                                    } else if (statusObj.status === 'past') {
                                        cardStyle = "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed";
                                        badgeStyle = "bg-slate-200 text-slate-500 border-slate-300";
                                    } else if (isSelected) {
                                        cardStyle = "border-blue-600 bg-blue-50/70 cursor-pointer ring-2 ring-blue-500/25";
                                        badgeStyle = "bg-blue-600 text-white border-blue-600";
                                    }

                                    return (
                                        <div
                                            key={`block-${block.start}`}
                                            onClick={() => handleBlockClick(block)}
                                            className={`p-3 rounded-xl border flex flex-col justify-between transition-all select-none shadow-sm min-h-[64px] ${cardStyle}`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] font-black text-slate-800 tracking-tight">
                                                    {formatTime(block.start)} - {formatTime(block.end)}
                                                </span>
                                                <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${badgeStyle}`}>
                                                    {isSelected ? 'Selected' : statusObj.status}
                                                </span>
                                            </div>
                                            {statusObj.status === 'booked' ? (
                                                <span className="text-[9px] text-red-655 font-bold truncate leading-tight" title={labelText}>
                                                    {labelText}
                                                </span>
                                            ) : (
                                                <span className="text-[9px] text-slate-450 font-semibold leading-tight">
                                                    {isSelected ? 'Selected range slot' : 'Click to select slot'}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm pb-2 border-t border-slate-100 pt-3">
                            <span className="text-slate-500">Total Duration</span>
                            <span className={`font-bold ${!duration.valid ? 'text-red-500' : ''}`}>{duration.text}</span>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 p-3 flex gap-2 rounded-lg mt-2 items-start">
                            <span className="material-symbols-outlined text-primary text-lg">info</span>
                            <p className="text-[11px] text-slate-650 leading-tight">
                              {user?.role === 'Lecturer' ? 'Your request will be sent directly to the AR office for final approval.' : 'Your request will first be sent to the selected lecturer for endorsement, then to the AR office for final approval.'}
                            </p>
                        </div>

                        <button disabled={loading} onClick={handleBooking} className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-colors hover:bg-primary/90 mt-4 outline-none">
                            {loading ? 'Processing...' : 'Confirm Booking'}
                        </button>
                    </div>
               </div>
          </div>
        )}
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
            <button className="flex flex-col items-center gap-1 text-slate-400 bg-transparent border-0 cursor-pointer" onClick={() => navigate(user?.role === 'Lecturer' ? '/lecturer' : '/')}>
                <span className="material-symbols-outlined font-variation-fill">home</span>
                <span className="text-[10px] font-bold">Home</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-primary bg-transparent border-0 cursor-pointer">
                <span className="material-symbols-outlined font-variation-fill">calendar_today</span>
                <span className="text-[10px] font-bold">Bookings</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-400 bg-transparent border-0 cursor-pointer" onClick={() => navigate('/report-fault')}>
                <span className="material-symbols-outlined">build</span>
                <span className="text-[10px] font-bold">Fix</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-400 bg-transparent border-0 cursor-pointer" onClick={() => navigate('/profile')}>
                <span className="material-symbols-outlined">person</span>
                <span className="text-[10px] font-bold">Profile</span>
            </button>
        </div>
      </nav>
    </div>
  );
}
