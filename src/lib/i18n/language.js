import { browser } from '$app/environment';
import { writable } from 'svelte/store';

// Available language tags
export const availableLanguageTags = ['en', 'pt-br'];
export const sourceLanguageTag = 'en';

// Language names for display
export const languageNames = {
  'en': 'English',
  'pt-br': 'Português (BR)'
};

// Get initial language from localStorage or default to source language
const getInitialLanguage = () => {
  if (browser) {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage && availableLanguageTags.includes(storedLanguage)) {
      return storedLanguage;
    }
  }
  return sourceLanguageTag;
};

// Create a writable store
export const languageStore = writable(getInitialLanguage());

// Export a function to set the language
export const setLanguage = (newLanguage) => {
  if (availableLanguageTags.includes(newLanguage)) {
    languageStore.set(newLanguage);
    if (browser) {
      localStorage.setItem('language', newLanguage);
    }
  } else {
    console.error(`Language ${newLanguage} is not available`);
  }
};

// Export the store for reactive use
export const languageTag = languageStore;
