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
      featuredImageId: post.featuredImageId,
      authorId: post.authorId,
      contentTypeId: post.contentTypeId,
      author: post.author?.username || 'Unknown',
      authorData: post.author ? {
        id: post.author.id,
        username: post.author.username,
        name: [post.author.firstName, post.author.lastName].filter(Boolean).join(' ') || post.author.username
      } : null,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      publishedAt: post.publishedAt,
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
    console.log('🔄 API received request body:', body);
    
    const { title, slug, excerpt, content, status, featured, featuredImageId, publishedAt, metaData, authorId } = body;
    console.log('🔄 Extracted featuredImageId from request:', featuredImageId);

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
      featuredImageId: featuredImageId || null,
      authorId: authorId || null,
      publishedAt: status === 'published' && publishedAt ? new Date(publishedAt) : null,
      metaData: metaData ? JSON.parse(typeof metaData === 'string' ? metaData : JSON.stringify(metaData)) : null,
      updatedAt: new Date()
    };
    
    console.log('🔄 Prepared update data:', updateData);
    console.log('🔄 Featured image ID in update data:', updateData.featuredImageId);

    // Update the post
    console.log('🔄 Updating post in database...');
    const [updatedPost] = await db
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, postId))
      .returning();
      
    console.log('✅ Database update completed:', updatedPost);

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
  const url = new URL(event.request.url);
  const permanent = url.searchParams.get('permanent') === 'true';
  
  console.log('DELETE endpoint called:', { postId, permanent, url: url.toString() });
  
  try {
    // Check if user is authenticated
    if (!event.locals.user?.isAuthenticated) {
      console.log('User not authenticated');
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    console.log('User authenticated:', event.locals.user?.id);

    // Check if post exists
    const existingPost = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    console.log('Existing post found:', existingPost.length > 0, existingPost[0]?.status);

    if (existingPost.length === 0) {
      return json({ error: 'Post not found' }, { status: 404 });
    }

    if (permanent) {
      console.log('Attempting permanent deletion for post:', postId);
      // Permanent deletion (from trash)
      const deleteResult = await db
        .delete(posts)
        .where(eq(posts.id, postId))
        .returning();
      console.log('Delete result:', deleteResult);
    } else {
      console.log('Moving post to trash:', postId);
      // Move to trash
      const updateResult = await db
        .update(posts)
        .set({ 
          status: 'trash',
          trashedAt: new Date(),
          trashedBy: event.locals.user?.id
        })
        .where(eq(posts.id, postId))
        .returning();
      console.log('Update result:', updateResult);
    }

    const message = permanent ? 'Post permanently deleted' : 'Post moved to trash';
    console.log('Success:', message);
    
    return json({ 
      message,
      success: true 
    });

  } catch (error) {
    console.error('Error deleting post - Full error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return json({ error: 'Failed to delete post' }, { status: 500 });
  }
};