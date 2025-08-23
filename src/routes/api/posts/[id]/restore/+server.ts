import { json } from '@sveltejs/kit';
import { getDbFromEvent } from '$lib/server/db/utils';
import { posts } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

/**
 * PUT /api/posts/[id]/restore
 * Restores a post from trash
 */
export const PUT: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  const { id } = event.params;

  try {
    // Restore the post by changing status back to draft
    const result = await db
      .update(posts)
      .set({ 
        status: 'draft',
        trashedAt: null,
        trashedBy: null
      })
      .where(eq(posts.id, id))
      .returning();

    if (result.length === 0) {
      return json({ error: 'Post not found' }, { status: 404 });
    }

    return json({ success: true, post: result[0] });
  } catch (error) {
    console.error('Error restoring post:', error);
    return json({ error: 'Failed to restore post' }, { status: 500 });
  }
};