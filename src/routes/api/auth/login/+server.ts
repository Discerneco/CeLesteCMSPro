import { json } from '@sveltejs/kit';
import { getDB } from '$lib/server/db';
import { verifyPassword, createToken } from '$lib/server/auth';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function POST({ request, platform, cookies }) {
  // Ensure platform is defined
  if (!platform) {
    return json({ success: false, message: 'Server configuration error' }, { status: 500 });
  }
  
  const db = getDB(platform);
  const { email, password } = await request.json();
  
  // Validate input
  if (!email || !password) {
    return json({ success: false, message: 'Email and password are required' }, { status: 400 });
  }
  
  try {
    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (!user) {
      return json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
    
    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    
    if (!isValid) {
      return json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
    
    // Create JWT token
    const token = await createToken(user.id, user.role || 'editor');
    
    // Set cookie
    cookies.set('auth_token', token, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    
    return json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return json({ success: false, message: 'An error occurred' }, { status: 500 });
  }
}
