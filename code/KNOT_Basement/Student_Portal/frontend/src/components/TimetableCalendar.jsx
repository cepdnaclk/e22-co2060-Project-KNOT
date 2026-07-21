import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  Grid,
  List,
  Filter,
  X,
  Clock,
  User,
  MapPin,
  Info
} from 'lucide-react';

export default function TimetableCalendar() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('All Rooms');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState('grid'); // 'grid' or 'agenda'
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch bookings and rooms
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookingsRes, roomsRes] = await Promise.all([
          axios.get('http://localhost:5001/api/schedule/all'),
          axios.get('http://localhost:5001/api/admin/rooms')
        ]);
        setBookings(bookingsRes.data);
        setRooms(roomsRes.data);
      } catch (err) {
        console.error("Error fetching schedule data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const parseBookingTime = (timeDisplay) => {
    // 1. Standard format: "YYYY-MM-DD hh:mm AM/PM - hh:mm AM/PM"
    const standardRegex = /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}\s+(?:AM|PM))\s*-\s*(\d{2}:\d{2}\s+(?:AM|PM))$/i;
    const match = timeDisplay.match(standardRegex);
    if (match) {
      const dateStr = match[1];
      const startTimeStr = match[2];
      const endTimeStr = match[3];
      const dateObj = new Date(dateStr);
      return {
        dateStr,
        dateObj,
        startTimeStr,
        endTimeStr,
        isValid: !isNaN(dateObj.getTime())
      };
    }

    // 2. Relative format: "Tomorrow, hh:mm AM/PM"
    const tomorrowRegex = /Tomorrow,?\s+(\d{1,2}):(\d{2})\s+(AM|PM)/i;
    const tomorrowMatch = timeDisplay.match(tomorrowRegex);
    if (tomorrowMatch) {
      const hours = parseInt(tomorrowMatch[1], 10);
      const mins = tomorrowMatch[2];
      const ampm = tomorrowMatch[3];
      
      const dateObj = new Date();
      dateObj.setDate(dateObj.getDate() + 1);
      const dateStr = dateObj.toISOString().split('T')[0];
      
      const startTimeStr = `${hours.toString().padStart(2, '0')}:${mins} ${ampm.toUpperCase()}`;
      // End time is 1 hour later
      let endHours = hours + 1;
      let endAmpm = ampm;
      if (endHours === 12) {
        endAmpm = ampm.toUpperCase() === 'AM' ? 'PM' : 'AM';
      } else if (endHours > 12) {
        endHours -= 12;
      }
      const endTimeStr = `${endHours.toString().padStart(2, '0')}:${mins} ${endAmpm.toUpperCase()}`;
      
      return {
        dateStr,
        dateObj,
        startTimeStr,
        endTimeStr,
        isValid: true
      };
    }

    // 3. Weekday format: "Friday, hh:mm AM/PM"
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekdayRegex = /^([a-zA-Z]+),?\s+(\d{1,2}):(\d{2})\s+(AM|PM)/i;
    const weekdayMatch = timeDisplay.match(weekdayRegex);
    if (weekdayMatch) {
      const dayName = weekdayMatch[1];
      const targetDayIndex = weekdays.findIndex(d => d.toLowerCase() === dayName.toLowerCase());
      if (targetDayIndex !== -1) {
        const hours = parseInt(weekdayMatch[2], 10);
        const mins = weekdayMatch[3];
        const ampm = weekdayMatch[4];
        
        // Find date of this weekday in the current week
        const today = new Date();
        const currentDayIndex = today.getDay(); // 0 is Sunday, 1 is Monday...
        const diff = targetDayIndex - currentDayIndex;
        
        const dateObj = new Date();
        dateObj.setDate(today.getDate() + diff);
        const dateStr = dateObj.toISOString().split('T')[0];
        
        const startTimeStr = `${hours.toString().padStart(2, '0')}:${mins} ${ampm.toUpperCase()}`;
        // End time is 1 hour later
        let endHours = hours + 1;
        let endAmpm = ampm;
        if (endHours === 12) {
          endAmpm = ampm.toUpperCase() === 'AM' ? 'PM' : 'AM';
        } else if (endHours > 12) {
          endHours -= 12;
        }
        const endTimeStr = `${endHours.toString().padStart(2, '0')}:${mins} ${endAmpm.toUpperCase()}`;
        
        return {
          dateStr,
          dateObj,
          startTimeStr,
          endTimeStr,
          isValid: true
        };
      }
    }

    return { isValid: false };
  };

  // Helper: converts time string like "08:30 AM" to decimal hours (e.g. 8.5)
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

  // Helper: Group overlapping events together and calculate their layout offsets (for a single column)
  const calculateColumnLayouts = (colBookings) => {
    const sorted = [...colBookings].sort((a, b) => {
      const tA = timeToDecimal(a.timeInfo.startTimeStr);
      const tB = timeToDecimal(b.timeInfo.startTimeStr);
      return tA - tB;
    });

    const groups = [];
    let currentGroup = [];
    let groupEnd = 0;

    sorted.forEach(b => {
      const start = timeToDecimal(b.timeInfo.startTimeStr);
      const end = timeToDecimal(b.timeInfo.endTimeStr);

      if (currentGroup.length === 0 || start < groupEnd) {
        currentGroup.push(b);
        groupEnd = Math.max(groupEnd, end);
      } else {
        groups.push(currentGroup);
        currentGroup = [b];
        groupEnd = end;
      }
    });
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    const layoutDetails = new Map();

    groups.forEach(group => {
      const columns = [];
      group.forEach(b => {
        const start = timeToDecimal(b.timeInfo.startTimeStr);
        const end = timeToDecimal(b.timeInfo.endTimeStr);

        let colIdx = 0;
        while (true) {
          if (!columns[colIdx]) {
            columns[colIdx] = [];
          }
          const overlaps = columns[colIdx].some(other => {
            const oStart = timeToDecimal(other.timeInfo.startTimeStr);
            const oEnd = timeToDecimal(other.timeInfo.endTimeStr);
            return !(start >= oEnd || end <= oStart);
          });
          if (!overlaps) {
            columns[colIdx].push(b);
            break;
          }
          colIdx++;
        }
      });

      const totalCols = columns.length;
      for (let c = 0; c < totalCols; c++) {
        columns[c].forEach(b => {
          layoutDetails.set(b.id, {
            width: 100 / totalCols,
            left: c * (100 / totalCols)
          });
        });
      }
    });

    return layoutDetails;
  };

  // Compute days of the current week (Monday to Sunday)
  const weekDays = useMemo(() => {
    const currentDay = currentDate.getDay();
    // Monday is 1, Sunday is 0
    const distance = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() + distance);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  const weekRangeLabel = useMemo(() => {
    return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  }, [currentDate]);

  // Process and filter bookings
  const processedBookings = useMemo(() => {
    return bookings
      .map(b => {
        const timeInfo = parseBookingTime(b.time_display);
        return {
          ...b,
          timeInfo
        };
      })
      .filter(b => b.timeInfo.isValid);
  }, [bookings]);

  // Filter based on selected room, search query
  const filteredBookings = useMemo(() => {
    return processedBookings.filter(b => {
      const roomMatch = selectedRoom === 'All Rooms' || b.room_name === selectedRoom;
      const searchMatch = !searchQuery.trim() || 
        b.purpose?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.room_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.assigned_lecturer?.toLowerCase().includes(searchQuery.toLowerCase());
      return roomMatch && searchMatch;
    });
  }, [processedBookings, selectedRoom, searchQuery]);

  // Filter bookings falling inside the currently active date (currentDate)
  const activeBookings = useMemo(() => {
    const activeDayStr = currentDate.toISOString().split('T')[0];
    return filteredBookings.filter(b => b.timeInfo.dateStr === activeDayStr);
  }, [filteredBookings, currentDate]);

  // The list of columns for the grid
  const gridColumns = useMemo(() => {
    if (selectedRoom === 'All Rooms') {
      // Columns are all the rooms
      return rooms.map(room => ({
        id: room.id,
        name: room.name,
        type: room.type,
      }));
    } else {
      // Column is just the single selected room
      const room = rooms.find(r => r.name === selectedRoom);
      return room ? [{
        id: room.id,
        name: room.name,
        type: room.type,
        isToday: true // highlight this column as active
      }] : [];
    }
  }, [selectedRoom, rooms]);

  // Map column to its bookings
  const getColumnBookings = (col) => {
    return activeBookings.filter(b => b.room_name === col.name);
  };

  // Get agenda bookings filtered exactly to the selected date
  const singleDayAgendaBookings = useMemo(() => {
    const selectedDateStr = currentDate.toISOString().split('T')[0];
    return filteredBookings
      .filter(b => b.timeInfo.dateStr === selectedDateStr)
      .sort((a, b) => timeToDecimal(a.timeInfo.startTimeStr) - timeToDecimal(b.timeInfo.startTimeStr));
  }, [filteredBookings, currentDate]);

  // Helper: map room name to dynamic colorful class
  const getRoomColorClasses = (roomName) => {
    const name = (roomName || '').toLowerCase();
    if (name.includes('lab')) {
      return {
        bg: 'bg-gradient-to-br from-indigo-500/10 to-purple-500/15 border-indigo-200 dark:border-indigo-800/40 text-indigo-700 dark:text-indigo-300 hover:from-indigo-500/20 hover:to-purple-500/25',
        badge: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800',
        gradientText: 'from-indigo-600 to-purple-600',
        borderLeft: 'border-l-indigo-500 dark:border-l-indigo-400'
      };
    } else if (name.includes('seminar')) {
      return {
        bg: 'bg-gradient-to-br from-blue-500/10 to-sky-500/15 border-blue-200 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 hover:from-blue-500/20 hover:to-sky-500/25',
        badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
        gradientText: 'from-blue-600 to-sky-600',
        borderLeft: 'border-l-blue-500 dark:border-l-blue-400'
      };
    } else if (name.includes('lecture') || name.includes('hall')) {
      if (name.includes('do2')) {
        return {
          bg: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/15 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 hover:from-emerald-500/20 hover:to-teal-500/25',
          badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
          gradientText: 'from-emerald-600 to-teal-600',
          borderLeft: 'border-l-emerald-500 dark:border-l-emerald-400'
        };
      } else {
        return {
          bg: 'bg-gradient-to-br from-amber-500/10 to-orange-500/15 border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 hover:from-amber-500/20 hover:to-orange-500/25',
          badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800',
          gradientText: 'from-amber-600 to-orange-600',
          borderLeft: 'border-l-amber-500 dark:border-l-amber-400'
        };
      }
    }
    return {
      bg: 'bg-gradient-to-br from-slate-500/10 to-slate-600/15 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:from-slate-500/20 hover:to-slate-600/25',
      badge: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
      gradientText: 'from-slate-600 to-slate-700',
      borderLeft: 'border-l-slate-500 dark:border-l-slate-400'
    };
  };

  // Navigate weeks/days
  const prevWeek = () => {
    const d = new Date(currentDate);
    if (selectedRoom === 'All Rooms') {
      d.setDate(currentDate.getDate() - 1);
    } else {
      d.setDate(currentDate.getDate() - 7);
    }
    setCurrentDate(d);
  };

  const nextWeek = () => {
    const d = new Date(currentDate);
    if (selectedRoom === 'All Rooms') {
      d.setDate(currentDate.getDate() + 1);
    } else {
      d.setDate(currentDate.getDate() + 7);
    }
    setCurrentDate(d);
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
  };

  // Hour slots for Weekly Grid view (8:00 AM to 6:00 PM)
  const hourSlots = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  
  const formatHour = (hour) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour > 12 ? hour - 12 : hour;
    return `${String(h).padStart(2, '0')}:00 ${ampm}`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden transition-all duration-300">
      
      {/* Calendar Header Controls */}
      <div className="p-6 md:p-8 bg-slate-900 text-white flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-2xl flex items-center justify-center">
              <CalendarIcon size={24} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Semester Timetable</h2>
              <p className="text-xs text-slate-400 mt-0.5">Explore scheduled pre-bookings & ongoing lectures</p>
            </div>
          </div>

          {/* View Toggles & Today */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-800/60 p-1.5 rounded-2xl border border-slate-700/60">
            <button
              onClick={() => setViewType('grid')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${viewType === 'grid' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <Grid size={14} /> Grid
            </button>
            <button
              onClick={() => setViewType('agenda')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${viewType === 'agenda' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <List size={14} /> Agenda
            </button>
            <div className="w-[1px] h-6 bg-slate-700/60 mx-1"></div>
            <button
              onClick={jumpToToday}
              className="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              Today
            </button>
          </div>
        </div>

        {/* Date Selector, Search & Room Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 border-t border-slate-800 pt-6">
          
          {/* Week navigation */}
          <div className="flex items-center justify-between md:justify-start gap-4">
            <button
              onClick={prevWeek}
              className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all shadow-sm"
              title="Previous Week"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-xs md:text-sm font-bold text-slate-100 select-none text-center min-w-[140px]">
              {weekRangeLabel}
            </span>
            <button
              onClick={nextWeek}
              className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all shadow-sm"
              title="Next Week"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Date Picker Input */}
          <div className="relative flex items-center bg-slate-800/80 border border-slate-700/80 rounded-2xl px-3.5 py-3 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all shadow-sm">
            <CalendarIcon size={16} className="text-slate-400 mr-2.5 shrink-0" />
            <input 
              type="date" 
              value={currentDate.toISOString().split('T')[0]} 
              onChange={(e) => {
                if (e.target.value) {
                  setCurrentDate(new Date(e.target.value));
                }
              }} 
              className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer w-full"
            />
          </div>

          {/* Room Filter Dropdown */}
          <div className="relative">
            <Filter size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full pl-11 pr-8 py-3 bg-slate-800/80 text-white placeholder-slate-400 border border-slate-700/80 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none cursor-pointer appearance-none transition-all shadow-sm"
            >
              <option value="All Rooms">All Lecture Halls & Labs</option>
              {rooms.map(room => (
                <option key={room.id} value={room.name}>{room.name} ({room.type})</option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search course, lecturer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-800/80 text-white placeholder-slate-400 border border-slate-700/80 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none transition-all shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-[350px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading semester schedule...</p>
          </div>
        ) : viewType === 'grid' ? (
          activeBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl shadow-inner">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4 animate-pulse">
                <CalendarIcon size={32} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Lectures Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px] leading-relaxed">
                There are no classes scheduled for the selected filters in this date range.
              </p>
            </div>
          ) : (
            /* Weekly Grid View / Daily Grid View */
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-inner">
              <div className={`relative ${selectedRoom === 'All Rooms' ? 'min-w-[1300px]' : 'w-full max-w-2xl mx-auto'}`}>
                
                {/* Header Days/Rooms Row */}
                <div 
                  className="grid border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 sticky top-0 z-10"
                  style={{ gridTemplateColumns: `100px repeat(${gridColumns.length}, 1fr)` }}
                >
                  <div className="p-4 border-r border-slate-200 dark:border-slate-800 font-bold text-slate-400 text-xs text-center uppercase tracking-wider select-none">Time</div>
                  {gridColumns.map((col, idx) => {
                    return (
                      <div 
                        key={col.id || idx} 
                        className={`p-4 border-r last:border-r-0 border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-0.5 select-none ${col.isToday ? 'bg-blue-500/5 border-b-2 border-b-blue-600' : ''}`}
                      >
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${col.isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                          {col.name}
                        </span>
                        {col.dateLabel && (
                          <span className={`text-sm font-black flex items-center justify-center w-7 h-7 rounded-full ${col.isToday ? 'bg-blue-600 text-white shadow-md' : 'text-slate-800 dark:text-slate-200'}`}>
                            {col.dateLabel}
                          </span>
                        )}
                        {col.type && (
                          <span className="text-[9px] font-semibold text-slate-400">
                            {col.type}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Grid content columns */}
                <div 
                  className="grid relative" 
                  style={{ gridTemplateColumns: `100px repeat(${gridColumns.length}, 1fr)`, height: '520px' }}
                >
                  
                  {/* Time slot rows on the left */}
                  <div className="relative h-full border-r border-slate-200 dark:border-slate-800 select-none">
                    {hourSlots.map((hour, idx) => {
                      const topPercent = ((hour - 8) / 10) * 100;
                      return (
                        <div 
                          key={idx} 
                          className="absolute w-full text-center pr-3" 
                          style={{ top: `${topPercent}%`, transform: 'translateY(-50%)' }}
                        >
                          <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                            {formatHour(hour)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Grid Columns */}
                  {gridColumns.map((col, colIdx) => {
                    const colBookings = getColumnBookings(col);
                    const layouts = calculateColumnLayouts(colBookings);

                    return (
                      <div 
                        key={col.id || colIdx} 
                        className={`relative h-full border-r last:border-r-0 border-slate-200 dark:border-slate-800 ${col.isToday ? 'bg-blue-600/[0.01]' : ''}`}
                      >
                        {/* Grid background reference horizontal lines */}
                        {hourSlots.map((_, hIdx) => (
                          <div 
                            key={hIdx} 
                            className="absolute w-full border-t border-slate-100 dark:border-slate-800/40 pointer-events-none" 
                            style={{ top: `${(hIdx / 10) * 100}%` }}
                          />
                        ))}

                        {/* Absoluted Booking Cards */}
                        {colBookings.map(b => {
                          const startDec = timeToDecimal(b.timeInfo.startTimeStr);
                          const endDec = timeToDecimal(b.timeInfo.endTimeStr);
                          
                          // Limit display inside the grid's range: 8:00 AM - 6:00 PM (18:00)
                          const start = Math.max(8.0, Math.min(18.0, startDec));
                          const end = Math.max(8.0, Math.min(18.0, endDec));
                          const duration = end - start;

                          if (duration <= 0) return null;

                          const topPercent = ((start - 8.0) / 10.0) * 100;
                          const heightPercent = (duration / 10.0) * 100;

                          const color = getRoomColorClasses(b.room_name);
                          const layout = layouts.get(b.id) || { width: 100, left: 0 };
                          const isShort = duration <= 1.25;

                          return (
                            <div
                              key={b.id}
                              onClick={() => setSelectedBooking(b)}
                              className={`absolute p-2 rounded-xl border-l-4 flex flex-col justify-between overflow-hidden cursor-pointer select-none transition-all duration-300 hover:shadow-lg shadow-sm hover:scale-[1.01] z-[2] group backdrop-blur-[2px] ${color.bg} ${color.borderLeft}`}
                              style={{ 
                                top: `${topPercent}%`, 
                                height: `calc(${heightPercent}% - 6px)`,
                                left: `calc(${layout.left}% + 2px)`,
                                width: `calc(${layout.width}% - 4px)`
                              }}
                            >
                              <div className="flex flex-col gap-1 min-h-0 overflow-hidden">
                                <div className="flex items-center justify-between gap-1 flex-wrap">
                                  <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border truncate ${color.badge}`}>
                                    {b.room_name}
                                  </span>
                                  <span className="text-[8px] font-black text-slate-500 flex items-center gap-0.5 shrink-0 bg-white/70 dark:bg-slate-800/70 px-1.5 py-0.5 rounded">
                                    <Clock size={8} /> {b.timeInfo.startTimeStr} - {b.timeInfo.endTimeStr}
                                  </span>
                                </div>
                                <h4 className="font-extrabold text-[10px] md:text-[11px] leading-tight text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                  {b.purpose}
                                </h4>
                              </div>

                              {(!isShort || selectedRoom !== 'All Rooms') && b.assigned_lecturer && (
                                <div className="text-[8px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-1 border-t border-slate-200/40 dark:border-slate-800/40 pt-1 shrink-0">
                                  <User size={8} className="shrink-0 text-slate-500" />
                                  <span className="truncate">Lecturer: {b.assigned_lecturer}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )
        ) : (
          
          /* Single Selected Date Agenda View */
          <div className="flex flex-col gap-6">
            {/* Date Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <CalendarIcon size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-base md:text-lg">
                    {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">Lectures scheduled for this date</p>
                </div>
              </div>
              <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-[10px] font-black px-2.5 py-1 rounded-full border border-blue-200/30">
                {singleDayAgendaBookings.length} {singleDayAgendaBookings.length === 1 ? 'lecture' : 'lectures'}
              </span>
            </div>

            {singleDayAgendaBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-250 dark:border-slate-800 rounded-3xl shadow-sm">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3.5">
                  <CalendarIcon size={24} />
                </div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-355">No Lectures Scheduled</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px] leading-relaxed">
                  There are no classes booked on this selected date. Try selecting another date from the calendar.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {singleDayAgendaBookings.map(b => {
                  const color = getRoomColorClasses(b.room_name);
                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBooking(b)}
                      className="p-5 rounded-2xl border flex items-center justify-between gap-4 cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.01] bg-white dark:bg-slate-900 hover:border-blue-600/30 group"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Class Time Indicator */}
                        <div className="flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800/80 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/50 shrink-0 text-center min-w-[85px]">
                          <span className="text-[10px] font-bold tracking-wide uppercase text-slate-400">Starts</span>
                          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{b.timeInfo.startTimeStr}</span>
                        </div>

                        {/* Class info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${color.badge}`}>
                              {b.room_name}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Clock size={11} /> {b.timeInfo.startTimeStr} - {b.timeInfo.endTimeStr}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm md:text-base text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {b.purpose}
                          </h4>
                          {b.assigned_lecturer && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                              <User size={12} className="text-slate-400" />
                              <span>Lecturer in Charge: <strong className="text-slate-700 dark:text-slate-300">{b.assigned_lecturer}</strong></span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-slate-300 group-hover:text-blue-600 transition-colors shrink-0">
                        <span className="material-symbols-outlined text-[24px]">chevron_right</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Details Dialog Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform scale-100 transition-all">
            
            {/* Modal Gradient Header */}
            <div className="relative p-6 text-white bg-slate-900 border-b border-slate-800">
              <button
                onClick={() => setSelectedBooking(null)}
                className="absolute right-4 top-4 w-9 h-9 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-full flex items-center justify-center transition-all"
              >
                <X size={18} />
              </button>
              
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-3xl text-blue-500 font-variation-fill">school</span>
                <div>
                  <h3 className="font-extrabold text-lg leading-snug">Class Schedule Details</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Approved Semester Reservation</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 flex flex-col gap-6">
              
              {/* Course Title & Room Name Banner */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">Ongoing Lecture</span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  {selectedBooking.purpose || 'Semester Class'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${getRoomColorClasses(selectedBooking.room_name).badge}`}>
                    {selectedBooking.room_name}
                  </span>
                  <span className="bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800">
                    Approved
                  </span>
                </div>
              </div>

              {/* Grid details */}
              <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 dark:border-slate-800 py-6">
                
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <CalendarIcon size={12} /> Date
                  </span>
                  <span className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                    {new Date(selectedBooking.timeInfo.dateStr).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock size={12} /> Time Slot
                  </span>
                  <span className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                    {selectedBooking.timeInfo.startTimeStr} - {selectedBooking.timeInfo.endTimeStr}
                  </span>
                </div>

                {selectedBooking.assigned_lecturer && (
                  <div className="flex flex-col gap-1 col-span-2 mt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <User size={12} /> Lecturer in Charge
                    </span>
                    <span className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                      {selectedBooking.assigned_lecturer}
                    </span>
                  </div>
                )}
              </div>

              {/* Extra Location Context */}
              <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                <MapPin size={18} className="text-slate-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  This lecture is held at <strong className="text-slate-700 dark:text-slate-300">{selectedBooking.room_name}</strong>. Please ensure the hall is prepared and key cards or digital access is resolved in advance.
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 dark:bg-slate-800/30 p-5 px-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}


    </div>
  );
}
