#!/usr/bin/env node
// Checks pages on a PR's preview site and compares them with a base site.
//
// Usage: node preview-check.mjs /path [/path ...]
//
// Reads config.json next to this script, written by the review workflow:
//   { "previewUrl": "https://pr-12-site.pantheonsite.io",
//     "baseUrl": "https://dev-site.pantheonsite.io",   (optional)
//     "outDir": "/abs/path/.claude-review/preview" }
//
// For each path, on the preview and on the base: HTTP status, PHP and Drupal
// error messages in the page, console errors, failed requests to the same site,
// and serious or critical accessibility issues (axe-core, WCAG 2.x A and AA).
// It saves a full-page screenshot of the preview and writes report.md and
// report.json to outDir. Anything also found on the base is listed apart, as
// not caused by the PR.
//
// Only paths on the preview site are visited: each argument must start with
// a single "/". "/" is always checked. At most 9 paths.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const MAX_PATHS = 9;
const PAGE_TIMEOUT = 60_000;
const ERROR_TEXT = [
  /The website encountered an unexpected error/i,
  /\b(Fatal error|Parse error|Warning|Notice|Deprecated)\b: .{0,300}? in \S+ on line \d+/,
  /\b(Error|Exception|TypeError)\b: .{0,300}? in [^\s]+\.(php|module|inc|theme)\b/,
];

const config = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'config.json'), 'utf8'));
const preview = new URL(config.previewUrl);
const base = config.baseUrl ? new URL(config.baseUrl) : null;
mkdirSync(config.outDir, { recursive: true });

const paths = ['/'];
for (const arg of process.argv.slice(2)) {
  if (!/^\/(?!\/)[^\s]*$/.test(arg)) {
    console.error(`Skipped "${arg}": a path must start with a single "/".`);
  } else if (!paths.includes(arg)) {
    paths.push(arg);
  }
}
if (paths.length > MAX_PATHS) {
  console.error(`Checking the first ${MAX_PATHS} paths only.`);
  paths.length = MAX_PATHS;
}

// Messages differ between sites only by host; compare them without it. A site
// can redirect to another host (live to its own domain), so both are replaced.
const normalize = (text, hosts) =>
  hosts.reduce((t, h) => t.split(h).join('<host>'), text).replace(/\s+/g, ' ').trim().slice(0, 300);
// Errors that depend on the domain, not the code: third-party services that
// only accept requests from the production domain.
const ENVIRONMENT_ONLY = /blocked by CORS policy|ERR_BLOCKED_BY_RESPONSE|ERR_NAME_NOT_RESOLVED/;

async function checkPage(browser, site, path, screenshot) {
  const url = new URL(path, site).toString();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const result = { url, status: null, errors: [], console: [], environmentOnly: [], failedRequests: [], a11y: [] };
  const rawConsole = [];
  const hosts = () => [...new Set([site.host, new URL(page.url()).host])].filter(Boolean);
  page.on('console', (msg) => {
    if (msg.type() === 'error') rawConsole.push(msg.text());
  });
  page.on('pageerror', (err) => rawConsole.push(String(err.message || err)));
  page.on('response', (res) => {
    const resUrl = new URL(res.url());
    if (hosts().includes(resUrl.host) && res.status() >= 400 && res.request().resourceType() !== 'document') {
      result.failedRequests.push(`${res.status()} ${resUrl.pathname}`);
    }
  });
  try {
    const response = await page.goto(url, { waitUntil: 'load', timeout: PAGE_TIMEOUT });
    result.status = response ? response.status() : null;
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
    const text = await page.locator('body').innerText({ timeout: 10_000 }).catch(() => '');
    for (const pattern of ERROR_TEXT) {
      const match = text.match(pattern);
      if (match) result.errors.push(normalize(match[0], hosts()));
    }
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    result.a11y = axe.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => ({ id: v.id, impact: v.impact, help: v.help, count: v.nodes.length, target: v.nodes[0]?.target.join(' ') }));
    if (screenshot) {
      result.screenshot = join(config.outDir, `${path === '/' ? 'home' : path.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}.png`);
      await page.screenshot({ path: result.screenshot, fullPage: true });
    }
  } catch (err) {
    result.errors.push(`Could not load the page: ${normalize(String(err.message).split('\n')[0], [site.host])}`);
  }
  for (const text of rawConsole) {
    const message = normalize(text, hosts());
    (ENVIRONMENT_ONLY.test(message) ? result.environmentOnly : result.console).push(message);
  }
  result.environmentOnly = [...new Set(result.environmentOnly)];
  await context.close();
  return result;
}

