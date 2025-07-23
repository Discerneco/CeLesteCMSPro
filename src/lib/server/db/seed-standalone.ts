import 'dotenv/config';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';
import { createId } from '@paralleldrive/cuid2';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64 } from '@oslojs/encoding';

// Oslo password hashing function (copied from auth-oslo.ts to avoid SvelteKit dependencies)
function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

function generateRandomString(length: number): string {
  const bytes = generateRandomBytes(length);
  return encodeBase64(bytes).slice(0, length);
}

async function hashPassword(password: string): Promise<string> {
  const salt = generateRandomString(16);
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password + salt);
  const hashBytes = await sha256(passwordBytes);
  const hashB64 = encodeBase64(hashBytes);
  return `${hashB64}:${salt}`;
}

/**
 * Standalone seed script that works outside SvelteKit context
 * Uses dotenv and better-sqlite3 directly
 */
async function seedDatabase() {
  console.log('🌱 Seeding database for development...');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl?.startsWith('file:')) {
    console.error('❌ DATABASE_URL must start with "file:" for local development');
    process.exit(1);
  }
  
  const dbPath = databaseUrl.replace('file:', '');
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite, { schema });
  
  try {
    // Create admin user with Oslo password hash
    const adminId = createId();
    const osloPasswordHash = await hashPassword('password');
    
    await db.insert(schema.users).values({
      id: adminId,
      email: 'admin@example.com',
      username: 'admin',
      passwordHash: osloPasswordHash, // Oslo SHA-256 hash for "password"
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      active: true,
      verifiedEmail: true,
      createdAt: new Date(),
      updatedAt: new Date()
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
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }).onConflictDoNothing();
    
    // Create categories
    const categoryId = createId();
    await db.insert(schema.categories).values({
      id: categoryId,
      name: 'General',
      slug: 'general',
      description: 'General posts',
      createdAt: new Date(),
      updatedAt: new Date()
    }).onConflictDoNothing();
    
    // Create tag
    const tagId = createId();
    await db.insert(schema.tags).values({
      id: tagId,
      name: 'News',
      slug: 'news',
      description: 'News and updates',
      createdAt: new Date(),
      updatedAt: new Date()
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
      contentTypeId: postTypeId,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: new Date()
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
      value: JSON.stringify({
        title: 'CeLesteCMS Pro',
        description: 'Modern CMS built with SvelteKit and Drizzle',
        language: 'en',
        theme: 'system'
      }),
      updatedAt: new Date()
    }).onConflictDoNothing();
    
    console.log('✅ Database seeded successfully');
    console.log('👤 Admin user created: admin@example.com / password');
    console.log('📝 Sample post created: "Welcome to CeLesteCMS Pro"');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    sqlite.close();
  }
}

// Run the function when this file is executed directly
seedDatabase();
