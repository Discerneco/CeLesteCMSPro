import { writable } from 'svelte/store';
import { authClient } from '$lib/auth-client';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';

// Create a reactive store that wraps Better Auth's session
function createAuthStore() {
  // Initialize store with null session
  const { subscribe, set, update } = writable<{
    user: any;
    isAuthenticated: boolean;
    isLoading: boolean;
  }>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  return {
    subscribe,
    
    // Initialize the store by fetching current session
    init: async () => {
      if (!browser) return;
      
      try {
        const session = await authClient.getSession();
        if (session.data) {
          set({
            user: session.data.user,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Failed to fetch session:', error);
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    },
    
    // Signup method using Better Auth
    signup: async (email: string, password: string, name: string) => {
      try {
        const result = await authClient.signUp.email({
          email,
          password,
          name
        });

        if (result.data) {
          // Update store with new session data (Better Auth auto-signs in after signup)
          set({
            user: result.data.user,
            isAuthenticated: true,
            isLoading: false
          });
          
          return { success: true };
        } else {
          return {
            success: false,
            message: result.error?.message || 'Signup failed'
          };
        }
      } catch (error) {
        console.error('Signup error:', error);
        return {
          success: false,
          message: 'An error occurred during signup'
        };
      }
    },
    
    // Login method using Better Auth
    login: async (email: string, password: string, rememberMe: boolean = false) => {
      console.log('🔍 Login called with rememberMe:', rememberMe);
      
      try {
        const result = await authClient.signIn.email({
          email,
          password,
          rememberMe
        });

        console.log('🔍 Better Auth signIn result:', result);

        if (result.data) {
          // Update store with new session data
          set({
            user: result.data.user,
            isAuthenticated: true,
            isLoading: false
          });
          
          return { success: true };
        } else {
          return {
            success: false,
            message: result.error?.message || 'Login failed'
          };
        }
      } catch (error) {
        console.error('Login error:', error);
        return {
          success: false,
          message: 'An error occurred during login'
        };
      }
    },
    
    // Logout method using Better Auth
    logout: async () => {
      try {
        await authClient.signOut();
        
        // Clear auth state
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
        
        // Redirect to login page
        goto('/admin/login');
      } catch (error) {
        console.error('Logout error:', error);
        // Even if logout fails on server, clear local state
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
        goto('/admin/login');
      }
    },
    
    // Refresh session data
    refresh: async () => {
      try {
        const session = await authClient.getSession();
        if (session.data) {
          set({
            user: session.data.user,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Failed to refresh session:', error);
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    }
  };
}

export const auth = createAuthStore();
