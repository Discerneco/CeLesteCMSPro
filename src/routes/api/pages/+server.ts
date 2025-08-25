import { json } from '@sveltejs/kit';
import { getDbFromEvent } from '$lib/server/db/utils';
import { pages, users } from '$lib/server/db/schema';
import { eq, ne } from 'drizzle-orm';
import type { RequestHandler } from './$types';

/**
 * GET /api/pages
 * Returns a list of all pages with author information
 */
export const GET: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  
  try {
    // Fetch pages with author information using join
    const pagesWithAuthors = await db
      .select({
        id: pages.id,
        title: pages.title,
        slug: pages.slug,
        content: pages.content,
        excerpt: pages.excerpt,
        status: pages.status,
        featuredImageId: pages.featuredImageId,
        createdAt: pages.createdAt,
        updatedAt: pages.updatedAt,
        publishedAt: pages.publishedAt,
        metaData: pages.metaData,
        authorUsername: users.username,
        authorFirstName: users.firstName,
        authorLastName: users.lastName
      })
      .from(pages)
      .leftJoin(users, eq(pages.authorId, users.id))
      .where(ne(pages.status, 'trash')) // Exclude trashed pages
      .orderBy(pages.createdAt);

    // Transform the data to match our UI expectations
    const transformedPages = pagesWithAuthors.map((page: any) => ({
      id: page.id,
      title: page.title,
      slug: page.slug,
      excerpt: page.excerpt || '',
      status: page.status,
      featuredImageId: page.featuredImageId,
      author: page.authorUsername || 'Unknown',
      createdAt: page.createdAt,
      publishedAt: page.publishedAt,
      // Format dates for display
      createdAtFormatted: page.createdAt ? new Date(page.createdAt).toLocaleDateString('pt-BR') : '',
      publishedAtFormatted: page.publishedAt ? new Date(page.publishedAt).toLocaleDateString('pt-BR') : ''
    }));

    return json(transformedPages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    return json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
};

/**
 * POST /api/pages
 * Creates a new page
 */
export const POST: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  
  try {
    // Check if user is authenticated
    console.log('User authentication status:', event.locals.user);
    if (!event.locals.user?.isAuthenticated) {
      return json({ error: 'Authentication required. Please log in.' }, { status: 401 });
    }

    // Parse the request body
    const body = await event.request.json();
    const { title, slug, excerpt, content, status, publishedAt, metaData, featuredImageId } = body;

    // Validate required fields - content is optional for pages
    if (!title) {
      return json({ error: 'Title is required' }, { status: 400 });
    }

    // Generate slug if not provided
    const finalSlug = slug || title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Prepare the page data
    const pageData = {
      title,
      slug: finalSlug,
      content,
      excerpt: excerpt || '',
      authorId: event.locals.user.id,
      status: status || 'draft',
      featuredImageId: featuredImageId || null,
      publishedAt: status === 'published' && publishedAt ? new Date(publishedAt) : null,
      metaData: metaData ? JSON.parse(typeof metaData === 'string' ? metaData : JSON.stringify(metaData)) : null
    };

    // Insert the new page
    const [newPage] = await db.insert(pages).values(pageData).returning();

    return json({ 
      message: 'Page created successfully',
      page: newPage 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating page:', error);
    console.error('Page data that failed:', pageData);
    
    // Handle unique constraint violations (duplicate slug)
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return json({ error: 'A page with this slug already exists' }, { status: 409 });
    }
    
    // Handle foreign key constraint violations
    if (error instanceof Error && error.message.includes('FOREIGN KEY constraint failed')) {
      return json({ error: 'Invalid author reference' }, { status: 400 });
    }
    
    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return json({ 
      error: 'Failed to create page', 
      details: errorMessage,
      debug: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
};