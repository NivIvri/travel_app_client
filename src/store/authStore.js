// src/store/AuthStore.js
import { create } from 'zustand';
import { useRouteStore } from './routeStore';
import { verifyToken, logoutUser, removeToken } from '../api/authApi';

export const useAuthStore = create((set, get) => ({
  isLoggedIn: false,
  user: null,
  isLoading: false,
  error: null,

  // Initialize auth state on app start
  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const user = await verifyToken();
      if (user) {
        set({ isLoggedIn: true, user, isLoading: false });
        
        // Load user's saved routes
        const routeStore = useRouteStore.getState();
        await routeStore.loadUserRoutes(user.username);
        console.log('User routes loaded successfully');
      } else {
        set({ isLoggedIn: false, user: null, isLoading: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoggedIn: false, user: null, isLoading: false });
      removeToken();
    }
  },

  login: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      set({ isLoggedIn: true, user: userData, isLoading: false });
      
      // Automatically load user's saved routes when they log in
      const routeStore = useRouteStore.getState();
      await routeStore.loadUserRoutes(userData.username);
      console.log('User routes loaded successfully');
    } catch (error) {
      console.error('Failed to load user routes:', error);
      set({ error: 'Failed to load user routes' });
      // Don't block login if route loading fails
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ isLoggedIn: false, user: null, isLoading: false, error: null });
      
      // Clear all route data when user logs out
      const routeStore = useRouteStore.getState();
      routeStore.clearAllData();
    }
  },

  // Clear authentication error
  clearError: () => {
    set({ error: null });
  },

  // Update user data
  updateUser: (userData) => {
    set({ user: userData });
  },
}));
