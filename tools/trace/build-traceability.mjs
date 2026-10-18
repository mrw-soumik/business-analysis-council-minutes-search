// Builds traceability.csv and 04-traceability-matrix.md from the source documents
// and checks that every reference is valid and every requirement is covered.
// Sources of truth:
//   01-business-requirements-document.md  BR, SR, FR/NFR (and detailed IDs), TR, BRL
//   02-user-stories.md                    story summary (Satisfies) and story details (Verified by)
//   03-uat-test-plan.md                   UAT summary, UAT details, Project A checks (PA)
// Usage: node trace/build-traceability.mjs   (run from the tools folder). Exit code 1 on any error.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const read = (f) => readFileSync(resolve(root, f), 'utf8');

const brd = read('01-business-requirements-document.md');
const stories = read('02-user-stories.md');
const uat = read('03-uat-test-plan.md');

const errors = [];
const err = (m) => errors.push(m);

// ---------------------------------------------------------------- helpers
function tableRows(text) {
  return text
    .split('\n')
    .filter((l) => /^\|.*\|\s*$/.test(l) && !/^\|\s*-+/.test(l))
    .map((l) => l.trim().slice(1, -1).split('|').map((c) => c.trim().replace(/\*\*/g, '')));
}
const ids = (cell) => (cell.match(/\b(?:BR|SR|FR|NFR|TR|BRL|US|UAT|PA)-\d{2}(?:\.\d+)?\b/g) || []);
const parentOf = (id) => id.replace(/\.\d+$/, '');
const uniq = (arr) => [...new Set(arr)];
const byId = (a, b) => a.localeCompare(b, 'en', { numeric: true });

// ---------------------------------------------------------------- BRD
const req = new Map(); // id -> {id, type, text, priority, parent, traces, srs}
const brRows = tableRows(brd).filter((r) => /^BR-\d{2}$/.test(r[0]));
for (const r of brRows) req.set(r[0], { id: r[0], type: 'Business', text: r[1], priority: r[2] });

const srRows = tableRows(brd).filter((r) => /^SR-\d{2}$/.test(r[0]));
for (const r of srRows) req.set(r[0], { id: r[0], type: 'Stakeholder', stakeholder: r[1], text: r[2], priority: r[3], traces: ids(r[4]), satisfiedBy: ids(r[5]) });

const headingRe = /^#### ((?:FR|NFR)-\d{2}) (.+)$/gm;
let m;
while ((m = headingRe.exec(brd))) {
  const id = m[1];
  const after = brd.slice(m.index, m.index + 1200);
  const meta = after.match(/\*\*Priority:\*\* (Must|Should|Could)\. \*\*Traces to:\*\* ([^.]+)\. \*\*Stakeholder requirements:\*\* ([^.]+)\./);
  if (!meta) { err(`BRD: ${id} has no Priority/Traces line`); continue; }
  req.set(id, {
    id,
    type: id.startsWith('NFR') ? 'Non-functional' : 'Functional',
    text: m[2].trim(),
    priority: meta[1],
    traces: ids(meta[2]),
    srs: ids(meta[3])
  });
}
const subRows = tableRows(brd).filter((r) => /^(?:FR|NFR)-\d{2}\.\d+$/.test(r[0]));
for (const r of subRows) {
  const parent = parentOf(r[0]);
  if (!req.has(parent)) err(`BRD: detailed requirement ${r[0]} has no parent ${parent}`);
  if (req.has(r[0])) err(`BRD: duplicate ID ${r[0]}`);
  req.set(r[0], { id: r[0], type: req.get(parent)?.type, text: r[1], priority: r[2], parent, acceptance: r[3] });
}
const trRows = tableRows(brd).filter((r) => /^TR-\d{2}$/.test(r[0]));
for (const r of trRows) req.set(r[0], { id: r[0], type: 'Transition', text: r[1], priority: r[2], acceptance: r[3], owner: r[4] });
const brlRows = tableRows(brd).filter((r) => /^BRL-\d{2}$/.test(r[0]));

const topLevel = [...req.values()].filter((r) => /^(FR|NFR)-\d{2}$/.test(r.id)).sort((a, b) => byId(a.id, b.id));
const detailed = [...req.values()].filter((r) => /^(FR|NFR)-\d{2}\.\d+$/.test(r.id)).sort((a, b) => byId(a.id, b.id));

