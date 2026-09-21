import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// A migration audit of the generated source pages and deployable bundle.
// It verifies retained destinations and local artifacts, not remote delivery.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const inventory = JSON.parse(readFileSync(join(root, 'functional-inventory.json'), 'utf8'));
const crawlPages = ['pages.json', 'event-pages.json'].flatMap(name =>
  JSON.parse(readFileSync(join(root, 'source-evidence', name), 'utf8')),
);
const migratedPaths = [...new Set(crawlPages.map(page => new URL(page.url).pathname.replace(/\/$/, '') || '/'))];
const expectedCalendar = new URL(inventory.calendarEmbedUrl);
const sourceHosts = new Set(['artesiacc.com', 'www.artesiacc.com']);
const siteOrigin = 'https://www.artesiacc.com';
const failures = new Set();
const fail = message => failures.add(message);
const decode = value => value.replace(/&(?:amp|quot|apos|lt|gt|#39|#x[0-9a-f]+|#\d+);/gi, entity => {
  const names = { '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>', '&#39;': "'" };
  return names[entity.toLowerCase()] ?? String.fromCodePoint(parseInt(entity.slice(entity[2]?.toLowerCase() === 'x' ? 3 : 2, -1), entity[2]?.toLowerCase() === 'x' ? 16 : 10));
});

function walk(directory, ignored = new Set()) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (ignored.has(entry.name) || entry.name.startsWith('.')) return [];
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path, ignored) : [path];
  });
}

function parseHtml(html) {
  const clean = html.replace(/<!--[\s\S]*?-->/g, '')
    .replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, '$1</script>')
    .replace(/(<style\b[^>]*>)[\s\S]*?<\/style>/gi, '$1</style>');
  return [...clean.matchAll(/<([a-z][a-z\d-]*)\b([^<>]*?)>/gi)].map(([, tag, raw]) => {
    const attrs = {};
    for (const [, name, double, single, bare] of raw.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)) {
      attrs[name.toLowerCase()] = decode(double ?? single ?? bare);
    }
    return { tag: tag.toLowerCase(), attrs };
  });
}

