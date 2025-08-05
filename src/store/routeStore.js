// src/store/routeStore.js
import { create } from 'zustand';

export const useRouteStore = create((set) => ({
  currentRoute: {
    destination: '',
    type: '',
    path: [],        // full route
    pathDays: [],    // route split into days
    forecast: [],    // optional: 3-day forecast (not for DB)
  },

  history: [],

  setRoute: ({ destination, type, path, pathDays = [], forecast = [] }) =>
    set(() => ({
      currentRoute: {
        destination,
        type,
        path,
        pathDays,
        forecast,
      },
    })),

  saveRouteToHistory: () =>
    set((state) => ({
      history: [
        ...state.history,
        {
          destination: state.currentRoute.destination,
          type: state.currentRoute.type,
          date: new Date().toISOString(),
        },
      ],
    })),

  resetRoute: () =>
    set(() => ({
      currentRoute: {
        destination: '',
        type: '',
        path: [],
        pathDays: [],
        forecast: [],
      },
    })),
}));
