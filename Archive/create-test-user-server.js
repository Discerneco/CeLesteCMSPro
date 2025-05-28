import { auth } from '$lib/server/auth';
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const { email, password, name } = await request.json();
    
    console.log('📝 Creating user via signup endpoint:', { email, name });
    
    // Use Better Auth's signup functionality
    const response = await auth.api.signUpEmail({
      body: { email, password, name }
    });
    
    if (response.error) {
      console.error('❌ Signup error:', response.error);
      return json({ error: response.error.message }, { status: 400 });
    }
    
    console.log('✅ User created successfully:', response.data?.user);
    
    return json({ 
      success: true, 
      user: response.data?.user,
      message: 'User created successfully'
    });
    
  } catch (error) {
    console.error('❌ Server error during signup:', error);
    return json({ 
      error: 'Server error during user creation' 
    }, { status: 500 });
  }
}
