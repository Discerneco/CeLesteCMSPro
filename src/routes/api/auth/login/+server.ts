import { json, type RequestHandler } from '@sveltejs/kit';
import { createDb } from '$lib/server/db';
import { verifyPassword, createSession, createSessionCookie } from '$lib/server/auth-oslo';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, platform, cookies }) => {
  const { email, password } = await request.json();
  
  // Validate input
  if (!email || !password) {
    return json({ success: false, message: 'Email and password are required' }, { status: 400 });
  }
  
  try {
    const db = createDb(platform);
    
    // Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (!user) {
      return json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
    
    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    
    if (!isValid) {
      return json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
    
    // Update last login timestamp
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));
    
    // Create session
    const sessionId = await createSession(user.id, platform);
    
    // Set cookie
    const sessionCookie = createSessionCookie(sessionId);
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: sessionCookie.attributes.path,
      httpOnly: sessionCookie.attributes.httpOnly,
      secure: sessionCookie.attributes.secure,
      sameSite: sessionCookie.attributes.sameSite,
      maxAge: sessionCookie.attributes.maxAge
    });
    
    return json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return json({ success: false, message: 'An error occurred' }, { status: 500 });
  }
}