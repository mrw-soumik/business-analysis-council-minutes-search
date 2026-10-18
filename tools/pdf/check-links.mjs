// Checks that every link in the published Markdown files and in both PDFs resolves to the
// intended file, folder or heading once the repository is published as
// github.com/mrw-soumik/business-analysis-council-minutes-search (branch main).
//   - Markdown: relative links and images are resolved against the repository root;
//     #anchors are checked against GitHub's heading slugs.
//   - PDFs: every github.com link into this repository must use blob/ for files and tree/ for
//     folders on branch main, point to a path that exists and is not ignored by git, and use
//     a valid heading anchor.
// External links (other sites) are listed but not fetched.
// Usage: node pdf/check-links.mjs   (run from the tools folder)
import { resolve } from 'node:path';
import { root, checkMarkdownLinks, checkPdfLinks } from './common.mjs';

const markdown = [
  'README.md',
  '00-executive-summary.md',
  '01-business-requirements-document.md',
  '02-user-stories.md',
  '03-uat-test-plan.md',
  '04-traceability-matrix.md'
];
const pdfs = ['council-minutes-assistant-ba-summary.pdf', 'council-minutes-assistant-ba-pack.pdf'];

let errors = 0;
const external = new Set();
for (const file of markdown) {
  const results = checkMarkdownLinks(file);
  const bad = results.filter((r) => r.error);
  results.filter((r) => r.external).forEach((r) => external.add(r.href));
  errors += bad.length;
  for (const r of bad) console.error(`  ${file}: ${r.href} -> ${r.error}`);
  console.log(`${bad.length ? 'FAIL' : 'OK  '} ${file}: ${results.filter((r) => !r.external).length} relative links and images`);
}
for (const file of pdfs) {
  const { checked, external: ext, errors: errs } = checkPdfLinks(resolve(root, file));
  ext.forEach((u) => external.add(u));
  errors += errs.length;
  for (const e of errs) console.error(`  ${file}: ${e}`);
  console.log(`${errs.length ? 'FAIL' : 'OK  '} ${file}: ${checked.length} repository links`);
}
console.log(`external links (not fetched): ${external.size}`);
for (const u of [...external].sort()) console.log(`  ${u}`);
if (errors) {
  console.error(`${errors} link problem(s)`);
  process.exit(1);
}
