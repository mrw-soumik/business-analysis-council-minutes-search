// Builds the recruiter-friendly PDF of the full pack.
// 1. Renders the four documents (and the README "about" section) from Markdown to HTML.
// 2. Checks every internal link and every heading anchor.
// 3. Checks for content that would be clipped at print width (tables, code blocks).
// 4. Prints with headless Chrome (--print-to-pdf), finds each heading's page with pdftotext,
//    writes the page numbers into the contents page and prints again.
// Usage: node pdf/build-pdf.mjs   (run from the tools folder)
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import MarkdownIt from 'markdown-it';
import GithubSlugger from 'github-slugger';
import { launchChrome, CHROME_PATH } from '../lib/chrome.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const build = resolve(root, 'tools/build');
mkdirSync(build, { recursive: true });
const OUT = resolve(root, 'council-minutes-assistant-ba-pack.pdf');
const REPO_URL = 'https://github.com/mrw-soumik/business-analysis-council-minutes-search/blob/main/';
const css = readFileSync(resolve(here, 'print.css'), 'utf8');

const docs = [
  { key: 'brd', file: '01-business-requirements-document.md', part: 'Part 1', short: 'Business Requirements Document' },
  { key: 'stories', file: '02-user-stories.md', part: 'Part 2', short: 'User Stories and Release Plan' },
  { key: 'uat', file: '03-uat-test-plan.md', part: 'Part 3', short: 'User Acceptance Test Plan' },
  { key: 'rtm', file: '04-traceability-matrix.md', part: 'Part 4', short: 'Requirements Traceability Matrix' }
];
const docKeyByFile = Object.fromEntries(docs.map((d) => [d.file, d.key]));

const diagrams = [
  { id: 'diagram-current-state', file: 'diagrams/current-state.svg', title: 'Diagram 1. Current-state process map (as-is), BPMN 2.0', source: 'diagrams/current-state.bpmn', note: 'Pools: information seeker; eSCRIBE public meetings portal (black box); City of St. John\'s with lanes for the City Clerk\'s office and 311, and the ATIPP Coordinator. City lanes are assumptions to validate. Annotations PP-01 to PP-05 mark pain points (BRD section 7.4).' },
  { id: 'diagram-future-state', file: 'diagrams/future-state.svg', title: 'Diagram 2. Future-state process map (to-be), BPMN 2.0', source: 'diagrams/future-state.bpmn', note: 'Pools: City staff; resident, journalist or community volunteer; the assistant (answer service and ingestion pipeline lanes, sharing the minutes index); eSCRIBE portal (black box, unchanged). Annotations reference requirement IDs.' },
  { id: 'diagram-context', file: 'diagrams/context-diagram.svg', title: 'Diagram 3. Context diagram', source: 'diagrams/context-diagram.svg', note: 'External entities and the information exchanged with the solution (BRD section 4.4).' },
  { id: 'diagram-data-model', file: 'diagrams/conceptual-data-model.svg', title: 'Diagram 4. Conceptual data model', source: 'diagrams/conceptual-data-model.svg', note: 'Entities, key attributes and multiplicities (BRD section 10).' }
];
const diagramIdByFile = Object.fromEntries(diagrams.map((d) => [d.file, d.id]));

const ID_CELL = /^(?:BR|SR|FR|NFR|TR|BRL|US|UAT|PA|PP|F|OQ|R|A|C|D|DQ|ST|SM|OBJ|EP|Q|P)-\d{2}(?:\.\d+)?(?: \(BR-\d{2}\))?$/;
const NOBREAK = /\bSJMC-R-\d{4}-\d{2}-\d{2}\/\d+|\b(?:BR|SR|FR|NFR|TR|BRL|US|UAT|PA|PP|OQ|DQ|ST|SM|OBJ|EP|CMA-BA)-\d{2}(?:\.\d+)?\b|\b\d{4}-\d{2}-\d{2}\b|\b(?:Must|Should|Could)\b(?= *$)/g;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const brokenLinks = [];
const allIds = new Set();
const tocEntries = []; // {id, text, level, part}

