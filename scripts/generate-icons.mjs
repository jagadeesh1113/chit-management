#!/usr/bin/env node
/**
 * generate-icons.mjs
 * Generates all required PWA icon sizes from an SVG source.
 * Run: node scripts/generate-icons.mjs
 *
 * Requires: sharp
 * Install: npm install --save-dev sharp
 */

import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'icons');

mkdirSync(OUT_DIR, { recursive: true });

// Chit management icon — cycle arc + group members + rupee coin
const SVG = `
<svg width="512" height="512" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="160" height="160" fill="white"/>
  <circle cx="80" cy="80" r="72" stroke="#9FE1CB" stroke-width="3" stroke-dasharray="390 60" stroke-linecap="round" stroke-dashoffset="-15"/>
  <path d="M136 34 L144 26 L148 38" stroke="#1D9E75" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="46" cy="58" r="15" fill="#E1F5EE" stroke="#1D9E75" stroke-width="2"/>
  <circle cx="46" cy="53" r="5" fill="#0F6E56"/>
  <path d="M34 72 Q46 67 58 72" stroke="#0F6E56" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <circle cx="80" cy="50" r="18" fill="#E1F5EE" stroke="#1D9E75" stroke-width="2.5"/>
  <circle cx="80" cy="44" r="6" fill="#0F6E56"/>
  <path d="M66 65 Q80 59 94 65" stroke="#0F6E56" stroke-width="2" stroke-linecap="round" fill="none"/>
  <circle cx="114" cy="58" r="15" fill="#E1F5EE" stroke="#1D9E75" stroke-width="2"/>
  <circle cx="114" cy="53" r="5" fill="#0F6E56"/>
  <path d="M102 72 Q114 67 126 72" stroke="#0F6E56" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <rect x="34" y="75" width="92" height="4" rx="2" fill="#9FE1CB"/>
  <circle cx="80" cy="112" r="26" fill="#E1F5EE" stroke="#1D9E75" stroke-width="2.5"/>
  <circle cx="80" cy="112" r="20" fill="none" stroke="#9FE1CB" stroke-width="1"/>
  <text x="80" y="121" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="700" fill="#085041">&#8377;</text>
</svg>
`.trim();

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

(async () => {
  const svgBuffer = Buffer.from(SVG);
  for (const size of SIZES) {
    const outPath = join(OUT_DIR, `icon-${size}x${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outPath);
    console.log(`✓ Generated ${outPath}`);
  }
  console.log('\n✅ All icons generated in public/icons/');
})();
