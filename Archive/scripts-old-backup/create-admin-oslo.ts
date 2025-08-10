import { getDB } from '../src/lib/server/db/index.js';
import { users } from '../src/lib/server/db/schema.js';
import { hashPassword } from '../src/lib/server/auth.js';

export async function createAdmin(email: string, password: string, username: string, firstName?: string, lastName?: string) {
  const db = getDB();
  
  const passwordHash = await hashPassword(password);
  
  await db.insert(users).values({
    email,
    username,
    passwordHash,
    firstName: firstName || 'Admin',
    lastName: lastName || 'User',
    role: 'admin',
    active: true,
    verifiedEmail: true
  });
  
  console.log(`✅ Oslo + Arctic admin user created: ${email}`);
}

// Example usage
if (import.meta.main) {
  createAdmin('admin@celestecms.com', 'admin123', 'admin', 'CeLeste', 'Admin')
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error creating admin user:', error);
      process.exit(1);
    });
}