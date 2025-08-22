import { json } from '@sveltejs/kit';
import { eq, inArray } from 'drizzle-orm';
import { getDbFromEvent } from '$lib/server/db/utils';
import { users, posts, media, postCategories, postTags, sessions } from '$lib/server/db/schema';
import { hashPassword } from '$lib/server/auth-oslo';
import type { RequestHandler } from './$types';

/**
 * GET /api/users/[id]
 * Returns a specific user by ID
 */
export const GET: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  const { id } = event.params;
  
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    
    if (user.length === 0) {
      return json({ error: 'User not found' }, { status: 404 });
    }
    
    // Remove password from response
    const { passwordHash, ...userWithoutPassword } = user[0];
    return json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user:', error);
    return json({ error: 'Failed to fetch user' }, { status: 500 });
  }
};

/**
 * PUT /api/users/[id]
 * Updates a specific user by ID
 */
export const PUT: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  const { id } = event.params;
  const userData = await event.request.json();
  
  try {
    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    
    if (existingUser.length === 0) {
      return json({ error: 'User not found' }, { status: 404 });
    }
    
    // Prepare update data
    const updateData: any = {
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      email: userData.email,
      username: userData.username,
      role: userData.role || 'subscriber',
      active: userData.active ?? true,
      verifiedEmail: userData.verifiedEmail ?? false,
      updatedAt: new Date()
    };
    
    // Hash password if provided
    if (userData.password && userData.password.trim()) {
      updateData.passwordHash = await hashPassword(userData.password);
    }
    
    // Update user
    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    
    if (result.length === 0) {
      return json({ error: 'Failed to update user' }, { status: 500 });
    }
    
    // Remove password from response
    const { passwordHash, ...userWithoutPassword } = result[0];
    return json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error updating user:', error);
    
    // Handle unique constraint violations
    if (error instanceof Error) {
      if (error.message.includes('UNIQUE constraint failed: users.email')) {
        return json({ error: 'Email address is already in use' }, { status: 400 });
      }
      if (error.message.includes('UNIQUE constraint failed: users.username')) {
        return json({ error: 'Username is already taken' }, { status: 400 });
      }
    }
    
    return json({ error: 'Failed to update user' }, { status: 500 });
  }
};

/**
 * DELETE /api/users/[id]
 * Deletes a specific user by ID
 */
export const DELETE: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  const { id } = event.params;
  
  try {
    // Get request body for content handling options
    const requestBody = await event.request.json().catch(() => ({}));
    const { contentAction, reassignToUserId } = requestBody;
    
    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    
    if (existingUser.length === 0) {
      return json({ error: 'User not found' }, { status: 404 });
    }
    
    // Prevent deletion of the last admin user
    if (existingUser[0].role === 'admin') {
      const adminCount = await db
        .select()
        .from(users)
        .where(eq(users.role, 'admin'));
      
      if (adminCount.length <= 1) {
        return json({ error: 'Cannot delete the last admin user' }, { status: 400 });
      }
    }
    
    // Handle linked content based on the selected action
    if (contentAction) {
      if (contentAction === 'delete_all') {
        // Move posts to trash instead of deleting
        await db
          .update(posts)
          .set({ 
            status: 'trash',
            trashedAt: new Date(),
            trashedBy: event.locals.user?.id // Current user doing the deletion
          })
          .where(eq(posts.authorId, id));
        
        // Media: Set uploaderId to null (anonymous)
        await db
          .update(media)
          .set({ uploaderId: null })
          .where(eq(media.uploaderId, id));
        
      } else if (contentAction === 'transfer' && reassignToUserId) {
        // Validate reassignment user exists and is active
        const reassignUser = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.id, reassignToUserId))
          .limit(1);
        
        if (reassignUser.length === 0) {
          return json({ error: 'Reassignment user not found' }, { status: 400 });
        }
        
        // Reassign content to the selected user
        await db
          .update(posts)
          .set({ authorId: reassignToUserId })
          .where(eq(posts.authorId, id));
        
        await db
          .update(media)
          .set({ uploaderId: reassignToUserId })
          .where(eq(media.uploaderId, id));
        
      } else if (contentAction === 'anonymous') {
        // For posts: move to trash (can't have null author)
        await db
          .update(posts)
          .set({ 
            status: 'trash',
            trashedAt: new Date(),
            trashedBy: event.locals.user?.id
          })
          .where(eq(posts.authorId, id));
        
        // For media: set uploaderId to null (allowed)
        await db
          .update(media)
          .set({ uploaderId: null })
          .where(eq(media.uploaderId, id));
      }
    }
    
    // Soft delete user (mark as deleted instead of removing)
    const result = await db
      .update(users)
      .set({ 
        deletedAt: new Date(),
        deletedBy: event.locals.user?.id,
        active: false // Also deactivate to prevent login
      })
      .where(eq(users.id, id))
      .returning();
    
    if (result.length === 0) {
      return json({ error: 'Failed to delete user' }, { status: 500 });
    }
    
    // Delete sessions to force logout
    await db.delete(sessions).where(eq(sessions.userId, id));
    
    return json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return json({ error: 'Failed to delete user' }, { status: 500 });
  }
};