const expectTop = [...Array(7)].flatMap((_, i) => [`FR-0${i + 1}`, `NFR-0${i + 1}`]);
for (const id of expectTop) if (!req.has(id)) err(`BRD: shared requirement ${id} is missing`);
for (const id of ['BR-01', 'BR-02', 'BR-03']) if (!req.has(id)) err(`BRD: ${id} is missing`);

// ---------------------------------------------------------------- stories
const storyRows = tableRows(stories).filter((r) => /^US-\d{2}$/.test(r[0]));
const story = new Map();
for (const r of storyRows) {
  if (r.length !== 8) { err(`Stories: summary row ${r[0]} has ${r.length} columns`); continue; }
  story.set(r[0], { id: r[0], title: r[1], persona: r[2], epic: r[3], priority: r[4], points: Number(r[5]), release: r[6], satisfies: ids(r[7]) });
}
// details: heading then a table row with Priority | Estimate | Release | Satisfies | Verified by
const storyHeadRe = /^#### (US-\d{2}) (.+)$/gm;
const storyDetail = new Map();
while ((m = storyHeadRe.exec(stories))) {
  const block = stories.slice(m.index, m.index + 1500);
  const row = tableRows(block).find((r) => /^(Must|Should|Could)$/.test(r[0]));
  if (!row) { err(`Stories: ${m[1]} detail has no metadata row`); continue; }
  storyDetail.set(m[1], { priority: row[0], points: parseInt(row[1], 10), release: row[2], satisfies: ids(row[3]), verifiedBy: ids(row[4]) });
}

// ---------------------------------------------------------------- UAT and PA
const uatRows = tableRows(uat).filter((r) => /^UAT-\d{2}$/.test(r[0]));
const test = new Map();
for (const r of uatRows) {
  if (r.length !== 7) { err(`UAT: summary row ${r[0]} has ${r.length} columns`); continue; }
  test.set(r[0], { id: r[0], title: r[1], stories: ids(r[2]), reqs: ids(r[3]), type: r[4], priority: r[5], status: r[6] });
}
const uatHeadRe = /^### (UAT-\d{2}) (.+)$/gm;
const uatDetail = new Map();
while ((m = uatHeadRe.exec(uat))) {
  const block = uat.slice(m.index, m.index + 600);
  const meta = block.match(/\*\*Story:\*\* ([^\n]+?)\. \*\*Requirements:\*\* ([^\n]+?)\. \*\*Priority:\*\* (\w+)\. \*\*Status:\*\* ([^.\n]+)\./);
  if (!meta) { err(`UAT: ${m[1]} detail has no metadata line`); continue; }
  uatDetail.set(m[1], { title: m[2].trim(), stories: ids(meta[1]), reqs: ids(meta[2]), priority: meta[3], status: meta[4] });
}
const paRows = tableRows(uat).filter((r) => /^PA-\d{2}$/.test(r[0]));
const pa = new Map();
for (const r of paRows) pa.set(r[0], { id: r[0], check: r[1], reqs: ids(r[2]), threshold: r[3], uat: ids(r[4]), result: r[5] });

