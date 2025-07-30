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
    <>
      <Header />
      <div>
        <Outlet />
      </div>
    </>
  );
}

export default ProtectedLayout;
