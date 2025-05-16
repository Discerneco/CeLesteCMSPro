// src/lib/i18n/index.ts
import { derived } from 'svelte/store';
import { languageStore } from './language';
import en from './messages/en.json';
import ptBr from './messages/pt-br.json';

const messagesMap: Record<string, typeof en> = {
  'en': en,
  'pt-br': ptBr
};

// Export a derived store that updates when the language changes
export const messages = derived(languageStore, (lang: string) => messagesMap[lang] || messagesMap['en']);


// Define the message interface based on our JSON structure
interface MessageInterface {
  sidebar: {
    dashboard: () => string;
    sites: () => string;
    templates: () => string;
    posts: () => string;
    pages: () => string;
    media: () => string;
    users: () => string;
    plugins: () => string;
    settings: () => string;
    help: () => string;
    logout: () => string;
  };
  dashboard: {
    title: () => string;
    welcome: () => string;
    systemStatus: () => string;
    recentActivity: () => string;
    quickActions: () => string;
    createNewSite: () => string;
    createNewPost: () => string;
    uploadMedia: () => string;
    manageUsers: () => string;
    stats: {
      activeSites: () => string;
      posts: () => string;
      users: () => string;
      mediaFiles: () => string;
    };
  };
  common: {
    save: () => string;
    cancel: () => string;
    delete: () => string;
    edit: () => string;
    loading: () => string;
    error: () => string;
    success: () => string;
    confirm: () => string;
    search: () => string;
  };
  login: {
    title: () => string;
    email: () => string;
    password: () => string;
    rememberMe: () => string;
    forgotPassword: () => string;
    loginButton: () => string;
    invalidCredentials: () => string;
  };
  settings: {
    title: () => string;
    appearance: () => string;
    language: () => string;
    darkMode: () => string;
    notifications: () => string;
  };
}

// Re-export language functions
export * from './language';


// Re-export language functions
export * from './language';
