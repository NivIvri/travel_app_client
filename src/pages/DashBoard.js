// src/pages/Dashboard.js
import React from "react";
import Header from "../components/Header"
import "../style/LoginPage.css";
import "../style/Dashboard.css";

function Dashboard() {
  return (
    <div className="futuristic-bg">
      <Header />
      <main className="glass-card dashboard-wrapper">
        <h1 className="neon-title">Dashboard</h1>
        <h2 className="switch-title">Welcome to your dashboard</h2>
        <p className="dashboard-text">
          Use the top bar to create a route or view your route history.
        </p>
      </main>
    </div>
  );
}

export default Dashboard;
