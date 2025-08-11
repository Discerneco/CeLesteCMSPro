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
    console.log(`Checking linked content for user ID: ${id}`);
    
    // Check if user exists
    const userExists = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    
    console.log(`User exists check:`, userExists);
    
    if (userExists.length === 0) {
      console.log(`User not found: ${id}`);
      return json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check for linked posts
    console.log(`Querying posts for user: ${id}`);
    const userPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        status: posts.status,
        createdAt: posts.createdAt
      })
      .from(posts)
      .where(eq(posts.authorId, id));
    
    console.log(`Found ${userPosts.length} posts for user: ${id}`, userPosts);
    
    // Check for linked media
    console.log(`Querying media for user: ${id}`);
    const userMedia = await db
      .select({
        id: media.id,
        filename: media.filename,
        type: media.type,
        createdAt: media.createdAt
      })
      .from(media)
      .where(eq(media.uploaderId, id));
    
    console.log(`Found ${userMedia.length} media files for user: ${id}`, userMedia);
    
    // Get list of other users for reassignment options (excluding the user being deleted)
    const otherUsers = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        username: users.username
      })
      .from(users)
      .where(eq(users.active, true));
    
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
    
    console.log('Returning linked content:', linkedContent);
    return json({ linkedContent });
    
  } catch (error) {
    console.error('Error checking linked content for user:', id, error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return json({ 
      error: `Failed to check linked content: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
};