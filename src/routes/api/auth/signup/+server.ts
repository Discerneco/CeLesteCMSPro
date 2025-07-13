import { json } from '@sveltejs/kit';
import { hashPassword, createSession, createSessionCookie } from '$lib/server/auth-oslo';
import { createDb } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';

export async function POST({ request, cookies, platform }) {
  try {
    const { email, password, name } = await request.json();
    
    // Validation
    if (!email || !password || !name) {
      return json({ success: false, message: 'All fields are required' });
    }
    
    if (password.length < 8) {
      return json({ success: false, message: 'Password must be at least 8 characters' });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return json({ success: false, message: 'Invalid email format' });
    }
    
    const db = createDb(platform);
    
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
    if (existingUser) {
      return json({ success: false, message: 'User already exists with this email' });
    }
    
    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const [firstName, ...lastNameParts] = name.trim().split(' ');
    const lastName = lastNameParts.join(' ') || '';
    
    const newUser = await db.insert(users).values({
      id: createId(),
      email,
      username: email, // Use email as username for now
      passwordHash,
      firstName,
      lastName,
      role: 'subscriber', // Default role
      active: true,
      verifiedEmail: true, // Auto-verify for now
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning().get();
    
    // Create session
    const sessionId = await createSession(newUser.id, platform);
    const sessionCookie = createSessionCookie(sessionId);
    
    // Set session cookie
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
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return json({ success: false, message: 'An error occurred during signup' });
  }
}