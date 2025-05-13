/**
 * Better Auth client instance for frontend authentication
 * This provides reactive stores and methods for authentication
 */
import { writable } from 'svelte/store';

// Define types for authentication
type User = {
  id: string;
  email: string;
  name?: string;
  role?: string;
  isAuthenticated: boolean;
};

type AuthResponse = {
  success: boolean;
  user?: User;
  error?: string;
};

// Create reactive stores for authentication state
export const user = writable(null);
export const isAuthenticated = writable(false);
export const isLoading = writable(false);

// Auth client for Svelte components
export const authClient = {
  // Sign in with email and password
  async signIn({ email, password }: { email: string; password: string }): Promise<AuthResponse> {
    isLoading.set(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        user.set(data.user);
        isAuthenticated.set(true);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    } finally {
      isLoading.set(false);
    }
  },
  
  // Sign out the current user
  async signOut() {
    isLoading.set(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      user.set(null);
      isAuthenticated.set(false);
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: 'Sign out failed' };
    } finally {
      isLoading.set(false);
    }
  },
  
  // Get the current session
  async getSession() {
    isLoading.set(true);
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      
      if (data.user) {
        user.set(data.user);
        isAuthenticated.set(true);
        return { user: data.user };
      } else {
        user.set(null);
        isAuthenticated.set(false);
        return null;
      }
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    } finally {
      isLoading.set(false);
    }
  }
};
