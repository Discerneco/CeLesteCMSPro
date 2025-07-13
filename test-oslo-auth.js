import { getDB } from './src/lib/server/db/index.ts';
import { users } from './src/lib/server/db/schema.ts';
import { hashPassword } from './src/lib/server/auth.ts';

async function createAdminUser() {
  try {
    const db = getDB();
    
    // Create admin password hash
    const passwordHash = await hashPassword('admin123');
    
    // Insert admin user
    await db.insert(users).values({
      email: 'admin@celestecms.com',
      username: 'admin',
      passwordHash,
      firstName: 'CeLeste',
      lastName: 'Admin',
      role: 'admin',
      active: true,
      verifiedEmail: true
    });
    
    console.log('✅ Oslo + Arctic admin user created successfully!');
    console.log('📧 Email: admin@celestecms.com');
    console.log('🔑 Password: admin123');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

createAdminUser();