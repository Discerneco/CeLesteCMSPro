import { goto } from '$app/navigation';

// Define the user type
type User = {
  id: string;
  email: string;
  name?: string;
  role: string;
};

/**
 * Authentication store using Svelte 5 runes
 * 
 * This module exports a singleton instance of the auth store
 * that can be imported and used throughout the application.
 */
class AuthStore {
  // State using Svelte 5 runes
  user = $state<User | null>(null);
  isLoading = $state(false);
  
  // Derived state
  isAuthenticated = $derived(!!this.user);
  
  /**
   * Login with email and password
   */
  async login(email: string, password: string) {
    this.isLoading = true;
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.user = data.user;
        this.isLoading = false;
        return { success: true };
      } else {
        this.isLoading = false;
        return { success: false, message: data.message };
      }
    } catch (error) {
      this.isLoading = false;
      return { success: false, message: 'An error occurred' };
    }
  }
  
  /**
   * Logout the current user
   */
  async logout() {
    this.isLoading = true;
    
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      this.user = null;
      this.isLoading = false;
      goto('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      this.isLoading = false;
    }
  }
  
  /**
   * Set the current user (used by server-side load functions)
   */
  setUser(user: User | null) {
    this.user = user;
  }
}

// Create and export the auth store singleton
export const auth = new AuthStore();
