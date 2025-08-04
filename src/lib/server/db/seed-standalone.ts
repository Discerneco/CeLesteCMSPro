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
    
    // Sample media data
    const sampleMedia = [
      {
        id: createId(),
        filename: 'hero-banner.jpg',
        originalFilename: 'hero-banner.jpg',
        mimeType: 'image/jpeg',
        size: 2048000, // 2MB
        path: '/uploads/hero-banner.jpg',
        url: 'https://picsum.photos/1920/1080?random=1',
        altText: 'Hero banner image for website',
        width: 1920,
        height: 1080,
        uploaderId: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: { description: 'Main hero banner for homepage' }
      },
      {
        id: createId(),
        filename: 'blog-post-1.jpg',
        originalFilename: 'blog-post-1.jpg',
        mimeType: 'image/jpeg',
        size: 1536000, // 1.5MB
        path: '/uploads/blog-post-1.jpg',
        url: 'https://picsum.photos/800/600?random=2',
        altText: 'Featured image for blog post',
        width: 800,
        height: 600,
        uploaderId: adminId,
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        updatedAt: new Date(Date.now() - 86400000),
        metadata: { description: 'Blog post featured image' }
      },
      {
        id: createId(),
        filename: 'company-logo.png',
        originalFilename: 'company-logo.png',
        mimeType: 'image/png',
        size: 256000, // 256KB
        path: '/uploads/company-logo.png',
        url: 'https://picsum.photos/400/200?random=3',
        altText: 'Company logo',
        width: 400,
        height: 200,
        uploaderId: adminId,
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
        updatedAt: new Date(Date.now() - 172800000),
        metadata: { description: 'Official company logo' }
      },
      {
        id: createId(),
        filename: 'sample-document.pdf',
        originalFilename: 'sample-document.pdf',
        mimeType: 'application/pdf',
        size: 1024000, // 1MB
        path: '/uploads/sample-document.pdf',
        url: '/uploads/sample-document.pdf',
        altText: 'Sample PDF document',
        width: null,
        height: null,
        uploaderId: adminId,
        createdAt: new Date(Date.now() - 259200000), // 3 days ago
        updatedAt: new Date(Date.now() - 259200000),
        metadata: { description: 'Sample PDF document for testing' }
      }
    ];

    // Insert sample media
    for (const mediaItem of sampleMedia) {
      await db.insert(schema.media).values(mediaItem).onConflictDoNothing();
    }
    
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
    console.log(`🖼️ Sample media files added (${sampleMedia.length} items)`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    sqlite.close();
  }
}

// Run the function when this file is executed directly
seedDatabase();
