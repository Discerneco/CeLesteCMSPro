import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
  const postId = params.id;
  
  try {
    const response = await fetch(`/api/posts/${postId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw error(404, 'Post not found');
      }
      throw error(response.status, 'Failed to load post');
    }
    
    const post = await response.json();
    
    return {
      post
    };
  } catch (err) {
    console.error('Error loading post:', err);
    throw error(500, 'Failed to load post data');
  }
}