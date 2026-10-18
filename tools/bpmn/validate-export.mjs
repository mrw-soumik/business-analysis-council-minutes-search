// Validates each .bpmn file by importing it with bpmn-js in headless Chrome,
// then exports the SVG from bpmn-js itself (so the image matches the model).
// Fails (exit code 1) on any import error or import warning.
// Usage: node bpmn/validate-export.mjs   (run from the tools folder)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchChrome } from '../lib/chrome.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const diagrams = resolve(here, '../../diagrams');
const viewerBundle = resolve(here, '../node_modules/bpmn-js/dist/bpmn-viewer.production.min.js');

const files = [
  {
    bpmn: 'current-state.bpmn',
    svg: 'current-state.svg',
    title: 'Current-state process map: finding what council decided (as-is)',
    desc: 'BPMN 2.0 collaboration with the information seeker, the eSCRIBE portal and City staff lanes, annotated with pain points PP-01 to PP-05.'
  },
  {
    bpmn: 'future-state.bpmn',
    svg: 'future-state.svg',
    title: 'Future-state process map: finding what council decided with the Council Minutes Assistant (to-be)',
    desc: 'BPMN 2.0 collaboration with City staff, the user, the assistant (answer service and ingestion pipeline lanes) and the eSCRIBE portal.'
  }
];

const xmlEscape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function addBackgroundAndTitle(svg, title, desc) {
  const open = svg.match(/<svg[^>]*>/);
  if (!open) throw new Error('No <svg> root found in export');
  const vb = open[0].match(/viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/);
  if (!vb) throw new Error('No viewBox in exported SVG');
  const [, x, y, w, h] = vb;
  const rootWithA11y = open[0].replace('<svg ', '<svg role="img" aria-labelledby="diagram-title diagram-desc" ');
  const insert =
    `<title id="diagram-title">${xmlEscape(title)}</title>` +
    `<desc id="diagram-desc">${xmlEscape(desc)}</desc>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#ffffff"/>`;
  return svg.replace(open[0], rootWithA11y + insert);
}

const browser = await launchChrome();
let failed = false;
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 2200, height: 1600 });
  await page.setContent('<!doctype html><html><body style="margin:0"><div id="canvas" style="width:2000px;height:1400px"></div></body></html>');
  await page.addScriptTag({ path: viewerBundle });

  for (const f of files) {
    const xml = readFileSync(resolve(diagrams, f.bpmn), 'utf8');
    const result = await page.evaluate(async (xmlText) => {
      const container = document.getElementById('canvas');
      container.innerHTML = '';
      // eslint-disable-next-line no-undef
      const viewer = new BpmnJS({ container });
      try {
        const { warnings } = await viewer.importXML(xmlText);
        const registry = viewer.get('elementRegistry');
        const textRenderer = viewer.get('textRenderer');
        const counts = {};
        const legibility = [];
        const intersects = (a, b) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
        for (const el of registry.getAll()) {
          counts[el.type] = (counts[el.type] || 0) + 1;
          const gfx = registry.getGraphics(el);
          const visual = gfx && gfx.querySelector('.djs-visual');
          if (!visual) continue;
          const bo = el.businessObject || {};

          // 1. External labels must not wrap into more lines than a 90 px layout.
          if (el.type === 'label' && bo.name) {
            const rendered = visual.querySelectorAll('tspan').length;
            const probe = textRenderer.createText(bo.name, { box: { width: 90, height: 30 }, style: textRenderer.getExternalStyle() });
            const expected = probe.querySelectorAll('tspan').length;
            if (rendered > expected) legibility.push(`label of ${bo.id} wraps into ${rendered} lines instead of ${expected}: "${bo.name}"`);
            continue;
          }

          // 2. Typed tasks: at most 3 lines, and the type icon must not touch the text.
          if (/Task$/.test(el.type) && el.type !== 'bpmn:Task') {
            const tspans = [...visual.querySelectorAll('text tspan')];
            if (tspans.length > 3) legibility.push(`${el.id} label uses ${tspans.length} lines (max 3)`);
            const icons = [...visual.children].filter((c) => c.tagName === 'path' || c.tagName === 'circle');
            for (const icon of icons) {
              const ir = icon.getBoundingClientRect();
              for (const t of tspans) {
                if (intersects(ir, t.getBoundingClientRect())) {
                  legibility.push(`${el.id}: task-type icon overlaps text "${t.textContent.trim()}"`);
                }
              }
            }
          }

          // 3. Text annotations: text must fit inside the bracket height.
          if (el.type === 'bpmn:TextAnnotation') {
            const text = visual.querySelector('text');
            if (text) {
              const tr = text.getBoundingClientRect();
              const br = visual.getBoundingClientRect();
              if (tr.height > el.height + 2) legibility.push(`${el.id}: annotation text (${Math.round(tr.height)} px) taller than box (${el.height} px)`);
              if (tr.bottom > br.bottom + 2) legibility.push(`${el.id}: annotation text overflows its box`);
            }
          }
        }
        const { svg } = await viewer.saveSVG();
        viewer.destroy();
        return { ok: true, warnings: warnings.map((w) => String(w.message || w)), legibility: [...new Set(legibility)], counts, svg };
      } catch (err) {
        return { ok: false, error: String((err && err.message) || err), warnings: ((err && err.warnings) || []).map((w) => String(w.message || w)) };
      }
    }, xml);

    if (!result.ok || result.warnings.length) {
      failed = true;
      console.error(`FAIL ${f.bpmn}: ${result.error || ''}`);
      for (const w of result.warnings) console.error(`  warning: ${w}`);
      continue;
    }
    if (result.legibility.length) {
      failed = true;
      console.error(`FAIL ${f.bpmn}: ${result.legibility.length} legibility issue(s)`);
      for (const issue of result.legibility) console.error(`  ${issue}`);
    }
    writeFileSync(resolve(diagrams, f.svg), addBackgroundAndTitle(result.svg, f.title, f.desc), 'utf8');
    const summary = Object.entries(result.counts)
      .filter(([t]) => !t.startsWith('label') && t !== 'bpmn:Collaboration')
      .map(([t, n]) => `${t.replace('bpmn:', '')}=${n}`)
      .join(', ');
    console.log(`OK   ${f.bpmn}: imported by bpmn-js with 0 warnings; exported ${f.svg}`);
    console.log(`     elements: ${summary}`);
  }
} finally {
  await browser.close();
}
if (failed) process.exit(1);
