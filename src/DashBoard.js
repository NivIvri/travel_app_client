import React from "react";
import Header from "./Header";
import "./LoginPage.css";

function Dashboard({ onLogout }) {
  return (
    <div className="futuristic-bg" style={{ paddingTop: "100px" }}>
      <Header onLogout={onLogout} />
      <div className="glass-card">
        <h1 className="neon-title">Dashboard</h1>
        <h2 className="switch-title">Welcome to your dashboard</h2>
        <p style={{ color: "white" }}>
          Use the top bar to create a route or view your route history.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
