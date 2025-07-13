import fs from 'fs';

const filesToRemove = [
  './src/routes/admin/+layout.server.js',
  './src/routes/api/auth/login/+server.js'
];

filesToRemove.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log('✅ Removed:', file);
    } else {
      console.log('❌ Not found:', file);
    }
  } catch (error) {
    console.error('Error removing', file, ':', error.message);
  }
});

console.log('🎉 Cleanup complete!');