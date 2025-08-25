import { writable } from 'svelte/store';
import { getLocale, setLocale } from '$lib/paraglide/runtime.js';
import { browser } from '$app/environment';

// Create a reactive store that tracks locale changes
export const currentLocale = writable(getLocale());

// Function to change locale and notify all subscribers
export function switchLocale(newLocale: string) {
  try {
    console.log('🌍 Switching locale via store:', getLocale(), '->', newLocale);
    
    // Update Paraglide locale
    setLocale(newLocale as any);
    
    // Update localStorage
    if (browser) {
      localStorage.setItem('PARAGLIDE_LOCALE', newLocale);
      localStorage.setItem('celestecms-language', newLocale);
    }
    
    // Notify all subscribers to re-render
    currentLocale.set(newLocale);
    
    console.log('✅ Locale switched successfully via store to:', newLocale);
    
    return true;
  } catch (error) {
    console.error('❌ Locale switch failed:', error);
    return false;
  }
}

// Initialize store with current locale
if (browser) {
  const savedLocale = localStorage.getItem('PARAGLIDE_LOCALE') || localStorage.getItem('celestecms-language');
  if (savedLocale && savedLocale !== getLocale()) {
    setLocale(savedLocale as any);
    currentLocale.set(savedLocale);
  }
}