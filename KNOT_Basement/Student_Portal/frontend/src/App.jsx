import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReportFault from './pages/ReportFault';
import BookSpace from './pages/BookSpace';
import Profile from './pages/Profile';
import MaintenanceDashboard from './pages/admin/MaintenanceDashboard';
import TicketDetails from './pages/admin/TicketDetails';
import LecturerDashboard from './pages/LecturerDashboard';

// Booking Admin — layout + nested sub-pages
import BookingDashboard from './pages/admin/BookingDashboard';
import BADashboard from './pages/admin/BADashboard';
import BAPendingApprovals from './pages/admin/BAPendingApprovals';
import BAAllBookings from './pages/admin/BAAllBookings';
import BARoomManagement from './pages/admin/BARoomManagement';

// Components
import Navigation from './components/Navigation';
import PageTransition from './components/PageTransition';

const ProtectedRoute = ({ children }) => {
  return localStorage.getItem('knot_user') ? children : <Navigate to="/login" />;
};

// Pages that manage their own full-screen sidebar layout
const SELF_LAYOUT_PAGES = ['/booking-admin', '/admin', '/lecturer'];

const AnimatedRoutes = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isSelfLayout = SELF_LAYOUT_PAGES.some(
    p => location.pathname === p || location.pathname.startsWith(p + '/')
  );
  const showGlobalNav = !isLoginPage && !isSelfLayout;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {showGlobalNav && <Navigation />}

      <main className={`flex-1 overflow-y-auto h-screen custom-scrollbar transition-all duration-300 ${showGlobalNav ? 'md:ml-64' : ''}`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
            <Route path="/report-fault" element={<ProtectedRoute><PageTransition><ReportFault /></PageTransition></ProtectedRoute>} />
            <Route path="/book-space" element={<ProtectedRoute><PageTransition><BookSpace /></PageTransition></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute>} />

            {/* Admin pages with their own sidebar */}
            <Route path="/admin" element={<ProtectedRoute><PageTransition><MaintenanceDashboard /></PageTransition></ProtectedRoute>} />
            <Route path="/admin/ticket/:id" element={<ProtectedRoute><PageTransition><TicketDetails /></PageTransition></ProtectedRoute>} />
            <Route path="/lecturer" element={<ProtectedRoute><PageTransition><LecturerDashboard /></PageTransition></ProtectedRoute>} />

            {/* Booking Admin — nested routes */}
            <Route
              path="/booking-admin"
              element={<ProtectedRoute><BookingDashboard /></ProtectedRoute>}
            >
              {/* Default redirect to dashboard overview */}
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<BADashboard />} />
              <Route path="pending-approvals" element={<BAPendingApprovals />} />
              <Route path="all-bookings" element={<BAAllBookings />} />
              <Route path="room-management" element={<BARoomManagement />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
