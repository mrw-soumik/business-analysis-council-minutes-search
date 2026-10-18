// Renders every SVG in ../diagrams to a PNG at 2x scale using headless Chrome.
// Usage: node diagrams/render-png.mjs   (run from the tools folder)
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchChrome } from '../lib/chrome.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const diagrams = resolve(here, '../../diagrams');

const svgs = readdirSync(diagrams).filter((f) => f.endsWith('.svg')).sort();
// Chrome anti-aliasing varies slightly between runs, so PNGs are only re-rendered
// when their SVG changes. The manifest records the SVG hash behind each PNG.
const manifestPath = resolve(here, 'png-manifest.json');
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
const force = process.argv.includes('--force');
const browser = await launchChrome();
try {
  const page = await browser.newPage();
  for (const file of svgs) {
    const raw = readFileSync(resolve(diagrams, file), 'utf8');
    const hash = createHash('sha256').update(raw).digest('hex');
    const pngName = file.replace(/\.svg$/, '.png');
    if (!force && manifest[pngName] === hash && existsSync(resolve(diagrams, pngName))) {
      console.log(`unchanged diagrams/${pngName} (SVG not modified)`);
      continue;
    }
    manifest[pngName] = hash;
    const svg = raw.replace(/^<\?xml[^>]*>\s*/, '').replace(/<!DOCTYPE[^>]*>\s*/, '');
    const open = svg.match(/<svg[^>]*>/)[0];
    const w = Math.ceil(parseFloat(open.match(/width="([\d.]+)/)[1]));
    const h = Math.ceil(parseFloat(open.match(/height="([\d.]+)/)[1]));
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 });
    await page.setContent(`<!doctype html><html><body style="margin:0;background:#ffffff">${svg}</body></html>`);
    const out = resolve(diagrams, file.replace(/\.svg$/, '.png'));
    await page.screenshot({ path: out, clip: { x: 0, y: 0, width: w, height: h } });
    console.log(`rendered diagrams/${file.replace(/\.svg$/, '.png')} (${w * 2}x${h * 2})`);
  }
} finally {
  await browser.close();
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
