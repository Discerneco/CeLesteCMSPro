import type { PageServerLoad } from './$types';
import { getDbFromEvent } from '$lib/server/db/utils';
import { posts, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	try {
		const db = getDbFromEvent(event);
		
		// Fetch posts with author information using join
		const postsWithAuthors = await db
			.select({
				id: posts.id,
				title: posts.title,
				slug: posts.slug,
				excerpt: posts.excerpt,
				status: posts.status,
				featured: posts.featured,
				createdAt: posts.createdAt,
				updatedAt: posts.updatedAt,
				publishedAt: posts.publishedAt,
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
		const transformedPosts = postsWithAuthors.map((post) => ({
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
			createdAtFormatted: post.createdAt 
				? new Date(post.createdAt).toLocaleDateString('pt-BR') 
				: '',
			publishedAtFormatted: post.publishedAt 
				? new Date(post.publishedAt).toLocaleDateString('pt-BR') 
				: ''
		}));

		return {
			posts: transformedPosts
		};
	} catch (error) {
		console.error('Error loading posts:', error);
		// Return empty posts array instead of throwing error
		return {
			posts: []
		};
	}
};