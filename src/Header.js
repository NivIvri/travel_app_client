import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Header({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <Link to="/create" style={styles.link}>Create New Route</Link>
        <Link to="/history" style={styles.link}>Routes History</Link>
      </div>
      <div style={styles.right}>
        <button onClick={handleLogout} style={styles.logout}>Logout</button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    position: "sticky",
    top: 0,
    background: "#222",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    padding: "1rem 2rem",
    zIndex: 1000,
  },
  left: {
    display: "flex",
    gap: "1rem",
  },
  right: {},
  link: {
    color: "white",
    textDecoration: "none",
    fontWeight: "bold",
  },
  logout: {
    background: "red",
    border: "none",
    color: "white",
    padding: "0.5rem 1rem",
    cursor: "pointer",
  },
};

export default Header;
