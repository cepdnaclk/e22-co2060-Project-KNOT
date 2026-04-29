import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon rendering issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function ReportFault() {
  const [priority, setPriority] = useState('Medium');
  const [building, setBuilding] = useState('');
  const [room, setRoom] = useState('');
  const [location, setLocation] = useState('');
  const [mapPosition, setMapPosition] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const userString = localStorage.getItem('knot_user');
  const user = userString ? JSON.parse(userString) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!building || !room || (!location.trim() && !mapPosition) || !description.trim()) {
      alert('Please provide building, room details, exact location (text or map pin), and a description.');
      return;
    }
    setLoading(true);

    try {
      const finalLocation = mapPosition 
        ? `${location}\nMap Coordinates: ${mapPosition.lat.toFixed(5)}, ${mapPosition.lng.toFixed(5)}`.trim()
        : location.trim();

      await axios.post('http://localhost:5001/api/faults', {
        title: `${building} ${room}`,
        description,
        priority,
        location: finalLocation,
        user_id: user.id,
        icon: 'construction' // default
      });

      setTimeout(() => {
        navigate(user?.role === 'Lecturer' ? '/lecturer' : '/');
      }, 300);
    } catch (err) {
      console.error(err);
      alert('Failed to submit fault');
      setLoading(false);
    }
  };

  return (
    <div className="text-slate-900 bg-background-light min-h-screen flex flex-col w-full">
      <header className="flex items-center justify-between p-4 bg-slate-900 shadow-sm z-10 w-full relative text-white">
        <button className="flex items-center gap-1 text-slate-300 hover:text-white" onClick={() => window.history.back()}>
          <span className="material-symbols-outlined text-[20px]">arrow_back_ios</span>
          <span className="font-bold text-sm">Back</span>
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 font-bold text-lg">Report an Issue</h1>
        <img src="/knot_logo_white.png" alt="KNOT Logo" className="h-20 scale-[1.7] origin-right object-contain -mr-2 -my-4" />
      </header>

      <main className="flex-1 w-full max-w-2xl px-4 py-6 mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3 mb-6">
          <span className="material-symbols-outlined text-yellow-600">info</span>
          <p className="text-[13px] text-yellow-800 leading-tight">If this is a critical emergency (e.g., active burst pipe, fire), please contact campus security immediately at <b>ext. 5555</b>.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
            <h3 className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2">Location Details</h3>
            
            <div>
              <label className="block text-sm font-semibold mb-1.5">Building Segment</label>
              <div className="relative">
                <select 
                  value={building} 
                  onChange={(e) => setBuilding(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl py-3 pl-4 pr-10 appearance-none text-sm text-slate-700 font-medium focus:bg-white"
                >
                  <option value="" disabled>Select a building</option>
                  <option value="Main Library">Main Library</option>
                  <option value="Engineering South">Engineering South (EOE)</option>
                  <option value="Science Block C">Science Block C</option>
                  <option value="Hostel Wing B">Hostel Wing B</option>
                  <option value="Cafeteria">Main Cafeteria</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none">expand_more</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Specific Room / Area</label>
              <input type="text" placeholder="e.g., Lab 2A, Room 104, Outside Entrance" 
                value={room} onChange={(e) => setRoom(e.target.value)}
                className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm placeholder:text-slate-400 text-slate-700 bg-slate-50 focus:bg-white" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Exact Location Details</label>
              <input type="text" placeholder="e.g., Near the main entrance, 3rd floor corridor" 
                value={location} onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm placeholder:text-slate-400 text-slate-700 bg-slate-50 focus:bg-white mb-4" />
              
              <label className="block text-sm font-semibold mb-1.5">Map Location (Optional)</label>
              <p className="text-xs text-slate-500 mb-2">Click on the map to drop a pin at the exact location of the issue.</p>
              <div className="h-48 w-full rounded-xl overflow-hidden border border-slate-200 relative z-0 mb-3 block">
                <MapContainer center={[7.2544, 80.5911]} zoom={15} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker position={mapPosition} setPosition={setMapPosition} />
                </MapContainer>
              </div>
              {mapPosition && (
                <div className="flex items-center justify-between bg-primary/5 text-primary text-sm p-3 rounded-lg border border-primary/20">
                  <span className="font-semibold">Pin dropped: {mapPosition.lat.toFixed(4)}, {mapPosition.lng.toFixed(4)}</span>
                  <button type="button" onClick={() => setMapPosition(null)} className="text-xs hover:underline font-bold">Remove Pin</button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
            <h3 className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2">Issue Info</h3>

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
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-slate-200 hover:border-primary/50'
                    }`}
                  >
                    <span className={`font-bold text-sm ${priority === level ? 'text-primary' : ''}`}>{level}</span>
                    <span className={`text-[10px] uppercase tracking-wider ${priority === level ? 'text-primary/70 font-semibold' : 'text-slate-400'}`}>
                      {level === 'Low' ? 'Cosmetic' : (level === 'Medium' ? 'Disruptive' : 'Critical')}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 relative">
                Description of Fault
                <span className="material-symbols-outlined absolute -left-6 top-0 text-slate-300 text-lg">edit</span>
              </label>
              <textarea 
                value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe exactly what is broken. E.g., The AC unit is leaking water near the window."
                className="w-full border border-slate-200 bg-slate-50 rounded-xl py-3 px-4 h-32 resize-none text-sm placeholder:text-slate-400 text-slate-700 focus:bg-white block"
              ></textarea>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit Report'} <span className="material-symbols-outlined font-variation-fill">send</span>
          </button>
        </form>
      </main>
    </div>
  );
}
