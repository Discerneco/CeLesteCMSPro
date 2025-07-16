import fs from 'fs';

const filesToRemove = [
  './verify-messages.js',
  './remove-old-config.js', 
  './cleanup-old-config.js'
];

filesToRemove.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`✅ Removed ${file}`);
    }
  } catch (error) {
    console.log(`⚠️  Could not remove ${file}: ${error.message}`);
  }
});

console.log('✅ Cleanup complete');