function rewriteHref(href, key) {
  if (!href) return href;
  if (/^(https?:|mailto:)/.test(href)) return href;
  if (href.startsWith('#')) return `#${key}-${href.slice(1)}`;
  const [path, anchor] = href.split('#');
  if (docKeyByFile[path]) return anchor ? `#${docKeyByFile[path]}-${anchor}` : `#${docKeyByFile[path]}-top`;
  if (diagramIdByFile[path]) return `#${diagramIdByFile[path]}`;
  if (path === 'README.md') return '#about-top';
  return REPO_URL + path.replace(/\/$/, '');
}

function renderMarkdown(source, key, { tocLevel = 2, part = '' } = {}) {
  const slugger = new GithubSlugger();
  const md = new MarkdownIt({ html: true, linkify: false, typographer: false });
  md.core.ruler.push('heading_ids', (state) => {
    const t = state.tokens;
    for (let i = 0; i < t.length; i++) {
      if (t[i].type !== 'heading_open') continue;
      const text = t[i + 1].children.map((c) => c.content).join('');
      const id = `${key}-${slugger.slug(text)}`;
      t[i].attrSet('id', id);
      allIds.add(id);
      const level = Number(t[i].tag.slice(1));
      if (level === 1 || level === tocLevel) tocEntries.push({ id, text, level, part });
    }
  });
  const linkOpen = md.renderer.rules.link_open || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const href = tokens[idx].attrGet('href');
    const rewritten = rewriteHref(href, key);
    tokens[idx].attrSet('href', rewritten);
    if (rewritten.startsWith('#')) brokenLinks.push({ from: key, href, target: rewritten.slice(1) });
    return linkOpen(tokens, idx, options, env, self);
  };
  md.renderer.rules.image = (tokens, idx) => {
    const tok = tokens[idx];
    const src = tok.attrGet('src');
    const alt = tok.children.map((c) => c.content).join('');
    const abs = pathToFileURL(resolve(root, src)).href;
    const diagramId = diagramIdByFile[src];
    const note = diagramId ? `<span class="fullsize-note">Full-size version: <a href="#${diagramId}">page <span data-pageref="${diagramId}">00</span></a>.</span>` : '';
    return `<img class="inline-figure" src="${abs}" alt="${esc(alt)}">${note}`;
  };
  md.renderer.rules.fence = (tokens, idx) => {
    const tok = tokens[idx];
    const lang = (tok.info || '').trim();
    let body = esc(tok.content.replace(/\n$/, ''));
    if (lang === 'gherkin') {
      body = body.replace(/^(\s*)(Feature:|Scenario Outline:|Scenario:|Examples:|Background:|Given|When|Then|And|But)(?=\s|$)/gm, '$1<b class="kw">$2</b>');
    }
    return `<pre class="code ${esc(lang)}"><code>${body}</code></pre>\n`;
  };
  let src = source
    .replace(/<!-- toc -->[\s\S]*?<!-- \/toc -->\n?/g, '')
    .replace(/<!-- pdf:landscape -->/g, '<div class="landscape-block">')
    .replace(/<!-- \/pdf:landscape -->/g, '</div>');
  let html = md.render(src);
  html = html.replace(/<td>([^<]{1,24})<\/td>/g, (m0, txt) => (ID_CELL.test(txt.trim()) ? `<td class="id">${txt}</td>` : m0));
  html = html.replace(/<th>([^<]{1,14})<\/th>/g, '<th class="nw">$1</th>');
  // keep IDs, resolution numbers, ISO dates and MoSCoW values on one line (text nodes only)
  html = html.replace(/>([^<]+)</g, (m0, txt) => '>' + txt.replace(NOBREAK, '<span class="nb">$&</span>') + '<');
  return html;
}

// ---------------------------------------------------------------- assemble
function extractAbout(readme) {
  const m = readme.match(/<!-- pdf:start -->([\s\S]*?)<!-- pdf:end -->/);
  if (!m) throw new Error('README has no pdf:start/pdf:end section');
  return m[1];
}

