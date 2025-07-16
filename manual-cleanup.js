import fs from 'fs';

console.log('🧹 Starting manual cleanup...');

// Remove temporary files
const tempFiles = [
  './cleanup-paraglide.js',
  './force-paraglide-regen.js', 
  './cleanup-temp-files.js',
  './clean-and-test.sh'
];

tempFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`✅ Removed ${file}`);
    }
  } catch (error) {
    console.log(`⚠️  Could not remove ${file}: ${error.message}`);
  }
});

// Remove conflicting Paraglide directory
if (fs.existsSync('./src/paraglide')) {
  fs.rmSync('./src/paraglide', { recursive: true, force: true });
  console.log('✅ Removed conflicting /src/paraglide/');
}

// Clear current lib/paraglide to force regeneration
if (fs.existsSync('./src/lib/paraglide')) {
  fs.rmSync('./src/lib/paraglide', { recursive: true, force: true });
  console.log('✅ Cleared /src/lib/paraglide/ for fresh generation');
}

console.log('✅ Manual cleanup complete! Ready for Paraglide regeneration.');
console.log('🚀 Please restart your dev server now.');

// Remove this script itself
setTimeout(() => {
  fs.unlinkSync('./manual-cleanup.js');
}, 100);