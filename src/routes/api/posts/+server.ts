import { json } from '@sveltejs/kit';
import { getDbFromEvent } from '$lib/server/db/utils';
import { posts, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

/**
 * GET /api/posts
 * Returns a list of all posts with author information
 */
export const GET: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  
  try {
    // Fetch posts with author information using join
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
        }
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .orderBy(posts.createdAt);

    // Transform the data to match our UI expectations
    const transformedPosts = postsWithAuthors.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      status: post.status,
      featured: !!post.featured,
      author: post.author?.username || 'Unknown',
      createdAt: post.createdAt,
      publishedAt: post.publishedAt,
      // Format dates for display
      createdAtFormatted: post.createdAt ? new Date(post.createdAt).toLocaleDateString('pt-BR') : '',
      publishedAtFormatted: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('pt-BR') : ''
    }));

    return json(transformedPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
};