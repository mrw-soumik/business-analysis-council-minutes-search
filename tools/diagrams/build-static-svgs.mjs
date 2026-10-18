// Generates the context diagram and the conceptual data model as standalone SVGs.
// White background so both read well on GitHub light and dark themes.
// Usage: node diagrams/build-static-svgs.mjs   (run from the tools folder)
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../../diagrams');

const C = {
  ink: '#1f2328',
  muted: '#57606a',
  line: '#3d444d',
  sysFill: '#f6f2fa',
  sysStroke: '#6a4c86',
  source: '#eef1f5',
  index: '#f6f2fa',
  interact: '#eef5f0',
  later: '#f6f6f6'
};
const FONT = 'Arial, Helvetica, sans-serif';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function wrap(text, maxChars) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const cand = line ? `${line} ${w}` : w;
    if (cand.length > maxChars && line) {
      lines.push(line);
      line = w;
    } else {
      line = cand;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function text(x, y, content, { size = 12, weight = 'normal', anchor = 'start', fill = C.ink, italic = false, lineHeight = 1.3 } = {}) {
  const lines = Array.isArray(content) ? content : [content];
  const style = italic ? ' font-style="italic"' : '';
  const tspans = lines
    .map((l, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : (size * lineHeight).toFixed(1)}">${esc(l)}</tspan>`)
    .join('');
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" fill="${fill}"${style}>${tspans}</text>`;
}

const defs = `<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="9.5" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" fill="${C.line}"/>
  </marker>
</defs>`;

function svgDoc(width, height, title, desc, body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="t d">
<title id="t">${esc(title)}</title>
<desc id="d">${esc(desc)}</desc>
${defs}
<rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff"/>
${body}
</svg>
`;
}

// ---------------------------------------------------------------------------
// Context diagram
// ---------------------------------------------------------------------------
function contextDiagram() {
  const W = 1240;
  const parts = [];
  parts.push(text(40, 46, 'Context diagram: St. John\'s Council Minutes Assistant', { size: 20, weight: 'bold' }));
  parts.push(text(40, 70, 'External entities and the information that flows between them and the solution. Arrows point to the receiver.', { size: 13, fill: C.muted }));

  // System (height follows its content)
  const sys = { x: 470, y: 110, w: 300 };
  const sysParts = [];
  sysParts.push(text(sys.x + sys.w / 2, sys.y + 38, ['St. John\'s Council', 'Minutes Assistant'], { size: 18, weight: 'bold', anchor: 'middle' }));
  sysParts.push(text(sys.x + sys.w / 2, sys.y + 90, 'Solution scope (built in Project A)', { size: 12, anchor: 'middle', fill: C.muted }));
  sysParts.push(`<line x1="${sys.x + 24}" y1="${sys.y + 106}" x2="${sys.x + sys.w - 24}" y2="${sys.y + 106}" stroke="${C.sysStroke}" stroke-width="1"/>`);
  const caps = [
    'Answers plain-language questions (FR-01)',
    'Cites meeting, date and page with a link (FR-02)',
    'Says "not found in the minutes" (FR-03)',
    'Filters by meeting date range (FR-04)',
    'Shows short source excerpts (FR-05)',
    'Hybrid keyword and semantic search (FR-06)',
    'Ingests new minutes on a schedule (FR-07)'
  ];
  let cy = sys.y + 132;
  for (const cap of caps) {
    const lines = wrap(cap, 31);
    sysParts.push(text(sys.x + 26, cy, '•', { size: 13 }));
    sysParts.push(text(sys.x + 40, cy, lines, { size: 13 }));
    cy += lines.length * 17 + 9;
  }
  sysParts.push(`<line x1="${sys.x + 24}" y1="${cy - 2}" x2="${sys.x + sys.w - 24}" y2="${cy - 2}" stroke="${C.sysStroke}" stroke-width="1"/>`);
  const scope = wrap('Data: Regular Council Meeting minutes published on eSCRIBE (portal coverage from July 2019)', 36);
  sysParts.push(text(sys.x + 26, cy + 20, scope, { size: 12, fill: C.muted }));
  sys.h = cy + 20 + (scope.length - 1) * 15.6 + 22 - sys.y;
  parts.push(`<rect x="${sys.x}" y="${sys.y}" width="${sys.w}" height="${Math.round(sys.h)}" rx="18" fill="${C.sysFill}" stroke="${C.sysStroke}" stroke-width="2.5"/>`);
  parts.push(...sysParts);
  const sysBottom = Math.round(sys.y + sys.h);

  // External entities
  const entity = (x, y, w, h, title, sub) => {
    parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#ffffff" stroke="${C.line}" stroke-width="1.8"/>`);
    const tl = wrap(title, 28);
    const total = tl.length * 18 + (sub ? 18 : 0);
    const ty = y + h / 2 - total / 2 + 14;
    parts.push(text(x + w / 2, ty, tl, { size: 14, weight: 'bold', anchor: 'middle', lineHeight: 1.25 }));
    if (sub) parts.push(text(x + w / 2, ty + tl.length * 18, sub, { size: 12, anchor: 'middle', fill: C.muted }));
  };
  const maintY = sysBottom + 100;
  entity(40, 150, 240, 100, 'Residents, journalists and community volunteers', 'Primary users');
  entity(40, 410, 240, 100, 'City staff answering enquiries', 'City Clerk\'s office and 311');
  entity(960, 150, 240, 100, 'Language model and embedding API', 'External service provider');
  entity(960, 410, 240, 100, 'eSCRIBE public meetings portal', 'Official record (City of St. John\'s)');
  entity(500, maintY, 240, 90, 'Maintainer', 'Product owner and developer');

  const arrow = (x1, y1, x2, y2) => parts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.line}" stroke-width="1.8" marker-end="url(#arrow)"/>`);
  const label = (x, y, lines, anchor = 'middle') => parts.push(text(x, y, lines, { size: 12, anchor, lineHeight: 1.25 }));

  // Residents
  arrow(280, 180, 470, 180); label(375, 170, 'Question, optional date range');
  arrow(470, 222, 280, 222); label(375, 241, ['Answer with citations and', 'excerpts, or "not found"']);
  // Staff
  arrow(280, 440, 470, 440); label(375, 430, 'Question about a decision');
  arrow(470, 482, 280, 482); label(375, 501, ['Answer with citations', 'and official links']);
  // Model provider
  arrow(770, 180, 960, 180); label(865, 156, ['Question and retrieved', 'passages (no identifiers)']);
  arrow(960, 222, 770, 222); label(865, 241, 'Draft answer, embeddings');
  // eSCRIBE
  arrow(770, 440, 960, 440); label(865, 430, 'Requests (max 1 per second)');
  arrow(960, 482, 770, 482); label(865, 501, ['Meeting list and minutes', '(PDF, HTML)']);
  // Maintainer
  const midY = (sysBottom + maintY) / 2;
  arrow(585, sysBottom, 585, maintY); label(575, midY - 4, ['Ingestion log, quality', 'report and alerts'], 'end');
  arrow(655, maintY, 655, sysBottom); label(665, midY - 4, ['Configuration and', 'corrections'], 'start');

  const noteY = maintY + 90 + 44;
  const note = wrap('Out of scope: Committee of the Whole and other committee minutes, agendas, attachments, video, records not published on eSCRIBE, and any change to eSCRIBE itself. The eSCRIBE portal remains the official record.', 140);
  parts.push(text(40, noteY, note, { size: 12, fill: C.muted }));
  const disclaimerY = noteY + note.length * 15.6 + 6;
  parts.push(text(40, disclaimerY, 'Independent portfolio project. Not affiliated with or endorsed by the City of St. John\'s.', { size: 12, fill: C.muted }));
  const H = Math.round(disclaimerY + 24);

  return svgDoc(W, H,
    'Context diagram for the St. John\'s Council Minutes Assistant',
    'The solution exchanges questions and answers with residents and City staff, retrieves minutes from the eSCRIBE portal, sends passages to a language model provider, and reports to a maintainer.',
    parts.join('\n'));
}

