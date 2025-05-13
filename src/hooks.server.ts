import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { verifyToken } from '$lib/server/auth';

// Paraglide middleware for internationalization
const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

// Authentication middleware
const handleAuth: Handle = async ({ event, resolve }) => {
  // Get auth token from cookies
  const authToken = event.cookies.get('auth_token');
  
  if (authToken) {
    const userData = await verifyToken(authToken);
    
    if (userData) {
      // Add user data to locals for access in load functions
      event.locals.user = {
        id: userData.userId,
        role: userData.role,
        isAuthenticated: true
      };
    }
  }
  
  // Default user state if no valid token
  if (!event.locals.user) {
    event.locals.user = {
      isAuthenticated: false
    };
  }
  
  return resolve(event);
};

// Protect admin routes
const handleAdminProtection: Handle = async ({ event, resolve }) => {
  const isAdminRoute = event.url.pathname.startsWith('/admin');
  const isLoginRoute = event.url.pathname === '/admin/login';
  
  if (isAdminRoute && !isLoginRoute && !event.locals.user?.isAuthenticated) {
    // Redirect unauthenticated users to login
    return Response.redirect(new URL('/admin/login', event.url.origin), 302);
  }
  
  return resolve(event);
};

// Combine all middleware using sequence
export const handle = sequence(handleAuth, handleAdminProtection, handleParaglide);
