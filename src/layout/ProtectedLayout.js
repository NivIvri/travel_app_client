// src/components/ProtectedLayout.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Header from '../components/Header';

function ProtectedLayout() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

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
