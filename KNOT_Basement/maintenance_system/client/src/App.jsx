import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Ticket, Wrench, Settings } from 'lucide-react';
import Dashboard from './components/Dashboard';
import TicketDetails from './components/TicketDetails';

function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`nav-item ${path === '/' ? 'active' : ''}`}>
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </Link>
      <Link to="/" className={`nav-item ${path.includes('/ticket') ? 'active' : ''}`}>
        <Ticket size={20} />
        <span>Tickets</span>
      </Link>
      <button className="nav-item">
        <Wrench size={20} />
        <span>Equipment</span>
      </button>
      <button className="nav-item">
        <Settings size={20} />
        <span>Settings</span>
      </button>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ticket/:id" element={<TicketDetails />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
