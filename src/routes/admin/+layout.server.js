import { redirect } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').LayoutServerLoad} */
export async function load({ locals, route }) {
  // Exclude login and signup routes from authentication check
  if (route.id?.includes('/admin/login') || route.id?.includes('/admin/signup')) {
    return {};
  }
  
  // Check if user is authenticated using Better Auth session from locals
  if (!locals.session) {
    // Redirect to login if no session
    throw redirect(302, '/admin/login');
  }
  
  return {
    // Pass user data from Better Auth session
    user: {
      isAuthenticated: true,
      ...locals.session.user
    }
  };
}
