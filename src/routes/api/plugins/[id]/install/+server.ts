import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { plugins, pluginInstallations } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';
import { eq, and } from 'drizzle-orm';

// POST /api/plugins/[id]/install - Install plugin for user
export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) {
		return error(401, 'Unauthorized');
	}

	try {
		const { siteId, config } = await request.json();

		// Verify plugin exists and is active
		const plugin = await db
			.select()
			.from(plugins)
			.where(and(eq(plugins.id, params.id), eq(plugins.isActive, true)))
			.limit(1);

		if (!plugin.length) {
			return error(404, 'Plugin not found or inactive');
		}

		// Check if already installed for this user/site combination
		const existingInstallation = await db
			.select()
			.from(pluginInstallations)
			.where(
				and(
					eq(pluginInstallations.pluginId, params.id),
					eq(pluginInstallations.userId, locals.user.id),
					siteId ? eq(pluginInstallations.siteId, siteId) : eq(pluginInstallations.siteId, null)
				)
			)
			.limit(1);

		if (existingInstallation.length > 0) {
			return error(409, 'Plugin already installed');
		}

		// Create installation record
		const installation = await db
			.insert(pluginInstallations)
			.values({
				pluginId: params.id,
				userId: locals.user.id,
				siteId: siteId || null,
				version: plugin[0].version,
				isActive: true,
				config: config ? JSON.stringify(config) : null
			})
			.returning();

		// Update download count
		await db
			.update(plugins)
			.set({
				downloads: plugin[0].downloads + 1,
				updatedAt: new Date()
			})
			.where(eq(plugins.id, params.id));

		return json({
			success: true,
			message: 'Plugin installed successfully',
			installation: installation[0]
		});
	} catch (err) {
		console.error('Error installing plugin:', err);
		return error(500, 'Failed to install plugin');
	}
};

// DELETE /api/plugins/[id]/install - Uninstall plugin
export const DELETE: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) {
		return error(401, 'Unauthorized');
	}

	try {
		const { siteId } = await request.json();

		// Find and delete the installation
		const deletedInstallation = await db
			.delete(pluginInstallations)
			.where(
				and(
					eq(pluginInstallations.pluginId, params.id),
					eq(pluginInstallations.userId, locals.user.id),
					siteId ? eq(pluginInstallations.siteId, siteId) : eq(pluginInstallations.siteId, null)
				)
			)
			.returning();

		if (!deletedInstallation.length) {
			return error(404, 'Plugin installation not found');
		}

		return json({
			success: true,
			message: 'Plugin uninstalled successfully'
		});
	} catch (err) {
		console.error('Error uninstalling plugin:', err);
		return error(500, 'Failed to uninstall plugin');
	}
};