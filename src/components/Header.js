// src/components/Header.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import "../style/Header.css";

function Header() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="header">
          <button className="nav-button" onClick={() => navigate("/create")}>
        Create Route
      </button>
      <button className="nav-button" onClick={() => navigate("/dashboard")}>
        Dashboard
      </button>
  
      <button className="nav-button" onClick={() => navigate("/history")}>
        History
      </button>
      <button className="nav-button" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}

export default Header;