// ---------------------------------------------------------------- reference checks
const known = (id) => req.has(id) || story.has(id) || test.has(id) || pa.has(id);
for (const s of story.values()) {
  if (!s.satisfies.length) err(`${s.id} satisfies no requirement`);
  for (const id of s.satisfies) if (!req.has(id)) err(`${s.id} references unknown requirement ${id}`);
  const d = storyDetail.get(s.id);
  if (!d) { err(`${s.id} has no detail section`); continue; }
  if (d.priority !== s.priority) err(`${s.id}: priority differs between summary (${s.priority}) and detail (${d.priority})`);
  if (d.points !== s.points) err(`${s.id}: points differ between summary and detail`);
  if (d.release !== s.release) err(`${s.id}: release differs between summary and detail`);
  if (d.satisfies.join() !== s.satisfies.join()) err(`${s.id}: Satisfies differs between summary and detail`);
  const testsForStory = [...test.values()].filter((t) => t.stories.includes(s.id)).map((t) => t.id).sort(byId);
  if (!testsForStory.length) err(`${s.id} is not verified by any UAT test case`);
  if (d.verifiedBy.slice().sort(byId).join() !== testsForStory.join()) err(`${s.id}: "Verified by" (${d.verifiedBy.join(', ')}) differs from UAT plan (${testsForStory.join(', ')})`);
}
for (const t of test.values()) {
  if (!t.stories.length) err(`${t.id} references no story`);
  for (const id of t.stories) if (!story.has(id)) err(`${t.id} references unknown story ${id}`);
  for (const id of t.reqs) if (!req.has(id)) err(`${t.id} references unknown requirement ${id}`);
  if (t.status !== 'Not run') err(`${t.id} status should be "Not run" (found "${t.status}")`);
  const d = uatDetail.get(t.id);
  if (!d) { err(`${t.id} has no detailed test case`); continue; }
  if (d.stories.join() !== t.stories.join()) err(`${t.id}: stories differ between summary and detail`);
  if (d.reqs.join() !== t.reqs.join()) err(`${t.id}: requirements differ between summary and detail`);
  if (d.priority !== t.priority) err(`${t.id}: priority differs between summary and detail`);
  // requirements tested should be satisfied by at least one of the test's stories (or be a quality gate)
  for (const rid of t.reqs) {
    const covered = t.stories.some((sid) => story.get(sid)?.satisfies.some((x) => x === rid || parentOf(x) === parentOf(rid)));
    if (!covered) err(`${t.id}: requirement ${rid} is not satisfied by its stories ${t.stories.join(', ')}`);
  }
}
for (const p of pa.values()) {
  if (!p.reqs.length) err(`${p.id} references no requirement`);
  for (const id of p.reqs) if (!req.has(id)) err(`${p.id} references unknown requirement ${id}`);
  for (const id of p.uat) if (!test.has(id)) err(`${p.id} references unknown UAT case ${id}`);
  if (p.result !== 'Pending') err(`${p.id} result should be "Pending" until Project A publishes results`);
}
for (const s of srRows) for (const id of [...ids(s[4]), ...ids(s[5])]) if (!req.has(id)) err(`${s[0]} references unknown ${id}`);
for (const r of topLevel) {
  for (const id of r.traces) if (!/^BR-/.test(id) || !req.has(id)) err(`${r.id} traces to unknown business requirement ${id}`);
  for (const id of r.srs) if (!req.has(id)) err(`${r.id} references unknown stakeholder requirement ${id}`);
}
for (const r of brlRows) for (const id of ids(r[2])) if (!known(id)) err(`${r[0]} references unknown ${id}`);

// ---------------------------------------------------------------- derive links
const storiesFor = (rid, exact = false) => [...story.values()].filter((s) => s.satisfies.some((x) => (exact ? x === rid : x === rid || parentOf(x) === rid))).map((s) => s.id).sort(byId);
const testsFor = (rid, exact = false) => [...test.values()].filter((t) => t.reqs.some((x) => (exact ? x === rid : x === rid || parentOf(x) === rid))).map((t) => t.id).sort(byId);
const checksFor = (rid, exact = false) => [...pa.values()].filter((p) => p.reqs.some((x) => (exact ? x === rid : x === rid || parentOf(x) === rid))).map((p) => p.id).sort(byId);

const parentRows = topLevel.map((r) => {
  const s = storiesFor(r.id);
  const t = testsFor(r.id);
  const c = checksFor(r.id);
  if (!r.traces.length) err(`${r.id} traces to no business requirement`);
  if (!s.length) err(`${r.id} has no user story`);
  if (!t.length) err(`${r.id} has no UAT test case`);
  return { ...r, stories: s, tests: t, checks: c };
});
const detailRows = detailed.map((r) => ({
  ...r,
  traces: req.get(r.parent).traces,
  stories: storiesFor(r.id, true),
  tests: testsFor(r.id, true),
  checks: checksFor(r.id, true)
}));
const unverified = detailRows.filter((r) => !r.tests.length && !r.checks.length);

