import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
  const postId = params.id;
  
  try {
    // Load both post and users in parallel
    const [postResponse, usersResponse] = await Promise.all([
      fetch(`/api/posts/${postId}`),
      fetch('/api/users')
    ]);
    
    if (!postResponse.ok) {
      if (postResponse.status === 404) {
        throw error(404, 'Post not found');
      }
      throw error(postResponse.status, 'Failed to load post');
    }
    
    if (!usersResponse.ok) {
      throw error(usersResponse.status, 'Failed to load users');
    }
    
    const post = await postResponse.json();
    const users = await usersResponse.json();
    
    return {
      post,
      users
    };
  } catch (err) {
    console.error('Error loading post:', err);
    throw error(500, 'Failed to load post data');
  }
}