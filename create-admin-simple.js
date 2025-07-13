import Database from 'better-sqlite3';
import { createId } from '@paralleldrive/cuid2';
import crypto from 'crypto';

// Simple password hashing using Node.js built-in crypto
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${hash}:${salt}`;
}

async function createAdminUser() {
  try {
    // Connect to local database
    const db = new Database('./local.db');
    
    // Create admin password hash
    const passwordHash = hashPassword('admin123');
    const userId = createId();
    const now = Date.now();
    
    // Check if admin user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get('admin@celestecms.com', 'admin');
    if (existingUser) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email: admin@celestecms.com');
      console.log('🔑 Password: admin123');
      console.log('💡 You can now test login with these credentials');
      db.close();
      return;
    }
    
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
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@celestecms.com');
    console.log('🔑 Password: admin123');
    console.log('🆔 User ID:', userId);
    
    db.close();
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    console.error('Make sure the database exists and has the users table.');
  }
}

createAdminUser();