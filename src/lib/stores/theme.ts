/**
 * Theme store for CeLesteCMS Pro
 * 
 * Implements DaisyUI theme system with localStorage persistence
 * Uses Svelte 5 compatible store pattern
 */
import { writable } from 'svelte/store';

// Available themes from DaisyUI config (matching app.css configuration)
export const AVAILABLE_THEMES = ['light', 'dark'] as const;
export type Theme = typeof AVAILABLE_THEMES[number];

// Helper to get initial theme from localStorage or fallback to default
function getInitialTheme(): Theme {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme');
    if (saved && AVAILABLE_THEMES.includes(saved as Theme)) {
      return saved as Theme;
    }
  }
  return AVAILABLE_THEMES[0];
}

// Create and export the theme store
function createThemeStore() {
  const store = writable<Theme>(getInitialTheme());

  // Helper function to update DOM and localStorage
  const updateDOM = (theme: Theme) => {
    if (typeof window !== 'undefined') {
      console.log('🎨 Theme store updating DOM:', theme);
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  };

  return {
    subscribe: store.subscribe,

    // Set theme directly if valid
    set: (value: Theme) => {
      if (AVAILABLE_THEMES.includes(value)) {
        store.set(value);
        updateDOM(value);
      }
    },

    // Toggle between light and dark
    toggle: () => {
      store.update(current => {
        const newTheme = current === 'light' ? 'dark' : 'light';
        updateDOM(newTheme);
        return newTheme;
      });
    }
  };
}

export const theme = createThemeStore();