function buildHtml(pageRefs = {}) {
  allIds.clear();
  tocEntries.length = 0;
  brokenLinks.length = 0;

  const aboutHtml = renderMarkdown(extractAbout(readFileSync(resolve(root, 'README.md'), 'utf8')), 'about', { tocLevel: 99, part: 'about' });
  allIds.add('about-top');
  tocEntries.unshift({ id: 'about-top', text: 'About this pack', level: 1, part: 'about' });

  const parts = docs.map((d) => {
    const body = renderMarkdown(readFileSync(resolve(root, d.file), 'utf8'), d.key, { tocLevel: 2, part: d.key });
    allIds.add(`${d.key}-top`);
    return `<section class="doc" id="${d.key}-top"><div class="part-label">${esc(d.part)} &middot; ${esc(d.short)}</div>${body}</section>`;
  });

  allIds.add('appendix-diagrams');
  tocEntries.push({ id: 'appendix-diagrams', text: 'Appendix: Diagrams', level: 1, part: 'appendix' });
  const diagramPages = diagrams.map((d) => {
    allIds.add(d.id);
    tocEntries.push({ id: d.id, text: d.title, level: 2, part: 'appendix' });
    const src = pathToFileURL(resolve(root, d.file)).href;
    return `<section class="diagram-page" id="${d.id}">
      <h2 class="diagram-title">${esc(d.title)}</h2>
      <p class="diagram-note">${esc(d.note)} Source: <a href="${REPO_URL}${d.source}">${esc(d.source)}</a>.</p>
      <div class="diagram-frame"><img src="${src}" alt="${esc(d.title)}"></div>
    </section>`;
  }).join('\n');

  const appendixIntro = `<section class="appendix-intro" id="appendix-diagrams">
    <div class="part-label">Appendix</div>
    <h1>Appendix: Diagrams</h1>
    <p>The four diagrams in this pack, each on its own landscape page so that labels stay readable. In the documents they appear at reduced size with a link to these pages.</p>
    <h3>How the BPMN models were checked</h3>
    <ul>
      <li>Generated as BPMN 2.0 XML with diagram interchange (DI) coordinates, so they open in bpmn.io and Camunda Modeler.</li>
      <li>Imported with bpmn-js in headless Chrome with zero import warnings, plus automated checks that no label wraps unexpectedly and no task-type icon overlaps its text.</li>
      <li>Linted with bpmnlint (recommended rules) with no findings, and validated against the official OMG BPMN 2.0 XML schema.</li>
      <li>The SVG images are exported by bpmn-js itself, so they match the models exactly.</li>
    </ul>
    <h3>Reading BPMN</h3>
    <table class="legend">
      <thead><tr><th>Symbol</th><th>Meaning</th></tr></thead>
      <tbody>
        <tr><td>Pool (large horizontal box)</td><td>A participant, such as the City or the assistant. A pool with no content is a "black box", here the eSCRIBE portal.</td></tr>
        <tr><td>Lane (band inside a pool)</td><td>A role or system component inside a participant.</td></tr>
        <tr><td>Thin circle / thick circle</td><td>Start event / end event. An envelope or clock inside marks a message or timer trigger.</td></tr>
        <tr><td>Rounded rectangle</td><td>A task. A person icon marks a user task, gears a service (system) task, an envelope a send task.</td></tr>
        <tr><td>Diamond with X</td><td>Exclusive gateway: exactly one outgoing path is taken. Unlabelled diamonds merge paths.</td></tr>
        <tr><td>Solid arrow / dashed arrow</td><td>Sequence flow within a pool / message flow between pools.</td></tr>
        <tr><td>Cylinder and dotted arrows</td><td>Data store (the minutes index) and the tasks that read or write it.</td></tr>
        <tr><td>Square bracket with text</td><td>Annotation, used for pain points (PP-nn) and requirement references.</td></tr>
      </tbody>
    </table>
  </section>`;

  // contents
  const tocHtml = tocEntries.map((e) => {
    const page = pageRefs[e.id] ?? '00';
    const cls = e.level === 1 ? 'toc-l1' : 'toc-l2';
    return `<div class="toc-entry ${cls}"><a href="#${e.id}">${esc(e.text)}</a><span class="leader"></span><span class="page" data-pageref="${e.id}">${page}</span></div>`;
  }).join('\n');

  const cover = `<section class="cover">
    <div class="cover-kicker">Business analysis work sample</div>
    <h1 class="cover-title">St. John's Council Minutes Assistant</h1>
    <div class="cover-subtitle">Business requirements, user stories, UAT plan and traceability for an AI service that answers questions about council decisions, with citations to the official minutes</div>
    <div class="cover-rule"></div>
    <table class="cover-meta">
      <tr><th>Author</th><td>Mostafa Rafiur Wasib</td></tr>
      <tr><th>Version</th><td>0.9, complete draft for stakeholder validation</td></tr>
      <tr><th>Date</th><td>17 October 2026</td></tr>
      <tr><th>Method</th><td>BABOK Guide v3 requirements classification; BPMN 2.0; MoSCoW; INVEST and Gherkin; WCAG 2.1 AA</td></tr>
      <tr><th>Implementation</th><td>Project A: <a href="https://github.com/mrw-soumik/stjohns-council-minutes-rag">github.com/mrw-soumik/stjohns-council-minutes-rag</a></td></tr>
      <tr><th>Repository</th><td><a href="https://github.com/mrw-soumik/business-analysis-council-minutes-search">github.com/mrw-soumik/business-analysis-council-minutes-search</a></td></tr>
    </table>
    <div class="cover-box">
      <div class="cover-box-title">Read it in five minutes</div>
      <ol>
        <li>BRD executive summary (Part 1, section 1)</li>
        <li>Current-state and future-state process maps (Diagrams 1 and 2)</li>
        <li>Requirements with acceptance criteria (Part 1, section 9)</li>
        <li>Stories US-05, US-07 and US-15 with Gherkin criteria (Part 2)</li>
        <li>Forward traceability: requirement to test to automated check (Part 4, section 3)</li>
      </ol>
    </div>
    <div class="cover-disclaimer">Independent portfolio project. Not affiliated with or endorsed by the City of St. John's. Source documents are &copy; City of St. John's and are retrieved from the City's public meetings portal; this pack does not redistribute them. Facts about the current state were checked on public City pages on 17 October 2026. No stakeholder interviews have taken place; assumptions are labelled.</div>
  </section>`;

  const about = `<section class="about" id="about-top"><div class="part-label">Introduction</div><h1>About this pack</h1>${aboutHtml}</section>`;

  return `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<title>St. John's Council Minutes Assistant: Business Analysis Pack</title>
<meta name="author" content="Mostafa Rafiur Wasib">
<meta name="description" content="Business requirements, user stories, UAT plan and traceability matrix for the St. John's Council Minutes Assistant.">
<style>${css}</style>
</head>
<body>
${cover}
<section class="contents"><h1>Contents</h1>${tocHtml}</section>
${about}
${parts.join('\n')}
${appendixIntro}
${diagramPages}
</body>
</html>`;
}

