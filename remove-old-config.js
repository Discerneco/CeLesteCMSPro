import fs from 'fs';

try {
  if (fs.existsSync('./tailwind.config.js')) {
    fs.unlinkSync('./tailwind.config.js');
    console.log('✅ Removed legacy tailwind.config.js (TW4 uses CSS-first config in app.css)');
  } else {
    console.log('ℹ️  tailwind.config.js not found');
  }
} catch (error) {
  console.error('❌ Error removing file:', error);
}