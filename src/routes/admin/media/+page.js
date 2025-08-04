import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
  try {
    const response = await fetch('/api/media');
    
    if (!response.ok) {
      throw error(response.status, 'Failed to load media');
    }
    
    const media = await response.json();
    
    return {
      media
    };
  } catch (err) {
    console.error('Error loading media:', err);
    throw error(500, 'Failed to load media data');
  }
}