// ---------------------------------------------------------------- checks
function checkLinks() {
  const missing = brokenLinks.filter((l) => !allIds.has(l.target));
  if (missing.length) {
    for (const l of missing) console.error(`  broken link in ${l.from}: ${l.href} -> #${l.target}`);
    throw new Error(`${missing.length} broken internal link(s)`);
  }
  console.log(`links: ${brokenLinks.length} internal links checked, all resolve`);
}

async function checkOverflow(htmlPath) {
  const browser = await launchChrome();
  try {
    const page = await browser.newPage();
    await page.emulateMediaType('print');
    const problems = [];
    // Letter portrait content width: 8.5in - 1.4in margins = 7.1in = 681.6 CSS px.
    // Letter landscape content width: 11in - 1.1in margins = 9.9in = 950.4 CSS px.
    for (const [width, inWide] of [[682, false], [950, true]]) {
    await page.setViewport({ width, height: 1000 });
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
    problems.push(...await page.evaluate((inWide) => {
      const out = [];
      const limit = document.documentElement.clientWidth + 1;
      for (const el of document.querySelectorAll('table, pre, img.inline-figure')) {
        if (el.closest('.diagram-page, .cover')) continue;
        if (Boolean(el.closest('.landscape-block')) !== inWide) continue;
        const r = el.getBoundingClientRect();
        if (r.right > limit || el.scrollWidth > el.clientWidth + 1) {
          const sec = el.closest('section');
          const head = el.previousElementSibling ? el.previousElementSibling.textContent.slice(0, 60) : '';
          out.push(`${el.tagName.toLowerCase()} in ${sec ? sec.id : '?'}${inWide ? ' (landscape)' : ''} after "${head}" is ${Math.round(Math.max(r.right, el.scrollWidth))}px wide (limit ${limit - 1}px)`);
        }
      }
      return out;
    }, inWide));
    }
    if (problems.length) {
      for (const p of problems) console.error(`  overflow: ${p}`);
      throw new Error(`${problems.length} element(s) would be clipped at print width`);
    }
    console.log('layout: no table, code block or figure wider than the printable area');
  } finally {
    await browser.close();
  }
}

