// src/lib/i18n/language.ts
import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';

// Define available languages
export const availableLanguageTags = ['en', 'pt-br'];
export const sourceLanguageTag = 'en';

// Language display names for UI
export const languageNames: Record<string, string> = {
  'en': 'English',
  'pt-br': 'Português'
};

// Get initial language from localStorage or default to source language
const getInitialLanguage = (): string => {
  // For server-side rendering, always use the source language
  if (!browser) {
    return sourceLanguageTag;
  }
  
  // Check localStorage first
  const storedLanguage = localStorage.getItem('language');
  if (storedLanguage && availableLanguageTags.includes(storedLanguage)) {
    return storedLanguage;
  }
  
  // Try to detect browser language
  try {
    const browserLang = navigator.language.split('-')[0];
    if (availableLanguageTags.includes(browserLang)) {
      return browserLang;
    }
  } catch (e) {
    console.error('Error detecting browser language:', e);
  }
  
  return sourceLanguageTag;
};

// Create a writable store
export const languageStore: Writable<string> = writable(getInitialLanguage());

// Export a function to get the current language
export const language = (): string => {
  let currentLanguage = sourceLanguageTag;
  const unsubscribe = languageStore.subscribe(value => {
    currentLanguage = value;
  });
  unsubscribe();
  return currentLanguage;
};

// Export a function to set the language
export const setLanguage = (newLanguage: string): void => {
  if (availableLanguageTags.includes(newLanguage)) {
    languageStore.set(newLanguage);
    if (browser) {
      localStorage.setItem('language', newLanguage);
      document.documentElement.lang = newLanguage;
    }
  } else {
    console.error(`Language ${newLanguage} is not available`);
  }
};

// Export the store for reactive use
export const languageTag = languageStore;
