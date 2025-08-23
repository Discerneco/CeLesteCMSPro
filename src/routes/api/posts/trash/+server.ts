import { json } from '@sveltejs/kit';
import { getDbFromEvent } from '$lib/server/db/utils';
import { posts, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

/**
 * GET /api/posts/trash
 * Returns a list of all trashed posts
 */
export const GET: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);

  try {
    const trashedPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        status: posts.status,
        featured: posts.featured,
        createdAt: posts.createdAt,
        publishedAt: posts.publishedAt,
        trashedAt: posts.trashedAt,
        author: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName
        }
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.status, 'trash'))
      .orderBy(posts.trashedAt);

    // Transform the data
    const transformedPosts = trashedPosts.map((post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      status: post.status,
      featured: !!post.featured,
      author: post.author?.username || 'Unknown',
      createdAt: post.createdAt,
      trashedAt: post.trashedAt,
      createdAtFormatted: post.createdAt ? new Date(post.createdAt).toLocaleDateString('pt-BR') : '',
      trashedAtFormatted: post.trashedAt ? new Date(post.trashedAt).toLocaleDateString('pt-BR') : ''
    }));

    return json(transformedPosts);
  } catch (error) {
    console.error('Error fetching trashed posts:', error);
    return json({ error: 'Failed to fetch trashed posts' }, { status: 500 });
  }
};