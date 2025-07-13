import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

// Create session state
const createAuthStore = () => {
  // Initialize from localStorage if available
  const initialState = browser && localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : { user: null, isAuthenticated: false };

  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    
    // Login method
    login: async (email, password) => {
      try {
        // This is a placeholder - will be replaced with actual API call
        // For now, just simulate a login to test UI
        if (email && password) {
          // In a real implementation, this would validate with your backend
          const user = {
            id: 'admin1',
            email,
            name: 'Administrator',
            role: 'admin'
          };

          // Set authenticated state
          set({ user, isAuthenticated: true });
          
          // Save to localStorage
          if (browser) {
            localStorage.setItem('auth', JSON.stringify({ user, isAuthenticated: true }));
          }
          
          return { success: true };
        }
        
        return { 
          success: false, 
          message: 'Invalid credentials'
        };
      } catch (error) {
        console.error('Login error:', error);
        return { 
          success: false, 
          message: 'An error occurred during login'
        };
      }
    },
    
    // Logout method
    logout: () => {
      // Clear auth state
      set({ user: null, isAuthenticated: false });
      
      // Clear from localStorage
      if (browser) {
        localStorage.removeItem('auth');
      }
      
      // Redirect to login page
      goto('/admin/login');
    },
    
    // Update user details
    updateUser: (userData) => {
      update(state => {
        const updatedState = { 
          ...state, 
          user: { ...state.user, ...userData } 
        };
        
        // Update localStorage
        if (browser) {
          localStorage.setItem('auth', JSON.stringify(updatedState));
        }
        
        return updatedState;
      });
    }
  };
};

export const auth = createAuthStore();
