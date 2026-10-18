// Builds the two-page summary PDF from 00-executive-summary.md with the same print styles.
// Before printing it checks that the summary agrees with the source documents:
//   - requirement IDs, wording and priority match the BRD exactly;
//   - risk IDs and ratings, and success measure targets, match the BRD;
//   - every count matches the generated traceability matrix.
// After printing it fails if the PDF is longer than two pages or if any repository link
// in it would not resolve once the repository is published.
// Usage: node pdf/build-summary.mjs   (run from the tools folder)
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  root, build, esc, readCss, repoUrl, renderMarkdown, fileUrl, printPdf, pdfPageCount, checkOverflow, checkPdfLinks
} from './common.mjs';

const SRC = '00-executive-summary.md';
const OUT = resolve(root, 'council-minutes-assistant-ba-summary.pdf');
const MAX_PAGES = 2;
const summary = readFileSync(resolve(root, SRC), 'utf8');
const brd = readFileSync(resolve(root, '01-business-requirements-document.md'), 'utf8');
const rtm = readFileSync(resolve(root, '04-traceability-matrix.md'), 'utf8');
const errors = [];

const rows = (text, re) => text.split('\n')
  .filter((l) => /^\|.*\|\s*$/.test(l))
  .map((l) => l.trim().slice(1, -1).split('|').map((c) => c.trim().replace(/\*\*/g, '')))
  .filter((r) => re.test(r[0]));

