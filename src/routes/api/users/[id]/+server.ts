import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import { users } from '$lib/server/db/schema.js';
import { hash } from '@oslojs/crypto/sha256';
import { encodeBase64 } from '@oslojs/encoding';
import { eq, or } from 'drizzle-orm';

/**
 * GET /api/users/[id]
 * Returns a specific user by ID
 */
export const GET: RequestHandler = async ({ params }) => {
  try {
    const userId = params.id;
    
    const user = await db
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
        preferences: users.preferences,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    const userData = user[0];
    const formattedUser = {
      ...userData,
      name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.username,
      status: userData.active ? (userData.verifiedEmail ? 'active' : 'pending') : 'inactive',
      createdAtFormatted: userData.createdAt.toLocaleDateString(),
      lastLoginFormatted: userData.lastLogin ? userData.lastLogin.toLocaleDateString() : null,
    };

    return json({ user: formattedUser });

  } catch (error) {
    console.error('Error loading user:', error);
    return json({ error: 'Failed to load user' }, { status: 500 });
  }
};

/**
 * PUT /api/users/[id]
 * Updates a specific user
 */
export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    const userId = params.id;
    const data = await request.json();

    // Check if user exists
    const existingUser = await db
      .select({ id: users.id, email: users.email, username: users.username })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    // Validate email format if provided
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return json({ error: 'Invalid email format' }, { status: 400 });
      }

      // Check if email is already taken by another user
      if (data.email !== existingUser[0].email) {
        const emailTaken = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, data.email))
          .limit(1);

        if (emailTaken.length > 0) {
          return json({ error: 'Email already exists' }, { status: 400 });
        }
      }
    }

    // Check if username is already taken by another user
    if (data.username && data.username !== existingUser[0].username) {
      const usernameTaken = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, data.username))
        .limit(1);

      if (usernameTaken.length > 0) {
        return json({ error: 'Username already exists' }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Update fields if provided
    if (data.email !== undefined) updateData.email = data.email;
    if (data.username !== undefined) updateData.username = data.username;
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.verifiedEmail !== undefined) updateData.verifiedEmail = data.verifiedEmail;
    if (data.preferences !== undefined) updateData.preferences = data.preferences;

    // Hash new password if provided
    if (data.password) {
      if (data.password.length < 8) {
        return json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
      }
      updateData.passwordHash = encodeBase64(hash(new TextEncoder().encode(data.password)));
    }

    // Update user
    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
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
        lastLogin: users.lastLogin,
      });

    const user = updatedUser[0];
    const formattedUser = {
      ...user,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
      status: user.active ? (user.verifiedEmail ? 'active' : 'pending') : 'inactive',
      createdAtFormatted: user.createdAt.toLocaleDateString(),
      lastLoginFormatted: user.lastLogin ? user.lastLogin.toLocaleDateString() : null,
    };

    return json({ user: formattedUser });

  } catch (error) {
    console.error('Error updating user:', error);
    return json({ error: 'Failed to update user' }, { status: 500 });
  }
};

/**
 * DELETE /api/users/[id]
 * Deletes a specific user
 */
export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const userId = params.id;

    // Check if user exists
    const existingUser = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deleting admin users
    if (existingUser[0].role === 'admin') {
      return json({ error: 'Cannot delete admin users' }, { status: 403 });
    }

    // Delete user
    await db
      .delete(users)
      .where(eq(users.id, userId));

    return json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Error deleting user:', error);
    return json({ error: 'Failed to delete user' }, { status: 500 });
  }
};