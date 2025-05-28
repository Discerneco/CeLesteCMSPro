import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import { join, isAbsolute } from 'node:path';

// Load environment variables
dotenv.config();

/**
 * Clean up incorrectly created user data using raw SQL
 */
async function cleanupDatabase() {
  console.log('🧹 Cleaning up incorrectly created Better Auth user data...');
  
  try {
    // Create database connection directly
    const databaseUrl = process.env.DATABASE_URL || 'file:./local.db';
    const dbPath = databaseUrl.replace('file:', '');
    
    // Resolve relative path 
    const absolutePath = isAbsolute(dbPath) ? dbPath : join(process.cwd(), dbPath);
    
    console.log(`📁 Using database at: ${absolutePath}`);
    
    const sqlite = new Database(absolutePath);
    
    // Delete all test data from Better Auth tables using raw SQL
    console.log('🗑️ Deleting test user data...');
    
    sqlite.exec('DELETE FROM account');
    sqlite.exec('DELETE FROM session');
    sqlite.exec('DELETE FROM user');
    sqlite.exec('DELETE FROM verification');
    
    console.log('✅ Database cleanup completed');
    console.log('🎯 Ready for proper Better Auth user creation!');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Start dev server: pnpm dev');
    console.log('2. Create user: curl -X POST http://localhost:5173/api/auth/sign-up \\');
    console.log('   -H "Content-Type: application/json" \\');
    console.log('   -d \'{"email":"admin@example.com","password":"password","name":"Admin User"}\'');
    
    // Close database connection
    sqlite.close();
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// Run the function
cleanupDatabase();
