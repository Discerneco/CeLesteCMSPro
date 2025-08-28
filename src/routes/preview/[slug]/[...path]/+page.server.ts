import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { getDbFromEvent } from '$lib/server/db/utils';
import { sites } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals }) => {
  const { slug, path } = params;
  
  try {
    const db = getDbFromEvent({ locals });
    
    // Find site by slug
    const [site] = await db
      .select({ id: sites.id, name: sites.name, slug: sites.slug })
      .from(sites)
      .where(eq(sites.slug, slug));
    
    if (!site) {
      throw error(404, {
        message: 'Site not found',
        details: `No site found with slug "${slug}"`
      });
    }
    
    // Build the file path - handle nested routes
    const buildDir = join(process.cwd(), 'builds', site.id);
    
    if (!existsSync(buildDir)) {
      throw error(404, {
        message: 'Site not generated yet',
        details: 'Please generate the site first before previewing'
      });
    }
    
    // Construct path to HTML file
    let filePath: string;
    
    if (path) {
      // Try multiple possible file locations
      const possiblePaths = [
        join(buildDir, path, 'index.html'),  // /blog/index.html
        join(buildDir, `${path}.html`),      // /blog.html
        join(buildDir, path)                 // /blog (direct file)
      ];
      
      filePath = possiblePaths.find(p => existsSync(p)) || possiblePaths[0];
    } else {
      // Root path
      filePath = join(buildDir, 'index.html');
    }
    
    if (!existsSync(filePath)) {
      throw error(404, {
        message: 'Page not found',
        details: `The requested page "${path || 'homepage'}" was not found in the generated site.`
      });
    }
    
    // Read the generated HTML
    const html = await readFile(filePath, 'utf-8');
    
    // Process HTML to fix relative links for preview
    const processedHtml = processHtmlForPreview(html, slug);
    
    return {
      siteId: site.id,
      slug,
      siteName: site.name,
      path: path || '',
      html: processedHtml,
      buildDir
    };
    
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      throw err; // Re-throw SvelteKit errors
    }
    
    console.error('Preview error:', err);
    throw error(500, {
      message: 'Failed to load page preview',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

/**
 * Process HTML to fix relative links for preview under /preview/slug/ path
 */
function processHtmlForPreview(html: string, siteSlug: string): string {
  return html
    // Fix relative links: href="./" -> href="/preview/site-slug/"
    .replace(/href="\.\/"/g, `href="/preview/${siteSlug}/"`)
    // Fix relative links: href="./page" -> href="/preview/site-slug/page"
    .replace(/href="\.\/([^"]+)"/g, `href="/preview/${siteSlug}/$1"`)
    // Fix relative assets: src="./_app/" -> src="/preview/site-slug/_app/"
    .replace(/src="\.\/(_app\/[^"]+)"/g, `src="/preview/${siteSlug}/$1"`)
    // Fix relative preload: href="./_app/" -> href="/preview/site-slug/_app/"
    .replace(/href="\.\/(_app\/[^"]+)"/g, `href="/preview/${siteSlug}/$1"`);
}