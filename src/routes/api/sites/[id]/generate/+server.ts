import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDbFromEvent } from '$lib/server/db/utils';
import { sites, templates, posts, pages, settings } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { SvelteKitBuilder } from '$lib/server/generator/sveltekit-builder';
import type { SiteData } from '$lib/server/generator/sveltekit-builder';

export const POST: RequestHandler = async ({ params, locals }) => {
  const siteId = params.id;
  
  try {
    const db = getDbFromEvent({ locals });
    
    // Update build status to building
    await db
      .update(sites)
      .set({ 
        buildStatus: 'building',
        buildLog: 'Starting SvelteKit-based site generation...',
        updatedAt: new Date()
      })
      .where(eq(sites.id, siteId));

    console.log(`🏗️ Starting SvelteKit site generation for site: ${siteId}`);

    // Load site data
    const [site] = await db
      .select({
        id: sites.id,
        name: sites.name,
        domain: sites.domain,
        description: sites.description,
        settings: sites.settings,
      })
      .from(sites)
      .where(eq(sites.id, siteId));

    if (!site) {
      throw new Error('Site not found');
    }

    console.log(`📄 Loading content for site: ${site.name}`);

    // Load site content
    const [sitePosts, sitePages, siteSettings] = await Promise.all([
      // Load published posts
      db.select().from(posts).where(eq(posts.status, 'published')).orderBy(desc(posts.createdAt)),
      
      // Load published pages
      db.select().from(pages).where(eq(pages.status, 'published')),
      
      // Load site settings
      db.select().from(settings)
    ]);

    console.log(`📝 Loaded ${sitePosts.length} posts and ${sitePages.length} pages`);

    // Prepare site data for SvelteKit builder
    const siteData: SiteData = {
      id: site.id,
      name: site.name,
      domain: site.domain,
      description: site.description,
      settings: site.settings || {},
      posts: sitePosts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: 'Admin' // TODO: Get actual author from database
      })),
      pages: sitePages.map(page => ({
        id: page.id,
        title: page.title,
        slug: page.slug,
        content: page.content,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt
      }))
    };

    // Use SvelteKit builder for generation
    const builder = new SvelteKitBuilder();
    const buildResult = await builder.generateSite(siteData);

    if (!buildResult.success) {
      throw new Error(buildResult.error || 'Site generation failed');
    }

    // Update build status to success
    const buildLog = `SvelteKit site generated successfully!\n- Pages: ${buildResult.stats?.pages} ✅\n- Posts: ${buildResult.stats?.posts} ✅\n- Clean HTML + Tailwind CSS ✅\n- SEO files: sitemap.xml, robots.txt ✅`;
    
    await db
      .update(sites)
      .set({ 
        buildStatus: 'success',
        lastBuildAt: new Date(),
        buildLog,
        updatedAt: new Date()
      })
      .where(eq(sites.id, siteId));

    console.log(`✅ Site generation completed successfully`);

    return json({ 
      success: true, 
      message: buildResult.message,
      buildDir: buildResult.buildDir,
      stats: buildResult.stats
    });

  } catch (error) {
    console.error(`❌ Site generation failed:`, error);

    // Update build status to error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const buildLog = `SvelteKit site generation failed: ${errorMessage}`;
    
    try {
      const db = getDbFromEvent({ locals });
      await db
        .update(sites)
        .set({ 
          buildStatus: 'error',
          buildLog,
          updatedAt: new Date()
        })
        .where(eq(sites.id, siteId));
    } catch (dbError) {
      console.error('Failed to update build status:', dbError);
    }

    return json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
};

function generateSitemap(site: any, posts: any[], pages: any[]): string {
  const baseUrl = site.domain ? `https://${site.domain}` : 'https://localhost:5173';
  const now = new Date().toISOString();
  
  const urls = [
    `  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`
  ];

  // Add blog index if posts exist
  if (posts.length > 0) {
    urls.push(`  <url>
    <loc>${baseUrl}/blog/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);

    // Add individual posts
    posts.forEach(post => {
      urls.push(`  <url>
    <loc>${baseUrl}/blog/${post.slug}/</loc>
    <lastmod>${new Date(post.updatedAt).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
    });
  }

  // Add static pages
  pages.forEach(page => {
    urls.push(`  <url>
    <loc>${baseUrl}/${page.slug}/</loc>
    <lastmod>${new Date(page.updatedAt).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

function generateRobotsTxt(site: any): string {
  const baseUrl = site.domain ? `https://${site.domain}` : 'https://localhost:5173';
  
  return `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`;
}