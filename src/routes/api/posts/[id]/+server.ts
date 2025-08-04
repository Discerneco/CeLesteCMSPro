import { json } from '@sveltejs/kit';
import { getDbFromEvent } from '$lib/server/db/utils';
import { posts, users, contentTypes } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

/**
 * GET /api/posts/[id]
 * Returns a single post with all details
 */
export const GET: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  const postId = event.params.id;
  
  try {
    // Fetch post with author information
    const postWithAuthor = await db
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
        authorId: posts.authorId,
        contentTypeId: posts.contentTypeId,
        author: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName
        }
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.id, postId))
      .limit(1);

    if (postWithAuthor.length === 0) {
      return json({ error: 'Post not found' }, { status: 404 });
    }

    const post = postWithAuthor[0];
    
    // Transform the data to match our UI expectations
    const transformedPost = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || '',
      status: post.status,
      featured: !!post.featured,
      authorId: post.authorId,
      contentTypeId: post.contentTypeId,
      author: post.author?.username || 'Unknown',
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      publishedAt: post.publishedAt,
      featuredImageId: post.featuredImageId,
      metaData: post.metaData,
      // Format dates for display
      createdAtFormatted: post.createdAt ? new Date(post.createdAt).toLocaleDateString('pt-BR') : '',
      publishedAtFormatted: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('pt-BR') : ''
    };

    return json(transformedPost);
  } catch (error) {
    console.error('Error fetching post:', error);
    return json({ error: 'Failed to fetch post' }, { status: 500 });
  }
};

/**
 * PUT /api/posts/[id]
 * Updates an existing post
 */
export const PUT: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  const postId = event.params.id;
  
  try {
    // Check if user is authenticated
    if (!event.locals.user?.isAuthenticated) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse the request body
    const body = await event.request.json();
    const { title, slug, excerpt, content, status, featured, publishedAt, metaData } = body;

    // Validate required fields
    if (!title || !content) {
      return json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Check if post exists
    const existingPost = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (existingPost.length === 0) {
      return json({ error: 'Post not found' }, { status: 404 });
    }

    // Generate slug if not provided
    const finalSlug = slug || title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Prepare the update data
    const updateData = {
      title,
      slug: finalSlug,
      content,
      excerpt: excerpt || '',
      status: status || 'draft',
      featured: !!featured,
      publishedAt: status === 'published' && publishedAt ? new Date(publishedAt) : null,
      metaData: metaData ? JSON.parse(typeof metaData === 'string' ? metaData : JSON.stringify(metaData)) : null,
      updatedAt: new Date()
    };

    // Update the post
    const [updatedPost] = await db
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, postId))
      .returning();

    return json({ 
      message: 'Post updated successfully',
      post: updatedPost 
    });

  } catch (error) {
    console.error('Error updating post:', error);
    
    // Handle unique constraint violations (duplicate slug)
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return json({ error: 'A post with this slug already exists' }, { status: 409 });
    }
    
    return json({ error: 'Failed to update post' }, { status: 500 });
  }
};

/**
 * DELETE /api/posts/[id]
 * Deletes a post
 */
export const DELETE: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  const postId = event.params.id;
  
  try {
    // Check if user is authenticated
    if (!event.locals.user?.isAuthenticated) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if post exists
    const existingPost = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (existingPost.length === 0) {
      return json({ error: 'Post not found' }, { status: 404 });
    }

    // Delete the post
    await db
      .delete(posts)
      .where(eq(posts.id, postId));

    return json({ 
      message: 'Post deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting post:', error);
    return json({ error: 'Failed to delete post' }, { status: 500 });
  }
};