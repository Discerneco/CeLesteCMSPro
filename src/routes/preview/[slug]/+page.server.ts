import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { getDbFromEvent } from '$lib/server/db/utils';
import { sites } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals }) => {
  const { slug } = params;
  
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
    
    // Check if build directory exists
    const buildDir = join(process.cwd(), 'builds', site.id);
    
    if (!existsSync(buildDir)) {
      throw error(404, {
        message: 'Site not generated yet',
        details: 'Please generate the site first before previewing'
      });
    }
    
    // Check if index.html exists
    const indexPath = join(buildDir, 'index.html');
    
    if (!existsSync(indexPath)) {
      throw error(404, {
        message: 'Homepage not found',
        details: 'The site appears to be incomplete. Try regenerating it.'
      });
    }
    
    // Read the generated HTML
    const html = await readFile(indexPath, 'utf-8');
    
    // Process HTML to fix relative links for preview
    const processedHtml = processHtmlForPreview(html, slug);
    
    return {
      siteId: site.id,
      slug,
      siteName: site.name,
      html: processedHtml,
      buildDir
    };
    
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      throw err; // Re-throw SvelteKit errors
    }
    
    console.error('Preview error:', err);
    throw error(500, {
      message: 'Failed to load site preview',
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