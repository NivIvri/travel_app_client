// src/store/routeStore.js
import { create } from 'zustand';


export const useRouteStore = create((set) => ({
  currentRoute: {
    destination: '',
    type: '',
    path: [],
  },

  // All saved trips
  history: [],

  // Set new trip
  setRoute: ({ destination, type ,path}) =>
    set(() => ({
      currentRoute: {
        destination,
        type,
        path
      },
    })),

  // Save to history
  saveRouteToHistory: () =>
    set((state) => ({
      history: [...state.history, state.currentRoute],
    })),

  // Reset current route
  resetRoute: () =>
    set(() => ({
      currentRoute: {
        destination: '',
        type: '',
        path: [],
      },
    })),
}));
