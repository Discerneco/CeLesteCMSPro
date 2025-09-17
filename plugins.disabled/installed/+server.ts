import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { plugins, pluginInstallations } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';
import { eq, and, like, or, desc, asc } from 'drizzle-orm';

// GET /api/plugins/installed - Get user's installed plugins
export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		return error(401, 'Unauthorized');
	}

	try {
		const searchQuery = url.searchParams.get('search') || '';
		const siteId = url.searchParams.get('siteId');
		const sortBy = url.searchParams.get('sortBy') || 'installedAt';
		const sortOrder = url.searchParams.get('sortOrder') || 'desc';
		const activeOnly = url.searchParams.get('activeOnly') === 'true';

		// Build base query joining installations with plugins
		let query = db
			.select({
				// Plugin fields
				id: plugins.id,
				name: plugins.name,
				slug: plugins.slug,
				description: plugins.description,
				version: plugins.version,
				author: plugins.author,
				category: plugins.category,
				tags: plugins.tags,
				features: plugins.features,
				price: plugins.price,
				isPremium: plugins.isPremium,
				rating: plugins.rating,
				downloads: plugins.downloads,
				// Installation fields
				installationId: pluginInstallations.id,
				installedVersion: pluginInstallations.version,
				isActive: pluginInstallations.isActive,
				installedAt: pluginInstallations.installedAt,
				lastUsedAt: pluginInstallations.lastUsedAt,
				config: pluginInstallations.config,
				siteId: pluginInstallations.siteId
			})
			.from(pluginInstallations)
			.innerJoin(plugins, eq(pluginInstallations.pluginId, plugins.id));

		// Build where conditions
		const conditions: any[] = [eq(pluginInstallations.userId, locals.user.id)];

		if (searchQuery) {
			conditions.push(
				or(
					like(plugins.name, `%${searchQuery}%`),
					like(plugins.description, `%${searchQuery}%`),
					like(plugins.tags, `%${searchQuery}%`)
				)
			);
		}

		if (siteId) {
			conditions.push(eq(pluginInstallations.siteId, siteId));
		}

		if (activeOnly) {
			conditions.push(eq(pluginInstallations.isActive, true));
		}

		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		// Add sorting
		let sortColumn;
		switch (sortBy) {
			case 'name':
				sortColumn = plugins.name;
				break;
			case 'category':
				sortColumn = plugins.category;
				break;
			case 'rating':
				sortColumn = plugins.rating;
				break;
			case 'lastUsedAt':
				sortColumn = pluginInstallations.lastUsedAt;
				break;
			case 'installedAt':
			default:
				sortColumn = pluginInstallations.installedAt;
				break;
		}

		query = query.orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn));

		const installedPlugins = await query;

		return json(installedPlugins);
	} catch (err) {
		console.error('Error fetching installed plugins:', err);
		return error(500, 'Failed to fetch installed plugins');
	}
};