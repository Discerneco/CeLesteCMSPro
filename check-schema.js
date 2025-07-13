import Database from 'better-sqlite3';

try {
  const db = new Database('./local.db');
  
  // Check the sessions table structure
  const sessionSchema = db.prepare("PRAGMA table_info(sessions)").all();
  console.log('📋 Sessions table structure:');
  sessionSchema.forEach(col => {
    console.log(`- ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : 'NULL'} ${col.pk ? 'PRIMARY KEY' : ''}`);
  });
  
  db.close();
} catch (error) {
  console.error('❌ Error checking schema:', error);
}