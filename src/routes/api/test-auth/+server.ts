import { json } from '@sveltejs/kit';
import { createDb } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '$lib/server/auth-temp';

export async function POST({ request, platform }) {
  try {
    const { email, password } = await request.json();
    
    console.log('🔍 Testing auth for:', email);
    
    const db = createDb(platform);
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (!user) {
      console.log('❌ User not found');
      return json({ success: false, message: 'User not found' });
    }
    
    console.log('👤 Found user:', user.email, user.username);
    console.log('🔐 Password hash format:', user.passwordHash?.substring(0, 20) + '...');
    
    const isValid = verifyPassword(password, user.passwordHash);
    console.log('✅ Password valid:', isValid);
    
    return json({
      success: true,
      user: { email: user.email, username: user.username },
      passwordValid: isValid
    });
  } catch (error) {
    console.error('❌ Test auth error:', error);
    return json({ success: false, error: error.message });
  }
}