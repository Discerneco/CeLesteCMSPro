import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { plugins, pluginInstallations, pluginRatings } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';
import { eq, and } from 'drizzle-orm';

// GET /api/plugins/[id] - Get specific plugin
export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return error(401, 'Unauthorized');
	}

	try {
		const plugin = await db
			.select()
			.from(plugins)
			.where(eq(plugins.id, params.id))
			.limit(1);

		if (!plugin.length) {
			return error(404, 'Plugin not found');
		}

		// Check if user has this plugin installed
		const installation = await db
			.select()
			.from(pluginInstallations)
			.where(
				and(
					eq(pluginInstallations.pluginId, params.id),
					eq(pluginInstallations.userId, locals.user.id)
				)
			)
			.limit(1);

		// Get user's rating for this plugin
		const userRating = await db
			.select()
			.from(pluginRatings)
			.where(
				and(
					eq(pluginRatings.pluginId, params.id),
					eq(pluginRatings.userId, locals.user.id)
				)
			)
			.limit(1);

		return json({
			...plugin[0],
			isInstalled: installation.length > 0,
			installation: installation[0] || null,
			userRating: userRating[0] || null
		});
	} catch (err) {
		console.error('Error fetching plugin:', err);
		return error(500, 'Failed to fetch plugin');
	}
};

// PUT /api/plugins/[id] - Update plugin (admin only)
export const PUT: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		return error(403, 'Admin access required');
	}

	try {
		const data = await request.json();
		
		const updatedPlugin = await db
			.update(plugins)
			.set({
				name: data.name,
				slug: data.slug,
				description: data.description,
				version: data.version,
				author: data.author,
				authorEmail: data.authorEmail,
				authorUrl: data.authorUrl,
				homepage: data.homepage,
				repository: data.repository,
				category: data.category,
				tags: JSON.stringify(data.tags || []),
				features: JSON.stringify(data.features || []),
				price: data.price,
				isPremium: data.isPremium,
				rating: data.rating,
				downloads: data.downloads,
				minVersion: data.minVersion,
				maxVersion: data.maxVersion,
				dependencies: JSON.stringify(data.dependencies || []),
				config: data.config ? JSON.stringify(data.config) : null,
				manifest: data.manifest ? JSON.stringify(data.manifest) : null,
				files: data.files ? JSON.stringify(data.files) : null,
				permissions: JSON.stringify(data.permissions || []),
				isActive: data.isActive,
				isVerified: data.isVerified,
				updatedAt: new Date(),
				publishedAt: data.publishedAt ? new Date(data.publishedAt) : null
			})
			.where(eq(plugins.id, params.id))
			.returning();

		if (!updatedPlugin.length) {
			return error(404, 'Plugin not found');
		}

		return json(updatedPlugin[0]);
	} catch (err) {
		console.error('Error updating plugin:', err);
		return error(500, 'Failed to update plugin');
	}
};

// DELETE /api/plugins/[id] - Delete plugin (admin only)
export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		return error(403, 'Admin access required');
	}

	try {
		const deletedPlugin = await db
			.delete(plugins)
			.where(eq(plugins.id, params.id))
			.returning();

		if (!deletedPlugin.length) {
			return error(404, 'Plugin not found');
		}

		return json({ success: true, message: 'Plugin deleted successfully' });
	} catch (err) {
		console.error('Error deleting plugin:', err);
		return error(500, 'Failed to delete plugin');
	}
};