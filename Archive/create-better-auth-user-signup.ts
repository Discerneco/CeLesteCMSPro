import { auth } from '../auth.js';

/**
 * Create a Better Auth user using the proper signup flow
 * This ensures proper password hashing and user creation
 */
async function createBetterAuthUser() {
  console.log('🔐 Creating Better Auth user using proper signup flow...');
  
  try {
    // Use Better Auth's signup API to create user
    const result = await auth.api.signUpEmail({
      body: {
        email: 'admin@example.com',
        password: 'password',
        name: 'Admin User'
      }
    });

    if (result.error) {
      console.error('❌ Signup failed:', result.error);
      process.exit(1);
    }

    console.log('✅ Better Auth user created successfully via signup API');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: password');
    console.log('👤 User:', result.data?.user);
    
  } catch (error) {
    console.error('❌ User creation failed:', error);
    process.exit(1);
  }
}

// Run the function when this file is executed directly
createBetterAuthUser();