// ---------------------------------------------------------------------------
// Conceptual data model
// ---------------------------------------------------------------------------
function dataModel() {
  const W = 1400;
  const H = 880;
  const parts = [];
  parts.push(text(30, 42, 'Conceptual data model: St. John\'s Council Minutes Assistant', { size: 20, weight: 'bold' }));
  parts.push(text(30, 64, 'Business entities, key attributes and relationships. Conceptual level only: not a physical database design.', { size: 13, fill: C.muted }));

  const colX = [30, 390, 750, 1110];
  const rowY = [100, 380, 650];
  const EW = 260;
  const HEAD = 32;
  const LINE = 20;

  const boxes = {};
  const entity = (key, col, row, name, attrs, fill, { dashed = false } = {}) => {
    const x = colX[col];
    const y = rowY[row];
    const h = HEAD + attrs.length * LINE + 12;
    boxes[key] = { x, y, w: EW, h };
    const dash = dashed ? ' stroke-dasharray="7 5"' : '';
    parts.push(`<rect x="${x}" y="${y}" width="${EW}" height="${h}" rx="4" fill="#ffffff" stroke="${C.line}" stroke-width="1.8"${dash}/>`);
    parts.push(`<path d="M${x + 1},${y + HEAD} L${x + 1},${y + 4} Q${x + 1},${y + 1} ${x + 4},${y + 1} L${x + EW - 4},${y + 1} Q${x + EW - 1},${y + 1} ${x + EW - 1},${y + 4} L${x + EW - 1},${y + HEAD} z" fill="${fill}"/>`);
    parts.push(`<line x1="${x}" y1="${y + HEAD}" x2="${x + EW}" y2="${y + HEAD}" stroke="${C.line}" stroke-width="1.2"${dash}/>`);
    parts.push(text(x + 12, y + 21, name, { size: 14, weight: 'bold' }));
    attrs.forEach((a, i) => parts.push(text(x + 12, y + HEAD + 18 + i * LINE, a, { size: 12 })));
  };

  entity('meeting', 0, 0, 'Meeting', ['Meeting ID (eSCRIBE)', 'Meeting type', 'Meeting date and time', 'Location', 'Portal URL'], C.source);
  entity('document', 1, 0, 'Minutes document', ['Document ID (eSCRIBE)', 'Format (PDF or HTML)', 'Official URL', 'Retrieved at', 'Content hash (change detection)'], C.source);
  entity('page', 2, 0, 'Page', ['Page number (PDF only)', 'Extracted text (local cache only)', 'Deep link (URL#page=n)'], C.source);
  entity('item', 0, 1, 'Agenda item', ['Item number (for example 15.1)', 'Item title', 'Section heading'], C.source);
  entity('passage', 1, 1, 'Passage', ['Passage ID', 'Text (shown as 300 characters max)', 'Page number or item number', 'Keyword index terms', 'Embedding vector'], C.index);
  entity('motion', 0, 2, 'Motion (later release)', ['Resolution number (SJMC-R-...)', 'Motion text', 'Outcome (carried or defeated)', 'Votes for, against, abstaining'], C.later, { dashed: true });
  entity('citation', 1, 2, 'Citation', ['Rank (1 to 5)', 'Excerpt shown', 'Link to official document', 'Supports claim? (evaluation)'], C.interact);
  entity('answer', 2, 2, 'Answer', ['Outcome (answered or not found)', 'Answer text', 'Model name and version', 'Response time', 'Model cost (CAD)'], C.interact);
  entity('question', 3, 2, 'Question', ['Question text', 'Date range filter (optional)', 'Asked at (no user identifiers)'], C.interact);

  const b = boxes;
  const rel = (pts, m1, m1At, m2, m2At, verb, verbAt, verbAnchor = 'middle') => {
    const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ');
    parts.push(`<path d="${d}" fill="none" stroke="${C.line}" stroke-width="1.6"/>`);
    parts.push(text(m1At[0], m1At[1], m1, { size: 12, weight: 'bold', anchor: m1At[2] || 'start' }));
    parts.push(text(m2At[0], m2At[1], m2, { size: 12, weight: 'bold', anchor: m2At[2] || 'start' }));
    parts.push(text(verbAt[0], verbAt[1], verb, { size: 12, italic: true, anchor: verbAnchor, fill: C.muted }));
  };

  // Meeting 1 -- 0..* Minutes document
  const yMD = b.meeting.y + 62;
  rel([[b.meeting.x + EW, yMD], [b.document.x, yMD]], '1', [b.meeting.x + EW + 6, yMD - 6], '0..*', [b.document.x - 6, yMD - 6, 'end'], 'is recorded in', [(b.meeting.x + EW + b.document.x) / 2, yMD + 18]);
  // Minutes document 1 -- 0..* Page
  rel([[b.document.x + EW, yMD], [b.page.x, yMD]], '1', [b.document.x + EW + 6, yMD - 6], '0..*', [b.page.x - 6, yMD - 6, 'end'], 'has', [(b.document.x + EW + b.page.x) / 2, yMD + 18]);
  // Meeting 1 -- 0..* Agenda item
  const xMI = b.meeting.x + 130;
  rel([[xMI, b.meeting.y + b.meeting.h], [xMI, b.item.y]], '1', [xMI + 8, b.meeting.y + b.meeting.h + 18], '0..*', [xMI + 8, b.item.y - 8], 'lists', [xMI + 12, (b.meeting.y + b.meeting.h + b.item.y) / 2 + 4], 'start');
  // Minutes document 1 -- 1..* Passage
  const xDP = b.document.x + 130;
  rel([[xDP, b.document.y + b.document.h], [xDP, b.passage.y]], '1', [xDP + 8, b.document.y + b.document.h + 18], '1..*', [xDP + 8, b.passage.y - 8], 'is split into', [xDP + 12, (b.document.y + b.document.h + b.passage.y) / 2 + 4], 'start');
  // Page 0..1 -- 0..* Passage (elbow)
  const xP = b.page.x + 130;
  const yPP = b.passage.y + 40;
  rel([[xP, b.page.y + b.page.h], [xP, yPP], [b.passage.x + EW, yPP]], '0..1', [xP + 8, b.page.y + b.page.h + 18], '0..*', [b.passage.x + EW + 8, yPP - 8], 'contains', [xP - 10, yPP + 18, 'end'], 'end');
  // Agenda item 0..1 -- 0..* Passage
  const yIP = b.item.y + 62;
  rel([[b.item.x + EW, yIP], [b.passage.x, yIP]], '0..1', [b.item.x + EW + 6, yIP - 6], '0..*', [b.passage.x - 6, yIP - 6, 'end'], 'is described by', [(b.item.x + EW + b.passage.x) / 2, yIP + 18]);
  // Agenda item 1 -- 0..* Motion
  rel([[xMI, b.item.y + b.item.h], [xMI, b.motion.y]], '1', [xMI + 8, b.item.y + b.item.h + 18], '0..*', [xMI + 8, b.motion.y - 8], 'records', [xMI + 12, (b.item.y + b.item.h + b.motion.y) / 2 + 4], 'start');
  // Passage 1 -- 0..* Citation
  rel([[xDP, b.passage.y + b.passage.h], [xDP, b.citation.y]], '1', [xDP + 8, b.passage.y + b.passage.h + 18], '0..*', [xDP + 8, b.citation.y - 8], 'is cited by', [xDP + 12, (b.passage.y + b.passage.h + b.citation.y) / 2 + 4], 'start');
  // Answer 1 -- 0..* Citation
  const yAC = b.answer.y + 62;
  rel([[b.answer.x, yAC], [b.citation.x + EW, yAC]], '1', [b.answer.x - 6, yAC - 6, 'end'], '0..*', [b.citation.x + EW + 6, yAC - 6], 'is supported by', [(b.citation.x + EW + b.answer.x) / 2, yAC + 18]);
  // Question 1 -- 0..1 Answer
  rel([[b.question.x, yAC], [b.answer.x + EW, yAC]], '1', [b.question.x - 6, yAC - 6, 'end'], '0..1', [b.answer.x + EW + 6, yAC - 6], 'receives', [(b.answer.x + EW + b.question.x) / 2, yAC + 18]);

  // Legend
  const lx = colX[3];
  const ly = rowY[0];
  parts.push(`<rect x="${lx}" y="${ly}" width="${EW}" height="236" rx="4" fill="#ffffff" stroke="${C.muted}" stroke-width="1"/>`);
  parts.push(text(lx + 12, ly + 22, 'Legend', { size: 14, weight: 'bold' }));
  const sw = (y, fill, label, dashed = false) => {
    parts.push(`<rect x="${lx + 12}" y="${y - 12}" width="22" height="16" fill="${fill}" stroke="${C.line}" stroke-width="1"${dashed ? ' stroke-dasharray="4 3"' : ''}/>`);
    parts.push(text(lx + 42, y, label, { size: 12 }));
  };
  sw(ly + 50, C.source, 'Source record (public City data)');
  sw(ly + 74, C.index, 'Search index (derived data)');
  sw(ly + 98, C.interact, 'Interaction (no personal data)');
  sw(ly + 122, C.later, 'Later release candidate', true);
  parts.push(text(lx + 12, ly + 150, wrap('Multiplicity at each end: 1 = exactly one; 0..1 = zero or one; 0..* = zero or more; 1..* = one or more.', 40), { size: 12, fill: C.muted }));
  parts.push(text(lx + 12, ly + 204, wrap('Relationship labels read from the "1" end.', 40), { size: 12, fill: C.muted }));

  // Data handling note
  const ny = rowY[1];
  parts.push(`<rect x="${lx}" y="${ny}" width="${EW}" height="196" rx="4" fill="#ffffff" stroke="${C.muted}" stroke-width="1"/>`);
  parts.push(text(lx + 12, ny + 22, 'Data handling rules', { size: 14, weight: 'bold' }));
  const notes = [
    'Minutes text is cached locally for indexing and is not redistributed (BRL-05).',
    'Excerpts shown are 300 characters or fewer, with a link to the source (FR-05).',
    'Questions are stored without user identifiers (NFR-06).'
  ];
  let nyy = ny + 48;
  for (const n of notes) {
    const lines = wrap(n, 38);
    parts.push(text(lx + 12, nyy, '•', { size: 12 }));
    parts.push(text(lx + 24, nyy, lines, { size: 12 }));
    nyy += lines.length * 15.6 + 10;
  }

  parts.push(text(30, H - 22, 'Independent portfolio project. Not affiliated with or endorsed by the City of St. John\'s.', { size: 12, fill: C.muted }));

  return svgDoc(W, H,
    'Conceptual data model for the St. John\'s Council Minutes Assistant',
    'Entities Meeting, Minutes document, Page, Agenda item, Motion, Passage, Question, Answer and Citation with their key attributes and multiplicities.',
    parts.join('\n'));
}

writeFileSync(resolve(outDir, 'context-diagram.svg'), contextDiagram(), 'utf8');
writeFileSync(resolve(outDir, 'conceptual-data-model.svg'), dataModel(), 'utf8');
console.log('wrote diagrams/context-diagram.svg and diagrams/conceptual-data-model.svg');
