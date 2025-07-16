import fs from 'fs';
import path from 'path';

function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ Removed conflicting directory: ${dirPath}`);
  } else {
    console.log(`ℹ️  Directory not found: ${dirPath}`);
  }
}

// Remove the conflicting /src/paraglide/ directory
// The correct location is /src/lib/paraglide/ as configured in vite.config.ts
removeDirectory('./src/paraglide');

console.log('✅ Cleanup complete. Paraglide will now regenerate files in the correct location.');