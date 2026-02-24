import sharp from 'sharp';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

const publicDir = '/vercel/share/v0-project/public';

if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

// Create a simple X-11 icon using raw SVG -> PNG conversion
const createIcon = async (size) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
    <rect width="512" height="512" rx="80" fill="#0d1117"/>
    <rect x="20" y="20" width="472" height="472" rx="60" fill="#161b22"/>
    <line x1="140" y1="140" x2="372" y2="372" stroke="#7c3aed" stroke-width="52" stroke-linecap="round"/>
    <line x1="372" y1="140" x2="140" y2="372" stroke="#7c3aed" stroke-width="52" stroke-linecap="round"/>
    <text x="256" y="460" font-family="monospace" font-size="80" font-weight="bold" fill="#a78bfa" text-anchor="middle">11</text>
  </svg>`;
  
  const pngBuffer = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
  const filePath = `${publicDir}/pwa-${size}x${size}.png`;
  writeFileSync(filePath, pngBuffer);
  console.log(`Created ${filePath} (${pngBuffer.length} bytes)`);
};

// Also create a screenshot
const createScreenshot = async () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <rect width="1280" height="720" fill="#0d1117"/>
    <rect x="0" y="0" width="48" height="720" fill="#161b22"/>
    <rect x="48" y="0" width="250" height="720" fill="#1a1f2b"/>
    <rect x="298" y="0" width="1282" height="36" fill="#161b22"/>
    <rect x="298" y="36" width="600" height="684" fill="#0d1117"/>
    <rect x="898" y="36" width="382" height="684" fill="#161b22"/>
    <text x="172" y="30" font-family="monospace" font-size="13" fill="#a78bfa" text-anchor="middle">EXPLORER</text>
    <text x="598" y="24" font-family="monospace" font-size="12" fill="#e6edf3">index.html</text>
    <text x="340" y="80" font-family="monospace" font-size="14" fill="#7c3aed">&lt;!DOCTYPE html&gt;</text>
    <text x="340" y="104" font-family="monospace" font-size="14" fill="#e6edf3">&lt;html lang="en"&gt;</text>
    <text x="340" y="128" font-family="monospace" font-size="14" fill="#e6edf3">  &lt;head&gt;</text>
    <text x="340" y="152" font-family="monospace" font-size="14" fill="#79c0ff">    &lt;title&gt;</text>
    <text x="500" y="152" font-family="monospace" font-size="14" fill="#a5d6ff">X-11 IDE</text>
    <text x="940" y="80" font-family="monospace" font-size="16" fill="#a78bfa" text-anchor="middle">PREVIEW</text>
    <text x="640" y="400" font-family="sans-serif" font-size="42" font-weight="bold" fill="#a78bfa" text-anchor="middle">Code Studio X-11</text>
    <text x="640" y="450" font-family="sans-serif" font-size="18" fill="#8b949e" text-anchor="middle">AI-Powered Cloud IDE</text>
  </svg>`;
  
  const pngBuffer = await sharp(Buffer.from(svg)).resize(1280, 720).png().toBuffer();
  const filePath = `${publicDir}/screenshot-wide.png`;
  writeFileSync(filePath, pngBuffer);
  console.log(`Created ${filePath} (${pngBuffer.length} bytes)`);
};

await createIcon(192);
await createIcon(512);
await createScreenshot();
console.log('All PWA assets created successfully!');
