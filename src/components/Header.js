// src/components/Header.js
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import "../style/Header.css";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, isLoading } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error('Logout error:', error);
      // Force navigation even if logout fails
      navigate("/");
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-container">
        <a href="/" className="logo">
          RoutePlanner
        </a>
        
        <nav className={`nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <a 
            href="/create" 
            className={`nav-link ${isActive('/create') ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              navigate("/create");
              setIsMobileMenuOpen(false);
            }}
          >
            Create Route
          </a>
          <a 
            href="/dashboard" 
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              navigate("/dashboard");
              setIsMobileMenuOpen(false);
            }}
          >
            Dashboard
          </a>
          <a 
            href="/history" 
            className={`nav-link ${isActive('/history') ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              navigate("/history");
              setIsMobileMenuOpen(false);
            }}
          >
            History
          </a>
        </nav>

        <div className="user-section">
          {user ? (
            <>
              <div className="user-info">
                Welcome, {user.username}
              </div>
              <button 
                className={`logout-btn ${isLoading ? 'loading' : ''}`}
                onClick={handleLogout}
                disabled={isLoading}
              >
                {isLoading ? 'Logging out...' : 'Logout'}
              </button>
            </>
          ) : (
            <button 
              className="login-btn"
              onClick={() => navigate("/")}
            >
              Login
            </button>
          )}
        </div>

        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          ☰
        </button>
      </div>
    </header>
  );
}

export default Header;
