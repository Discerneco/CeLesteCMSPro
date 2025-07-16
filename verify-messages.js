import fs from 'fs';

// Read the admin page file
const adminPage = fs.readFileSync('./src/routes/admin/+page.svelte', 'utf8');

// Extract all m.function_name() calls
const messageCallsRegex = /m\.([a-zA-Z_0-9]+)\(\)/g;
const calls = [];
let match;

while ((match = messageCallsRegex.exec(adminPage)) !== null) {
  calls.push(match[1]);
}

console.log('Message function calls found in admin dashboard:');
calls.forEach(call => console.log(`- ${call}`));

// Check if these files exist in paraglide messages
const messagesDir = './src/paraglide/messages';
const existingFiles = fs.readdirSync(messagesDir).filter(f => f.endsWith('.js') && f !== '_index.js');

console.log('\nVerification:');
calls.forEach(call => {
  const expectedFile = `${call}.js`;
  const exists = existingFiles.includes(expectedFile);
  console.log(`${exists ? '✅' : '❌'} ${call} -> ${expectedFile} ${exists ? 'EXISTS' : 'NOT FOUND'}`);
});

console.log('\nAvailable message files:');
existingFiles.forEach(file => console.log(`- ${file}`));