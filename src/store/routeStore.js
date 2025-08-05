// src/store/routeStore.js
import { create } from 'zustand';
import { saveRouteToServer, getUserRoutes, deleteRouteFromServer } from '../api/tripApi';

export const useRouteStore = create((set, get) => ({
  currentRoute: {
    destination: '',
    type: '',
    path: [],        // full route
    pathDays: [],    // route split into days
    forecast: [],    // optional: 3-day forecast (not for DB)
  },

  history: [],
  savedRoutes: [],
  isLoading: false,

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

  // Save route to server with user authentication
  saveRouteWithDetails: async (name, description, username) => {
    const state = get();
    
    if (!username) {
      throw new Error('User must be logged in to save routes');
    }

    if (!state.currentRoute.destination || !state.currentRoute.path.length) {
      throw new Error('No route to save');
    }

    const routeData = {
      username,
      name,
      description,
      destination: state.currentRoute.destination,
      type: state.currentRoute.type,
      path: state.currentRoute.path,
      pathDays: state.currentRoute.pathDays,
    };

    try {
      const response = await saveRouteToServer(routeData);
      
      // Add to local state (MongoDB returns the saved route)
      set((state) => ({
        savedRoutes: [...state.savedRoutes, response.route],
      }));
      
      return response.route;
    } catch (error) {
      console.error('Error saving route to server:', error);
      throw error;
    }
  },

  // Load user's saved routes from server
  loadUserRoutes: async (username) => {
    if (!username) {
      throw new Error('Username is required');
    }

    set({ isLoading: true });
    
    try {
      const routes = await getUserRoutes(username);
      set({ savedRoutes: routes, isLoading: false });
      return routes;
    } catch (error) {
      set({ isLoading: false });
      console.error('Error loading routes:', error);
      throw error;
    }
  },

  // Delete route from server
  deleteSavedRoute: async (routeId, username) => {
    if (!username) {
      throw new Error('User must be logged in to delete routes');
    }

    try {
      await deleteRouteFromServer(routeId, username);
      
      // Remove from local state
      set((state) => ({
        savedRoutes: state.savedRoutes.filter(route => route._id !== routeId),
      }));
    } catch (error) {
      console.error('Error deleting route:', error);
      throw error;
    }
  },

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

  // Clear all data (for logout)
  clearAllData: () =>
    set(() => ({
      currentRoute: {
        destination: '',
        type: '',
        path: [],
        pathDays: [],
        forecast: [],
      },
      history: [],
      savedRoutes: [],
      isLoading: false,
    })),
}));