// Splits what the preview shows into what's new and what the base shows too.
function compare(p, b) {
  const seen = (list, item) => b && list.includes(item);
  // Accessibility issues compare by rule: the number of elements depends on
  // content, which differs between the sites.
  const baseA11y = new Set((b?.a11y ?? []).map((v) => v.id));
  const isNewStatus = p.status === null || (p.status >= 400 && !(b && b.status === p.status));
  return {
    httpError: isNewStatus ? (p.status ?? 'no response') : null,
    errors: p.errors.filter((e) => !seen(b?.errors ?? [], e)),
    console: [...new Set(p.console)].filter((e) => !seen(b?.console ?? [], e)),
    failedRequests: [...new Set(p.failedRequests)].filter((r) => !seen(b?.failedRequests ?? [], r)),
    a11y: p.a11y.filter((v) => !b || !baseA11y.has(v.id)),
    onBaseToo: b
      ? {
          console: [...new Set(p.console)].filter((e) => b.console.includes(e)).length,
          a11y: p.a11y.filter((v) => baseA11y.has(v.id)).length,
        }
      : null,
  };
}

const browser = await chromium.launch();
const pages = [];
for (const path of paths) {
  const [p, b] = await Promise.all([
    checkPage(browser, preview, path, true),
    base ? checkPage(browser, base, path, false) : null,
  ]);
  pages.push({ path, preview: p, base: b, new: compare(p, b) });
}
await browser.close();

const lines = [
  '# Preview check',
  '',
  `Preview: ${preview.origin}` + (base ? ` · Base: ${base.origin}` : ' · No base site to compare with'),
  '',
  'Only issues the base site does not have are listed as new.',
];
for (const { path, preview: p, base: b, new: n } of pages) {
  lines.push('', `## ${path}`, '', `- Status: preview ${p.status ?? 'no response'}` + (b ? `, base ${b.status ?? 'no response'}` : ''));
  if (n.httpError !== null) lines.push(`- **New HTTP error:** ${n.httpError}`);
  for (const e of n.errors) lines.push(`- **New error in the page:** ${e}`);
  for (const e of n.console) lines.push(`- New console error: ${e}`);
  for (const r of n.failedRequests) lines.push(`- New failed request: ${r}`);
  if (p.environmentOnly.length) {
    lines.push(`- Depends on the domain, not a finding: ${p.environmentOnly.length} console error(s), e.g. ${p.environmentOnly[0]}`);
  }
  for (const v of n.a11y) lines.push(`- New accessibility issue (${v.impact}): ${v.id}, ${v.help}. ${v.count} element(s), first: \`${v.target}\``);
  if (n.httpError === null && !n.errors.length && !n.console.length && !n.failedRequests.length && !n.a11y.length) {
    lines.push('- Nothing new.');
  }
  if (n.onBaseToo && (n.onBaseToo.console || n.onBaseToo.a11y)) {
    lines.push(`- On the base too (not caused by this PR): ${n.onBaseToo.console} console error(s), ${n.onBaseToo.a11y} accessibility issue type(s).`);
  }
  if (p.screenshot) lines.push(`- Screenshot: ${p.screenshot}`);
}
writeFileSync(join(config.outDir, 'report.md'), lines.join('\n') + '\n');
writeFileSync(join(config.outDir, 'report.json'), JSON.stringify(pages, null, 2) + '\n');
console.log(lines.join('\n'));
