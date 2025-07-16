#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('Regenerating Paraglide messages...');

const child = spawn('npx', ['paraglide-js', 'compile', '--project', './project.inlang', '--outdir', './src/lib/paraglide'], {
  cwd: process.cwd(),
  stdio: 'inherit'
});

child.on('close', (code) => {
  console.log(`Paraglide compilation ${code === 0 ? 'completed successfully' : 'failed'}`);
  process.exit(code);
});

child.on('error', (err) => {
  console.error('Failed to start Paraglide compilation:', err);
  process.exit(1);
});