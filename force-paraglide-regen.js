import fs from 'fs';

// Clear the current Paraglide output directory to force fresh generation
const libParaglideDir = './src/lib/paraglide';
const srcParaglideDir = './src/paraglide';

console.log('🧹 Cleaning Paraglide directories...');

// Remove conflicting src/paraglide directory
if (fs.existsSync(srcParaglideDir)) {
  fs.rmSync(srcParaglideDir, { recursive: true, force: true });
  console.log('✅ Removed conflicting /src/paraglide/');
}

// Clear lib/paraglide to force regeneration  
if (fs.existsSync(libParaglideDir)) {
  fs.rmSync(libParaglideDir, { recursive: true, force: true });
  console.log('✅ Cleared /src/lib/paraglide/ for fresh generation');
}

console.log('✅ Ready for Paraglide regeneration. Restart dev server now.');