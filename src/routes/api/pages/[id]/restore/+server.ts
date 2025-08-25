import { json } from '@sveltejs/kit';
import { getDbFromEvent } from '$lib/server/db/utils';
import { pages } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

/**
 * PUT /api/pages/[id]/restore
 * Restores a page from trash
 */
export const PUT: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  const pageId = event.params.id;
  
  try {
    // Check if user is authenticated
    if (!event.locals.user?.isAuthenticated) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if page exists and is in trash
    const existingPage = await db
      .select()
      .from(pages)
      .where(eq(pages.id, pageId))
      .limit(1);

    if (existingPage.length === 0) {
      return json({ error: 'Page not found' }, { status: 404 });
    }

    if (existingPage[0].status !== 'trash') {
      return json({ error: 'Page is not in trash' }, { status: 400 });
    }

    // Restore the page (change status back to draft and clear trash fields)
    const [restoredPage] = await db
      .update(pages)
      .set({ 
        status: 'draft',
        trashedAt: null,
        trashedBy: null,
        updatedAt: new Date()
      })
      .where(eq(pages.id, pageId))
      .returning();

    return json({ 
      message: 'Page restored successfully',
      page: restoredPage 
    });

  } catch (error) {
    console.error('Error restoring page:', error);
    return json({ error: 'Failed to restore page' }, { status: 500 });
  }
};