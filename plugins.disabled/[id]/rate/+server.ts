import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { plugins, pluginRatings } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';
import { eq, and, avg } from 'drizzle-orm';

// POST /api/plugins/[id]/rate - Rate a plugin
export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) {
		return error(401, 'Unauthorized');
	}

	try {
		const { rating, review } = await request.json();

		// Validate rating
		if (!rating || rating < 1 || rating > 5) {
			return error(400, 'Rating must be between 1 and 5');
		}

		// Verify plugin exists
		const plugin = await db
			.select()
			.from(plugins)
			.where(eq(plugins.id, params.id))
			.limit(1);

		if (!plugin.length) {
			return error(404, 'Plugin not found');
		}

		// Check if user already rated this plugin
		const existingRating = await db
			.select()
			.from(pluginRatings)
			.where(
				and(
					eq(pluginRatings.pluginId, params.id),
					eq(pluginRatings.userId, locals.user.id)
				)
			)
			.limit(1);

		let result;
		if (existingRating.length > 0) {
			// Update existing rating
			result = await db
				.update(pluginRatings)
				.set({
					rating,
					review: review || null,
					updatedAt: new Date()
				})
				.where(
					and(
						eq(pluginRatings.pluginId, params.id),
						eq(pluginRatings.userId, locals.user.id)
					)
				)
				.returning();
		} else {
			// Create new rating
			result = await db
				.insert(pluginRatings)
				.values({
					pluginId: params.id,
					userId: locals.user.id,
					rating,
					review: review || null
				})
				.returning();
		}

		// Recalculate plugin average rating
		const avgRating = await db
			.select({ avg: avg(pluginRatings.rating) })
			.from(pluginRatings)
			.where(eq(pluginRatings.pluginId, params.id));

		const newAvgRating = avgRating[0]?.avg || 0;

		// Update plugin rating
		await db
			.update(plugins)
			.set({
				rating: Number(newAvgRating.toFixed(1)),
				updatedAt: new Date()
			})
			.where(eq(plugins.id, params.id));

		return json({
			success: true,
			message: 'Rating saved successfully',
			rating: result[0]
		});
	} catch (err) {
		console.error('Error rating plugin:', err);
		return error(500, 'Failed to rate plugin');
	}
};

// DELETE /api/plugins/[id]/rate - Remove rating
export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return error(401, 'Unauthorized');
	}

	try {
		// Delete user's rating
		const deletedRating = await db
			.delete(pluginRatings)
			.where(
				and(
					eq(pluginRatings.pluginId, params.id),
					eq(pluginRatings.userId, locals.user.id)
				)
			)
			.returning();

		if (!deletedRating.length) {
			return error(404, 'Rating not found');
		}

		// Recalculate plugin average rating
		const avgRating = await db
			.select({ avg: avg(pluginRatings.rating) })
			.from(pluginRatings)
			.where(eq(pluginRatings.pluginId, params.id));

		const newAvgRating = avgRating[0]?.avg || 0;

		// Update plugin rating
		await db
			.update(plugins)
			.set({
				rating: Number(newAvgRating.toFixed(1)),
				updatedAt: new Date()
			})
			.where(eq(plugins.id, params.id));

		return json({
			success: true,
			message: 'Rating removed successfully'
		});
	} catch (err) {
		console.error('Error removing rating:', err);
		return error(500, 'Failed to remove rating');
	}
};