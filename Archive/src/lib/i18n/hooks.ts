import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';
import { availableLanguageTags, sourceLanguageTag } from './language';

// Detect browser language safely
function detectBrowserLanguage(): string {
  if (!browser) {
    return sourceLanguageTag;
  }
  
  try {
    const browserLang = navigator.language.split('-')[0];
    if (availableLanguageTags.includes(browserLang)) {
      return browserLang;
    }
  } catch (e) {
    console.error('Error detecting browser language:', e);
  }
  
  return sourceLanguageTag;
}

// Get initial language safely
function getInitialLanguage(): string {
  if (!browser) {
    return sourceLanguageTag;
  }
  
  try {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage && availableLanguageTags.includes(storedLanguage)) {
      return storedLanguage;
    }
  } catch (e) {
    console.error('Error accessing localStorage:', e);
  }
  
  return detectBrowserLanguage();
}

// Store the current language
export const currentLanguage: Writable<string> = writable(sourceLanguageTag);

// Initialize the store with the correct value once in the browser
if (browser) {
  currentLanguage.set(getInitialLanguage());
}

// Update language and persist to localStorage
export function setLanguage(lang: string): void {
  if (availableLanguageTags.includes(lang)) {
    currentLanguage.set(lang);
    if (browser) {
      localStorage.setItem('language', lang);
      document.documentElement.lang = lang;
    }
  }
}

// Initialize language on page load
export function initLanguage(): void {
  if (browser) {
    currentLanguage.subscribe((lang) => {
      document.documentElement.lang = lang;
    });
  }
}
