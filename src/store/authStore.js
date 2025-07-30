// src/store/AuthStore.js
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  isLoggedIn: false,
  user: null,

  login: (user) => set({ isLoggedIn: true, user }),
  logout: () => set({ isLoggedIn: false, user: null }),
}));
