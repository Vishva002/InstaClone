import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-ig-primary">
        {/* Fullscreen loading spinner or Instagram-like logo */}
        <div className="flex flex-col items-center gap-4">
          <i className="bi bi-instagram text-5xl text-rose-500 animate-pulse"></i>
          <span className="text-sm font-medium text-ig-muted">Loading Instagram...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
