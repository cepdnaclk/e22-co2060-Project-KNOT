import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';

// Placeholder for other pages to demonstrate integration
const Login = () => <div className="p-10 text-center"><h1 className="text-2xl font-bold">Login Page</h1><p>Placeholder for your existing Login</p></div>;
const StudentDashboard = () => <div className="p-10 text-center"><h1 className="text-2xl font-bold">Student Dashboard</h1><p>Placeholder for your existing Student UI</p></div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
