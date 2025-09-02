import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
  const { id } = params;
  
  try {
    const response = await fetch(`/api/sites/${id}`);
    
    if (!response.ok) {
      throw error(404, 'Site not found');
    }
    
    const site = await response.json();
    
    return {
      site
    };
  } catch (err) {
    console.error('Failed to load site:', err);
    throw error(500, 'Failed to load site configuration');
  }
};