for (const scope of ['source', 'dist']) {
  const base = scope === 'source' ? root : join(root, 'dist');
  if (!existsSync(base)) { fail(`${scope}: build directory is missing; run npm run build first.`); continue; }
  const files = walk(base, scope === 'source' ? new Set(['node_modules', 'dist', 'src', 'source-evidence', 'evidence', 'scripts', 'public']) : new Set());
  const pages = files.filter(file => extname(file) === '.html');
  const cache = new Map();
  const seenLinks = new Set();
  const calendars = [];
  const resolveTarget = pathname => {
    let decoded;
    try { decoded = decodeURIComponent(pathname); } catch { return null; }
    const candidate = resolve(base, `.${decoded}`);
    if (!candidate.startsWith(base + '/') && candidate !== base) return null;
    const alternatives = [candidate, join(candidate, 'index.html'), candidate + '.html'];
    if (scope === 'source') alternatives.push(resolve(base, 'public', `.${decoded}`));
    return alternatives.find(file => existsSync(file) && statSync(file).isFile()) ?? null;
  };
  const pageInfo = file => {
    if (!cache.has(file)) {
      const tags = parseHtml(readFileSync(file, 'utf8'));
      const ids = new Set();
      for (const { attrs } of tags) {
        if (!attrs.id) continue;
        if (ids.has(attrs.id)) fail(`${scope}/${relative(base, file)}: duplicate ID #${attrs.id}`);
        ids.add(attrs.id);
      }
      cache.set(file, { tags, ids });
    }
    return cache.get(file);
  };
  const inspectReference = (value, fromFile, urlPath, label) => {
    if (!value || /^(?:data:|mailto:|tel:|blob:)/i.test(value)) return;
    let targetUrl;
    try { targetUrl = new URL(value, siteOrigin + urlPath); }
    catch { fail(`${scope}/${relative(base, fromFile)}: invalid ${label} ${value}`); return; }
    seenLinks.add(targetUrl.href);
    if (!sourceHosts.has(targetUrl.hostname)) return;
    const target = resolveTarget(targetUrl.pathname);
    if (!target) { fail(`${scope}/${relative(base, fromFile)}: missing ${label} target ${targetUrl.pathname}`); return; }
    if (targetUrl.hash && extname(target) === '.html') {
      const fragment = decodeURIComponent(targetUrl.hash.slice(1));
      if (fragment && !fragment.startsWith(':~:text=') && !pageInfo(target).ids.has(fragment)) {
        fail(`${scope}/${relative(base, fromFile)}: missing anchor ${targetUrl.pathname}#${fragment}`);
      }
    }
  };

  for (const pathname of migratedPaths) {
    if (!resolveTarget(pathname)) fail(`${scope}: audited source route ${pathname} is absent.`);
  }
  for (const pathname of ['/by-laws', '/golf-2', '/tournaments', '/course-map', '/404.html']) {
    if (!resolveTarget(pathname)) fail(`${scope}: supporting route ${pathname} is absent.`);
  }
  for (const file of pages) {
    const urlPath = '/' + relative(base, file).split('\\').join('/');
    const { tags } = pageInfo(file);
    for (const { tag, attrs } of tags) {
      if (attrs.href) inspectReference(attrs.href, file, urlPath, `${tag} href`);
      if (attrs.src) inspectReference(attrs.src, file, urlPath, `${tag} src`);
      if (attrs.poster) inspectReference(attrs.poster, file, urlPath, `${tag} poster`);
      if (attrs.srcset && !attrs.srcset.startsWith('data:')) {
        for (const candidate of attrs.srcset.split(',')) inspectReference(candidate.trim().split(/\s+/)[0], file, urlPath, `${tag} srcset`);
      }
      if (tag === 'iframe' && attrs.src) {
        const iframe = new URL(attrs.src, siteOrigin);
        if (iframe.hostname === 'calendar.google.com') calendars.push({ file, url: iframe });
        if (iframe.hostname === new URL(inventory.stableSourceHost).hostname) fail(`${scope}/${relative(base, file)}: Squarespace form iframe is blocked by SAMEORIGIN.`);
      }
      if (attrs['aria-controls']) {
        for (const id of attrs['aria-controls'].split(/\s+/)) {
          if (!pageInfo(file).ids.has(id)) fail(`${scope}/${relative(base, file)}: aria-controls target #${id} is missing.`);
        }
      }
    }
  }

  for (const expectedPath of ['/index.html', '/acc-events/index.html']) {
    if (!calendars.some(item => '/' + relative(base, item.file).split('\\').join('/') === expectedPath)) fail(`${scope}: live Google Calendar is absent from ${expectedPath}.`);
  }
  for (const { file, url } of calendars) {
    if (url.hostname !== expectedCalendar.hostname || url.pathname !== expectedCalendar.pathname ||
        JSON.stringify(url.searchParams.getAll('src')) !== JSON.stringify(expectedCalendar.searchParams.getAll('src')) ||
        url.searchParams.getAll('src').length !== 6 || url.searchParams.get('ctz') !== 'America/Denver') {
      fail(`${scope}/${relative(base, file)}: calendar sources or Mountain Time setting differ from audited embed.`);
    }
  }
  for (const expected of [inventory.memberBillingUrl, ...inventory.forms.map(form => form.originalFormUrl)]) {
    if (!seenLinks.has(new URL(expected).href)) fail(`${scope}: retained billing/form link is absent: ${expected}`);
  }
  if (inventory.downloads.length !== 6) fail('Audit inventory must contain the six recovered downloadable resources.');
  for (const download of inventory.downloads) {
    const file = resolveTarget(download.localPath);
    if (!file) { fail(`${scope}: retained download missing: ${download.localPath}`); continue; }
    const buffer = readFileSync(file);
    if (buffer.length !== download.bytes || createHash('sha256').update(buffer).digest('hex') !== download.sha256) fail(`${scope}: download differs from verified source bytes: ${download.localPath}`);
    if (!seenLinks.has(siteOrigin + download.localPath)) fail(`${scope}: retained download is not linked from any page: ${download.localPath}`);
  }

  // Check literal runtime assets and local module/CSS dependencies in addition to HTML.
  const runtimeFiles = scope === 'source'
    ? walk(join(root, 'src')).filter(file => ['.js', '.css'].includes(extname(file)) && !file.endsWith('resource-data.js'))
    : walk(base).filter(file => ['.js', '.css'].includes(extname(file)));
  for (const file of runtimeFiles) {
    const code = readFileSync(file, 'utf8');
    const urlPath = '/' + relative(base, file).split('\\').join('/');
    const values = new Set();
    for (const match of code.matchAll(/["'`](\/(?:images|documents|assets|video)\/[^"'`\s?#]+)["'`]/g)) values.add(match[1]);
    for (const match of code.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)["'](\.[^"']+)["']/g)) values.add(match[1]);
    for (const match of code.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)) values.add(match[1]);
    for (const value of values) inspectReference(value, file, urlPath, 'runtime asset');
  }
  const clubhouse = resolveTarget('/clubhouse/');
  if (clubhouse && !readFileSync(clubhouse, 'utf8').includes('Price shown as $1400 on the source; please confirm with clubhouse.')) fail(`${scope}: the ambiguous Wednesday feature price needs its inline confirmation note.`);
  console.log(`${scope}: inspected ${pages.length} HTML pages, ${migratedPaths.length} audited routes, ${calendars.length} live calendar embeds, and ${inventory.downloads.length} source-matched downloads.`);
}

if (failures.size) {
  console.error(`\nMigration check found ${failures.size} defect(s):\n${[...failures].map(message => `- ${message}`).join('\n')}`);
  process.exitCode = 1;
} else {
  console.log('Migration checks passed: local targets, anchors, unique IDs, retained forms/billing, calendar sources, and document hashes.');
  console.log('Remote form delivery and third-party availability require browser checks; this audit sends no submissions.');
}
