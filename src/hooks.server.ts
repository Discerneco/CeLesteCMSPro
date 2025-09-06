import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { validateSession, deleteSession } from '$lib/server/auth-oslo';

const handleParaglide: Handle = ({ event, resolve }) => {
	// Skip i18n for routes that should not be localized
	const skipI18nRoutes = [
		'/sites/',       // Static site preview routes
		'/preview/',     // Preview routes for generated sites
		'/blog',         // Content routes that only exist in generated sites
		'/about',        
		'/contact',
		'/api/'          // API routes should remain unlocalized
	];
	
	// Check if current path should skip i18n
	const shouldSkipI18n = skipI18nRoutes.some(route => 
		event.url.pathname.startsWith(route)
	);
	
	if (shouldSkipI18n) {
		return resolve(event);
	}
	
	return paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});
};

const handleAuth: Handle = async ({ event, resolve }) => {
	// Get session ID from cookies
	const sessionId = event.cookies.get('session');
	
	if (sessionId) {
		const sessionData = await validateSession(sessionId, event.platform);
		
		if (sessionData) {
			// Valid session
			event.locals.user = {
				id: sessionData.user.id,
				email: sessionData.user.email,
				username: sessionData.user.username,
				firstName: sessionData.user.firstName,
				lastName: sessionData.user.lastName,
				role: sessionData.user.role,
				isAuthenticated: true
			};
			event.locals.session = sessionData.session;
		} else {
			// Invalid session - clean up
			await deleteSession(sessionId, event.platform);
			event.cookies.delete('session', { path: '/' });
		}
	}
	
	// Default user state if no valid session
	if (!event.locals.user) {
		event.locals.user = {
			id: '',
			email: '',
			username: '',
			firstName: '',
			lastName: '',
			role: '',
			isAuthenticated: false
		};
	}
	
	return resolve(event);
};

const handleRouteProtection: Handle = async ({ event, resolve }) => {
	const isAdminRoute = event.url.pathname.startsWith('/admin');
	const isLoginRoute = event.url.pathname === '/admin/login' || event.url.pathname === '/admin/signup';
	
	if (isAdminRoute && !isLoginRoute && !event.locals.user?.isAuthenticated) {
		// Redirect unauthenticated users to login
		return Response.redirect(new URL('/admin/login', event.url.origin), 302);
	}
	
	return resolve(event);
};

export const handle: Handle = sequence(handleParaglide, handleAuth, handleRouteProtection);