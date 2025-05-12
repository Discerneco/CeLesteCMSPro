import { json } from '@sveltejs/kit';

export async function POST({ cookies }) {
  cookies.delete('auth_token', { path: '/' });
  return json({ success: true });
}
