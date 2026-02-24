import { writeFileSync } from 'fs';

// Generate a simple SVG icon and save as SVG (browsers can use SVG icons)
const svg192 = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
  <rect width="192" height="192" rx="24" fill="#7c3aed"/>
  <text x="96" y="88" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="72" font-weight="800">X</text>
  <text x="96" y="140" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="system-ui,sans-serif" font-size="42" font-weight="700">11</text>
</svg>`;

const svg512 = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="64" fill="#7c3aed"/>
  <text x="256" y="230" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="192" font-weight="800">X</text>
  <text x="256" y="380" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="system-ui,sans-serif" font-size="112" font-weight="700">11</text>
</svg>`;

const svgMaskable = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#7c3aed"/>
  <text x="256" y="230" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="160" font-weight="800">X</text>
  <text x="256" y="360" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="system-ui,sans-serif" font-size="96" font-weight="700">11</text>
</svg>`;

const screenshot = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <rect width="1280" height="720" fill="#0d1117"/>
  <rect x="0" y="0" width="48" height="720" fill="#161b22"/>
  <rect x="48" y="0" width="220" height="720" fill="#0d1117" stroke="#30363d" stroke-width="1"/>
  <rect x="0" y="0" width="1280" height="36" fill="#161b22"/>
  <text x="640" y="24" text-anchor="middle" fill="#c9d1d9" font-family="system-ui" font-size="13">Code Studio X-11 - AI Cloud IDE</text>
  <rect x="280" y="50" width="600" height="640" fill="#0d1117"/>
  <text x="300" y="80" fill="#7c3aed" font-family="monospace" font-size="12">1</text>
  <text x="340" y="80" fill="#c9d1d9" font-family="monospace" font-size="12">&lt;!DOCTYPE html&gt;</text>
  <text x="300" y="100" fill="#7c3aed" font-family="monospace" font-size="12">2</text>
  <text x="340" y="100" fill="#c9d1d9" font-family="monospace" font-size="12">&lt;html lang="en"&gt;</text>
  <rect x="900" y="50" width="380" height="640" fill="#0d1117" stroke="#30363d" stroke-width="1"/>
  <text x="920" y="80" fill="#818cf8" font-family="system-ui" font-size="14" font-weight="600">X-11 AI Assistant</text>
</svg>`;

writeFileSync('public/icon-192.svg', svg192);
writeFileSync('public/icon-512.svg', svg512);
writeFileSync('public/icon-maskable.svg', svgMaskable);
writeFileSync('public/screenshot-wide.svg', screenshot);

console.log('Icons generated successfully!');
