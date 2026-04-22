import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  // Allow through if Redux says authenticated, or if token exists in localStorage
  // (AppLayout restores Redux state async on mount — token acts as fallback)
  const hasToken = !!localStorage.getItem('accessToken');

  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
