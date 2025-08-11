import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Return the current user data from the session
	return {
		user: locals.user || null
	};
};