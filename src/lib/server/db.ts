import { drizzle } from 'drizzle-orm/d1';
import * as schema from '$lib/server/db/schema';

/**
 * Get a Drizzle ORM client for Cloudflare D1
 * 
 * This function requires the Cloudflare D1 binding to be available
 * in the platform.env object. In development, you'll need to use
 * wrangler to provide this binding.
 */
export function getDB(platform: App.Platform) {
  return drizzle(platform.env.DB, { schema });
}

