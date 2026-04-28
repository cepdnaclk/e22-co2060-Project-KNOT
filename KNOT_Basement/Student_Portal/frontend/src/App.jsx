import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReportFault from './pages/ReportFault';
import BookSpace from './pages/BookSpace';
import Profile from './pages/Profile';
import MaintenanceDashboard from './pages/admin/MaintenanceDashboard';
import TicketDetails from './pages/admin/TicketDetails';
import BookingDashboard from './pages/admin/BookingDashboard';
import LecturerDashboard from './pages/LecturerDashboard';

const ProtectedRoute = ({ children }) => {
  return localStorage.getItem('knot_user') ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/report-fault" element={<ProtectedRoute><ReportFault /></ProtectedRoute>} />
        <Route path="/book-space" element={<ProtectedRoute><BookSpace /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        
        {/* Unified Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute><MaintenanceDashboard /></ProtectedRoute>} />
        <Route path="/admin/ticket/:id" element={<ProtectedRoute><TicketDetails /></ProtectedRoute>} />
        <Route path="/booking-admin" element={<ProtectedRoute><BookingDashboard /></ProtectedRoute>} />
        <Route path="/lecturer" element={<ProtectedRoute><LecturerDashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
