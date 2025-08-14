import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAdminLoggedIn } from '../../services/auth';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = isAdminLoggedIn();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;