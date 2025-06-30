import React, { useState } from "react";
//import "./LoginPage.css";
import "./LoginPage.css"; // Ensure you have this CSS file for styles

function LoginPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({ username: "", email: "", password: "", confirmPassword: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/${isLogin ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert(data.message);
      if (isLogin) {
        onLogin(); // trigger redirect to dashboard
      } else {
        setIsLogin(true); // switch to login after register
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="futuristic-bg">
      <div className="glass-card">
        <h1 className="neon-title">Welcome</h1>
        <h2 className="switch-title">{isLogin ? "Login" : "Register"}</h2>
        <form onSubmit={handleSubmit} className="futuristic-form">
          {!isLogin && (
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          )}
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {!isLogin && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          )}
          <button type="submit" className="neon-btn">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
        <p className="switch-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={toggleForm} className="switch-btn">
            {isLogin ? " Register" : " Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
