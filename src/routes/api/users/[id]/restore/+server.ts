import { json } from '@sveltejs/kit';
import { getDbFromEvent } from '$lib/server/db/utils';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

/**
 * PUT /api/users/[id]/restore
 * Restores a soft-deleted user
 */
export const PUT: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  const { id } = event.params;

  try {
    // Check if user is authenticated and is admin
    if (!event.locals.user?.isAuthenticated) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }
    
    if (event.locals.user.role !== 'admin') {
      return json({ error: 'Admin access required' }, { status: 403 });
    }

    // Restore the user by clearing deletion fields
    const result = await db
      .update(users)
      .set({ 
        deletedAt: null,
        deletedBy: null,
        active: true
      })
      .where(eq(users.id, id))
      .returning();

    if (result.length === 0) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    return json({ 
      success: true, 
      user: result[0],
      message: 'User restored successfully' 
    });
  } catch (error) {
    console.error('Error restoring user:', error);
    return json({ error: 'Failed to restore user' }, { status: 500 });
  }
};