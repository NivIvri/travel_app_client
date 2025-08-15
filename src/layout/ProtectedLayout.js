// src/components/ProtectedLayout.js
import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';

function ProtectedLayout() {
  const { 
    isLoggedIn, 
    isLoading, 
    initializeAuth 
  } = useAuthStore();

  useEffect(() => {
    // Initialize authentication on component mount
    initializeAuth();
  }, [initializeAuth]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)'
      }}>
        <LoadingSpinner message="Checking authentication..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default ProtectedLayout;
