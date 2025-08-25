import { error } from '@sveltejs/kit';

export async function load({ params, fetch }) {
  try {
    // Fetch the page data
    const pageResponse = await fetch(`/api/pages/${params.id}`);
    if (!pageResponse.ok) {
      throw error(pageResponse.status, 'Page not found');
    }
    const page = await pageResponse.json();

    return {
      page
    };
  } catch (err) {
    console.error('Error loading page data:', err);
    throw error(500, 'Failed to load page data');
  }
}