import { createDb } from './index';
import * as schema from './schema';
import { createId } from '@paralleldrive/cuid2';

/**
 * Seed the database with initial data for development
 * 
 * This script is meant to be run directly from the command line during development:
 * pnpm run db:seed
 */
async function seedDatabase() {
  console.log('🌱 Seeding database for development...');
  
  const db = createDb();
  if (!db) {
    console.error('Database connection failed');
    process.exit(1);
  }
  
  try {
    // Create admin user
    const adminId = createId();
    await db.insert(schema.users).values({
      id: adminId,
      email: 'admin@example.com',
      username: 'admin',
      passwordHash: '$2b$10$J8SGeG1ADGfaTGNrBueiIuhS3GX4Xrn0VIuXLGf.iMOY9EANMkFui', // "password"
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      active: true,
      verifiedEmail: true
    }).onConflictDoNothing();
    
    // Create content types
    const postTypeId = createId();
    await db.insert(schema.contentTypes).values({
      id: postTypeId,
      name: 'Post',
      slug: 'post',
      description: 'Regular blog post',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'content', type: 'richtext', required: true },
        { name: 'excerpt', type: 'text', required: false }
      ]
    }).onConflictDoNothing();
    
    // Create categories
    const categoryId = createId();
    await db.insert(schema.categories).values({
      id: categoryId,
      name: 'General',
      slug: 'general',
      description: 'General posts'
    }).onConflictDoNothing();
    
    // Create tag
    const tagId = createId();
    await db.insert(schema.tags).values({
      id: tagId,
      name: 'News',
      slug: 'news',
      description: 'News and updates'
    }).onConflictDoNothing();
    
    // Create sample post
    const postId = createId();
    await db.insert(schema.posts).values({
      id: postId,
      title: 'Welcome to CeLesteCMS Pro',
      slug: 'welcome-to-celestecms-pro',
      content: '<p>This is your first post in CeLesteCMS Pro. You can edit or delete it to get started.</p>',
      excerpt: 'Get started with CeLesteCMS Pro',
      authorId: adminId,
      status: 'published',
      commentStatus: 'open',
      contentTypeId: postTypeId
    }).onConflictDoNothing();
    
    // Associate post with category
    await db.insert(schema.postCategories).values({
      postId,
      categoryId
    }).onConflictDoNothing();
    
    // Associate post with tag
    await db.insert(schema.postTags).values({
      postId,
      tagId
    }).onConflictDoNothing();
    
    // Default settings
    await db.insert(schema.settings).values({
      key: 'site',
      value: {
        title: 'CeLesteCMS Pro',
        description: 'Modern CMS built with SvelteKit and Drizzle',
        language: 'en',
        theme: 'system'
      }
    }).onConflictDoNothing();
    
    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the function when this file is executed directly
seedDatabase();
