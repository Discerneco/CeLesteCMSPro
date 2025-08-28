import type { RequestHandler } from './$types';
import { readFile, stat } from 'fs/promises';
import { join, extname } from 'path';
import { existsSync } from 'fs';
import { getDbFromEvent } from '$lib/server/db/utils';
import { sites } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// MIME type mapping for common static files
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

export const GET: RequestHandler = async ({ params, locals, setHeaders, request }) => {
  const { slug, path } = params;
  
  try {
    const db = getDbFromEvent({ locals });
    
    // Find site by slug
    const [site] = await db
      .select({ id: sites.id, name: sites.name, slug: sites.slug })
      .from(sites)
      .where(eq(sites.slug, slug));
    
    if (!site) {
      return new Response('Site not found', { status: 404 });
    }
    
    // Build the file path
    const buildDir = join(process.cwd(), 'builds', site.id);
    let filePath: string;
    
    if (path) {
      // Try multiple possible file locations for HTML files
      const possiblePaths = [
        join(buildDir, `${path}.html`), // .html extension first (most common)
        join(buildDir, path, 'index.html'), // Directory with index.html
        join(buildDir, path), // Direct file path
      ];
      
      // Find the first path that exists
      filePath = possiblePaths.find(p => {
        try {
          return existsSync(p);
        } catch {
          return false;
        }
      });
      
      if (!filePath) {
        console.error(`No file found for path: ${path}`, possiblePaths);
        return new Response('File not found', { status: 404 });
      }
    } else {
      filePath = join(buildDir, 'index.html');
    }
    
    if (!existsSync(filePath)) {
      return new Response('File not found', { status: 404 });
    }
    
    // Get file stats for caching
    const stats = await stat(filePath);
    const etag = `"${stats.mtime.getTime()}"`;
    const lastModified = stats.mtime.toUTCString();
    
    // Check if client has cached version
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === etag) {
      return new Response(null, { status: 304 });
    }
    
    // Determine MIME type
    const ext = extname(filePath).toLowerCase();
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
    
    // Read the file
    const content = await readFile(filePath);
    
    // Set cache headers based on file type
    const isAsset = ext !== '.html';
    const maxAge = isAsset ? 86400 : 300; // Assets: 1 day, HTML: 5 minutes
    
    setHeaders({
      'Content-Type': mimeType,
      'Cache-Control': `public, max-age=${maxAge}`,
      'ETag': etag,
      'Last-Modified': lastModified,
    });
    
    return new Response(content);
    
  } catch (error) {
    console.error('Preview error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};