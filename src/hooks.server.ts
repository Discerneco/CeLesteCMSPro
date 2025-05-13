import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { createAuth } from '$lib/server/auth';

// Paraglide middleware for internationalization
const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

// Better Auth middleware
const handleAuth: Handle = async ({ event, resolve }) => {
  try {
    // Check if platform is available
    if (!event.platform) {
      console.warn('Platform not available, falling back to default auth');
      event.locals.user = { isAuthenticated: false };
      return resolve(event);
    }
    
    // Initialize Better Auth with the platform
    const auth = createAuth(event.platform);
    
    // Use Better Auth's SvelteKit handler with a wrapper to transform user format
    const wrappedResolve = async (innerEvent: any) => {
      // Better Auth will set user in event.locals.user
      // Transform it to our expected format before passing to the next middleware
      const result = await resolve(innerEvent);
      
      if (innerEvent.locals.user) {
        const authUser = innerEvent.locals.user;
        innerEvent.locals.user = {
          id: authUser.id,
          email: authUser.email,
          name: authUser.name || '',
          role: authUser.role || 'user',
          isAuthenticated: true
        };
      } else {
        innerEvent.locals.user = { isAuthenticated: false };
      }
      
      return result;
    };
    
    return svelteKitHandler({ 
      event, 
      resolve: wrappedResolve, 
      auth
    });
  } catch (error) {
    console.error('Auth error:', error);
    // Fallback to default user state if auth fails
    event.locals.user = { isAuthenticated: false };
    return resolve(event);
  }
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
