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
    // Check if user exists
    const userExists = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    
    if (userExists.length === 0) {
      return json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check for linked posts
    const userPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        status: posts.status,
        createdAt: posts.createdAt
      })
      .from(posts)
      .where(eq(posts.authorId, id));
    
    // Check for linked media
    const userMedia = await db
      .select({
        id: media.id,
        filename: media.filename,
        type: media.mimeType,
        createdAt: media.createdAt
      })
      .from(media)
      .where(eq(media.uploaderId, id));
    
    // Debug: Log what we actually got from the queries
    console.log('Posts query result type:', typeof userPosts, 'Is Array:', Array.isArray(userPosts));
    console.log('Media query result type:', typeof userMedia, 'Is Array:', Array.isArray(userMedia));
    console.log('Posts length:', userPosts?.length, 'First post:', userPosts?.[0]);
    console.log('Media length:', userMedia?.length, 'First media:', userMedia?.[0]);
    
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
    
    // Ensure we have proper arrays and counts
    const postsArray = Array.isArray(userPosts) ? userPosts : [];
    const mediaArray = Array.isArray(userMedia) ? userMedia : [];
    const postCount = postsArray.length || 0;
    const mediaCount = mediaArray.length || 0;
    
    console.log('Final counts - Posts:', postCount, 'Media:', mediaCount);
    
    const linkedContent = {
      posts: {
        count: postCount,
        items: postsArray.map(post => ({
          id: post.id,
          title: post.title,
          status: post.status,
          createdAt: post.createdAt
        }))
      },
      media: {
        count: mediaCount,
        items: mediaArray.map(file => ({
          id: file.id,
          filename: file.filename,
          type: file.type || file.mimeType,
          createdAt: file.createdAt
        }))
      },
      reassignmentOptions,
      hasContent: postCount > 0 || mediaCount > 0
    };
    
    console.log('API returning linkedContent:', JSON.stringify(linkedContent, null, 2));
    return json({ linkedContent });
    
  } catch (error) {
    console.error('Error checking linked content for user:', id, error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return json({ 
      error: `Failed to check linked content: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
};