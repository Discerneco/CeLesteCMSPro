import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';

export const GET: RequestHandler = async () => {
  try {
    // Generate unique identifiers for this test
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 10000);
    const uniqueId = `${timestamp}-${randomSuffix}`;
    
    // Create a test user with unique username and email
    const testUser = await db.insert(users).values({
      email: `test-${uniqueId}@example.com`,
      username: `testuser-${uniqueId}`,
      passwordHash: 'test-hash-not-for-production',
      firstName: 'Test',
      lastName: 'User',
      role: 'admin'
    }).returning();
    
    // Test basic database query to confirm the schema works
    // Get all users to make sure we can read from the database
    const allUsers = await db.select().from(users);
    
    return json({
      success: true,
      testUser,
      userCount: allUsers.length,
      message: 'Database operations successful! The schema is working properly.'
    });
  } catch (error) {
    console.error('Database test error:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
};
