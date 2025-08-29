import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';

/**
 * Run database migrations for local development
 * This script is meant to be run directly from the command line
 * 
 * Usage: 
 * pnpm run db:migrate
 */
async function runMigrations() {
  // Use default local database path
  const dbPath = 'local.db';
  console.log(`Running migrations on database at ${dbPath}`);
  
  try {
    const sqlite = new Database(dbPath);
    const db = drizzle(sqlite);
    
    // This applies all migrations from the drizzle folder
    // @ts-ignore - Type mismatch between drizzle and better-sqlite3
    await migrate(db, { migrationsFolder: 'drizzle' });
    
    console.log('✅ Migrations completed successfully');
    sqlite.close();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the function immediately when this module is executed directly
runMigrations();
