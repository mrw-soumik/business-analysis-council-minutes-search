// Builds the full business analysis pack as one PDF.
// 1. Renders the README introduction and the four documents from Markdown to HTML.
// 2. Checks every internal link, and that nothing is wider than the printable area.
// 3. Prints with headless Chrome (--print-to-pdf), finds each heading's page with pdftotext,
//    writes the page numbers into the contents page and prints again.
// 4. Checks that every repository link in the PDF points to a file or folder that will be published.
// Usage: node pdf/build-pdf.mjs   (run from the tools folder)
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  root, build, esc, readCss, repoUrl, renderMarkdown, fileUrl, printPdf, pageTexts, checkOverflow, checkPdfLinks
} from './common.mjs';

const OUT = resolve(root, 'council-minutes-assistant-ba-pack.pdf');
const css = readCss('print.css');

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

const internalLinks = [];
const allIds = new Set();
const tocEntries = []; // {id, text, level, part}

function rewriteFor(key) {
  return (href) => {
    if (!href || /^(https?:|mailto:)/.test(href)) return href;
    let out;
    if (href.startsWith('#')) out = `#${key}-${href.slice(1)}`;
    else {
      const [path, anchor] = href.split('#');
      if (docKeyByFile[path]) out = anchor ? `#${docKeyByFile[path]}-${anchor}` : `#${docKeyByFile[path]}-top`;
      else if (diagramIdByFile[path]) out = `#${diagramIdByFile[path]}`;
      else if (path === 'README.md') out = '#about-top';
      else return repoUrl(href);
    }
    internalLinks.push({ from: key, href, target: out.slice(1) });
    return out;
  };
}

function imageFor(src, alt) {
  const diagramId = diagramIdByFile[src];
  const note = diagramId ? `<span class="fullsize-note">Full-size version: <a href="#${diagramId}">page <span data-pageref="${diagramId}">00</span></a>.</span>` : '';
  return `<img class="inline-figure" src="${fileUrl(src)}" alt="${esc(alt)}">${note}`;
}

function render(source, key, { tocLevel, part }) {
  return renderMarkdown(source, {
    key,
    rewriteHref: rewriteFor(key),
    renderImage: imageFor,
    onHeading: ({ id, text, level }) => {
      allIds.add(id);
      if (level === 1 || level === tocLevel) tocEntries.push({ id, text, level, part });
    }
  });
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
  internalLinks.length = 0;

  const aboutHtml = render(extractAbout(readFileSync(resolve(root, 'README.md'), 'utf8')), 'about', { tocLevel: 99, part: 'about' });
  allIds.add('about-top');
  tocEntries.unshift({ id: 'about-top', text: 'About this pack', level: 1, part: 'about' });

  const parts = docs.map((d) => {
    const body = render(readFileSync(resolve(root, d.file), 'utf8'), d.key, { tocLevel: 2, part: d.key });
    allIds.add(`${d.key}-top`);
    return `<section class="doc" id="${d.key}-top"><div class="part-label">${esc(d.part)} &middot; ${esc(d.short)}</div>${body}</section>`;
  });

  allIds.add('appendix-diagrams');
  tocEntries.push({ id: 'appendix-diagrams', text: 'Appendix: Diagrams', level: 1, part: 'appendix' });
  const diagramPages = diagrams.map((d) => {
    allIds.add(d.id);
    tocEntries.push({ id: d.id, text: d.title, level: 2, part: 'appendix' });
    return `<section class="diagram-page" id="${d.id}">
      <h2 class="diagram-title">${esc(d.title)}</h2>
      <p class="diagram-note">${esc(d.note)} Source: <a href="${repoUrl(d.source)}">${esc(d.source)}</a>.</p>
      <div class="diagram-frame"><img src="${fileUrl(d.file)}" alt="${esc(d.title)}"></div>
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
      <tr><th>Version</th><td>0.9.1, complete draft for stakeholder validation</td></tr>
      <tr><th>Date</th><td>17 October 2026 (analysis); 18 October 2026 (Project A's measured results recorded)</td></tr>
      <tr><th>Method</th><td>BABOK Guide v3 requirements classification; BPMN 2.0; MoSCoW; INVEST and Gherkin; WCAG 2.1 AA</td></tr>
      <tr><th>Implementation</th><td>Project A: <a href="https://github.com/mrw-soumik/stjohns-council-minutes-rag">github.com/mrw-soumik/stjohns-council-minutes-rag</a></td></tr>
      <tr><th>Repository</th><td><a href="https://github.com/mrw-soumik/business-analysis-council-minutes-search">github.com/mrw-soumik/business-analysis-council-minutes-search</a></td></tr>
      <tr><th>Short version</th><td><a href="${repoUrl('council-minutes-assistant-ba-summary.pdf')}">Two-page summary (PDF)</a></td></tr>
    </table>
    <div class="cover-box">
      <div class="cover-box-title">Read it in five minutes</div>
      <ol>
        <li>BRD executive summary (Part 1, section 1)</li>
        <li>Current-state and future-state process maps (Diagrams 1 and 2)</li>
        <li>Requirements with acceptance criteria (Part 1, section 9)</li>
        <li>Stories US-05, US-07 and US-15 with Gherkin criteria (Part 2)</li>
        <li>Traceability and measured results: requirement to test to automated check (Part 4, sections 3 and 4)</li>
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

function checkInternalLinks() {
  const missing = internalLinks.filter((l) => !allIds.has(l.target));
  if (missing.length) {
    for (const l of missing) console.error(`  broken link in ${l.from}: ${l.href} -> #${l.target}`);
    throw new Error(`${missing.length} broken internal link(s)`);
  }
  console.log(`links: ${internalLinks.length} internal links checked, all resolve`);
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
    const needle = norm(e.text).slice(0, 48);
    let found = -1;
    for (let i = cursor; i < pages.length; i++) {
      if (pages[i].includes(needle)) { found = i; break; }
    }
    if (found < 0) throw new Error(`Heading not found in PDF text: "${e.text}"`);
    refs[e.id] = found + 1;
    cursor = found;
  }
  return { refs, pageCount: pages.length };
}

// ---------------------------------------------------------------- run
const htmlPath = resolve(build, 'pack.html');
const draftPdf = resolve(build, 'pack-pass1.pdf');

writeFileSync(htmlPath, buildHtml(), 'utf8');
checkInternalLinks();
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

// Any "(NN pages)" stated next to a link to the full pack must match the PDF.
const finalPages = pageTexts(OUT).length;
for (const file of ['README.md', '00-executive-summary.md']) {
  const text = readFileSync(resolve(root, file), 'utf8');
  for (const m of text.matchAll(/council-minutes-assistant-ba-pack\.pdf\)[^(\n]*\((\d+) pages\)/g)) {
    if (Number(m[1]) !== finalPages) throw new Error(`${file} says the full pack has ${m[1]} pages; it has ${finalPages}. Update the text and rebuild the summary.`);
  }
}
console.log(`page count: README and summary state ${finalPages} pages, matching the PDF`);

const links = checkPdfLinks(OUT);
if (links.errors.length) {
  for (const e of links.errors) console.error(`  repository link: ${e}`);
  throw new Error(`${links.errors.length} repository link(s) in the PDF would not resolve`);
}
console.log(`pdf links: ${links.checked.length} repository links resolve to published files or folders; ${links.external.length} external links`);
