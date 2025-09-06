import type { RequestHandler } from './$types';
import { readFile, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { getDbFromEvent } from '$lib/server/db/utils';
import { sites } from '$lib/server/db/schema';
import { eq, or } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params, locals, setHeaders, request }) => {
  const { slug } = params;
  
  try {
    const db = getDbFromEvent({ locals });
    
    // Find site by slug or ID
    const [site] = await db
      .select({ id: sites.id, name: sites.name, slug: sites.slug })
      .from(sites)
      .where(or(
        eq(sites.slug, slug),
        eq(sites.id, slug)
      ));
    
    if (!site) {
      return new Response('Site not found', { status: 404 });
    }
    
    // Build the file path for index.html
    const buildDir = join(process.cwd(), 'builds', site.id);
    const filePath = join(buildDir, 'index.html');
    
    if (!existsSync(filePath)) {
      return new Response('Site not generated yet', { status: 404 });
    }
    
    // Get file stats for caching
    const stats = await stat(filePath);
    const etag = `"${stats.mtime.getTime()}"`;
    const lastModified = stats.mtime.toUTCString();
    
    // Check if client has cached version (using request headers instead of locals)
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === etag) {
      return new Response(null, { status: 304 });
    }
    
    // Read and serve the file
    const html = await readFile(filePath, 'utf-8');
    
    // Set proper caching headers
    setHeaders({
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300', // 5 minutes
      'ETag': etag,
      'Last-Modified': lastModified
    });
    
    return new Response(html);
    
  } catch (error) {
    console.error('Preview error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};