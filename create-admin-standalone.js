import Database from 'better-sqlite3';
import { createId } from '@paralleldrive/cuid2';
import { hash } from '@oslojs/crypto/sha2';
import { encodeBase64 } from '@oslojs/encoding';

// Simple Oslo password hashing function
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function hashPassword(password) {
  const salt = generateRandomString(16);
  const hashedPassword = await hash(new TextEncoder().encode(password + salt));
  return encodeBase64(hashedPassword) + ':' + salt;
}

async function createAdminUser() {
  try {
    // Connect to local database
    const db = new Database('./local.db');
    
    // Create admin password hash
    const passwordHash = await hashPassword('admin123');
    const userId = createId();
    const now = Date.now();
    
    // Insert admin user
    const stmt = db.prepare(`
      INSERT INTO users (id, email, username, password_hash, first_name, last_name, role, active, verified_email, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      userId,
      'admin@celestecms.com',
      'admin',
      passwordHash,
      'CeLeste',
      'Admin',
      'admin',
      1, // true
      1, // true
      now,
      now
    );
    
    console.log('✅ Oslo + Arctic admin user created successfully!');
    console.log('📧 Email: admin@celestecms.com');
    console.log('🔑 Password: admin123');
    console.log('🆔 User ID:', userId);
    
    db.close();
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

createAdminUser();