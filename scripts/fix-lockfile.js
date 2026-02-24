import { writeFileSync } from 'fs';
import { join } from 'path';

// Write a minimal valid package-lock.json that will make npm ci
// delete everything and do a fresh install from package.json
const projectDir = '/vercel/share/v0-project';

const lockfile = {
  name: "code-studio-x11",
  version: "0.0.0",
  lockfileVersion: 3,
  requires: true,
  packages: {}
};

writeFileSync(
  join(projectDir, 'package-lock.json'),
  JSON.stringify(lockfile, null, 2) + '\n'
);

console.log('Written minimal package-lock.json');
