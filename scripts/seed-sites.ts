#!/usr/bin/env tsx

/**
 * Seed Sites and Templates
 * 
 * This script creates:
 * 1. A default template with Horizonte syntax
 * 2. A default site using that template
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { sites, templates, templateSections } from '../src/lib/server/db/schema';
import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';

// Initialize database
const sqlite = new Database('local.db');
const db = drizzle(sqlite);

console.log('🌱 Seeding sites and templates...');

async function seedTemplatesAndSites() {
  try {
    // Check if default template already exists
    const existingTemplate = await db.select().from(templates).where(eq(templates.slug, 'default'));
    
    let defaultTemplateId: string;
    
    if (existingTemplate.length === 0) {
      console.log('📄 Creating default template...');
      
      // Create default template with Horizonte syntax
      const [newTemplate] = await db
        .insert(templates)
        .values({
          id: createId(),
          name: 'Default Portfolio',
          slug: 'default',
          description: 'A clean, modern portfolio template perfect for personal sites and blogs',
          content: `[menu:main]
[hero:center,title="Welcome to My Site",subtitle="Your journey starts here"]
[posts:grid,limit=6,featured=true]
[footer:minimal]`,
          type: 'page',
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
        
      defaultTemplateId = newTemplate.id;
      console.log(`✅ Created default template: ${newTemplate.name} (ID: ${defaultTemplateId})`);
    } else {
      defaultTemplateId = existingTemplate[0].id;
      console.log(`✅ Using existing default template (ID: ${defaultTemplateId})`);
    }

    // Create core template sections if they don't exist
    const coreSections = [
      { name: 'Navigation Menu', component: 'menu', category: 'navigation' },
      { name: 'Page Header', component: 'header', category: 'content' },
      { name: 'Hero Section', component: 'hero', category: 'content' },
      { name: 'Posts Grid', component: 'posts', category: 'content' },
      { name: 'Page Content', component: 'content', category: 'content' },
      { name: 'Site Footer', component: 'footer', category: 'navigation' }
    ];

    for (const section of coreSections) {
      const existing = await db.select().from(templateSections).where(eq(templateSections.componentName, section.component));
      
      if (existing.length === 0) {
        await db.insert(templateSections).values({
          id: createId(),
          name: section.name,
          componentName: section.component,
          category: section.category,
          schema: null,
          previewImage: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`📦 Created template section: ${section.name}`);
      }
    }

    // Check if default site already exists
    const existingSite = await db.select().from(sites).where(eq(sites.isDefault, true));
    
    if (existingSite.length === 0) {
      console.log('🏠 Creating default site...');
      
      // Create default site
      const [newSite] = await db
        .insert(sites)
        .values({
          id: createId(),
          name: 'My Portfolio Site',
          domain: 'localhost:5173',
          description: 'A modern portfolio website showcasing my work and blog posts',
          defaultTemplateId: defaultTemplateId,
          settings: JSON.stringify({
            theme: 'light',
            primaryColor: '#3b82f6',
            enableComments: true,
            enableSearch: true,
            postsPerPage: 6,
            language: 'en',
            timezone: 'UTC'
          }),
          buildStatus: 'idle',
          lastBuildAt: null,
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      console.log(`✅ Created default site: ${newSite.name} (ID: ${newSite.id})`);
      console.log(`   Domain: ${newSite.domain}`);
      console.log(`   Template: ${defaultTemplateId}`);
    } else {
      console.log(`✅ Default site already exists (ID: ${existingSite[0].id})`);
    }

    console.log('\n🎉 Sites and templates seeding completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Visit /admin/sites to see your default site');
    console.log('   2. Click "Generate" to build your static site');
    console.log('   3. Visit /admin/templates to customize templates');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Execute seeding
seedTemplatesAndSites()
  .finally(() => {
    sqlite.close();
  });