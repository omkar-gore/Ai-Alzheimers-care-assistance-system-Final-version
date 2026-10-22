import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // If not authenticated, redirect to appropriate login page based on target URL or default
    if (location.pathname.startsWith('/caregiver')) {
      return <Navigate to="/auth/caregiver/login" replace />;
    }
    if (location.pathname.startsWith('/doctor')) {
      return <Navigate to="/auth/doctor/login" replace />;
    }
    if (location.pathname.startsWith('/patient')) {
      return <Navigate to="/auth/patient/login" replace />;
    }
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Unauthorized role accessing this route: redirect to their own dashboard
    switch (user.role) {
      case 'patient':
        return <Navigate to="/patient/dashboard" replace />;
      case 'caregiver':
        return <Navigate to="/caregiver/dashboard" replace />;
      case 'doctor':
        return <Navigate to="/doctor/dashboard" replace />;
      case 'screeningUser':
        return <Navigate to="/cognitive-screening/history" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
