import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./LoginPage";
//import Dashboard from "./Dashboard";
import Dashboard from "./DashBoard";
import CreateRoute from "./CreateRoute";
import RouteHistory from "./RouteHistory";


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={!isLoggedIn ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={isLoggedIn ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/create" element={isLoggedIn ? <CreateRoute /> : <Navigate to="/" />} />
        <Route path="/history" element={isLoggedIn ? <RouteHistory /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
