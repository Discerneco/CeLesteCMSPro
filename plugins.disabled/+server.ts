import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { plugins, pluginInstallations, pluginRatings } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

// GET /api/plugins - List plugins with optional filters
export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		return error(401, 'Unauthorized');
	}

	try {
		const searchQuery = url.searchParams.get('search') || '';
		const category = url.searchParams.get('category') || '';
		const sortBy = url.searchParams.get('sortBy') || 'downloads';
		const sortOrder = url.searchParams.get('sortOrder') || 'desc';
		const includeInstalled = url.searchParams.get('includeInstalled') === 'true';

		let query = db.select().from(plugins);

		// Build where conditions
		const conditions: any[] = [];
		
		if (searchQuery) {
			conditions.push(
				or(
					like(plugins.name, `%${searchQuery}%`),
					like(plugins.description, `%${searchQuery}%`),
					like(plugins.tags, `%${searchQuery}%`)
				)
			);
		}

		if (category && category !== 'all') {
			conditions.push(eq(plugins.category, category));
		}

		conditions.push(eq(plugins.isActive, true));

		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		// Add sorting
		const sortColumn = {
			downloads: plugins.downloads,
			rating: plugins.rating,
			name: plugins.name,
			createdAt: plugins.createdAt,
			updatedAt: plugins.updatedAt
		}[sortBy] || plugins.downloads;

		query = query.orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn));

		const pluginList = await query;

		// If includeInstalled is true, also get installation info for current user
		if (includeInstalled && pluginList.length > 0) {
			const pluginIds = pluginList.map(p => p.id);
			const installations = await db
				.select()
				.from(pluginInstallations)
				.where(
					and(
						eq(pluginInstallations.userId, locals.user.id),
						// @ts-ignore
						pluginInstallations.pluginId.in(pluginIds)
					)
				);

			const installationMap = new Map(
				installations.map(inst => [inst.pluginId, inst])
			);

			const pluginsWithInstallation = pluginList.map(plugin => ({
				...plugin,
				isInstalled: installationMap.has(plugin.id),
				installation: installationMap.get(plugin.id) || null
			}));

			return json(pluginsWithInstallation);
		}

		return json(pluginList);
	} catch (err) {
		console.error('Error fetching plugins:', err);
		return error(500, 'Failed to fetch plugins');
	}
};

// POST /api/plugins - Create new plugin (admin only)
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		return error(403, 'Admin access required');
	}

	try {
		const data = await request.json();
		
		const newPlugin = await db.insert(plugins).values({
			name: data.name,
			slug: data.slug,
			description: data.description,
			version: data.version,
			author: data.author,
			authorEmail: data.authorEmail,
			authorUrl: data.authorUrl,
			homepage: data.homepage,
			repository: data.repository,
			category: data.category || 'other',
			tags: JSON.stringify(data.tags || []),
			features: JSON.stringify(data.features || []),
			price: data.price || 'Free',
			isPremium: data.isPremium || false,
			rating: data.rating || 0,
			downloads: data.downloads || 0,
			minVersion: data.minVersion,
			maxVersion: data.maxVersion,
			dependencies: JSON.stringify(data.dependencies || []),
			config: data.config ? JSON.stringify(data.config) : null,
			manifest: data.manifest ? JSON.stringify(data.manifest) : null,
			files: data.files ? JSON.stringify(data.files) : null,
			permissions: JSON.stringify(data.permissions || []),
			isActive: data.isActive !== undefined ? data.isActive : true,
			isVerified: data.isVerified || false,
			publishedAt: data.publishedAt ? new Date(data.publishedAt) : null
		}).returning();

		return json(newPlugin[0]);
	} catch (err) {
		console.error('Error creating plugin:', err);
		return error(500, 'Failed to create plugin');
	}
};