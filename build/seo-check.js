const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { registry: productUrlRegistry, getAllProductPaths } = require('./product-url-registry');

const root = path.resolve(__dirname, '..');
const SITE_URL = 'https://stremyanki-dlya-kolodcev.ru';
const PRODUCT_CSV_FILES = [
  'data/ss1-products.csv',
  'data/ss2-products.csv',
  'data/nts-62-91-111b-products.csv',
  'data/nts-62-91-111-products.csv',
  'data/nts-62-91-111a-products.csv',
  'data/ssg1-products.csv',
  'data/skoby-dlya-kolodcev-products.csv',
  'data/soedinitelnye-elementy-products.csv',
  'data/lestnica-podvesnaya-l-16.csv',
  'data/lestnica-ts-50-products.csv',
  'data/lestnica-ts-63-products.csv',
  'data/vdl-products-22.csv',
  'data/vdl-products-25.csv',
  'data/vdl-products-28.csv',
  'data/kl1-products.csv',
  'data/kl1-products-28.csv',
  'data/tmp-902-kruglye.csv',
  'data/tmp-902-perepadnye.csv',
  'data/tmp-902-pryamougolnye.csv'
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

  const sitemapProductPaths = urls.filter(url => new URL(url).pathname.startsWith('/products/'))
    .map(url => decodeURIComponent(new URL(url).pathname)).sort();
  const registryProductPaths = getAllProductPaths().sort();
  assert.strictEqual(registryProductPaths.length, new Set(registryProductPaths).size, 'product URL registry contains duplicate paths');
  assert.deepStrictEqual(registryProductPaths, sitemapProductPaths, 'product URL registry must exactly match product URLs in sitemap.xml');
  for (const [legacyPath, targetPath] of Object.entries(productUrlRegistry.legacyAliases || {})) {
    const legacyFile = path.resolve(root, legacyPath.slice(1));
    const targetFile = path.resolve(root, targetPath.slice(1));
    assert(fs.existsSync(legacyFile), 'legacy alias source page is missing: ' + legacyPath);
    assert(fs.existsSync(targetFile), 'legacy alias target page is missing: ' + targetPath);
    assert(registryProductPaths.includes(targetPath), 'legacy alias target is not registered: ' + targetPath);
    const legacyHtml = fs.readFileSync(legacyFile, 'utf8');
    const canonical = legacyHtml.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    assert(canonical && canonical[1] === SITE_URL + targetPath, 'legacy alias canonical mismatch: ' + legacyPath);
    assert(/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(legacyHtml), 'legacy alias must remain noindex: ' + legacyPath);
  }

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
      const isConnector = csvFile === 'data/soedinitelnye-elementy-products.csv';
      const isSkoby = csvFile === 'data/skoby-dlya-kolodcev-products.csv';
      const firstLabel = String(row.dimension1_label || (isConnector ? 'Ширина' : 'Длина'));
      const secondLabel = String(row.dimension2_label || (isConnector ? 'Высота' : 'Ширина'));
      const firstDimensionMatches = (isConnector || isSkoby)
        ? object.description.includes(firstLabel + ' ' + lengthCm + ' см')
        : object.description.includes('Длина ' + lengthCm + ' см') || object.description.includes('Высота ' + lengthCm + ' см');
      assert(firstDimensionMatches, csvFile + '/' + row.id + ': first dimension label/value differs from CSV');
      assert(object.description.includes(secondLabel.toLowerCase() + ' ' + widthMm + ' мм'), csvFile + '/' + row.id + ': second dimension label/value differs from CSV');
      if (isSkoby || isConnector) {
        assert(html.includes('<td>' + firstLabel + '</td><td>' + row.length + ' см</td>'), csvFile + '/' + row.id + ': visible first dimension differs from CSV');
        assert(html.includes('<td>' + secondLabel + '</td><td>' + row.width + ' см</td>'), csvFile + '/' + row.id + ': visible second dimension differs from CSV');
      }
      assert(object.description.includes('масса ' + weight + ' кг'), csvFile + '/' + row.id + ': JSON-LD weight differs from CSV');

      const price = String(row.price || '').trim();
      if (price) {
        assert(object.offers, csvFile + '/' + row.id + ': CSV has a price but Product JSON-LD has no Offer');
        assert.strictEqual(String(object.offers.price), String(Number(price)), csvFile + '/' + row.id + ': Offer price differs from CSV');
      } else {
        assert(!object.offers, csvFile + '/' + row.id + ': CSV has no price but Product JSON-LD has an Offer');
      }
      assert(html.includes('Артикул: ' + row.id) || html.includes('<strong>' + row.id + '</strong>') || html.includes('sku": "' + row.id), csvFile + '/' + row.id + ': product ID is not visible or structured');
      productsBySku.delete(String(row.id));
    }
  }
  assert.strictEqual(expectedProducts, 918, 'Unexpected generated product count; review CSV/category inventory');
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
  assert.strictEqual(links.length, 918, 'llms.txt: expected exactly 367 product links');
  assert.strictEqual(new Set(links.map(match => match[2])).size, 918, 'llms.txt: duplicate product URLs');
  const labels = new Set(links.map(match => match[1]));
  let expected = 0;
  for (const csvFile of PRODUCT_CSV_FILES) {
    for (const row of readCsv(csvFile)) {
      expected += 1;
      assert(labels.has(String(row.name || '').trim()), 'llms.txt: missing CSV product name for SKU ' + row.id);
    }
  }
  assert.strictEqual(expected, 918, 'llms.txt: unexpected CSV product inventory');
}


