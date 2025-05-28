import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users, sessions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// In a real implementation, you'd use bcrypt or Argon2 for password hashing
// For now, this is a simplified placeholder for demonstration
const verifyPassword = async (password, hash) => {
  // TODO: Implement proper password verification with bcrypt or Argon2
  // For demo purposes, we'll just compare directly - NEVER do this in production!
  return password === hash;
};

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, cookies }) {
  try {
    const { email, password, rememberMe } = await request.json();
    
    if (!email || !password) {
      return json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }
    
    // Find user by email
    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    const user = foundUsers.length > 0 ? foundUsers[0] : null;
    
    if (!user) {
      return json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
    
    // Verify password
    const passwordValid = await verifyPassword(password, user.passwordHash);
    
    if (!passwordValid) {
      return json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
    
    // If user is not active
    if (!user.active) {
      return json({ success: false, message: 'Account is inactive' }, { status: 403 });
    }
    
    // Create session
    const sessionToken = createId();
    const expiresAt = new Date();
    // Set session expiration - 30 days if rememberMe, otherwise 24 hours
    expiresAt.setDate(expiresAt.getDate() + (rememberMe ? 30 : 1));
    
    // Store session in database
    await db.insert(sessions).values({
      userId: user.id,
      token: sessionToken,
      expiresAt,
      userAgent: request.headers.get('user-agent') || '',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || '',
    });
    
    // Update last login timestamp
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));
    
    // Set session cookie
    cookies.set('session', sessionToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 24 hours in seconds
    });
    
    // Return success without sensitive information
    return json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
