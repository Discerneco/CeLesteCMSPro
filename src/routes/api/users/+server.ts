import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import { users } from '$lib/server/db/schema.js';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64 } from '@oslojs/encoding';
import { eq, count, desc, like, or } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

/**
 * GET /api/users
 * Returns a paginated list of users with search functionality
 */
export const GET: RequestHandler = async ({ url }) => {
  try {
    const searchQuery = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build search condition
    const searchCondition = searchQuery 
      ? or(
          like(users.firstName, `%${searchQuery}%`),
          like(users.lastName, `%${searchQuery}%`),
          like(users.email, `%${searchQuery}%`),
          like(users.username, `%${searchQuery}%`)
        )
      : undefined;

    // Get total count
    const totalCountResult = await db
      .select({ count: count() })
      .from(users)
      .where(searchCondition);
    
    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Get users
    const userList = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        active: users.active,
        verifiedEmail: users.verifiedEmail,
        createdAt: users.createdAt,
        lastLogin: users.lastLogin,
      })
      .from(users)
      .where(searchCondition)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    // Format users data
    const formattedUsers = userList.map((user: any) => ({
      ...user,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
      status: user.active ? (user.verifiedEmail ? 'active' : 'pending') : 'inactive',
      createdAtFormatted: user.createdAt.toLocaleDateString(),
      lastLoginFormatted: user.lastLogin ? user.lastLogin.toLocaleDateString() : null,
    }));

    return json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    });

  } catch (error) {
    console.error('Error loading users:', error);
    return json({ error: 'Failed to load users' }, { status: 500 });
  }
};

/**
 * POST /api/users
 * Creates a new user with validation and password hashing
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.email || !data.username || !data.password) {
      return json({ error: 'Email, username, and password are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate password strength
    if (data.password.length < 8) {
      return json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    // Check if email or username already exists
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(or(
        eq(users.email, data.email),
        eq(users.username, data.username)
      ))
      .limit(1);

    if (existingUser.length > 0) {
      return json({ error: 'Email or username already exists' }, { status: 400 });
    }

    // Hash password
    const passwordHash = encodeBase64(await sha256(new TextEncoder().encode(data.password)));

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        id: createId(),
        email: data.email,
        username: data.username,
        passwordHash,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        role: data.role || 'subscriber',
        active: data.active ?? true,
        verifiedEmail: data.verifiedEmail ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        active: users.active,
        verifiedEmail: users.verifiedEmail,
        createdAt: users.createdAt,
      });

    const user = newUser[0];
    const formattedUser = {
      ...user,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
      status: user.active ? (user.verifiedEmail ? 'active' : 'pending') : 'inactive',
      createdAtFormatted: user.createdAt.toLocaleDateString(),
      lastLoginFormatted: null,
    };

    return json({ user: formattedUser }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return json({ error: 'Failed to create user' }, { status: 500 });
  }
};
