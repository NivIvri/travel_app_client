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
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, navigate]);

  // Clear errors when switching forms
  useEffect(() => {
    clearError();
    setFormErrors({});
  }, [isLogin, clearError]);

  const toggleForm = () => {
    setIsLogin((prev) => !prev);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!isLogin) {
      if (!formData.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    if (!isLogin) {
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      const data = isLogin
        ? await loginUser(formData)
        : await registerUser(formData);

      if (isLogin) {
        // Login successful
        await login({ 
          username: formData.username,
          email: data.user?.email || '',
          id: data.user?.id || ''
        });
        navigate('/dashboard');
      } else {
        // Registration successful - show success message and switch to login
        alert('Account created successfully! Please sign in.');
        setIsLogin(true);
        setFormData({
          username: formData.username,
          email: '',
          password: '',
          confirmPassword: '',
        });
      }
    } catch (err) {
      console.error('Auth error:', err);
      // Error is handled by the auth store
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (fieldName) => {
    return formErrors[fieldName] || '';
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Welcome to RoutePlanner</h1>
        <p className="login-subtitle">
          {isLogin ? 'Sign in to your account' : 'Create your account'}
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className={`form-input ${getFieldError('email') ? 'error' : ''}`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {getFieldError('email') && (
                <span className="field-error">{getFieldError('email')}</span>
              )}
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              className={`form-input ${getFieldError('username') ? 'error' : ''}`}
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            {getFieldError('username') && (
              <span className="field-error">{getFieldError('username')}</span>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className={`form-input ${getFieldError('password') ? 'error' : ''}`}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {getFieldError('password') && (
              <span className="field-error">{getFieldError('password')}</span>
            )}

          </div>
          
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className={`form-input ${getFieldError('confirmPassword') ? 'error' : ''}`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {getFieldError('confirmPassword') && (
                <span className="field-error">{getFieldError('confirmPassword')}</span>
              )}
            </div>
          )}
          
          <button 
            type="submit" 
            className={`submit-btn ${isSubmitting || isLoading ? 'loading' : ''}`}
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="switch-container">
          <p className="switch-text">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button 
              onClick={toggleForm} 
              className="switch-btn"
              disabled={isSubmitting || isLoading}
            >
              {isLogin ? ' Sign up' : ' Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
