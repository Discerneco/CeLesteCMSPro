import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
  try {
    console.log('Loading posts from API...');
    
    const response = await fetch('/api/posts');
    
    if (!response.ok) {
      console.error('Failed to fetch posts:', response.status, response.statusText);
      throw error(response.status, 'Failed to load posts');
    }
    
    const posts = await response.json();
    console.log('Posts loaded successfully:', posts);
    
    return {
      posts
    };
  } catch (err) {
    console.error('Error in posts load function:', err);
    throw error(500, 'Failed to load posts');
  }
}