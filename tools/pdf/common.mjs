// Shared helpers for the PDF builds (full pack and two-page summary) and the link check.
import { readFileSync, existsSync, rmSync, mkdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { inflateSync } from 'node:zlib';
import MarkdownIt from 'markdown-it';
import GithubSlugger from 'github-slugger';
import { launchChrome, CHROME_PATH } from '../lib/chrome.mjs';

const here = dirname(fileURLToPath(import.meta.url));
export const root = resolve(here, '../..');
export const build = resolve(root, 'tools/build');
mkdirSync(build, { recursive: true });

export const REPO_SLUG = 'mrw-soumik/business-analysis-council-minutes-search';
export const REPO_WEB = `https://github.com/${REPO_SLUG}`;
export const BRANCH = 'main';

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function readCss(...names) {
  return names.map((n) => readFileSync(resolve(here, n), 'utf8')).join('\n');
}

// GitHub URL for a repository path: blob for files, tree for folders. Keeps any #anchor.
export function repoUrl(pathWithAnchor) {
  const [path, anchor] = pathWithAnchor.split('#');
  const clean = path.replace(/\/$/, '');
  const abs = resolve(root, clean);
  const isDir = existsSync(abs) && statSync(abs).isDirectory();
  return `${REPO_WEB}/${isDir ? 'tree' : 'blob'}/${BRANCH}/${clean}${anchor ? `#${anchor}` : ''}`;
}

const ID_CELL = /^(?:BR|SR|FR|NFR|TR|BRL|US|UAT|PA|PP|F|OQ|R|A|C|D|DQ|ST|SM|OBJ|EP|Q|P)-\d{2}(?:\.\d+)?(?: \(BR-\d{2}\))?$/;
const NOBREAK = /\bSJMC-R-\d{4}-\d{2}-\d{2}\/\d+|\b(?:BR|SR|FR|NFR|TR|BRL|US|UAT|PA|PP|OQ|DQ|ST|SM|OBJ|EP|CMA-BA)-\d{2}(?:\.\d+)?\b|\b\d{4}-\d{2}-\d{2}\b|\b(?:Must|Should|Could)\b(?= *$)/g;

// Keep IDs, resolution numbers, ISO dates and MoSCoW values on one line; keep short headers unbroken.
function polishHtml(html) {
  let out = html.replace(/<td>([^<]{1,24})<\/td>/g, (m0, txt) => (ID_CELL.test(txt.trim()) ? `<td class="id">${txt}</td>` : m0));
  out = out.replace(/<th>([^<]{1,14})<\/th>/g, '<th class="nw">$1</th>');
  out = out.replace(/>([^<]+)</g, (m0, txt) => '>' + txt.replace(NOBREAK, '<span class="nb">$&</span>') + '<');
  return out;
}

// Markdown renderer with GitHub-compatible heading IDs (prefixed by key) and hooks for links and images.
export function renderMarkdown(source, { key, rewriteHref, renderImage, onHeading }) {
  const slugger = new GithubSlugger();
  const md = new MarkdownIt({ html: true, linkify: false, typographer: false });
  md.core.ruler.push('heading_ids', (state) => {
    const t = state.tokens;
    for (let i = 0; i < t.length; i++) {
      if (t[i].type !== 'heading_open') continue;
      const text = t[i + 1].children.map((c) => c.content).join('');
      const id = `${key}-${slugger.slug(text)}`;
      t[i].attrSet('id', id);
      if (onHeading) onHeading({ id, text, level: Number(t[i].tag.slice(1)) });
    }
  });
  const linkOpen = md.renderer.rules.link_open || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    tokens[idx].attrSet('href', rewriteHref(tokens[idx].attrGet('href')));
    return linkOpen(tokens, idx, options, env, self);
  };
  md.renderer.rules.image = (tokens, idx) => {
    const tok = tokens[idx];
    return renderImage(tok.attrGet('src'), tok.children.map((c) => c.content).join(''));
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
  const src = source
    .replace(/<!-- toc -->[\s\S]*?<!-- \/toc -->\n?/g, '')
    .replace(/<!-- pdf:landscape -->/g, '<div class="landscape-block">')
    .replace(/<!-- \/pdf:landscape -->/g, '</div>');
  return polishHtml(md.render(src));
}

export const fileUrl = (path) => pathToFileURL(resolve(root, path)).href;

export function printPdf(htmlPath, pdfPath) {
  const profile = resolve(build, 'chrome-profile');
  rmSync(profile, { recursive: true, force: true });
  rmSync(pdfPath, { force: true });
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

export function pageTexts(pdfPath) {
  const txt = execFileSync('pdftotext', ['-enc', 'UTF-8', pdfPath, '-'], { maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
  const pages = txt.split('\f').map((p) => p.replace(/\s+/g, ' ').toLowerCase());
  if (pages.length && pages[pages.length - 1].trim() === '') pages.pop();
  return pages;
}

export function pdfPageCount(pdfPath) {
  const info = execFileSync('pdfinfo', [pdfPath]).toString('utf8');
  return Number(info.match(/^Pages:\s+(\d+)/m)[1]);
}

// Fails if a table, code block or inline figure is wider than the printable area.
export async function checkOverflow(htmlPath, { portraitWidth = 682, landscapeWidth = 950 } = {}) {
  const browser = await launchChrome();
  try {
    const page = await browser.newPage();
    await page.emulateMediaType('print');
    const problems = [];
    for (const [width, inWide] of [[portraitWidth, false], [landscapeWidth, true]]) {
      await page.setViewport({ width, height: 1000 });
      await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
      problems.push(...await page.evaluate((wide) => {
        const out = [];
        const limit = document.documentElement.clientWidth + 1;
        for (const el of document.querySelectorAll('table, pre, img.inline-figure')) {
          if (el.closest('.diagram-page, .cover')) continue;
          if (Boolean(el.closest('.landscape-block')) !== wide) continue;
          const r = el.getBoundingClientRect();
          if (r.right > limit || el.scrollWidth > el.clientWidth + 1) {
            const sec = el.closest('section');
            const head = el.previousElementSibling ? el.previousElementSibling.textContent.slice(0, 60) : '';
            out.push(`${el.tagName.toLowerCase()} in ${sec ? sec.id || sec.className : '?'}${wide ? ' (landscape)' : ''} after "${head}" is ${Math.round(Math.max(r.right, el.scrollWidth))}px wide (limit ${limit - 1}px)`);
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

// ---------------------------------------------------------------- link checking
const slugCache = new Map();
// GitHub heading anchors of a Markdown file.
export function markdownAnchors(path) {
  if (slugCache.has(path)) return slugCache.get(path);
  const slugger = new GithubSlugger();
  const md = new MarkdownIt({ html: true });
  const anchors = new Set();
  const tokens = md.parse(readFileSync(resolve(root, path), 'utf8'), {});
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === 'heading_open') anchors.add(slugger.slug(tokens[i + 1].children.map((c) => c.content).join('')));
  }
  slugCache.set(path, anchors);
  return anchors;
}

function isIgnored(path) {
  try {
    execFileSync('git', ['-C', root, 'check-ignore', '-q', path], { stdio: 'ignore' });
    return true; // exit code 0 means ignored
  } catch {
    return false;
  }
}

// Checks that a repository path (with optional anchor) will exist once published.
export function checkRepoTarget(pathWithAnchor, { expectDir = null } = {}) {
  const [path, anchor] = pathWithAnchor.split('#');
  const clean = decodeURIComponent(path.replace(/\/$/, ''));
  const abs = resolve(root, clean);
  if (!clean || !existsSync(abs)) return `missing file or folder: ${clean || '(empty)'}`;
  const isDir = statSync(abs).isDirectory();
  if (expectDir === true && !isDir) return `expected a folder (tree URL) but ${clean} is a file`;
  if (expectDir === false && isDir) return `expected a file (blob URL) but ${clean} is a folder`;
  if (isIgnored(clean)) return `${clean} is ignored by git and would not be published`;
  if (anchor) {
    if (!clean.endsWith('.md')) return `anchor #${anchor} on a non-Markdown file ${clean}`;
    if (!markdownAnchors(clean).has(anchor)) return `anchor #${anchor} not found in ${clean}`;
  }
  return null;
}

// Relative links in a Markdown file (resolved against the repository root).
export function checkMarkdownLinks(path) {
  const md = new MarkdownIt({ html: true });
  const tokens = md.parse(readFileSync(resolve(root, path), 'utf8'), {});
  const results = [];
  const walk = (list) => {
    for (const t of list) {
      if (t.children) walk(t.children);
      const href = t.type === 'link_open' ? t.attrGet('href') : (t.type === 'image' ? t.attrGet('src') : null);
      if (!href) continue;
      if (/^(https?:|mailto:)/.test(href)) { results.push({ href, external: true }); continue; }
      const target = href.startsWith('#') ? `${path}${href}` : href;
      results.push({ href, error: checkRepoTarget(target) });
    }
  };
  walk(tokens);
  return results;
}

// URIs of link annotations in a PDF (plain and compressed objects).
export function pdfUris(pdfPath) {
  const data = readFileSync(pdfPath);
  const chunks = [data.toString('latin1')];
  const raw = chunks[0];
  const streamRe = /stream\r?\n/g;
  let m;
  while ((m = streamRe.exec(raw))) {
    const start = m.index + m[0].length;
    const end = raw.indexOf('endstream', start);
    if (end < 0) break;
    try {
      chunks.push(inflateSync(data.subarray(start, end)).toString('latin1'));
    } catch {
      // not a Flate stream
    }
  }
  const uris = new Set();
  for (const c of chunks) {
    let i = c.indexOf('/URI (');
    while (i >= 0) {
      let j = i + 6;
      let s = '';
      while (j < c.length && c[j] !== ')') {
        if (c[j] === '\\') { s += c[j + 1]; j += 2; continue; }
        s += c[j++];
      }
      uris.add(s);
      i = c.indexOf('/URI (', j);
    }
  }
  return [...uris];
}

// Checks every repository URL in a PDF; returns {checked, external, errors}.
export function checkPdfLinks(pdfPath) {
  const prefix = `${REPO_WEB}/`;
  const checked = [];
  const external = [];
  const errors = [];
  for (const uri of pdfUris(pdfPath)) {
    if (!uri.startsWith(prefix)) { external.push(uri); continue; }
    const rest = uri.slice(prefix.length);
    const mm = rest.match(/^(blob|tree)\/([^/]+)\/(.+)$/);
    if (!mm) { if (rest === '' || rest === '/') { checked.push(uri); continue; } errors.push(`${uri}: not a blob or tree URL`); continue; }
    if (mm[2] !== BRANCH) errors.push(`${uri}: branch is ${mm[2]}, expected ${BRANCH}`);
    const err = checkRepoTarget(mm[3], { expectDir: mm[1] === 'tree' });
    if (err) errors.push(`${uri}: ${err}`);
    checked.push(uri);
  }
  return { checked, external, errors };
}
