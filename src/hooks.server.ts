import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { auth } from '$lib/server/auth';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

const handleAuth: Handle = async ({ event, resolve }) => {
	// Get session from Better Auth
	const session = await auth.api.getSession({
		headers: event.request.headers
	});
	
	event.locals.session = session;
	return resolve(event);
};

export const handle: Handle = async ({ event, resolve }) => {
	// Chain the auth handler with the paraglide handler
	return handleAuth({ event, resolve: (event) => handleParaglide({ event, resolve }) });
};
