import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const load: PageServerLoad = async ({ params }) => {
  const { siteId } = params;
  
  try {
    // Check if build directory exists
    const buildDir = join(process.cwd(), 'builds', siteId);
    
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
    
    return {
      siteId,
      html,
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