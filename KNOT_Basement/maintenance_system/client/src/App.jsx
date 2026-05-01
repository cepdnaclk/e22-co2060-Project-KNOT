import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Ticket, Wrench, Settings, Sun, Moon } from 'lucide-react';
import Dashboard from './components/Dashboard';
import TicketDetails from './components/TicketDetails';
import Equipment from './components/Equipment';
import Login from './components/Login';

function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  const navClass = "flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300";
  const activeClass = "flex flex-col items-center gap-1 text-primary";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 z-50 flex justify-between items-center max-w-5xl mx-auto dark:bg-slate-900 dark:border-slate-800">
      <Link to="/" className={path === '/' ? activeClass : navClass}>
        <LayoutDashboard size={20} />
        <span className="text-[10px] font-bold">Dashboard</span>
      </Link>
      <Link to="/" className={path.includes('/ticket') ? activeClass : navClass}>
        <Ticket size={20} />
        <span className="text-[10px] font-bold">Tickets</span>
      </Link>
      <Link to="/equipment" className={path === '/equipment' ? activeClass : navClass}>
        <Wrench size={20} />
        <span className="text-[10px] font-bold">Equipment</span>
      </Link>
      <button className={navClass}>
        <Settings size={20} />
        <span className="text-[10px] font-bold">Settings</span>
      </button>
    </nav>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('admin_token')
  );
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <Router>
      <div className={`min-h-screen flex flex-col w-full pb-20 font-display transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        {isAuthenticated && (
          <button 
            onClick={toggleDarkMode}
            className="fixed top-20 right-4 z-[100] p-3 rounded-full bg-white shadow-xl border border-slate-100 text-slate-700 hover:text-primary transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}
        
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" /> : <Login setAuth={setIsAuthenticated} />}
          />
          <Route
            path="/"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/equipment"
            element={isAuthenticated ? <Equipment /> : <Navigate to="/login" />}
          />
          <Route
            path="/ticket/:id"
            element={isAuthenticated ? <TicketDetails /> : <Navigate to="/login" />}
          />
        </Routes>
        {isAuthenticated && <BottomNav />}
      </div>
    </Router>
  );
}

export default App;
