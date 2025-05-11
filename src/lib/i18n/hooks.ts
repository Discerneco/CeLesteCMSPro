import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';
import { availableLanguageTags, sourceLanguageTag } from './language';

// Store the current language
export const currentLanguage: Writable<string> = writable(
  browser ? localStorage.getItem('language') || detectBrowserLanguage() : sourceLanguageTag
);

// Detect browser language
function detectBrowserLanguage(): string {
  if (browser) {
    const browserLang = navigator.language.split('-')[0];
    if (availableLanguageTags.includes(browserLang)) {
      return browserLang;
    }
  }
  return sourceLanguageTag;
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
