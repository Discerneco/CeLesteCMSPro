// src/lib/i18n/index.ts
import { language } from './language';

// This is a temporary solution until Paraglide generates the messages
// We'll directly access the JSON files for now
import en from './messages/en.json';
import ptBr from './messages/pt-br.json';

type MessageData = typeof en;
type NestedMessage = string | Record<string, any>;

const messagesMap: Record<string, MessageData> = {
  'en': en,
  'pt-br': ptBr
};

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

// Create a message function that uses the current language
export const m = new Proxy({} as MessageInterface, {
  get(_target, prop) {
    return function(...args: any[]): string {
      const currentLanguage = language();
      const messages = messagesMap[currentLanguage] || messagesMap['en'];
      
      // Handle nested properties like 'dashboard.stats.users'
      const parts = typeof prop === 'string' ? prop.split('.') : [String(prop)];
      let result: any = messages;
      
      for (const part of parts) {
        if (result && typeof result === 'object' && part in result) {
          result = result[part];
        } else {
          return `[Missing message: ${String(prop)}]`;
        }
      }
      
      return String(result);
    };
  }
});

// Re-export language functions
export * from './language';
