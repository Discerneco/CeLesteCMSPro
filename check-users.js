import Database from 'better-sqlite3';

try {
  const db = new Database('./local.db');
  
  // Check all users
  const users = db.prepare('SELECT id, email, username, role, password_hash FROM users').all();
  
  console.log('📋 Users in database:');
  console.log('Total users:', users.length);
  
  users.forEach(user => {
    console.log(`- ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Username: ${user.username}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Password hash: ${user.password_hash?.substring(0, 20)}...`);
    console.log('');
  });
  
  db.close();
} catch (error) {
  console.error('❌ Error checking users:', error);
}