#!/usr/bin/env tsx
import 'dotenv/config';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './src/lib/server/db/schema.js';
import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';

// CLI commands for database operations
const commands = {
  async listUsers() {
    const users = await db.select().from(schema.users);
    console.log('👥 Users:', users);
    return users;
  },

  async listPosts() {
    const posts = await db.select().from(schema.posts);
    console.log('📝 Posts:', posts);
    return posts;
  },

  async createUser(email: string, username: string, role: 'admin' | 'editor' | 'author' | 'subscriber' = 'subscriber') {
    const user = {
      id: createId(),
      email,
      username,
      passwordHash: '$2b$10$J8SGeG1ADGfaTGNrBueiIuhS3GX4Xrn0VIuXLGf.iMOY9EANMkFui', // "password"
      firstName: username,
      role,
      active: true,
      verifiedEmail: true
    };
    
    await db.insert(schema.users).values(user);
    console.log('✅ User created:', user);
    return user;
  },

  async createPost(title: string, content: string, status: 'draft' | 'published' = 'draft') {
    const users = await db.select().from(schema.users).limit(1);
    const contentTypes = await db.select().from(schema.contentTypes).limit(1);
    
    if (users.length === 0) {
      console.error('❌ No users found. Create a user first.');
      return;
    }
    
    if (contentTypes.length === 0) {
      console.error('❌ No content types found. Creating default...');
      await commands.createContentType();
      const newContentTypes = await db.select().from(schema.contentTypes).limit(1);
      if (newContentTypes.length === 0) return;
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const post = {
      id: createId(),
      title,
      slug,
      content,
      excerpt: content.substring(0, 150) + '...',
      authorId: users[0].id,
      contentTypeId: contentTypes[0]?.id || (await db.select().from(schema.contentTypes).limit(1))[0].id,
      status,
      publishedAt: status === 'published' ? new Date() : null
    };
    
    await db.insert(schema.posts).values(post);
    console.log('✅ Post created:', post);
    return post;
  },

  async createContentType() {
    const contentType = {
      id: createId(),
      name: 'Post',
      slug: 'post',
      description: 'Regular blog post',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'content', type: 'richtext', required: true }
      ]
    };
    
    await db.insert(schema.contentTypes).values(contentType).onConflictDoNothing();
    console.log('✅ Content type created:', contentType);
    return contentType;
  },

  async stats() {
    const userCount = await db.select().from(schema.users);
    const postCount = await db.select().from(schema.posts);
    const categoryCount = await db.select().from(schema.categories);
    
    console.log('📊 Database Stats:');
    console.log(`- Users: ${userCount.length}`);
    console.log(`- Posts: ${postCount.length}`);
    console.log(`- Categories: ${categoryCount.length}`);
  },

  help() {
    console.log(`
🛠️  Database CLI Commands:
   listUsers()          - Show all users
   listPosts()          - Show all posts  
   createUser(email, username, role?)  - Create new user
   createPost(title, content, status?) - Create new post
   createContentType()  - Create default content type
   stats()              - Show database statistics
   help()               - Show this help
   
💡 Example usage:
   await createUser('john@example.com', 'john', 'editor')
   await createPost('My First Post', '<p>Hello world!</p>', 'published')
`);
  }
};

// Database connection
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl?.startsWith('file:')) {
  console.error('❌ DATABASE_URL must start with "file:"');
  process.exit(1);
}

const dbPath = databaseUrl.replace('file:', '');
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

console.log('🔗 Connected to database:', dbPath);
console.log('💡 Type help() for available commands');

// Make commands available globally
Object.assign(globalThis, commands);
Object.assign(globalThis, { db, schema });

// Keep the process alive for interactive use
process.stdin.resume();
