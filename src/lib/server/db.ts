import { drizzle } from 'drizzle-orm/d1';
import * as schema from '$lib/server/db/schema';

export function getDB(platform: App.Platform) {
  return drizzle(platform.env.DB, { schema });
}
