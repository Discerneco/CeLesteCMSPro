import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import { posts, media, users } from '$lib/server/db/schema.js';
import { count, gte, sql } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const timeframe = url.searchParams.get('timeframe') || 'total';
    
    // Define time filters
    const getTimeFilter = (period: string) => {
      switch (period) {
        case 'hour':
          return sql`datetime('now', '-1 hour')`;
        case '24hrs':
          return sql`datetime('now', '-1 day')`;
        case 'week':
          return sql`datetime('now', '-7 days')`;
        case 'month':
          return sql`datetime('now', '-1 month')`;
        case 'login':
          // For login, we'll use a placeholder - this should be passed from the client
          // For now, defaulting to 1 day as a reasonable "last session" period
          return sql`datetime('now', '-1 day')`;
        case 'total':
        default:
          return null;
      }
    };
    
    const timeFilter = getTimeFilter(timeframe);
    
    // Build queries with optional time filtering
    const postsQuery = timeFilter 
      ? db.select({ count: count() }).from(posts).where(gte(posts.createdAt, timeFilter))
      : db.select({ count: count() }).from(posts);
      
    const mediaQuery = timeFilter
      ? db.select({ count: count() }).from(media).where(gte(media.createdAt, timeFilter))
      : db.select({ count: count() }).from(media);
      
    const usersQuery = timeFilter
      ? db.select({ count: count() }).from(users).where(gte(users.createdAt, timeFilter))
      : db.select({ count: count() }).from(users);
    
    // Execute all queries in parallel for optimal performance
    const [postsResult, mediaResult, usersResult] = await Promise.all([
      postsQuery,
      mediaQuery, 
      usersQuery
    ]);
    
    const stats = {
      posts: postsResult[0]?.count || 0,
      media: mediaResult[0]?.count || 0,
      users: usersResult[0]?.count || 0,
      sites: 3, // Static for now - could be made dynamic later
      timeframe
    };
    
    return json(stats);
    
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
};