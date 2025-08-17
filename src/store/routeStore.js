// src/store/routeStore.js
import { create } from 'zustand';
import { saveRouteToServer, getUserRoutes, deleteRouteFromServer } from '../api/tripApi';
import polyline from '@mapbox/polyline';

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
          id: Date.now().toString(), // Generate unique ID for history items
          destination: state.currentRoute.destination,
          type: state.currentRoute.type,
          path: state.currentRoute.path,
          pathDays: state.currentRoute.pathDays,
          date: new Date().toISOString(),
          isSaved: false, // Mark as not saved initially
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
      
      // Decode the saved route before adding to local state
      const savedRoute = response.route;
      console.log('Saved route from server:', savedRoute);
      const decodedRoute = { ...savedRoute };
      
      // Decode path if it's encoded
      if (savedRoute.pathEncoded) {
        try {
          const decoded = polyline.decode(savedRoute.pathEncoded);
          decodedRoute.path = decoded.map(([lat, lon]) => [lon, lat]); // Convert to [lon, lat] format
        } catch (error) {
          console.error('Error decoding saved route path:', error);
          decodedRoute.path = routeData.path; // Use original data as fallback
        }
      } else if (savedRoute.path && Array.isArray(savedRoute.path)) {
        // Route has regular path data (not encoded)
        decodedRoute.path = savedRoute.path;
      } else {
        // Fallback to original data
        decodedRoute.path = routeData.path;
      }
      
      // Decode pathDays if they're encoded
      if (savedRoute.pathDaysEncoded && Array.isArray(savedRoute.pathDaysEncoded)) {
        try {
          decodedRoute.pathDays = savedRoute.pathDaysEncoded.map(encodedDay => {
            const decoded = polyline.decode(encodedDay);
            return decoded.map(([lat, lon]) => [lon, lat]); // Convert to [lon, lat] format
          });
        } catch (error) {
          console.error('Error decoding saved route pathDays:', error);
          decodedRoute.pathDays = routeData.pathDays; // Use original data as fallback
        }
      } else if (savedRoute.pathDays && Array.isArray(savedRoute.pathDays)) {
        // Route has regular pathDays data (not encoded)
        decodedRoute.pathDays = savedRoute.pathDays;
      } else {
        // Fallback to original data
        decodedRoute.pathDays = routeData.pathDays;
      }
      
      // Add to local state with decoded data
      console.log('Decoded route for local state:', decodedRoute);
      
      // Ensure the route has a timestamp
      const routeWithTimestamp = {
        ...decodedRoute,
        savedAt: decodedRoute.savedAt || decodedRoute.createdAt || decodedRoute.date || new Date().toISOString()
      };
      
      set((state) => ({
        savedRoutes: [...state.savedRoutes, routeWithTimestamp],
      }));
      
      return decodedRoute;
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
      console.log('Loaded routes from server:', routes);
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

  // Save a route from history to server
  saveRouteFromHistory: async (historyItem, name, description, username) => {
    if (!username) {
      throw new Error('User must be logged in to save routes');
    }

    if (!historyItem.destination || !historyItem.path.length) {
      throw new Error('No route to save');
    }

    const routeData = {
      username,
      name,
      description,
      destination: historyItem.destination,
      type: historyItem.type,
      path: historyItem.path,
      pathDays: historyItem.pathDays,
    };

    try {
      const response = await saveRouteToServer(routeData);
      
      // Decode the saved route before adding to local state
      const savedRoute = response.route;
      const decodedRoute = { ...savedRoute };
      
      // Decode path if it's encoded
      if (savedRoute.pathEncoded) {
        try {
          const decoded = polyline.decode(savedRoute.pathEncoded);
          decodedRoute.path = decoded.map(([lat, lon]) => [lon, lat]);
        } catch (error) {
          console.error('Error decoding saved route path:', error);
          decodedRoute.path = routeData.path;
        }
      } else if (savedRoute.path && Array.isArray(savedRoute.path)) {
        decodedRoute.path = savedRoute.path;
      } else {
        decodedRoute.path = routeData.path;
      }
      
      // Decode pathDays if they're encoded
      if (savedRoute.pathDaysEncoded && Array.isArray(savedRoute.pathDaysEncoded)) {
        try {
          decodedRoute.pathDays = savedRoute.pathDaysEncoded.map(encodedDay => {
            const decoded = polyline.decode(encodedDay);
            return decoded.map(([lat, lon]) => [lon, lat]);
          });
        } catch (error) {
          console.error('Error decoding saved route pathDays:', error);
          decodedRoute.pathDays = routeData.pathDays;
        }
      } else if (savedRoute.pathDays && Array.isArray(savedRoute.pathDays)) {
        decodedRoute.pathDays = savedRoute.pathDays;
      } else {
        decodedRoute.pathDays = routeData.pathDays;
      }
      
      // Add to local state with decoded data
      const routeWithTimestamp = {
        ...decodedRoute,
        savedAt: decodedRoute.savedAt || decodedRoute.createdAt || decodedRoute.date || new Date().toISOString()
      };
      
      set((state) => ({
        savedRoutes: [...state.savedRoutes, routeWithTimestamp],
        // Mark the history item as saved
        history: state.history.map(item => 
          item.id === historyItem.id 
            ? { ...item, isSaved: true, savedRouteId: decodedRoute._id }
            : item
        ),
      }));
      
      return decodedRoute;
    } catch (error) {
      console.error('Error saving route from history:', error);
      throw error;
    }
  },

  // Remove item from history
  removeFromHistory: (historyId) =>
    set((state) => ({
      history: state.history.filter(item => item.id !== historyId),
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
