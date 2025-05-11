// src/lib/i18n/index.ts
import { languageStore } from './language';

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

// Helper function to get the current language value from the store
function getCurrentLanguage(): string {
  let currentLang = 'en';
  const unsubscribe = languageStore.subscribe(value => {
    currentLang = value;
  });
  unsubscribe();
  return currentLang;
}

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

// Pre-create the message objects to avoid proxy issues with SSR
const createMessageObject = () => {
  const result: any = {};
  
  // Create sidebar messages
  result.sidebar = {
    dashboard: () => {
      const currentLang = getCurrentLanguage();
      return messagesMap[currentLang]?.sidebar?.dashboard || messagesMap['en'].sidebar.dashboard;
    },
    sites: () => {
      const currentLang = getCurrentLanguage();
      return messagesMap[currentLang]?.sidebar?.sites || messagesMap['en'].sidebar.sites;
    },
    templates: () => {
      const currentLang = getCurrentLanguage();
      return messagesMap[currentLang]?.sidebar?.templates || messagesMap['en'].sidebar.templates;
    },
    posts: () => {
      const currentLang = getCurrentLanguage();
      return messagesMap[currentLang]?.sidebar?.posts || messagesMap['en'].sidebar.posts;
    },
    pages: () => {
      const currentLang = getCurrentLanguage();
      return messagesMap[currentLang]?.sidebar?.pages || messagesMap['en'].sidebar.pages;
    },
    media: () => {
      const currentLang = getCurrentLanguage();
      return messagesMap[currentLang]?.sidebar?.media || messagesMap['en'].sidebar.media;
    },
    users: () => {
      const currentLang = getCurrentLanguage();
      return messagesMap[currentLang]?.sidebar?.users || messagesMap['en'].sidebar.users;
    },
    plugins: () => {
      const currentLang = getCurrentLanguage();
      return messagesMap[currentLang]?.sidebar?.plugins || messagesMap['en'].sidebar.plugins;
    },
    settings: () => {
      const currentLang = getCurrentLanguage();
      return messagesMap[currentLang]?.sidebar?.settings || messagesMap['en'].sidebar.settings;
    },
    help: () => {
      const currentLang = getCurrentLanguage();
      return messagesMap[currentLang]?.sidebar?.help || messagesMap['en'].sidebar.help;
    },
    logout: () => {
      const currentLang = getCurrentLanguage();
      return messagesMap[currentLang]?.sidebar?.logout || messagesMap['en'].sidebar.logout;
    }
  };
  
  // Create dashboard messages
  result.dashboard = {
    title: () => {
      const currentLang = getCurrentLanguage();
      return messagesMap[currentLang]?.dashboard?.title || messagesMap['en'].dashboard.title;
    },
    welcome: () => {
      const currentLang = getCurrentLanguage();
      return messagesMap[currentLang]?.dashboard?.welcome || messagesMap['en'].dashboard.welcome;
    },
    systemStatus: () => {
      const currentLang = getCurrentLanguage();
      return messagesMap[currentLang]?.dashboard?.systemStatus || messagesMap['en'].dashboard.systemStatus;
    },
    stats: {
      activeSites: () => {
        const currentLang = getCurrentLanguage();
        return messagesMap[currentLang]?.dashboard?.stats?.activeSites || messagesMap['en'].dashboard.stats.activeSites;
      },
      posts: () => {
        const currentLang = getCurrentLanguage();
        return messagesMap[currentLang]?.dashboard?.stats?.posts || messagesMap['en'].dashboard.stats.posts;
      },
      users: () => {
        const currentLang = getCurrentLanguage();
        return messagesMap[currentLang]?.dashboard?.stats?.users || messagesMap['en'].dashboard.stats.users;
      },
      mediaFiles: () => {
        const currentLang = getCurrentLanguage();
        return messagesMap[currentLang]?.dashboard?.stats?.mediaFiles || messagesMap['en'].dashboard.stats.mediaFiles;
      }
    }
  };
  
  return result;
};

// Export the message object
export const m = createMessageObject();

// Re-export language functions
export * from './language';
