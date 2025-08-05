import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import '../style/LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();

  
  // Zustand store
  const login = useAuthStore((state) => state.login);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, navigate]);

  const toggleForm = () => {
    setIsLogin((prev) => !prev);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const data = isLogin
        ? await loginUser(formData)
        : await registerUser(formData);

      alert(data.message);

      if (isLogin) {
        login({ username: formData.username });
      } else {
        setIsLogin(true);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="futuristic-bg">
      <div className="glass-card">
        <h1 className="neon-title">Welcome</h1>
        <h2 className="switch-title">{isLogin ? 'Login' : 'Register'}</h2>

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
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="switch-text">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={toggleForm} className="switch-btn">
            {isLogin ? ' Register' : ' Login'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
