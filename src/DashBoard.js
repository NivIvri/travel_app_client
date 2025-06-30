import React from "react";
import Header from "./Header";

function Dashboard({ onLogout }) {
  return (
    <>
      <Header onLogout={onLogout} />
      <div style={{ padding: "2rem" }}>
        <h2>Welcome to your Dashboard</h2>
        <p>Select "Create New Route" or "Routes History" above to continue.</p>
      </div>
    </>
  );
}

export default Dashboard;
