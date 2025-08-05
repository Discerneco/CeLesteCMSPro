import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { posts, media, users } from '$lib/server/db/schema.js';
import { count, gte, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
  try {
    // Get current user's last login to calculate "since last session" stats
    const currentUser = locals.user;
    let lastLoginFilter = sql`datetime('now', '-1 day')`; // Default fallback
    
    if (currentUser?.lastLogin) {
      // Use actual last login time for more accurate "since last session" calculation
      lastLoginFilter = sql`datetime(${currentUser.lastLogin.toISOString()})`;
    }
    
    // Get total counts
    const [totalPostsResult, totalMediaResult, totalUsersResult] = await Promise.all([
      db.select({ count: count() }).from(posts),
      db.select({ count: count() }).from(media),
      db.select({ count: count() }).from(users)
    ]);
    
    // Get "since last session" counts for +badges
    const [sessionPostsResult, sessionMediaResult, sessionUsersResult] = await Promise.all([
      db.select({ count: count() }).from(posts).where(gte(posts.createdAt, lastLoginFilter)),
      db.select({ count: count() }).from(media).where(gte(media.createdAt, lastLoginFilter)),
      db.select({ count: count() }).from(users).where(gte(users.createdAt, lastLoginFilter))
    ]);
    
    const stats = {
      total: {
        posts: totalPostsResult[0]?.count || 0,
        media: totalMediaResult[0]?.count || 0,
        users: totalUsersResult[0]?.count || 0,
        sites: 3 // Static for now - could be made dynamic later
      },
      sinceLastSession: {
        posts: sessionPostsResult[0]?.count || 0,
        media: sessionMediaResult[0]?.count || 0,
        users: sessionUsersResult[0]?.count || 0,
        sites: 0 // Sites typically don't change frequently
      }
    };
    
    return {
      stats
    };
    
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    
    // Return fallback stats to prevent page from breaking
    return {
      stats: {
        total: {
          posts: 0,
          media: 0,
          users: 0,
          sites: 3
        },
        sinceLastSession: {
          posts: 0,
          media: 0,
          users: 0,
          sites: 0
        }
      }
    };
  }
};