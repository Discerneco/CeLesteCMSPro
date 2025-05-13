import { json } from '@sveltejs/kit';
import { createAuth } from '$lib/server/auth';
import { getDB } from '$lib/server/db';

/**
 * GET handler for checking the current auth session
 * Returns user data if authenticated, null otherwise
 */
export async function GET({ request, platform, cookies, locals }) {
  // If user is already in locals, return it directly
  if (locals.user && locals.user.isAuthenticated) {
    return json({ user: locals.user });
  }
  
  // Check auth token from cookies
  const authToken = cookies.get('auth_token');
  
  if (!authToken) {
    return json({ user: null });
  }
  
  // For our implementation, we trust the token if it exists
  // In production, we would validate against the database
  if (authToken.startsWith('deprecated-token-')) {
    const parts = authToken.split('-');
    if (parts.length >= 4) {
      const user = {
        id: parts[2],
        email: 'admin@celeste.cms', // Example, would come from DB
        name: 'Admin User',
        role: parts[3],
        isAuthenticated: true
      };
      
      return json({ user });
    }
  }
  
  // Return no user if token is invalid
  return json({ user: null });
}
