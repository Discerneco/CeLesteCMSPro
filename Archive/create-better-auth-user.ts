import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema.js';
import { createId } from '@paralleldrive/cuid2';
import dotenv from 'dotenv';
import { join, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

// Get current file directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

/**
 * Create a Better Auth compatible user for testing
 * This creates users in the Better Auth tables (user, account) 
 * instead of the old CMS users table
 */
async function createBetterAuthUser() {
  console.log('🔐 Creating Better Auth user for testing...');
  
  try {
    // Create database connection directly
    const databaseUrl = process.env.DATABASE_URL || 'file:./local.db';
    const dbPath = databaseUrl.replace('file:', '');
    
    // Resolve relative path from project root (go up from src/lib/server/db to project root)
    const projectRoot = join(__dirname, '../../../../');
    const absolutePath = isAbsolute(dbPath) ? dbPath : join(projectRoot, dbPath);
    
    console.log(`📁 Using database at: ${absolutePath}`);
    
    const sqlite = new Database(absolutePath);
    const db = drizzle(sqlite, { schema });
    
    // Create admin user in Better Auth user table
    const userId = createId();
    console.log(`👤 Creating user with ID: ${userId}`);
    
    await db.insert(schema.user).values({
      id: userId,
      name: 'Admin User',
      email: 'admin@example.com',
      emailVerified: true
    }).onConflictDoNothing();
    
    // Create account record for email/password authentication
    const accountId = createId();
    console.log(`🔑 Creating account with ID: ${accountId}`);
    
    await db.insert(schema.account).values({
      id: accountId,
      accountId: 'email-password',
      providerId: 'credential',
      userId: userId,
      password: '$2b$10$J8SGeG1ADGfaTGNrBueiIuhS3GX4Xrn0VIuXLGf.iMOY9EANMkFui' // "password"
    }).onConflictDoNothing();
    
    console.log('✅ Better Auth user created successfully');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: password');
    
    // Close database connection
    sqlite.close();
    
  } catch (error) {
    console.error('❌ User creation failed:', error);
    console.error('Error details:', error);
    process.exit(1);
  }
}

// Run the function when this file is executed directly
createBetterAuthUser();
