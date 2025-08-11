import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { getDbFromEvent } from '$lib/server/db/utils';
import { users } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  // Ensure user is authenticated
  if (!event.locals.user) {
    throw redirect(302, '/admin/login');
  }

  const db = getDbFromEvent(event);
  const currentUser = event.locals.user;

  try {
    // Get current user's full data from database
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.id, currentUser.id))
      .limit(1);

    if (userData.length === 0) {
      throw redirect(302, '/admin/login');
    }

    // Remove password hash from the response
    const { passwordHash, ...user } = userData[0];

    // Format dates for display
    const userWithFormattedDates = {
      ...user,
      createdAtFormatted: new Date(user.createdAt).toLocaleDateString(),
      lastLoginFormatted: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : null,
      // Build full name for display
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || user.email
    };

    return {
      user: userWithFormattedDates
    };
  } catch (error) {
    console.error('Error loading profile data:', error);
    throw redirect(302, '/admin/login');
  }
};