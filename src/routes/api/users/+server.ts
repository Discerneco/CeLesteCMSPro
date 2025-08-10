import { json } from '@sveltejs/kit';
import { getDbFromEvent } from '$lib/server/db/utils';
import { users } from '$lib/server/db/schema';
import { hashPassword } from '$lib/server/auth-oslo';
import type { RequestHandler } from './$types';

/**
 * GET /api/users
 * Returns a list of all users (without passwords)
 */
export const GET: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  
  try {
    const allUsers = await db.select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      username: users.username,
      role: users.role,
      active: users.active,
      verifiedEmail: users.verifiedEmail,
      lastLogin: users.lastLogin,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users);
    
    return json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return json({ error: 'Failed to fetch users' }, { status: 500 });
  }
};

/**
 * POST /api/users
 * Creates a new user with proper validation and password hashing
 */
export const POST: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  const userData = await event.request.json();
  
  try {
    // Validate required fields
    if (!userData.email || !userData.username || !userData.password) {
      return json({ 
        error: 'Email, username, and password are required' 
      }, { status: 400 });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return json({ 
        error: 'Invalid email format' 
      }, { status: 400 });
    }
    
    // Validate password length
    if (userData.password.length < 8) {
      return json({ 
        error: 'Password must be at least 8 characters long' 
      }, { status: 400 });
    }
    
    // Prepare user data
    const newUserData = {
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      email: userData.email.toLowerCase().trim(),
      username: userData.username.toLowerCase().trim(),
      passwordHash: await hashPassword(userData.password),
      role: userData.role || 'subscriber',
      active: userData.active ?? true,
      verifiedEmail: userData.verifiedEmail ?? false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.insert(users).values(newUserData).returning();
    
    if (result.length === 0) {
      return json({ error: 'Failed to create user' }, { status: 500 });
    }
    
    // Remove password from response
    const { passwordHash, ...userWithoutPassword } = result[0];
    return json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle unique constraint violations
    if (error instanceof Error) {
      if (error.message.includes('UNIQUE constraint failed: users.email')) {
        return json({ error: 'Email address is already in use' }, { status: 400 });
      }
      if (error.message.includes('UNIQUE constraint failed: users.username')) {
        return json({ error: 'Username is already taken' }, { status: 400 });
      }
    }
    
    return json({ error: 'Failed to create user' }, { status: 500 });
  }
};
