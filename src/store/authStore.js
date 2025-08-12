// src/store/AuthStore.js
import { create } from 'zustand';
import { useRouteStore } from './routeStore';

export const useAuthStore = create((set, get) => ({
  isLoggedIn: false,
  user: null,

  login: async (user) => {
    set({ isLoggedIn: true, user });
    
    // Automatically load user's saved routes when they log in
    try {
      const routeStore = useRouteStore.getState();
      await routeStore.loadUserRoutes(user.username);
      console.log('User routes loaded successfully');
    } catch (error) {
      console.error('Failed to load user routes:', error);
      // Don't block login if route loading fails
    }
  },

  logout: () => {
    set({ isLoggedIn: false, user: null });
    
    // Clear all route data when user logs out
    const routeStore = useRouteStore.getState();
    routeStore.clearAllData();
  },
}));
