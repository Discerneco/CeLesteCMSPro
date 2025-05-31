#!/usr/bin/env node

/**
 * Regenerate Paraglide i18n files after updating message JSON files
 * Run with: node regenerate-i18n.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🌍 Regenerating Paraglide i18n files...');

try {
  // Change to project directory
  process.chdir(path.join(__dirname));
  
  // Run Paraglide compile command
  console.log('📝 Compiling message files...');
  execSync('npx @inlang/paraglide-js compile', { stdio: 'inherit' });
  
  console.log('✅ i18n files regenerated successfully!');
  console.log('');
  console.log('🚀 Next steps:');
  console.log('1. Test the language switching in auth pages');
  console.log('2. Run: pnpm dev');
  console.log('3. Visit: http://localhost:5173/admin/login');
  console.log('4. Try switching languages!');
  
} catch (error) {
  console.error('❌ Error regenerating i18n files:', error.message);
  console.log('');
  console.log('💡 Alternative approach:');
  console.log('1. Run: npx @inlang/paraglide-js compile');
  console.log('2. Or check your project.inlang/settings.json configuration');
  process.exit(1);
}
