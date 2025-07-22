// src/lib/stores/i18n.ts
import { getLocale } from '$lib/paraglide/runtime';
import * as m from '$lib/paraglide/messages';
import { writable, derived } from 'svelte/store';

// Create a reactive locale store
function createLocaleStore() {
  const { subscribe, set } = writable(getLocale());
  
  let updateLocale: (() => void) | undefined;
  
  // Update store when locale changes - only in browser
  if (typeof window !== 'undefined') {
    // Listen to URL changes which indicate locale changes
    updateLocale = () => {
      const currentLocale = getLocale();
      set(currentLocale);
    };
    
    // Update on page navigation
    window.addEventListener('popstate', updateLocale);
    
    // Update periodically to catch any missed changes
    setInterval(updateLocale, 100);
  }
  
  return {
    subscribe,
    update: updateLocale
  };
}

export const locale = createLocaleStore();

// Create reactive message functions
export const messages = derived(locale, ($locale) => {
  // Force re-evaluation of all message functions when locale changes
  return {
    // Auth messages
    auth: {
      loginTitle: () => m.auth_login_title(),
      loginSubtitle: () => m.auth_login_subtitle(),
      emailLabel: () => m.auth_email_label(),
      passwordLabel: () => m.auth_password_label(),
      loginButton: () => m.auth_login_button(),
      rememberMe: () => m.auth_remember_me(),
      dontHaveAccount: () => m.auth_dont_have_account(),
      support: () => m.auth_support(),
      copyright: () => m.auth_copyright(),
      themeToggle: () => m.auth_toggle_theme(),
      fillAllFields: () => m.auth_fill_all_fields(),
      invalidEmail: () => m.auth_invalid_email(),
      invalidCredentials: () => m.auth_invalid_credentials(),
      loginError: () => m.auth_login_error(),
      showPassword: () => m.auth_show_password(),
      hidePassword: () => m.auth_hide_password(),
    },
    
    // Common messages
    common: {
      forgotPassword: () => m.common_forgot_password(),
      signup: () => m.common_signup(),
    },
    
    // Dashboard messages
    dashboard: {
      title: () => m.dashboard_title(),
      welcome: () => m.dashboard_welcome(),
      recentPosts: () => m.dashboard_recent_posts(),
      addPost: () => m.dashboard_add_post(),
      recentActivity: () => m.dashboard_recent_activity(),
      viewAll: () => m.dashboard_view_all(),
      systemStatus: () => m.dashboard_system_status(),
      systemOperational: () => m.dashboard_system_operational(),
      database: () => m.dashboard_database(),
      api: () => m.dashboard_api(),
      storage: () => m.dashboard_storage(),
      webServer: () => m.dashboard_web_server(),
      operational: () => m.dashboard_operational(),
      stats: {
        activeSites: () => m.dashboard_stats_active_sites(),
        posts: () => m.dashboard_stats_posts(),
        users: () => m.dashboard_stats_users(),
        mediaFiles: () => m.dashboard_stats_media_files(),
      }
    },
    
    // Sidebar messages
    sidebar: {
      dashboard: () => m.sidebar_dashboard(),
      sites: () => m.sidebar_sites(),
      templates: () => m.sidebar_templates(),
      posts: () => m.sidebar_posts(),
      pages: () => m.sidebar_pages(),
      media: () => m.sidebar_media(),
      users: () => m.sidebar_users(),
      plugins: () => m.sidebar_plugins(),
      settings: () => m.sidebar_settings(),
      help: () => m.sidebar_help(),
      logout: () => m.sidebar_logout(),
    },
    
    // User menu messages
    userMenu: {
      profile: () => m.user_menu_profile(),
      settings: () => m.user_menu_settings(),
      logout: () => m.user_menu_logout(),
    }
  };
});

// Helper function to force locale update
export function updateLocale() {
  if (typeof window !== 'undefined' && locale.update) {
    locale.update();
  }
}