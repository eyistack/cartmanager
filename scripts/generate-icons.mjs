import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Clean high contrast cart icon SVG with safe margins for Android maskable and Apple Touch Icon
const createSvg = (isMaskable = false) => {
  // If maskable, icon sits in the safe inner 70-80% zone with padding
  const padding = isMaskable ? 80 : 40;
  const viewBoxSize = 512;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#09090b" rx="${isMaskable ? '0' : '96'}"/>
  <g transform="translate(${isMaskable ? 32 : 16}, ${isMaskable ? 32 : 16}) scale(${isMaskable ? 0.88 : 0.94})">
    <circle cx="192" cy="392" r="32" fill="#3b82f6"/>
    <circle cx="368" cy="392" r="32" fill="#3b82f6"/>
    <path d="M112 128h48l44 192a24 24 0 0 0 24 18h152a24 24 0 0 0 23-18l29-120H168" 
          fill="none" stroke="#ffffff" stroke-width="36" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M256 180v80M216 220h80" fill="none" stroke="#3b82f6" stroke-width="26" stroke-linecap="round"/>
  </g>
</svg>
  `.trim();
};

async function generate() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const standardSvg = Buffer.from(createSvg(false));
  const maskableSvg = Buffer.from(createSvg(true));

  // 1. pwa-192x192.png
  await sharp(standardSvg).resize(192, 192).png().toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Generated pwa-192x192.png');

  // 2. pwa-512x512.png
  await sharp(standardSvg).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Generated pwa-512x512.png');

  // 3. pwa-maskable-512x512.png
  await sharp(maskableSvg).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Generated pwa-maskable-512x512.png');

  // 4. apple-touch-icon.png (180x180)
  await sharp(standardSvg).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // 5. favicon-32x32.png
  await sharp(standardSvg).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32x32.png'));
  console.log('Generated favicon-32x32.png');
}

generate().catch(console.error);