function assertTeplovyeSetiProductPages() {
  const catalog = fs.readFileSync(path.join(root, 'lestnicy-teplovyh-setej-ts.html'), 'utf8');
  const imagePaths = [
    'images/lestnicy-teplovyh-setej-ts/vid-1.webp',
    'images/lestnicy-teplovyh-setej-ts/vid-2.webp',
    'images/lestnicy-teplovyh-setej-ts/vid-3.webp',
    'images/lestnicy-teplovyh-setej-ts/foto-1.webp',
    'images/lestnicy-teplovyh-setej-ts/foto-2.webp',
    'images/lestnicy-teplovyh-setej-ts/chertezh.webp'
  ];
  for (const series of ['50', '63']) {
    const csvFile = 'data/lestnica-ts-' + series + '-products.csv';
    const rows = readCsv(csvFile);
    assert.strictEqual(rows.length, 108, csvFile + ': expected 108 source rows');
    const expectedWidthCm = series === '50' ? 50 : 63;
    const expectedWidthMm = expectedWidthCm * 10;
    for (const row of rows) {
      const slug = String(row.id).toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const relative = 'products/lestnicy-teplovyh-setej-ts/' + slug + '.html';
      const file = path.join(root, relative);
      assert(fs.existsSync(file), csvFile + ': missing generated product page for ' + row.id);
      const html = fs.readFileSync(file, 'utf8');
      assert(html.includes('<h1>' + row.name + '</h1>'), relative + ': missing product heading');
      assert(html.includes('Артикул: ' + row.id), relative + ': product ID is not visible');
      assert(html.includes('<td>Ширина</td><td>' + expectedWidthMm + ' мм (' + expectedWidthCm + ' см)</td>'), relative + ': width differs from TS series');
      assert(html.includes('Другие размеры'), relative + ': related-size section is missing');
      assert(html.includes('ТС-50') && html.includes('50×50×5 мм'), relative + ': TS-50 execution tab is missing');
      assert(html.includes('ТС-63') && html.includes('63×63×5 мм'), relative + ': TS-63 execution tab is missing');
      assert(html.includes('Показать все размеры') && html.includes('other-sizes__extra'), relative + ': expandable related-size list is missing');
      for (const variant of ['50', '63']) {
        const variantId = 'lestnicy-teplovyh-setej-ts-' + variant;
        const panel = html.match(new RegExp('<div class="other-sizes__variant-panel"[^>]*data-variant-id="' + variantId + '"[\\s\\S]*?<\\/div>'));
        assert(panel, relative + ': missing related-size panel for TS-' + variant);
        const expectedLinks = variant === series ? 107 : 108;
        const panelStart = html.indexOf('data-variant-id="' + variantId + '"');
        const nextPanel = html.indexOf('class="other-sizes__variant-panel"', panelStart + 1);
        const panelHtml = html.slice(panelStart, nextPanel === -1 ? html.indexOf('</section>', panelStart) : nextPanel);
        assert.strictEqual((panelHtml.match(/class="other-sizes__link"/g) || []).length, expectedLinks, relative + ': incorrect TS-' + variant + ' related-size count');
      }
      assert(catalog.includes('href="' + relative + '"'), csvFile + ': catalog does not link to ' + row.id);
      for (const image of imagePaths) {
        assert(fs.existsSync(path.join(root, image)), csvFile + ': missing source image ' + image);
        assert(html.includes('../../' + image), relative + ': gallery does not use ' + image);
      }
      assert(!html.includes('Подвесная лестница Л-16 по'), relative + ': unrelated L-16 product description leaked into TS product page');
    }
  }
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

function assertMetalCatalogsAndPages() {
  const groups = [
    { csv: 'data/skoby-dlya-kolodcev-products.csv', catalog: 'skoby-dlya-kolodcev.html', folder: 'products/skoby-dlya-kolodcev' },
    { csv: 'data/soedinitelnye-elementy-products.csv', catalog: 'soedinitelnye-elementy.html', folder: 'products/soedinitelnye-elementy' }
  ];
  for (const group of groups) {
    const rows = readCsv(group.csv);
    const catalog = fs.readFileSync(path.join(root, group.catalog), 'utf8');
    const ids = [...catalog.matchAll(/<tr\b[^>]*id="item-([^"]+)"/g)].map(match => match[1]);
    assert.deepStrictEqual(ids.sort(), rows.map(row => String(row.id)).sort(), group.catalog + ': visible table rows do not match CSV inventory');
    if (group.catalog === 'soedinitelnye-elementy.html') {
      assert(!/<tr\b[^>]*id="item-(?:GS|MN|SK)-/i.test(catalog), 'connector catalog contains legacy skoba rows');
    }
    for (const row of rows) {
      const connectorBaseId = String(row.id).replace(/-902$/, '');
      const connectorNumber = Number(connectorBaseId.match(/\d+/)?.[0] || 0);
      const connectorTpr = String(row.name || '').match(/ТПР\s*(901-09-11\.84|902-09-22\.84)/iu)?.[1];
      const connectorSlug = 'soedinitelny-element-' + connectorBaseId.toLowerCase() +
        (connectorTpr === '901-09-11.84' ? '-tpr-901-09-11-84' :
          connectorTpr === '902-09-22.84' || String(row.id).endsWith('-902') ? '-tpr-902-09-22-84' : '');
      const slug = String(row.slug || (group.folder.endsWith('skoby-dlya-kolodcev')
        ? 'skoba-' + String(row.id).toLowerCase().replace(/[^a-z0-9-]/g, '-')
        : connectorSlug));
      const file = path.join(root, group.folder, slug + '.html');
      assert(fs.existsSync(file), group.csv + ': missing individual page for ' + row.id);
      const html = fs.readFileSync(file, 'utf8');
      assert(html.includes('<h1>' + row.name + '</h1>'), group.csv + ': missing product heading for ' + row.id);
      const hasStructuredSpecifications = html.includes('Характеристики изделия') || /<!-- SPECIFICATIONS_START -->[\s\S]*?<table\b[\s\S]*?<\/table>[\s\S]*?<!-- SPECIFICATIONS_END -->/.test(html);
      assert(hasStructuredSpecifications, group.csv + ': missing structured specifications for ' + row.id);
      assert(html.includes('Другие типоразмеры'), group.csv + ': missing related product navigation for ' + row.id);
      assert(html.includes('class="nav"') && html.includes('class="footer"'), group.csv + ': shared site navigation/footer missing for ' + row.id);
      const connectorImageGroup = connectorNumber >= 1 && connectorNumber <= 4
        ? 'ms-1-2-3-4' : 'ms-5-6-7-8';
      const images = group.folder === 'products/soedinitelnye-elementy'
        ? [
            'images/soedinitelnye-elementy/' + connectorImageGroup + '-card.webp',
            'images/soedinitelnye-elementy/' + connectorImageGroup + '.webp'
          ]
        : String(row.images || row.image || '').split(';').map(value => value.trim()).filter(value => value && !value.endsWith('default-product.svg'));
      for (const image of images) {
        assert(fs.existsSync(path.join(root, image)), group.csv + '/' + row.id + ': missing product image ' + image);
        assert(html.includes('../../' + image), group.csv + '/' + row.id + ': product image not used on detail page ' + image);
      }
    }
  }
  const priceList = fs.readFileSync(path.join(root, 'price-list.html'), 'utf8');
  assert(priceList.includes('<div id="nomenclature-skoby">') && priceList.includes('<div id="nomenclature-ms">'), 'price-list must include skoba and MS sections');
  for (const group of groups) {
    const rows = readCsv(group.csv);
    for (const row of rows) {
      assert(priceList.includes('id="item-' + row.id + '"'), 'price-list is missing ' + row.id);
    }
  }
  const connectorCatalog = fs.readFileSync(path.join(root, 'soedinitelnye-elementy.html'), 'utf8');
  assert(connectorCatalog.includes('<th>Ширина, см</th><th>Высота, см</th>'), 'connector catalog must show width/height headings');
  const skobyCatalog = fs.readFileSync(path.join(root, 'skoby-dlya-kolodcev.html'), 'utf8');
  assert(skobyCatalog.includes('<th>Габарит 1, см</th><th>Габарит 2, см</th>'), 'skoby catalog must use neutral dimension headings for mixed product shapes');
  assert(skobyCatalog.includes('images/skoby-dlya-kolodcev/skoba-mn1-omega/vid-1.webp'), 'skoby catalog must use the full-resolution representative product image');
}
assertRobotsPolicy();
assertLlmsProductLinks();
const ntsFeedProducts = assertNtsFeedCoverage();
const sitemapCount = assertSitemap();
const productCount = assertCsvProducts();
assertTeplovyeSetiProductPages();
assertMetalCatalogsAndPages();

function assertProductImageViewerSources() {
  const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const gallerySources = [...home.matchAll(/data-vid-1=["']([^"']+)["']/g)].map(match => match[1]);
  assert(gallerySources.length > 0, 'index.html: no product image gallery sources found');
  for (const source of gallerySources) {
    if (source === 'images/default-product.svg') continue;
    assert(!/vid-(?:card|mini)\.webp$/i.test(source), 'index.html: lightbox uses a thumbnail instead of a full-size image: ' + source);
    assert(fs.existsSync(path.join(root, source)), 'index.html: full-size gallery image is missing: ' + source);
  }

  const tprTemplate = fs.readFileSync(path.join(root, 'templates/stremyanki-tpr-901-09-11-84.html'), 'utf8');
  assert(tprTemplate.includes('const currentIndex = imgSources.findIndex'), 'TPR lightbox must open the currently selected product image');
  assert(tprTemplate.includes('currentIndex >= 0 ? currentIndex'), 'TPR lightbox must prefer the selected image over the default first slide');
  const tpr902Template = fs.readFileSync(path.join(root, 'templates/stremyanki-tpr-902-09-22-84.html'), 'utf8');
  assert(tpr902Template.includes('const currentIndex = imgSources.findIndex'), 'TPR 902 lightbox must open the currently selected product image');
  assert(tpr902Template.includes('currentIndex >= 0 ? currentIndex'), 'TPR 902 lightbox must prefer the selected image over the default first slide');

  const viewer = fs.readFileSync(path.join(root, 'js/product-lightbox.js'), 'utf8');
  assert(viewer.includes('function fullSizeSource'), 'shared product viewer must resolve full-size image sources');
  assert(viewer.includes('function galleryEntries'), 'shared product viewer must build a gallery for the selected product');
  assert(!viewer.includes('document.querySelectorAll(IMAGE_SELECTOR)'), 'shared product viewer must not combine images from the whole document');
  assert(!viewer.includes('.product-thumb-cell img'), 'table thumbnails must not open as full-size product photos');
}
assertProductImageViewerSources();
assert(!/<link\b[^>]*rel=["']canonical["']/i.test(fs.readFileSync(path.join(root, '404.html'), 'utf8')), '404.html must not declare a canonical URL');
console.log('SEO checks passed: ' + sitemapCount + ' sitemap URLs, ' + productCount + ' CSV-backed Product pages, ' + ntsFeedProducts + ' NTS feed products, robots policy and JSON-LD validated.');
