import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { getDB } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { users } from '$lib/server/db/schema';
import { hashPassword } from '$lib/server/auth';
import { createId } from '@paralleldrive/cuid2';

/**
 * Development-only endpoint to create an admin user
 * This endpoint is only available in development mode
 */
export async function POST({ request, platform }) {
  // Type assertion for platform
  if (!platform) {
    return json({ success: false, message: 'Platform not available' }, { status: 500 });
  }
  // Only allow this endpoint in development mode
  if (!dev) {
    return json({ success: false, message: 'This endpoint is only available in development mode' }, { status: 403 });
  }

  try {
    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password) {
      return json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    // Get DB client
    const db = getDB(platform);
    
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return json({ success: false, message: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    await db.insert(users).values({
      id: createId(),
      email,
      passwordHash: passwordHash,
      name: name || 'Admin User',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return json({ success: true, message: 'Admin user created successfully' });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return json({ success: false, message: 'Failed to create admin user' }, { status: 500 });
  }
}
