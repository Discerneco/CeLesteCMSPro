// create-admin.js - Script to generate SQL for creating an admin user
import crypto from 'crypto';
import { createId } from '@paralleldrive/cuid2';

// Replace these with your desired admin credentials
const email = 'admin@celeste.cms';
const password = 'CeLeste2025!';
const name = 'Admin User';

// Hash the password (same logic as in auth.ts)
function hashPassword(password) {
  const salt = process.env.PASSWORD_SALT || 'default-salt-for-development';
  const hash = crypto.createHash('sha256');
  hash.update(password + salt);
  return hash.digest('base64');
}

const passwordHash = hashPassword(password);
const id = createId();
const now = new Date().toISOString();

// SQL to insert the admin user
const sql = `
INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
VALUES ('${id}', '${email}', '${passwordHash}', '${name}', 'admin', '${now}', '${now}')
`;

console.log(sql);
