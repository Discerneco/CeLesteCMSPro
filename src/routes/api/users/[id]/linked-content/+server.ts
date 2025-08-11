import { json } from '@sveltejs/kit';
import { getDbFromEvent } from '$lib/server/db/utils';
import { users, posts, media } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

/**
 * GET /api/users/[id]/linked-content
 * Returns summary of content linked to a user before deletion
 */
export const GET: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  const { id } = event.params;
  
  try {
    // Debug: Check if table schemas are properly imported
    console.log('Table schemas check:', {
      users: typeof users,
      posts: typeof posts,
      media: typeof media,
      usersUndefined: users === undefined,
      postsUndefined: posts === undefined,
      mediaUndefined: media === undefined
    });
    // Check if user exists
    console.log('Starting user existence check...');
    const userExists = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    console.log('User existence check completed:', userExists);
    
    if (userExists.length === 0) {
      return json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check for linked posts
    console.log('Starting posts query...');
    let userPosts = [];
    try {
      userPosts = await db
        .select({
          id: posts.id,
          title: posts.title,
          status: posts.status,
          createdAt: posts.createdAt
        })
        .from(posts)
        .where(eq(posts.authorId, id));
      console.log('Posts query completed:', userPosts.length, 'posts found');
    } catch (postsError) {
      console.error('Posts query failed:', postsError);
      throw new Error(`Posts query failed: ${postsError instanceof Error ? postsError.message : 'Unknown error'}`);
    }
    
    // Check for linked media
    console.log('Starting media query...');
    let userMedia = [];
    try {
      userMedia = await db
        .select({
          id: media.id,
          filename: media.filename,
          type: media.mimeType, // Fix: use mimeType instead of type
          createdAt: media.createdAt
        })
        .from(media)
        .where(eq(media.uploaderId, id));
      console.log('Media query completed:', userMedia.length, 'media files found');
    } catch (mediaError) {
      console.error('Media query failed:', mediaError);
      throw new Error(`Media query failed: ${mediaError instanceof Error ? mediaError.message : 'Unknown error'}`);
    }
    
    // Get list of other users for reassignment options (excluding the user being deleted)
    console.log('Starting other users query...');
    let otherUsers = [];
    try {
      otherUsers = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          username: users.username
        })
        .from(users)
        .where(eq(users.active, true));
      console.log('Other users query completed:', otherUsers.length, 'users found');
    } catch (usersError) {
      console.error('Other users query failed:', usersError);
      throw new Error(`Other users query failed: ${usersError instanceof Error ? usersError.message : 'Unknown error'}`);
    }
    
    // Filter out the user being deleted
    const reassignmentOptions = otherUsers
      .filter(user => user.id !== id)
      .map(user => ({
        id: user.id,
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username,
        email: user.email
      }));
    
    const linkedContent = {
      posts: {
        count: userPosts.length,
        items: userPosts.map(post => ({
          id: post.id,
          title: post.title,
          status: post.status,
          createdAt: post.createdAt
        }))
      },
      media: {
        count: userMedia.length,
        items: userMedia.map(file => ({
          id: file.id,
          filename: file.filename,
          type: file.type,
          createdAt: file.createdAt
        }))
      },
      reassignmentOptions,
      hasContent: userPosts.length > 0 || userMedia.length > 0
    };
    
    return json({ linkedContent });
    
  } catch (error) {
    console.error('Error checking linked content for user:', id, error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return json({ 
      error: `Failed to check linked content: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
};