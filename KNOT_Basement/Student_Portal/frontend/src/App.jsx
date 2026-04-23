import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReportFault from './pages/ReportFault';
import BookSpace from './pages/BookSpace';
import Profile from './pages/Profile';

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
      </Routes>
    </BrowserRouter>
  );
}
