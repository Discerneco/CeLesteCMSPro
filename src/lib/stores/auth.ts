import { writable } from 'svelte/store';
import { goto } from '$app/navigation';

export const createAuthStore = () => {
  const { subscribe, set, update } = writable({
    user: null,
    isAuthenticated: false,
    isLoading: false
  });
  
  return {
    subscribe,
    login: async (email: string, password: string, rememberMe: boolean = false) => {
      update(state => ({ ...state, isLoading: true }));
      
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, rememberMe })
        });
        
        const data = await response.json();
        
        if (data.success) {
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false
          });
          
          return { success: true };
        } else {
          update(state => ({ ...state, isLoading: false }));
          return { success: false, message: data.message };
        }
      } catch (error) {
        update(state => ({ ...state, isLoading: false }));
        return { success: false, message: 'An error occurred' };
      }
    },
    signup: async (email: string, password: string, name: string) => {
      update(state => ({ ...state, isLoading: true }));
      
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name })
        });
        
        const data = await response.json();
        
        if (data.success) {
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false
          });
          
          return { success: true };
        } else {
          update(state => ({ ...state, isLoading: false }));
          return { success: false, message: data.message };
        }
      } catch (error) {
        update(state => ({ ...state, isLoading: false }));
        return { success: false, message: 'An error occurred' };
      }
    },
    logout: async () => {
      update(state => ({ ...state, isLoading: true }));
      
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        set({ user: null, isAuthenticated: false, isLoading: false });
        goto('/admin/login');
      } catch (error) {
        update(state => ({ ...state, isLoading: false }));
      }
    },
    setUser: (user: any) => {
      update(state => ({
        ...state,
        user,
        isAuthenticated: !!user
      }));
    },
    init: () => {
      console.log('🚀 Auth store initialized');
      return true;
    }
  };
};

export const auth = createAuthStore();