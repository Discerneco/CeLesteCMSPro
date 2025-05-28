import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema.js';
import { eq } from 'drizzle-orm';
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
 * Clean up the incorrectly created user and recreate properly
 */
async function cleanupAndRecreateUser() {
  console.log('🧹 Cleaning up incorrectly created Better Auth user...');
  
  try {
    // Create database connection directly
    const databaseUrl = process.env.DATABASE_URL || 'file:./local.db';
    const dbPath = databaseUrl.replace('file:', '');
    
    // Resolve relative path from project root
    const projectRoot = join(__dirname, '../../../../');
    const absolutePath = isAbsolute(dbPath) ? dbPath : join(projectRoot, dbPath);
    
    console.log(`📁 Using database at: ${absolutePath}`);
    
    const sqlite = new Database(absolutePath);
    const db = drizzle(sqlite, { schema });
    
    // Delete existing test user
    console.log('🗑️ Deleting existing test user...');
    
    // First delete accounts
    await db.delete(schema.account).where(eq(schema.account.userId, 'a9fm9o4eddvbzudljf2xf53w'));
    
    // Then delete user
    await db.delete(schema.user).where(eq(schema.user.email, 'admin@example.com'));
    
    console.log('✅ Cleanup completed');
    
    // Close database connection
    sqlite.close();
    
    console.log('');
    console.log('🔧 Please run the development server and use Better Auth signup endpoint:');
    console.log('curl -X POST http://localhost:5173/api/auth/sign-up \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"email":"admin@example.com","password":"password","name":"Admin User"}\'');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// Run the function when this file is executed directly
cleanupAndRecreateUser();
