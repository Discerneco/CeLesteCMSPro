import { json } from '@sveltejs/kit';
import { getDbFromEvent } from '$lib/server/db/utils';
import { postAutosaves } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

/**
 * POST /api/posts/[id]/autosave
 * Auto-save post content (overwrites existing autosave for user)
 */
export const POST: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  const postId = event.params.id;
  
  try {
    // Check if user is authenticated
    if (!event.locals.user?.isAuthenticated) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = event.locals.user.id;
    const body = await event.request.json();
    
    // Prepare autosave data - include featured flag in metaData
    const metaData = body.metaData || {};
    if (body.featured !== undefined) {
      metaData.featured = body.featured;
    }

    const autosaveData = {
      postId,
      userId,
      title: body.title || '',
      slug: body.slug || '',
      content: body.content || '',
      excerpt: body.excerpt || '',
      metaData: JSON.stringify(metaData),
      featuredImageId: body.featuredImageId || null,
      status: body.status || 'draft',
      updatedAt: new Date()
    };
    
    // Check if autosave exists for this post/user combo
    const existingAutosave = await db
      .select()
      .from(postAutosaves)
      .where(
        and(
          eq(postAutosaves.postId, postId),
          eq(postAutosaves.userId, userId)
        )
      )
      .limit(1);
    
    if (existingAutosave.length > 0) {
      // Update existing autosave
      await db
        .update(postAutosaves)
        .set(autosaveData)
        .where(
          and(
            eq(postAutosaves.postId, postId),
            eq(postAutosaves.userId, userId)
          )
        );
    } else {
      // Create new autosave
      await db.insert(postAutosaves).values(autosaveData);
    }
    
    return json({ 
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Auto-saved'
    });
    
  } catch (error) {
    console.error('Error auto-saving post:', error);
    return json({ error: 'Failed to auto-save' }, { status: 500 });
  }
};

/**
 * GET /api/posts/[id]/autosave
 * Retrieve autosave for current user
 */
export const GET: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  const postId = event.params.id;
  
  try {
    // Check if user is authenticated
    if (!event.locals.user?.isAuthenticated) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = event.locals.user.id;
    
    // Get autosave for this post/user
    const autosave = await db
      .select()
      .from(postAutosaves)
      .where(
        and(
          eq(postAutosaves.postId, postId),
          eq(postAutosaves.userId, userId)
        )
      )
      .limit(1);
    
    if (autosave.length === 0) {
      return json({ exists: false });
    }
    
    return json({ 
      exists: true,
      autosave: autosave[0]
    });
    
  } catch (error) {
    console.error('Error retrieving autosave:', error);
    return json({ error: 'Failed to retrieve autosave' }, { status: 500 });
  }
};

/**
 * DELETE /api/posts/[id]/autosave
 * Clear autosave after manual save
 */
export const DELETE: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  const postId = event.params.id;
  
  try {
    // Check if user is authenticated
    if (!event.locals.user?.isAuthenticated) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = event.locals.user.id;
    
    // Delete autosave for this post/user
    await db
      .delete(postAutosaves)
      .where(
        and(
          eq(postAutosaves.postId, postId),
          eq(postAutosaves.userId, userId)
        )
      );
    
    return json({ success: true });
    
  } catch (error) {
    console.error('Error deleting autosave:', error);
    return json({ error: 'Failed to delete autosave' }, { status: 500 });
  }
};