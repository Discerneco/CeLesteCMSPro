import { error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

export async function GET({ params }) {
  const { slug } = params;
  
  // Build the file path using slug
  const buildsDir = path.join(process.cwd(), 'builds');
  const siteDir = path.join(buildsDir, slug);
  const indexPath = path.join(siteDir, 'index.html');
  
  // Check if site directory exists
  if (!fs.existsSync(siteDir)) {
    throw error(404, 'Site not found');
  }
  
  // Check if index.html exists
  if (!fs.existsSync(indexPath)) {
    throw error(404, 'Site index not found');
  }
  
  const content = fs.readFileSync(indexPath);
  const stats = fs.statSync(indexPath);
  const etag = `"${stats.size}-${stats.mtime.getTime()}"`;
  
  const headers = {
    'Content-Type': 'text/html',
    'Cache-Control': 'public, max-age=300', // 5 minutes for HTML
    'ETag': etag
  };
  
  return new Response(content, { headers });
}