import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Route guard that requires authentication and (optionally) specific roles.
 * Handles the async hydration window: if a token exists but Redux hasn't
 * rehydrated yet, we optimistically allow through (the API will 401 if stale).
 */
const RoleProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const hasToken = !!localStorage.getItem('accessToken');

  // Not logged in at all
  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/" replace />;
  }

  // Role check — only enforce if Redux has resolved the user
  if (isAuthenticated && user && roles.length > 0 && !roles.includes(user.role)) {
    // Redirect to appropriate home based on actual role
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'RESTAURANT_OWNER') return <Navigate to="/owner" replace />;
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
