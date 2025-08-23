import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
  // Fetch the post data
  const postResponse = await fetch(`/api/posts/${params.id}`);
  
  if (!postResponse.ok) {
    throw new Error('Post not found');
  }
  
  const post = await postResponse.json();
  
  return {
    post
  };
};