import React from 'react';
import { Navigate } from 'react-router-dom';
import { ADMIN_TOKEN_KEY } from '../../lib/apiClient';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
