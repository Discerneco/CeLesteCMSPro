import { json } from '@sveltejs/kit';
import { getDbFromEvent } from '$lib/server/db/utils';
import { pages, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

/**
 * GET /api/pages/[id]
 * Returns a single page with all details
 */
export const GET: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  const pageId = event.params.id;
  
  try {
    // Fetch page with author information
    const pageWithAuthor = await db
      .select({
        id: pages.id,
        title: pages.title,
        slug: pages.slug,
        content: pages.content,
        excerpt: pages.excerpt,
        status: pages.status,
        createdAt: pages.createdAt,
        updatedAt: pages.updatedAt,
        publishedAt: pages.publishedAt,
        metaData: pages.metaData,
        authorId: pages.authorId,
        author: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName
        }
      })
      .from(pages)
      .leftJoin(users, eq(pages.authorId, users.id))
      .where(eq(pages.id, pageId))
      .limit(1);

    if (pageWithAuthor.length === 0) {
      return json({ error: 'Page not found' }, { status: 404 });
    }

    const page = pageWithAuthor[0];
    
    // Transform the data to match our UI expectations
    const transformedPage = {
      id: page.id,
      title: page.title,
      slug: page.slug,
      content: page.content,
      excerpt: page.excerpt || '',
      status: page.status,
      authorId: page.authorId,
      author: page.author?.username || 'Unknown',
      authorData: page.author ? {
        id: page.author.id,
        username: page.author.username,
        name: [page.author.firstName, page.author.lastName].filter(Boolean).join(' ') || page.author.username
      } : null,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      publishedAt: page.publishedAt,
      metaData: page.metaData,
      // Format dates for display
      createdAtFormatted: page.createdAt ? new Date(page.createdAt).toLocaleDateString('pt-BR') : '',
      publishedAtFormatted: page.publishedAt ? new Date(page.publishedAt).toLocaleDateString('pt-BR') : ''
    };

    return json(transformedPage);
  } catch (error) {
    console.error('Error fetching page:', error);
    return json({ error: 'Failed to fetch page' }, { status: 500 });
  }
};

/**
 * PUT /api/pages/[id]
 * Updates an existing page
 */
export const PUT: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  const pageId = event.params.id;
  
  try {
    // Check if user is authenticated
    if (!event.locals.user?.isAuthenticated) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse the request body
    const body = await event.request.json();
    const { title, slug, excerpt, content, status, publishedAt, metaData, featuredImageId } = body;

    // Validate required fields - content is optional for pages
    if (!title) {
      return json({ error: 'Title is required' }, { status: 400 });
    }

    // Check if page exists
    const existingPage = await db
      .select()
      .from(pages)
      .where(eq(pages.id, pageId))
      .limit(1);

    if (existingPage.length === 0) {
      return json({ error: 'Page not found' }, { status: 404 });
    }

    // Generate slug if not provided
    const finalSlug = slug || title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Prepare the update data (preserve existing authorId, don't overwrite it)
    const updateData = {
      title,
      slug: finalSlug,
      content,
      excerpt: excerpt || '',
      status: status || 'draft',
      featuredImageId: featuredImageId || null,
      publishedAt: status === 'published' && publishedAt ? new Date(publishedAt) : null,
      metaData: metaData ? JSON.parse(typeof metaData === 'string' ? metaData : JSON.stringify(metaData)) : null,
      updatedAt: new Date()
    };

    // Update the page
    const [updatedPage] = await db
      .update(pages)
      .set(updateData)
      .where(eq(pages.id, pageId))
      .returning();

    return json({ 
      message: 'Page updated successfully',
      page: updatedPage 
    });

  } catch (error) {
    console.error('Error updating page:', error);
    
    // Handle unique constraint violations (duplicate slug)
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return json({ error: 'A page with this slug already exists' }, { status: 409 });
    }
    
    return json({ error: 'Failed to update page' }, { status: 500 });
  }
};

/**
 * DELETE /api/pages/[id]
 * Deletes a page
 */
export const DELETE: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  const pageId = event.params.id;
  const url = new URL(event.request.url);
  const permanent = url.searchParams.get('permanent') === 'true';
  
  console.log('DELETE endpoint called:', { pageId, permanent, url: url.toString() });
  
  try {
    // Check if user is authenticated
    if (!event.locals.user?.isAuthenticated) {
      console.log('User not authenticated');
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    console.log('User authenticated:', event.locals.user?.id);

    // Check if page exists
    const existingPage = await db
      .select()
      .from(pages)
      .where(eq(pages.id, pageId))
      .limit(1);

    console.log('Existing page found:', existingPage.length > 0, existingPage[0]?.status);

    if (existingPage.length === 0) {
      return json({ error: 'Page not found' }, { status: 404 });
    }

    if (permanent) {
      console.log('Attempting permanent deletion for page:', pageId);
      // Permanent deletion (from trash)
      const deleteResult = await db
        .delete(pages)
        .where(eq(pages.id, pageId))
        .returning();
      console.log('Delete result:', deleteResult);
    } else {
      console.log('Moving page to trash:', pageId);
      // Move to trash
      const updateResult = await db
        .update(pages)
        .set({ 
          status: 'trash',
          trashedAt: new Date(),
          trashedBy: event.locals.user?.id
        })
        .where(eq(pages.id, pageId))
        .returning();
      console.log('Update result:', updateResult);
    }

    const message = permanent ? 'Page permanently deleted' : 'Page moved to trash';
    console.log('Success:', message);
    
    return json({ 
      message,
      success: true 
    });

  } catch (error) {
    console.error('Error deleting page - Full error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return json({ error: 'Failed to delete page' }, { status: 500 });
  }
};