import { json, type RequestHandler } from '@sveltejs/kit';
import { deleteSession, deleteSessionCookie } from '$lib/server/auth-oslo';

export const POST: RequestHandler = async ({ cookies, platform, locals }) => {
  const sessionId = cookies.get('session');
  
  if (sessionId) {
    await deleteSession(sessionId, platform);
  }
  
  // Clear session cookie
  const sessionCookie = deleteSessionCookie();
  cookies.set(sessionCookie.name, sessionCookie.value, {
    path: sessionCookie.attributes.path,
    httpOnly: sessionCookie.attributes.httpOnly,
    secure: sessionCookie.attributes.secure,
    sameSite: sessionCookie.attributes.sameSite,
    maxAge: sessionCookie.attributes.maxAge
  });
  
  return json({ success: true });
}