// ---------------------------------------------------------------- CSV
const csvCell = (v) => {
  const s = Array.isArray(v) ? v.join('; ') : String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const thresholdFor = (checkIds) => checkIds.map((id) => `${id}: ${pa.get(id).threshold}`);
const header = ['business_requirements', 'requirement_id', 'detailed_requirement_id', 'requirement_type', 'priority', 'requirement', 'stakeholder_requirements', 'user_stories', 'uat_test_cases', 'project_a_checks', 'acceptance_threshold', 'project_a_result'];
const lines = [header.join(',')];
for (const p of parentRows) {
  lines.push([p.traces, p.id, '', p.type, p.priority, p.text, p.srs, p.stories, p.tests, p.checks, thresholdFor(p.checks), p.checks.length ? 'Pending' : 'Not applicable (manual UAT only)'].map(csvCell).join(','));
  for (const d of detailRows.filter((x) => x.parent === p.id)) {
    lines.push([d.traces, d.parent, d.id, d.type, d.priority, d.text, '', d.stories, d.tests, d.checks, thresholdFor(d.checks), d.checks.length ? 'Pending' : (d.tests.length ? 'Not applicable (manual UAT only)' : 'Not yet verified')].map(csvCell).join(','));
  }
}
writeFileSync(resolve(root, 'traceability.csv'), lines.join('\n') + '\n', 'utf8');

// ---------------------------------------------------------------- Markdown
const list = (a) => (a && a.length ? a.join(', ') : 'None');
const counts = {
  br: brRows.length,
  sr: srRows.length,
  fr: topLevel.filter((r) => r.type === 'Functional').length,
  frd: detailed.filter((r) => r.type === 'Functional').length,
  nfr: topLevel.filter((r) => r.type === 'Non-functional').length,
  nfrd: detailed.filter((r) => r.type === 'Non-functional').length,
  tr: trRows.length,
  brl: brlRows.length,
  stories: story.size,
  points: [...story.values()].reduce((a, s) => a + s.points, 0),
  r1: [...story.values()].filter((s) => s.release === 'R1'),
  r2: [...story.values()].filter((s) => s.release === 'R2'),
  tests: test.size,
  high: [...test.values()].filter((t) => t.priority === 'High').length,
  medium: [...test.values()].filter((t) => t.priority === 'Medium').length,
  checks: pa.size
};

const md = [];
md.push('# Requirements Traceability Matrix: St. John\'s Council Minutes Assistant');
md.push('');
md.push('> **Independent portfolio project.** Not affiliated with or endorsed by the City of St. John\'s. Source documents are © City of St. John\'s and are retrieved from the City\'s public meetings portal; this repository does not redistribute them.');
md.push('');
md.push('| Item | Value |');
md.push('|---|---|');
md.push('| Document ID | CMA-BA-04 |');
md.push('| Version | 0.9 (generated) |');
md.push('| Author | Mostafa Rafiur Wasib |');
md.push('| Date | 17 October 2026 |');
md.push('| Machine-readable version | [traceability.csv](traceability.csv) (one row per requirement and per detailed requirement) |');
md.push('| How it is produced | Generated by `tools/trace/build-traceability.mjs` from the BRD, the user stories and the UAT plan. The build fails if any reference is broken or any requirement is uncovered. Do not edit this file by hand. |');
md.push('');
md.push('<!-- toc -->');
md.push('**Contents**');
md.push('');
md.push('1. [How to read this matrix](#1-how-to-read-this-matrix)');
md.push('2. [Coverage summary](#2-coverage-summary)');
md.push('3. [Forward traceability](#3-forward-traceability)');
md.push('4. [Business requirement view](#4-business-requirement-view)');
md.push('5. [Backward traceability](#5-backward-traceability)');
md.push('6. [Detailed requirements without direct verification](#6-detailed-requirements-without-direct-verification)');
md.push('7. [Stakeholder requirements](#7-stakeholder-requirements)');
md.push('8. [Transition requirements](#8-transition-requirements)');
md.push('9. [Updating results from Project A](#9-updating-results-from-project-a)');
md.push('<!-- /toc -->');
md.push('');
md.push('## 1. How to read this matrix');
md.push('');
md.push('Each row follows one chain: **business requirement** (why) to **functional or non-functional requirement** (what and how well) to **user stories** (how it is delivered) to **UAT test cases** (how the business accepts it) to **Project A automated checks** (how it is measured on every build). Requirement IDs are defined in [01-business-requirements-document.md](01-business-requirements-document.md), stories in [02-user-stories.md](02-user-stories.md), and UAT cases and automated checks (PA-nn) in [03-uat-test-plan.md](03-uat-test-plan.md).');
md.push('');
md.push('**Result** shows the measured outcome from Project A. All results are **Pending** until Project A publishes its evaluation report. No result is claimed in this pack.');
md.push('');
md.push('## 2. Coverage summary');
md.push('');
md.push('| Item | Count |');
md.push('|---|---|');
md.push(`| Business requirements | ${counts.br} |`);
md.push(`| Stakeholder requirements | ${counts.sr} |`);
md.push(`| Functional requirements (detailed) | ${counts.fr} (${counts.frd}) |`);
md.push(`| Non-functional requirements (detailed) | ${counts.nfr} (${counts.nfrd}) |`);
md.push(`| Transition requirements | ${counts.tr} |`);
md.push(`| Business rules | ${counts.brl} |`);
md.push(`| User stories (points) | ${counts.stories} (${counts.points}); Release 1: ${counts.r1.length} stories, ${counts.r1.reduce((a, s) => a + s.points, 0)} points; Release 2: ${counts.r2.length} stories, ${counts.r2.reduce((a, s) => a + s.points, 0)} points |`);
md.push(`| UAT test cases | ${counts.tests} (${counts.high} High, ${counts.medium} Medium), all Not run |`);
md.push(`| Project A automated checks | ${counts.checks}, all Pending |`);
md.push('');
md.push('**Checks performed by the build (all passed):**');
md.push('');
md.push(`- Every one of the ${parentRows.length} functional and non-functional requirements traces to at least one business requirement, one user story and one UAT test case.`);
md.push(`- Every one of the ${counts.stories} user stories is verified by at least one UAT test case, and its "Verified by" list matches the UAT plan.`);
md.push('- Every UAT test case and automated check references valid stories and requirements, and each requirement a UAT case tests is satisfied by one of its stories.');
md.push('- Summary tables and detailed sections agree on priority, estimate, release and references.');
md.push(`- ${detailRows.length - unverified.length} of ${detailRows.length} detailed requirements are verified directly by a UAT case or an automated check. The other ${unverified.length} are listed in section 6 with how they are verified.`);
md.push('');
md.push('## 3. Forward traceability');
md.push('');
md.push('| Business requirement | Requirement | Priority | User stories | UAT test cases | Project A checks | Threshold | Result |');
md.push('|---|---|---|---|---|---|---|---|');
for (const p of parentRows) {
  const thr = p.checks.length ? p.checks.map((id) => `${id}: ${pa.get(id).threshold}`).join('; ') : 'Manual UAT only';
  md.push(`| ${list(p.traces)} | **${p.id}** ${p.text} | ${p.priority} | ${list(p.stories)} | ${list(p.tests)} | ${list(p.checks)} | ${thr} | ${p.checks.length ? 'Pending' : 'Not applicable'} |`);
}
md.push('');
md.push('## 4. Business requirement view');
md.push('');
md.push('| Business requirement | Functional requirements | Non-functional requirements | User stories | UAT test cases |');
md.push('|---|---|---|---|---|');
for (const br of brRows) {
  const reqs = parentRows.filter((p) => p.traces.includes(br[0]));
  const fr = reqs.filter((p) => p.type === 'Functional').map((p) => p.id);
  const nfr = reqs.filter((p) => p.type === 'Non-functional').map((p) => p.id);
  const st = uniq(reqs.flatMap((p) => p.stories)).sort(byId);
  const ts = uniq(reqs.flatMap((p) => p.tests)).sort(byId);
  md.push(`| **${br[0]}** ${br[1]} | ${list(fr)} | ${list(nfr)} | ${list(st)} | ${list(ts)} |`);
}
md.push('');
md.push('## 5. Backward traceability');
md.push('');
md.push('Read from right to left: each UAT case, the stories it accepts, and the requirements and business requirements behind them.');
md.push('');
md.push('| UAT test case | Priority | User stories | Requirements | Business requirements |');
md.push('|---|---|---|---|---|');
for (const t of [...test.values()].sort((a, b) => byId(a.id, b.id))) {
  const brs = uniq(t.reqs.flatMap((rid) => {
    const r = req.get(rid);
    if (!r) return [];
    if (r.parent) return req.get(r.parent).traces;
    if (r.traces) return r.traces.filter((x) => x.startsWith('BR-'));
    return [];
  })).sort(byId);
  md.push(`| **${t.id}** ${t.title} | ${t.priority} | ${list(t.stories)} | ${list(t.reqs)} | ${brs.length ? brs.join(', ') : 'Via TR-07 (support process)'} |`);
}
md.push('');
md.push('## 6. Detailed requirements without direct verification');
md.push('');
const notes = {
  'NFR-05.6': 'Could priority. Verified by a readability check of the question bank answers during UAT-04 review; not an exit criterion.',
  'NFR-06.5': 'Verified as a go-live condition: the ATIPP Coordinator confirms the processing arrangements before production use (TR-09).'
};
if (unverified.length) {
  md.push('These detailed requirements are not referenced directly by a UAT case or an automated check. Their parent requirement is covered, and the note says how each one is verified.');
  md.push('');
  md.push('| Detailed requirement | Priority | Requirement | How it is verified |');
  md.push('|---|---|---|---|');
  for (const d of unverified) md.push(`| ${d.id} | ${d.priority} | ${d.text} | ${notes[d.id] || 'To be assigned before UAT preparation.'} |`);
} else {
  md.push('None. Every detailed requirement is verified by a UAT case or an automated check.');
}
md.push('');
md.push('## 7. Stakeholder requirements');
md.push('');
md.push('| Stakeholder requirement | Stakeholder | Business requirements | Satisfied by | User stories |');
md.push('|---|---|---|---|---|');
for (const s of srRows) {
  const sat = ids(s[5]);
  const st = uniq(sat.flatMap((rid) => storiesFor(rid))).sort(byId);
  md.push(`| **${s[0]}** ${s[2]} | ${s[1]} | ${list(ids(s[4]))} | ${list(sat)} | ${list(st)} |`);
}
md.push('');
md.push('## 8. Transition requirements');
md.push('');
md.push('Transition requirements are verified through transition activities rather than product UAT, except where a story implements them.');
md.push('');
md.push('| Transition requirement | Priority | User stories | UAT test cases | Verified by |');
md.push('|---|---|---|---|---|');
for (const r of trRows) {
  const st = storiesFor(r[0]);
  const ts = testsFor(r[0]);
  md.push(`| **${r[0]}** ${r[1]} | ${r[2]} | ${list(st)} | ${list(ts)} | ${r[3]} |`);
}
md.push('');
md.push('## 9. Updating results from Project A');
md.push('');
md.push('1. When Project A publishes an evaluation report, record each measured value and the report version in the `project_a_result` column of `traceability.csv` and in the Result column of the UAT plan, section 14.');
md.push('2. Align the PA check IDs with the test names used in Project A if they differ.');
md.push('3. Re-run `npm run trace` in the `tools` folder to rebuild this matrix and repeat the coverage checks.');
md.push('');

if (errors.length) {
  console.error(`Traceability check FAILED with ${errors.length} error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
writeFileSync(resolve(root, '04-traceability-matrix.md'), md.join('\n'), 'utf8');
console.log('Traceability check passed.');
console.log(`  BR ${counts.br}, SR ${counts.sr}, FR ${counts.fr} (${counts.frd} detailed), NFR ${counts.nfr} (${counts.nfrd} detailed), TR ${counts.tr}, BRL ${counts.brl}`);
console.log(`  Stories ${counts.stories} (${counts.points} points; R1 ${counts.r1.length}/${counts.r1.reduce((a, s) => a + s.points, 0)}; R2 ${counts.r2.length}/${counts.r2.reduce((a, s) => a + s.points, 0)})`);
console.log(`  UAT ${counts.tests} (${counts.high} High, ${counts.medium} Medium); PA checks ${counts.checks}`);
console.log(`  Detailed requirements without direct verification: ${unverified.map((d) => d.id).join(', ') || 'none'}`);
console.log('  wrote traceability.csv and 04-traceability-matrix.md');
