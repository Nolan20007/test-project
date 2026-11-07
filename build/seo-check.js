const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const PRODUCT_CSV_FILES = [
  'data/ss1-products.csv',
  'data/ss2-products.csv',
  'data/nts-62-91-111b-products.csv',
  'data/nts-62-91-111-products.csv',
  'data/nts-62-91-111a-products.csv',
  'data/ssg1-products.csv'
];

function parseCsvLine(line) {
  const cells = [];
  let value = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        value += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === ',' && !quoted) {
      cells.push(value);
      value = '';
    } else {
      value += char;
    }
  }
  cells.push(value);
  return cells;
}

function readCsv(file) {
  const content = fs.readFileSync(path.join(root, file), 'utf8').replace(/^\uFEFF/, '').trim();
  const lines = content.split(/\r?\n/);
  const headers = parseCsvLine(lines.shift());
  return lines.filter(Boolean).map(line => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
  });
}

function walkHtml(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkHtml(absolute);
    return entry.isFile() && entry.name.endsWith('.html') ? [absolute] : [];
  });
}

function jsonLdObjects(html, file) {
  const scripts = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  return scripts.map(match => {
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      throw new Error(file + ': invalid JSON-LD: ' + error.message);
    }
  });
}

function assertRobotsPolicy() {
  const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
  const googleGroup = robots.split(/\n(?=User-agent:)/i).find(group => /^User-agent:\s*Google-Extended/im.test(group));
  assert(googleGroup, 'robots.txt: Google-Extended group is missing');
  assert(/Allow:\s*\//i.test(googleGroup), 'robots.txt: Google-Extended must be allowed');
  for (const blocked of ['/cart.html', '/data/', '/admin/', '/private/']) {
    assert(googleGroup.includes('Disallow: ' + blocked), 'robots.txt: Google-Extended must disallow ' + blocked);
  }
  assert(/User-agent:\s*OAI-SearchBot\s*\nAllow:\s*\//i.test(robots), 'robots.txt: OAI-SearchBot must be allowed');
  assert(/User-agent:\s*GPTBot\s*\nDisallow:\s*\//i.test(robots), 'robots.txt: GPTBot must remain blocked');
}

function assertSitemap() {
  const xml = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  const urls = [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map(match => match[1].trim());
  assert(urls.length > 0, 'sitemap.xml contains no URLs');
  assert.strictEqual(new Set(urls).size, urls.length, 'sitemap.xml contains duplicate URLs');

  for (const url of urls) {
    assert(!url.endsWith('/cart.html') && !url.endsWith('/404.html'), 'sitemap.xml contains excluded URL: ' + url);
    const pathname = new URL(url).pathname;
    const relative = pathname === '/' ? 'index.html' : decodeURIComponent(pathname.slice(1));
    const absolute = path.resolve(root, relative);
    assert(absolute.startsWith(root + path.sep), 'sitemap URL escapes repository root: ' + url);
    assert(fs.existsSync(absolute), 'sitemap URL has no generated file: ' + url);
    const html = fs.readFileSync(absolute, 'utf8');
    assert(!/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html), 'noindex page is listed in sitemap: ' + url);
    const canonical = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    assert(canonical, 'missing canonical: ' + url);
    assert.strictEqual(canonical[1], url, 'canonical mismatch: ' + url);
    jsonLdObjects(html, relative);
  }
  return urls.length;
}

function assertCsvProducts() {
  const productFiles = walkHtml(path.join(root, 'products'));
  const productsBySku = new Map();

  for (const file of productFiles) {
    const html = fs.readFileSync(file, 'utf8');
    if (/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) continue;
    for (const object of jsonLdObjects(html, path.relative(root, file))) {
      if (object && object['@type'] === 'Product' && object.sku) {
        assert(!productsBySku.has(String(object.sku)), 'duplicate Product JSON-LD sku: ' + object.sku);
        productsBySku.set(String(object.sku), { object, html, file });
      }
    }
  }

  let expectedProducts = 0;
  for (const csvFile of PRODUCT_CSV_FILES) {
    for (const row of readCsv(csvFile)) {
      expectedProducts += 1;
      const entry = productsBySku.get(String(row.id));
      assert(entry, csvFile + ': no generated Product page for CSV id ' + row.id);
      const object = entry.object;
      const html = entry.html;
      const lengthCm = Number(row.length);
      const widthMm = Number(row.width) * 10;
      const weight = Number(row.weight).toFixed(2).replace('.', ',');
      assert(Number.isFinite(lengthCm) && lengthCm > 0, csvFile + '/' + row.id + ': invalid CSV length');
      assert(Number.isFinite(widthMm) && widthMm > 0, csvFile + '/' + row.id + ': invalid CSV width');
      assert(Number.isFinite(Number(row.weight)) && Number(row.weight) > 0, csvFile + '/' + row.id + ': invalid CSV weight');
      assert(object.description.includes('Длина ' + lengthCm + ' см') || object.description.includes('Высота ' + lengthCm + ' см'), csvFile + '/' + row.id + ': JSON-LD length/height differs from CSV');
      assert(object.description.includes('ширина ' + widthMm + ' мм'), csvFile + '/' + row.id + ': JSON-LD width differs from CSV');
      assert(object.description.includes('масса ' + weight + ' кг'), csvFile + '/' + row.id + ': JSON-LD weight differs from CSV');

      const price = String(row.price || '').trim();
      if (price) {
        assert(object.offers, csvFile + '/' + row.id + ': CSV has a price but Product JSON-LD has no Offer');
        assert.strictEqual(String(object.offers.price), String(Number(price)), csvFile + '/' + row.id + ': Offer price differs from CSV');
      } else {
        assert(!object.offers, csvFile + '/' + row.id + ': CSV has no price but Product JSON-LD has an Offer');
      }
      assert(html.includes('Артикул: ' + row.id) || html.includes('sku": "' + row.id), csvFile + '/' + row.id + ': product ID is not visible or structured');
      productsBySku.delete(String(row.id));
    }
  }
  assert.strictEqual(expectedProducts, 112, 'Unexpected generated product count; review CSV/category inventory');
  assert.strictEqual(productsBySku.size, 0, 'Product JSON-LD contains SKUs not represented by the generated product CSV files');
  return expectedProducts;
}


function assertLlmsProductLinks() {
  const content = fs.readFileSync(path.join(root, 'llms.txt'), 'utf8');
  const startMarker = '<!-- PRODUCT_PAGES_START -->';
  const endMarker = '<!-- PRODUCT_PAGES_END -->';
  const start = content.indexOf(startMarker);
  const end = content.indexOf(endMarker);
  assert(start !== -1 && end > start, 'llms.txt: product section markers are missing or invalid');
  const section = content.slice(start + startMarker.length, end);
  assert(!/\bundefined\b|null/i.test(section), 'llms.txt: product section contains undefined/null labels');
  const links = [...section.matchAll(/^- \[([^\]]+)\]\((https?:\/\/[^)]+)\)$/gm)];
  assert.strictEqual(links.length, 112, 'llms.txt: expected exactly 112 product links');
  assert.strictEqual(new Set(links.map(match => match[2])).size, 112, 'llms.txt: duplicate product URLs');
  const labels = new Set(links.map(match => match[1]));
  let expected = 0;
  for (const csvFile of PRODUCT_CSV_FILES) {
    for (const row of readCsv(csvFile)) {
      expected += 1;
      assert(labels.has(String(row.name || '').trim()), 'llms.txt: missing CSV product name for SKU ' + row.id);
    }
  }
  assert.strictEqual(expected, 112, 'llms.txt: unexpected CSV product inventory');
}


function assertNtsFeedCoverage() {
  const groups = [
    { csv: 'data/nts-62-91-111-products.csv', image: 'images/nts-62-91-111/vid-search.webp' },
    { csv: 'data/nts-62-91-111b-products.csv', image: 'images/nts-62-91-111b/vid-search.webp' }
  ];
  const feeds = [
    { file: 'google-feed.xml', idTag: 'g:id', imageTag: 'g:image_link' },
    { file: 'yandex-feed.xml', idTag: null, imageTag: 'picture' }
  ];

  for (const group of groups) {
    const rows = readCsv(group.csv).filter(row => Number(row.price) > 0);
    assert(rows.length > 0, group.csv + ': expected priced NTS products');
    assert(fs.existsSync(path.join(root, group.image)), group.csv + ': feed image is missing: ' + group.image);

    for (const feed of feeds) {
      const xml = fs.readFileSync(path.join(root, feed.file), 'utf8');
      for (const row of rows) {
        const escapedId = String(row.id);
        const present = feed.idTag
          ? xml.includes('<' + feed.idTag + '>' + escapedId + '</' + feed.idTag + '>')
          : xml.includes('<offer id="' + escapedId + '"');
        assert(present, feed.file + ': missing NTS product ' + row.id);
      }
      const expectedImageUrl = 'https://stremyanki-dlya-kolodcev.ru/' + group.image;
      assert(xml.includes(expectedImageUrl), feed.file + ': missing NTS feed image ' + expectedImageUrl);
    }
  }
  return groups.reduce((sum, group) => sum + readCsv(group.csv).filter(row => Number(row.price) > 0).length, 0);
}

assertRobotsPolicy();
assertLlmsProductLinks();
const ntsFeedProducts = assertNtsFeedCoverage();
const sitemapCount = assertSitemap();
const productCount = assertCsvProducts();
assert(!/<link\b[^>]*rel=["']canonical["']/i.test(fs.readFileSync(path.join(root, '404.html'), 'utf8')), '404.html must not declare a canonical URL');
console.log('SEO checks passed: ' + sitemapCount + ' sitemap URLs, ' + productCount + ' CSV-backed Product pages, ' + ntsFeedProducts + ' NTS feed products, robots policy and JSON-LD validated.');
