/**
 * Migration script to add slugs to existing sites before applying SQL migration
 * This script should be run before running the SQL migration for the slug field
 */

import Database from 'better-sqlite3';
import { join } from 'path';
import { generateSlug, generateUniqueSlug } from '../src/lib/server/utils/slug.js';

async function migrateSiteSlugs() {
  console.log('🔄 Starting site slug migration...');
  
  // Connect to database
  const dbPath = join(process.cwd(), 'local.db');
  const db = new Database(dbPath);
  
  try {
    // First, add the slug column (this should match the SQL migration)
    console.log('📝 Adding slug column to sites table...');
    try {
      db.exec('ALTER TABLE sites ADD COLUMN slug TEXT');
      console.log('✅ Slug column added successfully');
    } catch (error) {
      // Column might already exist
      console.log('ℹ️  Slug column already exists or failed to add:', error.message);
    }
    
    // Get all existing sites
    console.log('🔍 Fetching existing sites...');
    const sites = db.prepare('SELECT id, name, slug FROM sites').all() as Array<{
      id: string;
      name: string;
      slug: string | null;
    }>;
    
    console.log(`📊 Found ${sites.length} sites to process`);
    
    if (sites.length === 0) {
      console.log('ℹ️  No sites found, migration complete');
      return;
    }
    
    // Get existing slugs to avoid conflicts
    const existingSlugs = sites
      .filter(site => site.slug)
      .map(site => site.slug!);
    
    // Update sites that don't have slugs
    const sitesToUpdate = sites.filter(site => !site.slug);
    console.log(`🔄 Updating ${sitesToUpdate.length} sites without slugs...`);
    
    const updateStmt = db.prepare('UPDATE sites SET slug = ? WHERE id = ?');
    
    for (const site of sitesToUpdate) {
      const baseSlug = generateSlug(site.name);
      const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);
      
      updateStmt.run(uniqueSlug, site.id);
      existingSlugs.push(uniqueSlug);
      
      console.log(`  ✅ ${site.name} → ${uniqueSlug}`);
    }
    
    // Add unique constraint
    console.log('🔒 Adding unique constraint on slug...');
    try {
      db.exec('CREATE UNIQUE INDEX IF NOT EXISTS sites_slug_unique ON sites (slug)');
      console.log('✅ Unique constraint added successfully');
    } catch (error) {
      console.log('ℹ️  Unique constraint already exists or failed:', error.message);
    }
    
    // Verify results
    console.log('🔍 Verifying migration results...');
    const updatedSites = db.prepare('SELECT name, slug FROM sites ORDER BY name').all();
    console.log('📋 Final site slugs:');
    updatedSites.forEach((site: any) => {
      console.log(`  - ${site.name} → ${site.slug}`);
    });
    
    console.log('✅ Site slug migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateSiteSlugs().catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
}

export { migrateSiteSlugs };