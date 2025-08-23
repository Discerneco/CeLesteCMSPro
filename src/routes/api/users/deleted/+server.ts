import { json } from '@sveltejs/kit';
import { getDbFromEvent } from '$lib/server/db/utils';
import { users } from '$lib/server/db/schema';
import { isNotNull } from 'drizzle-orm';
import type { RequestHandler } from './$types';

/**
 * GET /api/users/deleted
 * Returns a list of all soft-deleted users
 */
export const GET: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);

  try {
    console.log('Deleted users API called');
    console.log('User:', event.locals.user?.username, 'Role:', event.locals.user?.role);

    // Check if user is authenticated and is admin
    if (!event.locals.user?.isAuthenticated) {
      console.log('Authentication failed');
      return json({ error: 'Authentication required' }, { status: 401 });
    }
    
    if (event.locals.user.role !== 'admin') {
      console.log('Admin access failed, user role:', event.locals.user.role);
      return json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log('Starting database query...');

    // Fetch deleted users (those with deletedAt set)
    const deletedUsers = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        active: users.active,
        createdAt: users.createdAt,
        deletedAt: users.deletedAt,
        deletedBy: users.deletedBy
      })
      .from(users)
      .where(isNotNull(users.deletedAt))
      .orderBy(users.deletedAt);

    console.log('Query completed, found', deletedUsers.length, 'deleted users');

    // Transform the data for UI
    const transformedUsers = deletedUsers.map((user: any) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: 'deleted', // All users in this endpoint are deleted
      active: user.active,
      createdAt: user.createdAt,
      createdAtFormatted: user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '',
      deletedAt: user.deletedAt,
      deletedAtFormatted: user.deletedAt ? new Date(user.deletedAt).toLocaleDateString('pt-BR') : '',
      deletedBy: user.deletedBy
    }));

    console.log('Returning', transformedUsers.length, 'transformed users');
    return json(transformedUsers);
  } catch (error) {
    console.error('Error fetching deleted users - Full error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return json({ error: 'Failed to fetch deleted users' }, { status: 500 });
  }
};