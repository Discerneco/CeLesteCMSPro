import { createDb } from './index';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Get a database instance from a SvelteKit request event
 * 
 * This helper function extracts the platform from a SvelteKit request event
 * and creates a database connection. Use this in +server.ts or +page.server.ts files.
 * 
 * @param event SvelteKit RequestEvent object
 * @returns A Drizzle ORM database instance
 * 
 * @example
 * // In a +server.ts file
 * export async function GET({ platform }) {
 *   const db = getDbFromPlatform(platform);
 *   const users = await db.select().from(schema.users);
 *   return json(users);
 * }
 */
export function getDbFromEvent(event: RequestEvent): ReturnType<typeof createDb> {
  return createDb(event.platform);
}

/**
 * Get a database instance from a SvelteKit platform object
 * 
 * @param platform SvelteKit Platform object
 * @returns A Drizzle ORM database instance
 * 
 * @example
 * // In a hook or other context with platform access
 * export async function handle({ event, resolve }) {
 *   const db = getDbFromPlatform(event.platform);
 *   // Use db...
 *   return resolve(event);
 * }
 */
export function getDbFromPlatform(platform?: App.Platform): ReturnType<typeof createDb> {
  return createDb(platform);
}
