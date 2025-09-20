import { json } from '@sveltejs/kit';
import { getDbFromEvent } from '$lib/server/db/utils';
import { posts, users, contentTypes, postAutosaves } from '$lib/server/db/schema';
import { eq, ne, and, gt } from 'drizzle-orm';
import type { RequestHandler } from './$types';

/**
 * GET /api/posts
 * Returns a list of all posts with author information
 */
export const GET: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  
  try {
    // Fetch posts with author information and auto-save data using joins
    const postsWithAuthors = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        content: posts.content,
        excerpt: posts.excerpt,
        status: posts.status,
        featured: posts.featured,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        publishedAt: posts.publishedAt,
        featuredImageId: posts.featuredImageId,
        metaData: posts.metaData,
        author: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName
        },
        autosave: {
          title: postAutosaves.title,
          excerpt: postAutosaves.excerpt,
          updatedAt: postAutosaves.updatedAt
        }
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(postAutosaves, eq(posts.id, postAutosaves.postId))
      .where(ne(posts.status, 'trash')) // Exclude trashed posts
      .orderBy(posts.createdAt);

    // Transform the data to match our UI expectations
    const transformedPosts = postsWithAuthors.map((post: any) => {
      // Check if auto-save is newer than saved version
      const hasNewerAutosave = post.autosave?.updatedAt && post.autosave.updatedAt > post.updatedAt;

      return {
        id: post.id,
        title: hasNewerAutosave && post.autosave.title ? post.autosave.title : post.title,
        slug: post.slug,
        excerpt: hasNewerAutosave && post.autosave.excerpt ? post.autosave.excerpt : (post.excerpt || ''),
        status: post.status,
        featured: !!post.featured,
        author: post.author?.username || 'Unknown',
        createdAt: post.createdAt,
        publishedAt: post.publishedAt,
        hasUnsavedChanges: hasNewerAutosave,
        // Format dates for display
        createdAtFormatted: post.createdAt ? new Date(post.createdAt).toLocaleDateString('pt-BR') : '',
        publishedAtFormatted: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('pt-BR') : ''
      };
    });

    return json(transformedPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
};

/**
 * POST /api/posts
 * Creates a new blog post
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
    const { title, slug, excerpt, content, status, featured, publishedAt, metaData } = body;

    // Validate required fields
    if (!title || !content) {
      return json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Get the default Post content type
    const defaultContentType = await db
      .select()
      .from(contentTypes)
      .where(eq(contentTypes.slug, 'post'))
      .limit(1);

    if (defaultContentType.length === 0) {
      return json({ error: 'Default content type not found' }, { status: 500 });
    }

    // Generate slug if not provided
    const finalSlug = slug || title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Prepare the post data
    const postData = {
      title,
      slug: finalSlug,
      content,
      excerpt: excerpt || '',
      authorId: event.locals.user.id,
      contentTypeId: defaultContentType[0].id,
      status: status || 'draft',
      featured: !!featured,
      publishedAt: status === 'published' && publishedAt ? new Date(publishedAt) : null,
      metaData: metaData ? JSON.parse(typeof metaData === 'string' ? metaData : JSON.stringify(metaData)) : null
    };

    // Insert the new post
    const [newPost] = await db.insert(posts).values(postData).returning();

    return json({ 
      message: 'Post created successfully',
      post: newPost 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating post:', error);
    console.error('Post data that failed:', postData);
    
    // Handle unique constraint violations (duplicate slug)
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return json({ error: 'A post with this slug already exists' }, { status: 409 });
    }
    
    // Handle foreign key constraint violations
    if (error instanceof Error && error.message.includes('FOREIGN KEY constraint failed')) {
      return json({ error: 'Invalid author or content type reference' }, { status: 400 });
    }
    
    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return json({ 
      error: 'Failed to create post', 
      details: errorMessage,
      debug: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
};