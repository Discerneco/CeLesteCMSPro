// Create admin user with official Oslo implementation
import Database from 'better-sqlite3';
import { createId } from '@paralleldrive/cuid2';

// Import Oslo utilities
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64 } from '@oslojs/encoding';

// Generate cryptographically secure random bytes
function generateRandomBytes(length) {
  return crypto.getRandomValues(new Uint8Array(length));
}

// Generate random string for salt
function generateRandomString(length) {
  const bytes = generateRandomBytes(length);
  return encodeBase64(bytes).slice(0, length);
}

// Official Oslo password hashing
async function hashPassword(password) {
  const salt = generateRandomString(16);
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password + salt);
  const hashBytes = await sha256(passwordBytes);
  const hashB64 = encodeBase64(hashBytes);
  return `${hashB64}:${salt}`;
}

async function createAdminUser() {
  try {
    console.log('🚀 Creating admin user with official Oslo implementation...');
    
    const db = new Database('./local.db');
    
    // Check if admin exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@celestecms.com');
    if (existing) {
      console.log('⚠️  Admin user already exists! Updating password...');
    }
    
    // Create Oslo password hash
    const passwordHash = await hashPassword('admin123');
    const userId = createId();
    const now = Date.now();
    
    if (existing) {
      // Update existing admin
      const stmt = db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE email = ?');
      stmt.run(passwordHash, now, 'admin@celestecms.com');
      console.log('✅ Admin password updated with Oslo hash!');
    } else {
      // Create new admin
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
      console.log('✅ Admin user created with Oslo hash!');
    }
    
    console.log('📧 Email: admin@celestecms.com');
    console.log('🔑 Password: admin123');
    console.log('🔐 Hash method: Oslo SHA-256 with salt');
    
    db.close();
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    console.error('💡 Make sure Oslo packages are installed: pnpm install');
  }
}

createAdminUser();