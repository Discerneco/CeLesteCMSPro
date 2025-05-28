import { createAuthClient } from 'better-auth/svelte'
import { browser } from '$app/environment'

// Get base URL - use environment variable in production, fallback to current origin in browser
const getBaseURL = () => {
  if (browser) {
    return window.location.origin;
  }
  // In SSR, try environment variable first, then fallback
  return process.env.BETTER_AUTH_URL || 'http://localhost:5173';
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  // Enable fetch credentials for cookie-based auth
  fetchOptions: {
    credentials: 'include'
  }
});

// Export commonly used methods for convenience
export const { 
  signIn, 
  signOut, 
  signUp, 
  useSession,
  getSession,
  $Infer
} = authClient;
