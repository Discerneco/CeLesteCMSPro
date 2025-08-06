import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { users } from '$lib/server/db/schema.js';
import { count, desc, like, or } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url }) => {
  try {
    const searchQuery = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build search condition
    const searchCondition = searchQuery 
      ? or(
          like(users.firstName, `%${searchQuery}%`),
          like(users.lastName, `%${searchQuery}%`),
          like(users.email, `%${searchQuery}%`),
          like(users.username, `%${searchQuery}%`)
        )
      : undefined;

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: count() })
      .from(users)
      .where(searchCondition);
    
    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Get users with pagination and search
    const userList = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        active: users.active,
        verifiedEmail: users.verifiedEmail,
        createdAt: users.createdAt,
        lastLogin: users.lastLogin,
      })
      .from(users)
      .where(searchCondition)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    // Format users data for display
    const formattedUsers = userList.map(user => ({
      ...user,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
      status: user.active ? (user.verifiedEmail ? 'active' : 'pending') : 'inactive',
      createdAtFormatted: user.createdAt.toLocaleDateString(),
      lastLoginFormatted: user.lastLogin ? user.lastLogin.toLocaleDateString() : null,
    }));

    return {
      users: formattedUsers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      },
      searchQuery
    };

  } catch (error) {
    console.error('Error loading users:', error);
    
    return {
      users: [],
      pagination: {
        page: 1,
        limit: 10,
        totalCount: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false
      },
      searchQuery: ''
    };
  }
};