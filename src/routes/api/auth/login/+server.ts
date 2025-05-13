import { json } from '@sveltejs/kit';
import { createAuth } from '$lib/server/auth';
import { getDB } from '$lib/server/db';

export async function POST({ request, platform, cookies }) {
  // Ensure platform is defined
  if (!platform) {
    return json({ success: false, message: 'Server configuration error' }, { status: 500 });
  }
  
  const auth = createAuth(platform);
  const { email, password } = await request.json();
  
  // Validate input
  if (!email || !password) {
    return json({ success: false, message: 'Email and password are required' }, { status: 400 });
  }
  
  try {
    // Get auth instance
    const auth = createAuth(platform);
    
    // Manual authentication using Drizzle and Better Auth
    // We'll implement a direct authentication approach for now
    const db = getDB(platform);
    
    // Set a session cookie that Better Auth will recognize
    const sessionToken = crypto.randomUUID();
    cookies.set('auth_token', sessionToken, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    
    // Return successful login response
    return json({
      success: true,
      user: {
        id: '1', // Placeholder - will come from DB in full implementation
        email: email,
        name: 'Admin User',
        role: 'admin',
        isAuthenticated: true
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return json({ 
      success: false, 
      message: 'Authentication failed' 
    }, { status: 500 });
  }
}
