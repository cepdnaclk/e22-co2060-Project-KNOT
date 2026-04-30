import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Ticket, Wrench, Settings } from 'lucide-react';
import Dashboard from './components/Dashboard';
import TicketDetails from './components/TicketDetails';

function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  const navClass = "flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600";
  const activeClass = "flex flex-col items-center gap-1 text-primary";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 z-50 flex justify-between items-center max-w-5xl mx-auto">
      <Link to="/" className={path === '/' ? activeClass : navClass}>
        <LayoutDashboard size={20} className={path === '/' ? "font-variation-fill" : ""} />
        <span className="text-[10px] font-bold">Dashboard</span>
      </Link>
      <Link to="/" className={path.includes('/ticket') ? activeClass : navClass}>
        <Ticket size={20} className={path.includes('/ticket') ? "font-variation-fill" : ""} />
        <span className="text-[10px] font-bold">Tickets</span>
      </Link>
      <button className={navClass}>
        <Wrench size={20} />
        <span className="text-[10px] font-bold">Equipment</span>
      </button>
      <button className={navClass}>
        <Settings size={20} />
        <span className="text-[10px] font-bold">Settings</span>
      </button>
    </nav>
  );
}

import Login from './components/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    !!localStorage.getItem('admin_token')
  );

  return (
    <Router>
      <div className="bg-background-light min-h-screen flex flex-col w-full pb-20 text-slate-900 font-display">
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
