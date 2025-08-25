import { json } from '@sveltejs/kit';
import { getDbFromEvent } from '$lib/server/db/utils';
import { pages, users } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { RequestHandler } from './$types';

/**
 * GET /api/pages/trash
 * Returns all trashed pages
 */
export const GET: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  
  try {
    // Check if user is authenticated
    if (!event.locals.user?.isAuthenticated) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    // Fetch trashed pages with author information
    const trashedPages = await db
      .select({
        id: pages.id,
        title: pages.title,
        slug: pages.slug,
        excerpt: pages.excerpt,
        status: pages.status,
        featuredImageId: pages.featuredImageId,
        authorId: pages.authorId,
        publishedAt: pages.publishedAt,
        createdAt: pages.createdAt,
        updatedAt: pages.updatedAt,
        metaData: pages.metaData,
        authorUsername: users.username,
        authorFirstName: users.firstName,
        authorLastName: users.lastName
      })
      .from(pages)
      .leftJoin(users, eq(pages.authorId, users.id))
      .where(eq(pages.status, 'trash'))
      .orderBy(desc(pages.updatedAt));

    // Transform the data to match UI expectations (author as string)
    const transformedPages = trashedPages.map((page: any) => ({
      id: page.id,
      title: page.title,
      slug: page.slug,
      excerpt: page.excerpt,
      status: page.status,
      featuredImageId: page.featuredImageId,
      authorId: page.authorId,
      publishedAt: page.publishedAt,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      metaData: page.metaData,
      author: page.authorUsername || 'Unknown'
    }));

    return json(transformedPages);
  } catch (error) {
    console.error('Error fetching trashed pages:', error);
    return json({ error: 'Failed to fetch trashed pages' }, { status: 500 });
  }
};