// 1. Requirements: exact wording and priority from the BRD headings.
const brdReq = new Map();
for (const m of brd.matchAll(/^#### ((?:FR|NFR)-\d{2}) (.+)\n\n\*\*Priority:\*\* (\w+)\./gm)) brdReq.set(m[1], { text: m[2].trim(), priority: m[3] });
const reqRows = rows(summary, /^(?:FR|NFR)-\d{2}$/);
if (reqRows.length < 8 || reqRows.length > 10) errors.push(`summary lists ${reqRows.length} requirements; expected 8 to 10`);
for (const [id, text, priority] of reqRows) {
  const b = brdReq.get(id);
  if (!b) { errors.push(`${id} is not defined in the BRD`); continue; }
  if (b.text !== text) errors.push(`${id} wording differs from the BRD:\n      summary: ${text}\n      BRD:     ${b.text}`);
  if (b.priority !== priority) errors.push(`${id} priority ${priority} differs from the BRD (${b.priority})`);
}
const brdBr = new Set(rows(brd, /^BR-\d{2}$/).map((r) => r[0]));
for (const id of new Set(summary.match(/\bBR-\d{2}\b/g) || [])) if (!brdBr.has(id)) errors.push(`${id} is not in the BRD`);

// 2. Risks: same rating as the BRD risk register.
const brdRisks = new Map(rows(brd, /^R-\d{2}$/).map((r) => [r[0], r[5]]));
for (const [cell] of rows(summary, /^R-\d{2} /)) {
  const id = cell.slice(0, 4);
  const rating = (cell.match(/rated (High|Medium|Low)/) || [])[1];
  if (!brdRisks.has(id)) errors.push(`${id} is not in the BRD risk register`);
  else if (rating !== brdRisks.get(id)) errors.push(`${id} is rated ${rating} in the summary but ${brdRisks.get(id)} in the BRD`);
}

// 3. Success measures: every percentage in a target also appears in the BRD row for that measure.
const brdSm = new Map(rows(brd, /^SM-\d{2} \(BR-\d{2}\)$/).map((r) => [r[0].slice(0, 5), r.join(' ')]));
for (const r of rows(summary, /^SM-\d{2} /)) {
  const id = r[0].slice(0, 5);
  if (!brdSm.has(id)) { errors.push(`${id} is not in the BRD`); continue; }
  for (const pct of r[1].match(/\d+%/g) || []) if (!brdSm.get(id).includes(pct)) errors.push(`${id} target ${pct} is not in the BRD`);
}

// 4. Counts: must match the generated traceability matrix.
const cov = new Map(rows(rtm, /./).map((r) => [r[0], r[1]]));
const num = (label, re) => {
  const m = (cov.get(label) || '').match(re);
  if (!m) throw new Error(`Could not read "${label}" from 04-traceability-matrix.md`);
  return m.slice(1).map(Number);
};
const [fr, frd] = num('Functional requirements (detailed)', /(\d+) \((\d+)\)/);
const [nfr, nfrd] = num('Non-functional requirements (detailed)', /(\d+) \((\d+)\)/);
const [sr] = num('Stakeholder requirements', /(\d+)/);
const [tr] = num('Transition requirements', /(\d+)/);
const [stories, points, r1s, r1p] = num('User stories (points)', /(\d+) \((\d+)\); Release 1: (\d+) stories, (\d+) points/);
const [tests, high, medium] = num('UAT test cases', /(\d+) \((\d+) High, (\d+) Medium\)/);
const [checks] = num('Project A automated checks', /(\d+)/);
const verified = rtm.match(/- (\d+) of (\d+) detailed requirements are verified directly/);
const epics = new Set([...readFileSync(resolve(root, '02-user-stories.md'), 'utf8').matchAll(/^\| (EP-\d{2}) \|/gm)].map((m) => m[1])).size;
const expected = [
  `${fr} functional (${frd} detailed), ${nfr} non-functional (${nfrd} detailed), ${sr} stakeholder and ${tr} transition requirements`,
  `${stories} user stories (${points} points) in ${epics} epics`,
  `Release 1 (MVP): ${r1s} stories, ${r1p} points`,
  `${tests} UAT test cases (${high} High, ${medium} Medium)`,
  `${checks} automated checks`,
  `every one of the ${fr + nfr} functional and non-functional requirements traces to a business requirement, at least one user story and at least one UAT test case`,
  `${verified[1]} of the ${verified[2]} detailed requirements are tested directly`
];
for (const e of expected) if (!summary.includes(e)) errors.push(`summary does not state: "${e}"`);

if (errors.length) {
  console.error(`Summary consistency check FAILED with ${errors.length} error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`consistency: ${reqRows.length} requirements, risks, success measures and ${expected.length} counts match the BRD and the generated matrix`);

// ---------------------------------------------------------------- render and print
const body = renderMarkdown(summary, {
  key: 'summary',
  // In the PDF every relative link becomes an absolute link into the published repository.
  rewriteHref: (href) => (!href || /^(https?:|mailto:)/.test(href) ? href : repoUrl(href.startsWith('#') ? `${SRC}${href}` : href)),
  renderImage: (src, alt) => `<img class="inline-figure" src="${fileUrl(src)}" alt="${esc(alt)}">`
});
const html = `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<title>St. John's Council Minutes Assistant: Two-Page Summary</title>
<meta name="author" content="Mostafa Rafiur Wasib">
<style>${readCss('print.css', 'summary.css')}</style>
</head>
<body>
<section class="summary">${body}</section>
</body>
</html>`;
const htmlPath = resolve(build, 'summary.html');
writeFileSync(htmlPath, html, 'utf8');
await checkOverflow(htmlPath, { portraitWidth: Math.floor((8.5 - 1.2) * 96) });
printPdf(htmlPath, OUT);

const pages = pdfPageCount(OUT);
if (pages > MAX_PAGES) {
  console.error(`summary PDF has ${pages} pages; the limit is ${MAX_PAGES}`);
  process.exit(1);
}
const links = checkPdfLinks(OUT);
if (links.errors.length) {
  for (const e of links.errors) console.error(`  repository link: ${e}`);
  process.exit(1);
}
console.log(`pdf: ${OUT.replace(root + '/', '')} (${pages} pages); ${links.checked.length} repository links resolve; external: ${links.external.join(', ') || 'none'}`);
