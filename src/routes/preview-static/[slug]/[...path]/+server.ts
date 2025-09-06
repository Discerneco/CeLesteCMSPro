import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import fs from 'fs';
import path from 'path';
import { lookup } from 'mrmime';

export async function GET({ params, url }) {
  const { slug, path: filePath } = params;
  
  // Build the file path using slug
  const buildsDir = path.join(process.cwd(), 'builds');
  const siteDir = path.join(buildsDir, slug);
  
  // Check if site directory exists
  if (!fs.existsSync(siteDir)) {
    throw error(404, 'Site not found');
  }
  
  // Handle root path - filePath can be undefined or a path string
  let requestedPath = filePath || '';
  if (!requestedPath || requestedPath === '') {
    requestedPath = 'index.html';
  }
  
  const fullFilePath = path.join(siteDir, requestedPath);
  
  // Security check - ensure we're still within the site directory
  const normalizedPath = path.resolve(fullFilePath);
  const normalizedSiteDir = path.resolve(siteDir);
  if (!normalizedPath.startsWith(normalizedSiteDir)) {
    throw error(403, 'Access denied');
  }
  
  // Check if file exists
  if (!fs.existsSync(fullFilePath)) {
    // If it's a directory, try index.html
    const indexPath = path.join(fullFilePath, 'index.html');
    if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) {
      return serveFile(indexPath, url);
    }
    throw error(404, 'File not found');
  }
  
  const stats = fs.statSync(fullFilePath);
  if (stats.isDirectory()) {
    // Try to serve index.html from directory
    const indexPath = path.join(fullFilePath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return serveFile(indexPath, url);
    }
    throw error(404, 'Directory index not found');
  }
  
  return serveFile(fullFilePath, url);
}

async function serveFile(filePath: string, url: URL) {
  const content = fs.readFileSync(filePath);
  const mimeType = lookup(path.extname(filePath)) || 'application/octet-stream';
  
  // Get file stats for caching headers
  const stats = fs.statSync(filePath);
  const etag = `"${stats.size}-${stats.mtime.getTime()}"`;
  
  // Set caching headers following Microfolio/Jekyll pattern
  const headers: Record<string, string> = {
    'Content-Type': mimeType,
    'ETag': etag
  };
  
  // Cache static assets for 1 day, HTML for 5 minutes
  if (mimeType.startsWith('text/html')) {
    headers['Cache-Control'] = 'public, max-age=300'; // 5 minutes
  } else {
    headers['Cache-Control'] = 'public, max-age=86400'; // 1 day
  }
  
  return new Response(content, { headers });
}