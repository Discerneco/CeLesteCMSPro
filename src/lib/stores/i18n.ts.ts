// src/lib/stores/i18n.ts
import { getLocale } from '$lib/paraglide/runtime';
import * as m from '$lib/paraglide/messages';
import { writable, derived } from 'svelte/store';

// Create a reactive locale store
function createLocaleStore() {
  const { subscribe, set } = writable(getLocale());
  
  // Update store when locale changes
  if (typeof window !== 'undefined') {
    // Listen to URL changes which indicate locale changes
    const updateLocale = () => {
      const currentLocale = getLocale();
      set(currentLocale);
    };
    
    // Update on page navigation
    window.addEventListener('popstate', updateLocale);
    
    // Update periodically to catch any missed changes
    setInterval(updateLocale, 100);
    
    return {
      subscribe,
      update: updateLocale
    };
  }
  
  return { subscribe };
}

export const locale = createLocaleStore();

// Create reactive message functions
export const messages = derived(locale, ($locale) => {
  // Force re-evaluation of all message functions when locale changes
  return {
    // Auth messages
    auth: {
      loginTitle: () => m['auth.loginTitle'](),
      loginSubtitle: () => m['auth.loginSubtitle'](),
      emailLabel: () => m['auth.emailLabel'](),
      passwordLabel: () => m['auth.passwordLabel'](),
      loginButton: () => m['auth.loginButton'](),
      rememberMe: () => m['auth.rememberMe'](),
      dontHaveAccount: () => m['auth.dontHaveAccount'](),
      support: () => m['auth.support'](),
      copyright: () => m['auth.copyright'](),
      toggleTheme: () => m['auth.toggleTheme'](),
      fillAllFields: () => m['auth.fillAllFields'](),
      invalidEmail: () => m['auth.invalidEmail'](),
      invalidCredentials: () => m['auth.invalidCredentials'](),
      loginError: () => m['auth.loginError'](),
      showPassword: () => m['auth.showPassword'](),
      hidePassword: () => m['auth.hidePassword'](),
    },
    
    // Common messages
    common: {
      forgotPassword: () => m['common.forgotPassword'](),
      signup: () => m['common.signup'](),
    },
    
    // Dashboard messages
    dashboard: {
      title: () => m['dashboard.title'](),
      welcome: () => m['dashboard.welcome'](),
      recentPosts: () => m['dashboard.recentPosts'](),
      addPost: () => m['dashboard.addPost'](),
      recentActivity: () => m['dashboard.recentActivity'](),
      viewAll: () => m['dashboard.viewAll'](),
      systemStatus: () => m['dashboard.systemStatus'](),
      systemOperational: () => m['dashboard.systemOperational'](),
      database: () => m['dashboard.database'](),
      api: () => m['dashboard.api'](),
      storage: () => m['dashboard.storage'](),
      webServer: () => m['dashboard.webServer'](),
      operational: () => m['dashboard.operational'](),
      stats: {
        activeSites: () => m['dashboard.stats.activeSites'](),
        posts: () => m['dashboard.stats.posts'](),
        users: () => m['dashboard.stats.users'](),
        mediaFiles: () => m['dashboard.stats.mediaFiles'](),
      }
    },
    
    // Sidebar messages
    sidebar: {
      dashboard: () => m['sidebar.dashboard'](),
      sites: () => m['sidebar.sites'](),
      templates: () => m['sidebar.templates'](),
      posts: () => m['sidebar.posts'](),
      pages: () => m['sidebar.pages'](),
      media: () => m['sidebar.media'](),
      users: () => m['sidebar.users'](),
      plugins: () => m['sidebar.plugins'](),
      settings: () => m['sidebar.settings'](),
      help: () => m['sidebar.help'](),
      logout: () => m['sidebar.logout'](),
    },
    
    // User menu messages
    userMenu: {
      profile: () => m['userMenu.profile'](),
      settings: () => m['userMenu.settings'](),
      logout: () => m['userMenu.logout'](),
    }
  };
});

// Helper function to force locale update
export function updateLocale() {
  if (locale.update) {
    locale.update();
  }
}