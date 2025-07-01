import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css"; // Reuse existing button styling

function Header({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <header style={styles.header}>
      <div style={styles.toolbar}>
        <Link to="/create" className="switch-btn">Create New Route</Link>
        <Link to="/history" className="switch-btn">Routes History</Link>
        <button onClick={handleLogout} className="switch-btn">Logout</button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    background: "rgba(15, 15, 30, 0.8)",
    padding: "1rem 0",
    zIndex: 1000,
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  toolbar: {
    maxWidth: "900px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 2rem",
  },
};

export default Header;
