import type { PageServerLoad } from './$types';
import { getDbFromEvent } from '$lib/server/db/utils';
import { pages, users } from '$lib/server/db/schema';
import { eq, ne } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	try {
		const db = getDbFromEvent(event);
		
		// Fetch pages with author information using join
		const pagesWithAuthors = await db
			.select({
				id: pages.id,
				title: pages.title,
				slug: pages.slug,
				excerpt: pages.excerpt,
				status: pages.status,
				createdAt: pages.createdAt,
				updatedAt: pages.updatedAt,
				publishedAt: pages.publishedAt,
				author: {
					id: users.id,
					username: users.username,
					firstName: users.firstName,
					lastName: users.lastName
				}
			})
			.from(pages)
			.leftJoin(users, eq(pages.authorId, users.id))
			.where(ne(pages.status, 'trash')) // Exclude trashed pages
			.orderBy(pages.createdAt);

		// Transform the data to match our UI expectations
		const transformedPages = pagesWithAuthors.map((page) => ({
			id: page.id,
			title: page.title,
			slug: page.slug,
			excerpt: page.excerpt || '',
			status: page.status,
			author: page.author?.username || 'Unknown',
			createdAt: page.createdAt,
			publishedAt: page.publishedAt,
			// Format dates for display
			createdAtFormatted: page.createdAt 
				? new Date(page.createdAt).toLocaleDateString('pt-BR') 
				: '',
			publishedAtFormatted: page.publishedAt 
				? new Date(page.publishedAt).toLocaleDateString('pt-BR') 
				: ''
		}));

		return {
			pages: transformedPages
		};
	} catch (error) {
		console.error('Error loading pages:', error);
		// Return empty pages array instead of throwing error
		return {
			pages: []
		};
	}
};