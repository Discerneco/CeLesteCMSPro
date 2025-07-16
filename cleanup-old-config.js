import fs from 'fs';

// Remove old TailwindCSS 3 config file
try {
  if (fs.existsSync('./tailwind.config.js')) {
    fs.unlinkSync('./tailwind.config.js');
    console.log('✅ Removed old tailwind.config.js (TW4 uses CSS-first config)');
  } else {
    console.log('ℹ️  tailwind.config.js not found');
  }
} catch (error) {
  console.error('❌ Error removing file:', error);
}