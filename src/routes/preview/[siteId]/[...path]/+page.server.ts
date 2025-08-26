import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const load: PageServerLoad = async ({ params }) => {
  const { siteId, path } = params;
  
  try {
    // Build the file path - handle nested routes
    const buildDir = join(process.cwd(), 'builds', siteId);
    
    if (!existsSync(buildDir)) {
      throw error(404, {
        message: 'Site not generated yet',
        details: 'Please generate the site first before previewing'
      });
    }
    
    // Construct path to HTML file
    let filePath: string;
    
    if (path) {
      // Handle nested paths (e.g., blog/post-slug)
      filePath = join(buildDir, path, 'index.html');
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
    
    return {
      siteId,
      path: path || '',
      html,
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