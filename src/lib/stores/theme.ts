/**
 * Theme store for CeLesteCMS Pro
 * 
 * Implements DaisyUI theme system with localStorage persistence
 * Uses Svelte 5 compatible store pattern
 */
import { writable } from 'svelte/store';

// Available themes from DaisyUI config
export const AVAILABLE_THEMES = ['celesteLight', 'celesteDark'] as const;
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
  
  // Update DOM whenever theme changes
  if (typeof window !== 'undefined') {
    store.subscribe(theme => {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    });
  }
  
  return {
    subscribe: store.subscribe,
    
    // Set theme directly if valid
    set: (value: Theme) => {
      if (AVAILABLE_THEMES.includes(value)) {
        store.set(value);
      }
    },
    
    // Toggle between light and dark
    toggle: () => {
      store.update(current => 
        current === 'celesteLight' ? 'celesteDark' : 'celesteLight'
      );
    }
  };
}

export const theme = createThemeStore();
