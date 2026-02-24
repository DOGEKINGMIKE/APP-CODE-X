import { execSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import { resolve } from 'path';

const root = resolve(import.meta.dirname, '..');
const lockPath = resolve(root, 'package-lock.json');

// Remove stale lockfile if it exists
if (existsSync(lockPath)) {
  unlinkSync(lockPath);
  console.log('Removed stale package-lock.json');
}

// Generate a fresh lockfile
console.log('Generating fresh package-lock.json...');
execSync('npm install --legacy-peer-deps --package-lock-only', {
  cwd: root,
  stdio: 'inherit',
});

console.log('Done! Fresh package-lock.json generated.');
