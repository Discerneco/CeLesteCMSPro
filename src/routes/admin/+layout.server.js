/** @type {import('@sveltejs/kit').LayoutServerLoad} */
export async function load({ locals, route, cookies }) {
  // Exclude login route from authentication check
  if (route.id?.includes('/admin/login')) {
    return {};
  }
  
  // This will be expanded to use server-side authentication checking
  // For now, we'll use a simple cookie check as a placeholder
  const authCookie = cookies.get('auth');
  
  if (!authCookie) {
    // Redirect to login if no auth cookie
    return {
      status: 302,
      redirect: '/admin/login'
    };
  }
  
  return {
    // We'll populate this with user data later
    user: { isAuthenticated: true }
  };
}