function printPdf(htmlPath, pdfPath) {
  const profile = resolve(build, 'chrome-profile');
  rmSync(profile, { recursive: true, force: true });
  execFileSync(CHROME_PATH, [
    '--headless',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${profile}`,
    '--no-pdf-header-footer',
    '--generate-pdf-document-outline',
    '--virtual-time-budget=10000',
    `--print-to-pdf=${pdfPath}`,
    pathToFileURL(htmlPath).href
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  if (!existsSync(pdfPath)) throw new Error('Chrome did not produce a PDF');
}

function pageTexts(pdfPath) {
  const txt = execFileSync('pdftotext', ['-enc', 'UTF-8', pdfPath, '-'], { maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
  return txt.split('\f').map((p) => p.replace(/\s+/g, ' ').toLowerCase());
}

function findPages(pdfPath) {
  const pages = pageTexts(pdfPath);
  const norm = (s) => s.replace(/\s+/g, ' ').toLowerCase().trim();
  // Start after the contents: the about page is the first page containing its first section heading.
  const aboutIdx = pages.findIndex((p, i) => i > 0 && p.includes('what this is'));
  if (aboutIdx < 0) throw new Error('Could not find the About page in the PDF text');
  const refs = { 'about-top': aboutIdx + 1 };
  let cursor = aboutIdx;
  for (const e of tocEntries) {
    if (e.id === 'about-top') continue;
    let needle = norm(e.text).slice(0, 48);
    if (e.part !== 'about' && e.level === 1 && e.part !== 'appendix') needle = norm(e.text).slice(0, 48);
    let found = -1;
    for (let i = cursor; i < pages.length; i++) {
      if (pages[i].includes(needle)) { found = i; break; }
    }
    if (found < 0) throw new Error(`Heading not found in PDF text: "${e.text}"`);
    refs[e.id] = found + 1;
    cursor = found;
  }
  return { refs, pageCount: pages.length - (pages[pages.length - 1].trim() === '' ? 1 : 0) };
}

// ---------------------------------------------------------------- run
const htmlPath = resolve(build, 'pack.html');
const draftPdf = resolve(build, 'pack-pass1.pdf');

writeFileSync(htmlPath, buildHtml(), 'utf8');
checkLinks();
await checkOverflow(htmlPath);

printPdf(htmlPath, draftPdf);
let { refs } = findPages(draftPdf);
for (let pass = 2; pass <= 3; pass++) {
  writeFileSync(htmlPath, buildHtml(refs).replace(/data-pageref="([^"]+)">00</g, (m0, id) => `data-pageref="${id}">${refs[id] ?? '?'}<`), 'utf8');
  printPdf(htmlPath, OUT);
  const check = findPages(OUT);
  const changed = Object.keys(check.refs).filter((k) => check.refs[k] !== refs[k]);
  refs = check.refs;
  if (!changed.length) {
    console.log(`pdf: ${OUT.replace(root + '/', '')} (${check.pageCount} pages), contents page numbers verified on pass ${pass}`);
    break;
  }
  if (pass === 3) throw new Error(`Page numbers did not settle: ${changed.join(', ')}`);
}
