import Database from 'better-sqlite3';
import crypto from 'crypto';

// Hash password using the same method as auth-temp.ts
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${hash}:${salt}`;
}

async function updateAdminPassword() {
  try {
    const db = new Database('./local.db');
    
    // Hash the admin password
    const passwordHash = hashPassword('admin123');
    
    // Update admin user password
    const stmt = db.prepare('UPDATE users SET password_hash = ? WHERE email = ?');
    const result = stmt.run(passwordHash, 'admin@celestecms.com');
    
    if (result.changes > 0) {
      console.log('✅ Admin password updated successfully!');
      console.log('📧 Email: admin@celestecms.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('❌ Admin user not found');
    }
    
    db.close();
  } catch (error) {
    console.error('❌ Error updating password:', error);
  }
}

updateAdminPassword();