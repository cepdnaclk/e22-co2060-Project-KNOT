import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Settings, 
  Calendar, 
  PenTool, 
  User, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  // Don't show nav on login page
  if (location.pathname === '/login') return null;

  const navLinks = [
    { name: 'Student Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'Book Space', path: '/book-space', icon: <Calendar size={20} /> },
    { name: 'Report Fault', path: '/report-fault', icon: <PenTool size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
    { name: 'Lecturer Portal', path: '/lecturer', icon: <User size={20} /> },
    { name: 'Maintenance Admin', path: '/admin', icon: <Settings size={20} /> },
    { name: 'Booking Admin', path: '/booking-admin', icon: <Calendar size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('knot_user');
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-slate-800 text-white rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Navigation */}
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 768) && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className={`
              fixed top-0 left-0 h-full w-64 bg-slate-900 text-white shadow-2xl z-40
              flex flex-col transform md:translate-x-0
              ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}
          >
            <div className="p-6 flex items-center gap-3 border-b border-slate-700/50">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/30">
                K
              </div>
              <h1 className="text-xl font-bold tracking-wider">KNOT</h1>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                    ${isActive 
                      ? 'bg-blue-500/10 text-blue-400 shadow-sm border border-blue-500/20' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }
                  `}
                >
                  {link.icon}
                  <span className="font-medium">{link.name}</span>
                </NavLink>
              ))}
            </div>

            <div className="p-4 border-t border-slate-700/50">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}
    </>
  );
};

export default Navigation;
