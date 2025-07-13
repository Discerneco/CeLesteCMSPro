import fs from 'fs';
import path from 'path';

// Remove the duplicate JavaScript layout file
const filePath = './src/routes/admin/+layout.server.js';

try {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log('✅ Removed duplicate layout file:', filePath);
  } else {
    console.log('ℹ️  File not found:', filePath);
  }
} catch (error) {
  console.error('❌ Error removing file:', error);
}