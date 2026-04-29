import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5002/api/lecturer/auth/login', {
        username,
        password
      });

      if (response.data.success) {
        localStorage.setItem('knot_lecturer', JSON.stringify(response.data.user));
        setTimeout(() => {
            navigate('/');
        }, 500);
      }
    } catch (err) {
      setError('Invalid credentials.');
    } finally {
      if(!localStorage.getItem('knot_lecturer')) setLoading(false);
    }
  };

  return (
    <div className="text-slate-900 min-h-screen flex flex-col items-center w-full bg-background-light">
      <header className="flex items-center p-6 bg-slate-900 z-10 w-full shadow-md">
        <div className="flex items-center gap-2 w-full max-w-7xl mx-auto">
          <img src="/knot_logo_white.png" alt="KNOT Logo" className="h-40 scale-[1.25] object-contain mx-auto -my-10" />
        </div>
      </header>

      <main className="flex-1 w-full px-4 flex flex-col justify-center py-12">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 w-full max-w-md mx-auto border-t-[6px] border-t-primary relative">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-primary text-3xl font-variation-fill">lock</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 text-slate-900">Lecturer Portal</h2>
            <p className="text-sm text-slate-500 font-medium">Sign in to manage student endorsements</p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">Staff Username</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-400">person</span>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g., lec_01"
                  className="w-full border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm placeholder:text-slate-400 text-slate-700 font-medium bg-white outline-none focus:border-primary" 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <a href="#" className="text-xs text-primary font-medium hover:underline">Forgot?</a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-400">key</span>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl py-3.5 pl-12 pr-12 text-sm text-slate-700 font-medium bg-white outline-none focus:border-primary" 
                />
              </div>
            </div>

            {error && <div className="text-red-500 text-sm font-medium text-center">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2d7dd2] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 mt-4"
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              <span className="material-symbols-outlined font-variation-fill">arrow_forward</span>
            </button>
          </form>
          
          <div className="mt-8 text-center pt-6 border-t border-slate-50">
             <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">University of Peradeniya</p>
          </div>
        </div>
      </main>
    </div>
  );
}
