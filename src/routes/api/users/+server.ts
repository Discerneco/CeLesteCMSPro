import { json } from '@sveltejs/kit';
import { getDbFromEvent } from '$lib/server/db/utils';
import { users } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';

/**
 * GET /api/users
 * Returns a list of all users
 */
export const GET: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  
  try {
    const allUsers = await db.select().from(users);
    return json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return json({ error: 'Failed to fetch users' }, { status: 500 });
  }
};

/**
 * POST /api/users
 * Creates a new user
 */
export const POST: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  const userData = await event.request.json();
  
  try {
    const result = await db.insert(users).values(userData).returning();
    return json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return json({ error: 'Failed to create user' }, { status: 500 });
  }
};
