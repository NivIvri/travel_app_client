// src/api/authApi.js
const API_BASE = "http://localhost:5000/api";

// Helper function to get stored token
const getStoredToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to store token
const storeToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Helper function to remove token
const removeToken = () => {
  localStorage.removeItem('authToken');
};

// Helper function to validate password strength (simplified)
const validatePassword = (password) => {
  if (!password || password.length < 1) {
    throw new Error('Password is required');
  }
};

// Helper function to validate email format
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Please enter a valid email address');
  }
};

// Helper function to validate username
const validateUsername = (username) => {
  if (username.length < 3) {
    throw new Error('Username must be at least 3 characters long');
  }
  if (username.length > 20) {
    throw new Error('Username must be less than 20 characters');
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    throw new Error('Username can only contain letters, numbers, and underscores');
  }
};

export async function registerUser(formData) {
  try {
    // Client-side validation
    validateEmail(formData.email);
    validateUsername(formData.username);
  validatePassword(formData.password);

    const response = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.username,
        email: formData.email,
        password: formData.password
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // Store the token if registration includes auto-login
    if (data.token) {
      storeToken(data.token);
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Registration failed');
  }
}

export async function loginUser(formData) {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.username,
        password: formData.password
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Store the JWT token
    if (data.token) {
      storeToken(data.token);
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Login failed');
  }
}

export async function logoutUser() {
  try {
    const token = getStoredToken();
    
    if (token) {
      // Call logout endpoint to invalidate token on server
      await fetch(`${API_BASE}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always remove token from localStorage
    removeToken();
  }
}

export async function verifyToken() {
  try {
    const token = getStoredToken();
    
    if (!token) {
      return null;
    }

    const response = await fetch(`${API_BASE}/verify`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      removeToken();
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Token verification error:', error);
    removeToken();
    return null;
  }
}

// Helper function to get auth headers for API calls
export const getAuthHeaders = () => {
  const token = getStoredToken();
  return {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` })
  };
};

// Export token management functions
export { getStoredToken, storeToken, removeToken };
