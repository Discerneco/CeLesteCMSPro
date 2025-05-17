import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';

export const GET: RequestHandler = async () => {
  try {
    // Create a test user
    const testUser = await db.insert(users).values({
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: 'test-hash-not-for-production',
      firstName: 'Test',
      lastName: 'User',
      role: 'admin'
    }).returning();
    
    // Get all users
    const allUsers = await db.select().from(users);
    
    return json({
      success: true,
      testUser,
      allUsers,
      message: 'Database operations successful!'
    });
  } catch (error) {
    console.error('Database test error:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
};
