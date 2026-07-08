import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ReportFault() {
  const [building, setBuilding] = useState('');
  const [room, setRoom] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const userString = localStorage.getItem('knot_lecturer');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if(!user) navigate('/login');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        title: `${building} - ${room}`,
        description,
        priority,
        location: `${building} ${room}`,
        user_id: user.id,
        icon: 'construction'
      };
      await axios.post('http://localhost:5002/api/lecturer/faults', payload);
      navigate('/');
    } catch (err) {
      alert("Failed to report fault");
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
        <h1 className="absolute left-1/2 -translate-x-1/2 font-bold text-lg">Report a Fault</h1>
        <img src="/knot_logo_white.png" alt="KNOT Logo" className="h-20 scale-[1.7] origin-right object-contain -mr-2 -my-4" />
      </header>

      <main className="flex-1 w-full max-w-2xl px-4 py-6 mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 mb-6">
          <span className="material-symbols-outlined text-amber-600">info</span>
          <p className="text-[13px] text-amber-800 leading-tight">Please provide accurate details to help the maintenance team locate and fix the issue quickly.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
              <h3 className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2">Location Details</h3>
              
              <div>
                <label className="block text-sm font-semibold mb-1.5">Building</label>
                <div className="relative">
                  <select 
                    value={building} 
                    onChange={(e) => setBuilding(e.target.value)} required
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl py-3 pl-4 pr-10 appearance-none text-sm text-slate-700 font-medium focus:bg-white focus:border-primary outline-none"
                  >
                    <option value="" disabled>Select Building</option>
                    <option value="EOE">Engineering Old Block (EOE)</option>
                    <option value="DO1">Drawing Office 1 (DO1)</option>
                    <option value="Staff Room">Staff Room</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none">expand_more</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Room / Area</label>
                <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} required placeholder="e.g. Room 302 or Hallway" className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-700 bg-slate-50 focus:bg-white focus:border-primary outline-none" />
              </div>
           </div>

           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
              <h3 className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2">Issue Description</h3>
              
              <div>
                <label className="block text-sm font-semibold mb-1.5">Description of Fault</label>
                <textarea 
                  value={description} onChange={(e) => setDescription(e.target.value)} required
                  placeholder="Please describe exactly what is broken..." 
                  className="w-full border border-slate-200 rounded-xl py-3 px-4 h-32 resize-none text-sm placeholder:text-slate-400 text-slate-700 bg-slate-50 focus:bg-white focus:border-primary outline-none" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Priority Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Low', 'Medium', 'High'].map(level => (
                    <button 
                      key={level}
                      type="button"
                      onClick={() => setPriority(level)}
                      className={`border rounded-lg p-3 flex flex-col items-center justify-center gap-1 transition-colors ${
                        priority === level 
                        ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary' 
                        : 'border-slate-200 hover:border-primary/50'
                      }`}
                    >
                      <span className={`font-bold text-sm ${priority === level ? 'text-primary' : ''}`}>{level}</span>
                    </button>
                  ))}
                </div>
              </div>
           </div>

           <button type="submit" disabled={isLoading} className="w-full bg-[#2d7dd2] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
              <span>{isLoading ? 'Submitting...' : 'Submit Report'}</span>
              <span className="material-symbols-outlined font-variation-fill">send</span>
           </button>
        </form>
      </main>
    </div>
  );
}
