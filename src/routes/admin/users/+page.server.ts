import type { PageServerLoad } from './$types';
import { getDbFromEvent } from '$lib/server/db/utils';
import { users } from '$lib/server/db/schema';
import { like } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
  const db = getDbFromEvent(event);
  const url = event.url;
  
  // Get search query and pagination from URL parameters
  const searchQuery = url.searchParams.get('search') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 10; // Users per page
  
  try {
    let query = db.select().from(users);
    
    // Apply search filter if provided
    if (searchQuery.trim()) {
      query = query.where(
        like(users.email, `%${searchQuery}%`)
      );
    }
    
    const rawUsers = await query;
    
    // Transform user data to match component expectations
    const transformedUsers = rawUsers.map(user => ({
      ...user,
      // Combine firstName and lastName into name
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username,
      // Map active boolean to status string
      status: user.active ? 'active' : 'inactive',
      // Format dates for display
      lastLoginFormatted: user.lastLogin 
        ? new Date(user.lastLogin).toLocaleDateString()
        : null,
      createdAtFormatted: new Date(user.createdAt).toLocaleDateString()
    }));
    
    // Calculate pagination
    const totalUsers = transformedUsers.length;
    const totalPages = Math.max(1, Math.ceil(totalUsers / limit));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = transformedUsers.slice(startIndex, endIndex);
    
    return {
      users: paginatedUsers,
      searchQuery: searchQuery,
      pagination: {
        page: currentPage,
        totalPages: totalPages,
        hasPrevious: currentPage > 1,
        hasNext: currentPage < totalPages,
        totalUsers: totalUsers
      }
    };
  } catch (error) {
    console.error('Error loading users:', error);
    
    // Return empty state with proper pagination structure
    return {
      users: [],
      searchQuery: searchQuery,
      pagination: {
        page: 1,
        totalPages: 1,
        hasPrevious: false,
        hasNext: false,
        totalUsers: 0
      }
    };
  }
};