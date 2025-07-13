// Test if Oslo packages are available
import { execSync } from 'child_process';

const osloPkgs = [
  '@oslojs/crypto',
  '@oslojs/encoding', 
  '@oslojs/cookie'
];

for (const pkg of osloPkgs) {
  try {
    console.log(`✅ Testing ${pkg}...`);
    const result = await import(pkg);
    console.log(`✅ ${pkg} is available`);
  } catch (error) {
    console.log(`❌ ${pkg} not available: ${error.message}`);
  }
}