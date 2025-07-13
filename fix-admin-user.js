import Database from 'better-sqlite3';
import crypto from 'crypto';

// Hash password using the same method as auth-temp.ts
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${hash}:${salt}`;
}

try {
  const db = new Database('./local.db');
  
  // Hash the admin password
  const passwordHash = hashPassword('admin123');
  
  // Update the existing admin user
  const stmt = db.prepare(`
    UPDATE users 
    SET email = ?, password_hash = ?, updated_at = ?
    WHERE username = 'admin'
  `);
  
  const result = stmt.run('admin@celestecms.com', passwordHash, Date.now());
  
  if (result.changes > 0) {
    console.log('✅ Admin user updated successfully!');
    console.log('📧 Email: admin@celestecms.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Username: admin');
  } else {
    console.log('❌ Failed to update admin user');
  }
  
  db.close();
} catch (error) {
  console.error('❌ Error updating admin user:', error);
}