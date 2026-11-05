const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://stremyanki-dlya-kolodcev.ru';
// Individual product pages are generated from templates, including the SSG series.

// ============================================================
//  НОВЫЙ КОНФИГ ДЛЯ ГЕНЕРАЦИИ КАРТОЧЕК ТОВАРОВ
// ============================================================
const CATEGORIES_TO_GENERATE = [
  {
    template: 'stremyanki-tpr-901-09-11-84.html',
    folder: 'stremyanki-tpr-901-09-11-84',
    title: 'Стремянки ТПР 901-09-11.84',
    catalog_link: 'ss1.html',
    csv: 'data/ss1-products.csv',
    items: [
      { id: 'C-1', model: 'С-1', length_mm: 1200, length_cm: 120, project: 'ТПР 901-09-11.84', slug: 'stremyanka-s-1' },
      { id: 'C-2', model: 'С-2', length_mm: 1500, length_cm: 150, project: 'ТПР 901-09-11.84', slug: 'stremyanka-s-2' },
      { id: 'C-3', model: 'С-3', length_mm: 1800, length_cm: 180, project: 'ТПР 901-09-11.84', slug: 'stremyanka-s-3' },
      { id: 'C-4', model: 'С-4', length_mm: 2250, length_cm: 225, project: 'ТПР 901-09-11.84', slug: 'stremyanka-s-4' },
      { id: 'C-5', model: 'С-5', length_mm: 2400, length_cm: 240, project: 'ТПР 901-09-11.84', slug: 'stremyanka-s-5' },
      { id: 'C-6', model: 'С-6', length_mm: 2100, length_cm: 210, project: 'ТПР 901-09-11.84', slug: 'stremyanka-s-6' },
      { id: 'C-7', model: 'С-7', length_mm: 2700, length_cm: 270, project: 'ТПР 901-09-11.84', slug: 'stremyanka-s-7' },
      { id: 'C-8', model: 'С-8', length_mm: 4200, length_cm: 420, project: 'ТПР 901-09-11.84', slug: 'stremyanka-s-8' },
      { id: 'C-9', model: 'С-9', length_mm: 4500, length_cm: 450, project: 'ТПР 901-09-11.84', slug: 'stremyanka-s-9' },
    ]
  },
  {
    template: 'stremyanki-tpr-902-09-22-84.html',
    folder: 'stremyanki-tpr-902-09-22-84',
    title: 'Стремянки ТПР 902-09-22.84',
    catalog_link: 'ss2.html',
    csv: 'data/ss2-products.csv',
    items: [
      { id: 'C1-00', model: 'С1-00', length_mm: 600, length_cm: 60, project: 'ТПР 902-09-22.84', slug: 'stremyanka-s1-00' },
      { id: 'C1-01', model: 'С1-01', length_mm: 900, length_cm: 90, project: 'ТПР 902-09-22.84', slug: 'stremyanka-s1-01' },
      { id: 'C1-02', model: 'С1-02', length_mm: 1200, length_cm: 120, project: 'ТПР 902-09-22.84', slug: 'stremyanka-s1-02' },
      { id: 'C1-03', model: 'С1-03', length_mm: 1500, length_cm: 150, project: 'ТПР 902-09-22.84', slug: 'stremyanka-s1-03' },
      { id: 'C1-04', model: 'С1-04', length_mm: 1800, length_cm: 180, project: 'ТПР 902-09-22.84', slug: 'stremyanka-s1-04' },
      { id: 'C1-05', model: 'С1-05', length_mm: 2100, length_cm: 210, project: 'ТПР 902-09-22.84', slug: 'stremyanka-s1-05' },
      { id: 'C1-06', model: 'С1-06', length_mm: 2400, length_cm: 240, project: 'ТПР 902-09-22.84', slug: 'stremyanka-s1-06' },
      { id: 'C1-07', model: 'С1-07', length_mm: 2700, length_cm: 270, project: 'ТПР 902-09-22.84', slug: 'stremyanka-s1-07' },
      { id: 'C1-08', model: 'С1-08', length_mm: 3000, length_cm: 300, project: 'ТПР 902-09-22.84', slug: 'stremyanka-s1-08' },
      { id: 'C1-09', model: 'С1-09', length_mm: 3300, length_cm: 330, project: 'ТПР 902-09-22.84', slug: 'stremyanka-s1-09' },
      { id: 'C1-10', model: 'С1-10', length_mm: 3600, length_cm: 360, project: 'ТПР 902-09-22.84', slug: 'stremyanka-s1-10' },
      { id: 'C1-11', model: 'С1-11', length_mm: 3900, length_cm: 390, project: 'ТПР 902-09-22.84', slug: 'stremyanka-s1-11' },
      { id: 'C1-12', model: 'С1-12', length_mm: 4200, length_cm: 420, project: 'ТПР 902-09-22.84', slug: 'stremyanka-s1-12' },
      { id: 'C1-13', model: 'С1-13', length_mm: 4500, length_cm: 450, project: 'ТПР 902-09-22.84', slug: 'stremyanka-s1-13' },
      { id: 'C1-14', model: 'С1-14', length_mm: 4800, length_cm: 480, project: 'ТПР 902-09-22.84', slug: 'stremyanka-s1-14' },
      { id: 'C1-15', model: 'С1-15', length_mm: 5100, length_cm: 510, project: 'ТПР 902-09-22.84', slug: 'stremyanka-s1-15' },
      { id: 'C1-16', model: 'С1-16', length_mm: 5400, length_cm: 540, project: 'ТПР 902-09-22.84', slug: 'stremyanka-s1-16' },
      { id: 'C1-17', model: 'С1-17', length_mm: 5700, length_cm: 570, project: 'ТПР 902-09-22.84', slug: 'stremyanka-s1-17' },
      { id: 'C1-18', model: 'С1-18', length_mm: 6000, length_cm: 600, project: 'ТПР 902-09-22.84', slug: 'stremyanka-s1-18' },
    ]
  },
  {
    template: 'stremyanki-ssg1.html',
    folder: 'pozharnye-stremyanki-seriya-14503-794',
    title: 'Пожарные стремянки СГ серия 1.450.3-7.94',
    catalog_link: 'ssg1.html',
    csv: 'data/ssg1-products.csv',
    album: 'Выпуск 2',
    project_phrase: 'серии 1.450.3-7.94',
    product_title_prefix: 'Пожарная стремянка',
    product_title_accusative: 'пожарную стремянку',
    items: [
      { id: 'SG-22', model: 'СГ-22', length_mm: 2200, length_cm: 220, project: 'Серия 1.450.3-7.94', slug: 'pozharnaya-stremyanka-sg-22' },
      { id: 'SG-28', model: 'СГ-28', length_mm: 2800, length_cm: 280, project: 'Серия 1.450.3-7.94', slug: 'pozharnaya-stremyanka-sg-28' },
      { id: 'SG-34', model: 'СГ-34', length_mm: 3400, length_cm: 340, project: 'Серия 1.450.3-7.94', slug: 'pozharnaya-stremyanka-sg-34' },
      { id: 'SG-40', model: 'СГ-40', length_mm: 4000, length_cm: 400, project: 'Серия 1.450.3-7.94', slug: 'pozharnaya-stremyanka-sg-40' },
      { id: 'SG-46', model: 'СГ-46', length_mm: 4600, length_cm: 460, project: 'Серия 1.450.3-7.94', slug: 'pozharnaya-stremyanka-sg-46' },
      { id: 'SG-52', model: 'СГ-52', length_mm: 5200, length_cm: 520, project: 'Серия 1.450.3-7.94', slug: 'pozharnaya-stremyanka-sg-52' },
      { id: 'SG-58', model: 'СГ-58', length_mm: 5800, length_cm: 580, project: 'Серия 1.450.3-7.94', slug: 'pozharnaya-stremyanka-sg-58' },
      { id: 'SG-64', model: 'СГ-64', length_mm: 6400, length_cm: 640, project: 'Серия 1.450.3-7.94', slug: 'pozharnaya-stremyanka-sg-64' },
      { id: 'SG-70', model: 'СГ-70', length_mm: 7000, length_cm: 700, project: 'Серия 1.450.3-7.94', slug: 'pozharnaya-stremyanka-sg-70' },
      { id: 'SG-82', model: 'СГ-82', length_mm: 8200, length_cm: 820, project: 'Серия 1.450.3-7.94', slug: 'pozharnaya-stremyanka-sg-82' }
    ]
  }
];

const PAGES = [
  { html: 'ss1.html', tables: [{ id: 'nomenclature-container', csv: 'data/ss1-products.csv' }] },
  { html: 'ss2.html', tables: [{ id: 'nomenclature-container', csv: 'data/ss2-products.csv' }] },
  
  { html: 'l-17-000SB.html', tables: [{ id: 'nomenclature-container', csv: 'data/l-17-000SB-products.csv' }] },
  { html: 'l-3-sk-2201-88.html', tables: [{ id: 'nomenclature-container', csv: 'data/l-3-sk-2201-88-products.csv' }] },
  { html: 'l-19.html', tables: [{ id: 'nomenclature-container', csv: 'data/l-19-products.csv' }] },

  { html: 'kl-1-dlya-kanalizacionnyh-kolodcev.html', tables: [
      { id: 'nomenclature-kl1-25', csv: 'data/kl1-products.csv' },
      { id: 'nomenclature-kl1-28', csv: 'data/kl1-products-28.csv' }
  ]},

  { html: 'vl-2-l-19-vodoprovodnaya.html', tables: [
      { id: 'nomenclature-vl2-22', csv: 'data/vdl-products-22.csv' },
      { id: 'nomenclature-vl2-25', csv: 'data/vdl-products-25.csv' },
      { id: 'nomenclature-vl2-28', csv: 'data/vdl-products-28.csv' }
  ]},

  { html: 'ssg1.html', tables: [{ id: 'nomenclature-container', csv: 'data/ssg1-products.csv' }] },
  { html: 'l-16-dlya-teplovyh-setej.html', tables: [
      { id: 'nomenclature-50', csv: 'data/tl-products.csv' },
      { id: 'nomenclature-63', csv: 'data/tl-63-products.csv' }
  ]},
  { html: 'tmp-902.html', tables: [
      { id: 'nomenclature-kruglye', csv: 'data/tmp-902-kruglye.csv' },
      { id: 'nomenclature-pryamougolnye', csv: 'data/tmp-902-pryamougolnye.csv' },
      { id: 'nomenclature-perepadnye', csv: 'data/tmp-902-perepadnye.csv' }
  ]},
  { html: 'skoba-mn.html', tables: [{ id: 'nomenclature-container', csv: 'data/scoba-nm-products.csv' }] },
  { html: 'skoba-nm1-3-900-3.html', tables: [{ id: 'nomenclature-container', csv: 'data/scoba-nm1-3900-products.csv' }] },

  { html: 'price-list.html', tables: [
      { id: 'nomenclature-ss1',                  csv: 'data/ss1-products.csv' },
      { id: 'nomenclature-ss2',                  csv: 'data/ss2-products.csv' },
      { id: 'nomenclature-l-17',                 csv: 'data/l-17-000SB-products.csv' },
      { id: 'nomenclature-l-3',                  csv: 'data/l-3-sk-2201-88-products.csv' },
      { id: 'nomenclature-l-19',                 csv: 'data/l-19-products.csv' },
      { id: 'nomenclature-tmp-902-kruglye',       csv: 'data/tmp-902-kruglye.csv' },
      { id: 'nomenclature-tmp-902-pryamougolnye', csv: 'data/tmp-902-pryamougolnye.csv' },
      { id: 'nomenclature-tmp-902-perepadnye',    csv: 'data/tmp-902-perepadnye.csv' },
      { id: 'nomenclature-tl-50',                 csv: 'data/tl-products.csv' },
      { id: 'nomenclature-tl-63',                 csv: 'data/tl-63-products.csv' },
      { id: 'nomenclature-ssg1',                  csv: 'data/ssg1-products.csv' },
      { id: 'nomenclature-vl2-22',                csv: 'data/vdl-products-22.csv' },
      { id: 'nomenclature-vl2-25',                csv: 'data/vdl-products-25.csv' },
      { id: 'nomenclature-vl2-28',                csv: 'data/vdl-products-28.csv' },
      { id: 'nomenclature-kl1-25',                csv: 'data/kl1-products.csv' },
      { id: 'nomenclature-kl1-28',                csv: 'data/kl1-products-28.csv' },
      { id: 'nomenclature-scoba-nm',              csv: 'data/scoba-nm-products.csv' },
      { id: 'nomenclature-scoba-nm1-3900',        csv: 'data/scoba-nm1-3900-products.csv' }
  ]},
];

const FEED_SOURCES = [
  { csv: 'data/ss1-products.csv',             page: 'ss1.html',             bigImage: 'images/ss1/vid-1.png',  typePrefix: 'Стремянка, лестница для колодцев' },
  { csv: 'data/ss2-products.csv',             page: 'ss2.html',             bigImage: 'images/ss2/vid-1.png',  typePrefix: 'Стремянка, лестница для колодцев' },
  { csv: 'data/l-17-000SB-products.csv',      page: 'l-17-000SB.html',      bigImage: 'images/l-17-000SB/vid-1.png', typePrefix: 'Лестница подвесная Л-17 для гидранта' },
  { csv: 'data/l-3-sk-2201-88-products.csv',  page: 'l-3-sk-2201-88.html',  bigImage: 'images/l-3-sk-2201-88/vid-1.png', typePrefix: 'Лестница Л-3 СК 2201-88-36' },
  { csv: 'data/l-19-products.csv',            page: 'l-19.html',            bigImage: 'images/l-19/vid-1.png', typePrefix: 'Лестница для колодцев' },
  { csv: 'data/ssg1-products.csv',            page: 'ssg1.html',            bigImage: 'images/ssg1/vid-1.png', typePrefix: 'Пожарная стремянка' },
  { csv: 'data/tl-products.csv',              page: 'l-16-dlya-teplovyh-setej.html', bigImage: 'images/tl/vid-1.png', typePrefix: 'Стремянка, лестница тепловых сетей' },
  { csv: 'data/tl-63-products.csv',           page: 'l-16-dlya-teplovyh-setej.html', bigImage: 'images/tl/vid-1.png', typePrefix: 'Стремянка, лестница тепловых сетей' },
  { csv: 'data/vdl-products-22.csv',          page: 'vl-2-l-19-vodoprovodnaya.html', bigImage: 'images/vdl/vid-1.png', typePrefix: 'Лестница для колодцев' },
  { csv: 'data/vdl-products-25.csv',          page: 'vl-2-l-19-vodoprovodnaya.html', bigImage: 'images/vdl/vid-1.png', typePrefix: 'Лестница для колодцев' },
  { csv: 'data/vdl-products-28.csv',          page: 'vl-2-l-19-vodoprovodnaya.html', bigImage: 'images/vdl/vid-1.png', typePrefix: 'Лестница для колодцев' },
  { csv: 'data/kl1-products.csv',             page: 'kl-1-dlya-kanalizacionnyh-kolodcev.html', bigImage: 'images/kl1/vid-1.png', typePrefix: 'Лестница для колодцев' },
  { csv: 'data/kl1-products-28.csv',          page: 'kl-1-dlya-kanalizacionnyh-kolodcev.html', bigImage: 'images/kl1/vid-1.png', typePrefix: 'Лестница для колодцев' },
  { csv: 'data/tmp-902-kruglye.csv',          page: 'tmp-902.html',         bigImage: 'images/tmp-902/vid-1.png', typePrefix: 'Стремянка, лестница для колодцев' },
  { csv: 'data/tmp-902-pryamougolnye.csv',    page: 'tmp-902.html',         bigImage: 'images/tmp-902/vid-1.png', typePrefix: 'Стремянка, лестница для колодцев' },
  { csv: 'data/tmp-902-perepadnye.csv',       page: 'tmp-902.html',         bigImage: 'images/tmp-902/vid-1.png', typePrefix: 'Стремянка, лестница для колодцев' },
  { csv: 'data/scoba-nm-products.csv',        page: 'skoba-mn.html',        bigImage: 'images/scoba-nm/vid-1.png', typePrefix: 'Скоба ходовая' },
  { csv: 'data/scoba-nm1-3900-products.csv',  page: 'skoba-nm1-3-900-3.html', bigImage: 'images/scoba-nm1-3900/vid-1.png', typePrefix: 'Скоба ходовая' },
];

const M_START = '<!-- NOMENCLATURE_START -->';
const M_END   = '<!-- NOMENCLATURE_END -->';
const JSONLD_START = '<!-- JSONLD_PRODUCTS_START -->';
const JSONLD_END   = '<!-- JSONLD_PRODUCTS_END -->';
const NAV_START = '<!-- NAV_START -->';
const NAV_END = '<!-- NAV_END -->';
const FOOTER_START = '<!-- FOOTER_START -->';
const FOOTER_END = '<!-- FOOTER_END -->';
const CTA_START = '<!-- CTA_START -->';
const CTA_END = '<!-- CTA_END -->';

const COLLAPSE_THRESHOLD = 11;
const COLLAPSE_SHOW = 10;

const ANALYTICS_TAG = '<script src="js/analytics.js"></script>';
const ANALYTICS_TAG_PRODUCT = '<script src="../../js/analytics.js"></script>';
const ANALYTICS_RE = /<script\s+src=["'](\.\.\/)?js\/analytics\.js["'][^>]*>\s*<\/script>/i;

const OG_START = '<!-- OG_START -->';
const OG_END   = '<!-- OG_END -->';

function loadInclude(name) {
  const filePath = path.resolve(__dirname, '..', 'includes', name);
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠ Не найден includes/${name} — пропускаю замену.`);
    return null;
  }
  return fs.readFileSync(filePath, 'utf8').trim();
}

function replaceBetweenMarkers(html, startMarker, endMarker, newContent) {
  const startIdx = html.indexOf(startMarker);
  const endIdx = html.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1) return { html, replaced: false };
  if (endIdx < startIdx) return { html, replaced: false };

  const before = html.slice(0, startIdx + startMarker.length);
  let after = html.slice(endIdx);

  const endEsc = endMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const dupRe = new RegExp(`(\\s*${endEsc}\\s*)+`, 'g');
  after = after.replace(dupRe, `\n${endMarker}`);

  const newHtml = `${before}\n${newContent}\n${after}`;
  return { html: newHtml, replaced: newHtml !== html };
}

function parseCSV(text) {
  const rows = []; let row = []; let field = ''; let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], nx = text[i + 1];
    if (inQ) {
      if (ch === '"' && nx === '"') { field += '"'; i++; }
      else if (ch === '"') inQ = false;
      else field += ch;
    } else {
      if (ch === '"') inQ = true;
      else if (ch === ',') { row.push(field); field = ''; }
      else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (ch !== '\r') field += ch;
    }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1)
    .filter(r => r.some(v => v.trim() !== ''))
    .map(r => { const o = {}; headers.forEach((h, i) => o[h] = (r[i] || '').trim()); return o; });
}

function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function fmtPrice(p) {
  const n = parseFloat(p); return isNaN(n) ? '—' : n.toLocaleString('ru-RU');
}

function formatWeight(w) {
  const n = parseFloat(String(w || '').replace(',', '.').replace(/[^\d.\-]/g, ''));
  if (isNaN(n) || n <= 0) return '1';
  if (n < 0.001) return '0.001';
  if (n > 2000) return '2000';
  return String(Math.round(n * 1000) / 1000);
}

function warnMissingWeights(csvName, products) {
  const bad = products.filter(p => {
    const n = parseFloat(String(p.weight || '').replace(',', '.').replace(/[^\d.\-]/g, ''));
    return isNaN(n) || n <= 0;
  });
  if (bad.length) {
    console.warn(`  ⚠ ${csvName}: ${bad.length} товаров без валидного веса → ${bad.map(p => p.id).slice(0, 5).join(', ')}${bad.length > 5 ? '…' : ''}`);
  }
}

function safeAnchor(id) {
  return 'item-' + String(id).replace(/[^a-zA-Z0-9а-яА-ЯёЁ\-_.]/g, '_');
}

function replacePrices(html) {
  if (!html.includes('PRICE_START')) return { html, replaced: false };

  let result = html;
  let replaced = false;

  const regex = /<!--\s*PRICE_START:min:([^\s>]+?)\s*-->[\s\S]*?<!--\s*PRICE_END\s*-->/g;

  result = result.replace(regex, (match, filesStr) => {
    const csvFiles = filesStr.split(',').map(s => s.trim()).filter(Boolean);
    let minPrice = Infinity;

    csvFiles.forEach(csvRelPath => {
      const csvPath = path.resolve(__dirname, '..', 'data', csvRelPath.trim());
      if (!fs.existsSync(csvPath)) {
        console.warn(`  ⚠ PRICE: CSV не найден — ${csvRelPath}`);
        return;
      }
      const csv = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
      const products = parseCSV(csv);
      products.forEach(p => {
        const price = parseFloat(p.price) || 0;
        if (price > 0 && price < minPrice) minPrice = price;
      });
    });

    if (minPrice === Infinity) return match;

    const formatted = fmtPrice(minPrice) + ' ₽';
    replaced = true;
    return `<!-- PRICE_START:min:${filesStr} -->${formatted}<!-- PRICE_END -->`;
  });

  return { html: result, replaced };
}

function buildTable(products, enableCollapse) {
  if (!products.length) return '<div class="loading">Нет данных о продукции</div>';

  const total = products.length;
  const needCollapse = enableCollapse && total > COLLAPSE_THRESHOLD;

  let html = `<table class="nomenclature-table"><thead><tr>
    <th>Фото</th><th>Изделие</th><th>Длина, см</th><th>Ширина, см</th>
    <th>Масса, кг</th><th>Цена</th><th>ед. изм.</th>
    <th>Количество</th><th>Корзина</th></tr></thead><tbody>`;

  products.forEach((p, idx) => {
    const id = esc(p.id), name = esc(p.name), length = esc(p.length), width = esc(p.width),
          weight = esc(p.weight), unit = esc(p.unit),
          img = esc(p.image || 'images/default-product.png'),
          price = parseFloat(p.price) || 0,
          anchor = safeAnchor(p.id);

    // Логика генерации ссылки на карточку товара
    let itemUrl = '#';
    let modelSlug = '';
    
    if (id.startsWith('C-')) {
        modelSlug = id.toLowerCase().replace('c-', 's-');
        itemUrl = `products/stremyanki-tpr-901-09-11-84/stremyanka-${modelSlug}.html`;
    } 
    else if (id.startsWith('SG-')) {
        modelSlug = id.toLowerCase();
        itemUrl = `products/pozharnye-stremyanki-seriya-14503-794/pozharnaya-stremyanka-${modelSlug}.html`;
    }
    else if (id.startsWith('C1-')) {
        modelSlug = id.toLowerCase().replace('c1-', 's1-');
        itemUrl = `products/stremyanki-tpr-902-09-22-84/stremyanka-${modelSlug}.html`;
    }

    const hiddenStyle = (needCollapse && idx >= COLLAPSE_SHOW) ? ' style="display:none;" class="hidden-row"' : '';

    const nameHtml = itemUrl !== '#' ? `<a href="${itemUrl}" style="color: var(--primary-color); text-decoration: underline;">${name}</a>` : name;

    html += `<tr id="${anchor}"${hiddenStyle}>
      <td><img src="${img}" alt="${name}" width="40" height="40" style="width:40px;height:40px;max-height:40px;object-fit:contain;" loading="lazy" decoding="async" onerror="this.src='images/default-product.png'"></td>
      <td>${nameHtml}</td><td>${length}</td><td>${width}</td><td>${weight}</td>
      <td>от ${fmtPrice(price)} руб.</td><td>${unit}</td>
      <td class="cart-cell"><div class="quantity-control">
        <button type="button" onclick="changeQuantity('${id}', -1)">−</button>
        <input type="number" id="${id}-qty" value="1" min="1" max="99" data-price="${price}">
        <button type="button" onclick="changeQuantity('${id}', 1)">+</button>
      </div></td>
      <td><button type="button" class="cart-button"
            data-item-id="${id}" data-item-name="${name}"
            data-item-length="${length}" data-item-weight="${weight}">В корзину</button></td>
    </tr>`;
  });

  html += `</tbody></table>`;

  if (needCollapse) {
    const uid = 'tbl-' + Math.random().toString(36).slice(2, 8);
    html = html.replace('<table class="nomenclature-table"', `<table id="${uid}" class="nomenclature-table"`);
    html += `<div class="table-toggle-wrap">
      <button type="button" class="table-toggle-btn" data-target="${uid}" data-total="${total}" onclick="toggleTableRows(this)">
        Показать все (${total}) ▾
      </button>
    </div>`;
  }

  return html;
}

function replaceContainer(html, containerId, innerHtml) {
  const idEsc = containerId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const mRe = new RegExp(
    `(<div[^>]*id="${idEsc}"[^>]*>)\\s*${M_START.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}[\\s\\S]*?${M_END.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\s*(</div>)`
  );
  if (mRe.test(html)) {
    return html.replace(mRe, `$1\n${M_START}\n${innerHtml}\n${M_END}\n$2`);
  }

  const openRe = new RegExp(`<div[^>]*id="${idEsc}"[^>]*>`);
  const m = openRe.exec(html);
  if (!m) { console.warn(`  ⚠ Не найден #${containerId}`); return html; }
  const startIdx = m.index + m[0].length;

  let depth = 1, i = startIdx;
  while (i < html.length && depth > 0) {
    const o = html.slice(i).search(/<div\b/i);
    const c = html.slice(i).search(/<\/div>/i);
    if (c === -1) break;
    if (o !== -1 && o < c) { depth++; i += o + 5; }
    else { depth--; i += c + 6; }
  }
  const endIdx = i - 6;

  return html.slice(0, startIdx) +
         `\n${M_START}\n${innerHtml}\n${M_END}\n` +
         html.slice(endIdx);
}

function buildProductListJsonLd(products, pageUrl) {
  if (!products.length) return '';
  const items = products.map(p => {
    const price = parseFloat(p.price) || 0;
    const anchor = safeAnchor(p.id);
    
    let searchImage = p.image || 'images/default-product.png';
    if (searchImage.includes('vid-mini')) {
      searchImage = searchImage.replace('vid-mini.webp', 'vid-search.webp').replace('vid-mini.png', 'vid-search.png');
    }

    const obj = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": p.name,
      "sku": p.id,
      "mpn": p.id,
      "image": SITE_URL + '/' + searchImage,
      "description": p.name + '. Длина ' + p.length + ' см, ширина ' + p.width + ' см, масса ' + p.weight + ' кг.',
      "brand": { "@type": "Brand", "name": "Лестницы и стремянки для колодцев" },
      "offers": {
        "@type": "Offer",
        "url": pageUrl + '#' + anchor,
        "priceCurrency": "RUB",
        "price": String(price),
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": { "@type": "Organization", "name": "ИП Гневашева Кристина Дмитриевна" }
      }
    };
    return JSON.stringify(obj, null, 2);
  });
  return items.map(json => `<script type="application/ld+json">\n${json}\n</script>`).join('\n');
}

function stripOldProductJsonLd(html) {
  return html.replace(
    /<script\s+type=["']application\/ld\+json["']\s*>([\s\S]*?)<\/script>/gi,
    (match, inner) => {
      if (/"@type"\s*:\s*"Product"/i.test(inner)) {
        return '<!-- removed old Product JSON-LD -->';
      }
      return match;
    }
  );
}

function replaceJsonLd(html, jsonLd) {
  const block = `${JSONLD_START}\n${jsonLd}\n${JSONLD_END}`;
  const re = new RegExp(
    `${JSONLD_START.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}[\\s\\S]*?${JSONLD_END.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}`
  );
  if (re.test(html)) return html.replace(re, block);
  return html.replace('</head>', `${block}\n</head>`);
}

function buildYandexFeed() {
  const offers = [];

  FEED_SOURCES.forEach(src => {
    const csvPath = path.resolve(__dirname, '..', src.csv);
    if (!fs.existsSync(csvPath)) {
      console.warn(`  ⚠ CSV для фида не найден: ${src.csv}`);
      return;
    }
    const csv = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
    let products = parseCSV(csv);
    warnMissingWeights(src.csv, products);

    products.forEach(p => {
      const price = parseFloat(p.price) || 0;
      if (price <= 0) return;

      const anchor = safeAnchor(p.id);
      const url = `${SITE_URL}/${src.page}#${encodeURIComponent(anchor)}`;
      
      let searchImage = src.bigImage;
      if (searchImage.includes('vid-1')) {
        searchImage = searchImage.replace('vid-1.png', 'vid-search.webp').replace('vid-1.webp', 'vid-search.webp');
      }
      const picture = `${SITE_URL}/${searchImage}`;
      
      const typePrefix = src.typePrefix || 'Стремянка для колодцев';

      offers.push(`    <offer id="${esc(p.id)}" available="true">
      <url>${esc(url)}</url>
      <price>${price}</price>
      <currencyId>RUB</currencyId>
      <categoryId>1</categoryId>
      <picture>${esc(picture)}</picture>
      <name>${esc(p.name)}</name>
      <vendor>Лестницы и стремянки для колодцев</vendor>
      <typePrefix>${esc(typePrefix)}</typePrefix>
      <model>${esc(p.id)}</model>
      <weight>${formatWeight(p.weight)}</weight>
      <description>${esc(p.name)}. Длина ${esc(p.length)} см, ширина ${esc(p.width)} см, масса ${esc(p.weight)} кг.</description>
    </offer>`);
    });
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${new Date().toISOString().slice(0,16).replace('T',' ')}">
  <shop>
    <name>Лестницы и стремянки для колодцев</name>
    <company>ИП Гневашева Кристина Дмитриевна</company>
    <url>${SITE_URL}</url>
    <currencies>
      <currency id="RUB" rate="1"/>
    </currencies>
    <categories>
      <category id="1">Стремянки и лестницы для колодцев</category>
    </categories>
    <offers>
${offers.join('\n')}
    </offers>
  </shop>
</yml_catalog>
`;

  const outPath = path.resolve(__dirname, '..', 'yandex-feed.xml');
  fs.writeFileSync(outPath, xml, 'utf8');
  console.log(`  ✅ yandex-feed.xml создан (${offers.length} товаров)`);
}

function buildGoogleFeed() {
  const items = [];

  FEED_SOURCES.forEach(src => {
    const csvPath = path.resolve(__dirname, '..', src.csv);
    if (!fs.existsSync(csvPath)) return;
    const csv = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
    let products = parseCSV(csv);
    warnMissingWeights(src.csv, products);

    products.forEach(p => {
      const price = parseFloat(p.price) || 0;
      if (price <= 0) return;

      const anchor = safeAnchor(p.id);
      const url = `${SITE_URL}/${src.page}#${encodeURIComponent(anchor)}`;
      
      let searchImage = src.bigImage;
      if (searchImage.includes('vid-1')) {
        searchImage = searchImage.replace('vid-1.png', 'vid-search.webp').replace('vid-1.webp', 'vid-search.webp');
      }
      const picture = `${SITE_URL}/${searchImage}?v=${encodeURIComponent(p.id)}`;
      
      const formattedPrice = price.toFixed(2) + ' RUB';

      items.push(`    <item>
      <g:id>${esc(p.id)}</g:id>
      <g:title>${esc(p.name)}</g:title>
      <g:description>${esc(p.name)}. Длина ${esc(p.length)} см, ширина ${esc(p.width)} см, масса ${esc(p.weight)} кг.</g:description>
      <g:link>${esc(url)}</g:link>
      <g:image_link>${esc(picture)}</g:image_link>
      <g:price>${formattedPrice}</g:price>
      <g:availability>in stock</g:availability>
      <g:condition>new</g:condition>
      <g:brand>Лестницы и стремянки для колодцев</g:brand>
      <g:mpn>${esc(p.id)}</g:mpn>
      <g:shipping_weight>${formatWeight(p.weight)} kg</g:shipping_weight>
      <g:google_product_category>Hardware &gt; Ladders</g:google_product_category>
      <g:product_type>Стремянки и лестницы для колодцев</g:product_type>
    </item>`);
    });
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Лестницы и стремянки для колодцев</title>
    <link>${SITE_URL}</link>
    <description>Каталог лестниц и стремянок для колодцев</description>
${items.join('\n')}
  </channel>
</rss>
`;

  const outPath = path.resolve(__dirname, '..', 'google-feed.xml');
  fs.writeFileSync(outPath, xml, 'utf8');
  console.log(`  ✅ google-feed.xml создан (${items.length} товаров)`);
}

const ALL_HTML_FILES = [
  'index.html',
  '404.html',
  'cart.html',
  'dostavka-i-oplata.html',
  'gost-trebovaniya-k-lestnicam.html',
  'kak-vybrat-stremyanku.html',
  'kl-1-dlya-kanalizacionnyh-kolodcev.html',
  'l-16-dlya-teplovyh-setej.html',
  'l-17-000SB.html',
  'l-3-sk-2201-88.html',
  'l-19.html',
  'montazh-stremyanok-v-kolodcy.html',
  'o-kompanii.html',
  'politika-konfidencialnosti.html',
  'price-list.html',
  'publichnaya-oferta.html',
  'ss1.html',
  'ss2.html',
  'ssg1.html',
  'tipovye-proekty.html',
  'tmp-902.html',
  'vl-2-l-19-vodoprovodnaya.html',
  'skoba-mn.html',
  'skoba-nm1-3-900-3.html',
  'sitemap.html',
  'vozvrat.html',
];

function insertOgTags(html, file) {
  const ogPath = path.resolve(__dirname, '..', 'data', 'og.json');
  if (!fs.existsSync(ogPath)) return { html, replaced: false };

  let ogData;
  try {
    ogData = JSON.parse(fs.readFileSync(ogPath, 'utf8'));
  } catch (e) {
    console.warn(`  ⚠ OG: не удалось прочитать data/og.json — ${e.message}`);
    return { html, replaced: false };
  }

  const data = ogData[file];
  if (!data) return { html, replaced: false };

  const url = SITE_URL + '/' + (file === 'index.html' ? '' : file);
  const type = (file === 'index.html') ? 'website' : 'product';

  const block = `${OG_START}
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(data.title)}">
<meta property="og:description" content="${esc(data.description)}">
<meta property="og:image" content="${esc(data.image)}">
<meta property="og:url" content="${url}">
${OG_END}`;

  const re = new RegExp(
    OG_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
    '[\\s\\S]*?' +
    OG_END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  if (re.test(html)) {
    const newHtml = html.replace(re, block);
    return { html: newHtml, replaced: newHtml !== html };
  }

  const canonRe = /(<link\s+rel=["']canonical["'][^>]*>)/i;
  if (canonRe.test(html)) {
    const newHtml = html.replace(canonRe, `$1\n${block}`);
    return { html: newHtml, replaced: newHtml !== html };
  }

  if (html.includes('</head>')) {
    const newHtml = html.replace('</head>', `${block}\n</head>`);
    return { html: newHtml, replaced: newHtml !== html };
  }

  return { html, replaced: false };
}

function processMarkers(file, navContent, footerContent, ctaContent) {
  const filePath = path.resolve(__dirname, '..', file);
  if (!fs.existsSync(filePath)) return false;

  let html = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const isProductPage = file.startsWith('products/');
  const prefix = isProductPage ? '../../' : '';

  const fixLinks = (content) => {
    if (!isProductPage) return content;

    const isRelative = (url) => {
      if (!url) return false;
      const u = url.trim();
      if (u.startsWith('../') || u.startsWith('/')) return false;
      if (u.startsWith('#')) return false;
      if (/^(https?:|data:|mailto:|tel:|javascript:|\/\/)/i.test(u)) return false;
      return true;
    };

    let out = content;

    // href — как было
    out = out.replace(/href="([^"]+)"/g, (m, url) => {
      if (!isRelative(url)) return m;
      return `href="${prefix}${url}"`;
    });

    // src (img, source, script)
    out = out.replace(/\ssrc="([^"]+)"/g, (m, url) => {
      if (!isRelative(url)) return m;
      return ` src="${prefix}${url}"`;
    });

    // srcset (picture/source) — если появится
    out = out.replace(/\ssrcset="([^"]+)"/g, (m, val) => {
      const fixed = val.split(',').map(part => {
        const trimmed = part.trim();
        if (!trimmed) return part;
        const [url, ...rest] = trimmed.split(/\s+/);
        if (!isRelative(url)) return part;
        return [`${prefix}${url}`, ...rest].join(' ');
      }).join(', ');
      return ` srcset="${fixed}"`;
    });

    // xlink:href (inline SVG)
    out = out.replace(/\sxlink:href="([^"]+)"/g, (m, url) => {
      if (!isRelative(url)) return m;
      return ` xlink:href="${prefix}${url}"`;
    });

    return out;
  };

  if (navContent) {
    const navResult = replaceBetweenMarkers(html, NAV_START, NAV_END, fixLinks(navContent));
    if (navResult.replaced) { html = navResult.html; changed = true; }
  }

  if (footerContent) {
    const footerResult = replaceBetweenMarkers(html, FOOTER_START, FOOTER_END, fixLinks(footerContent));
    if (footerResult.replaced) { html = footerResult.html; changed = true; }
  }

  if (ctaContent && file !== 'index.html') {
    const ctaResult = replaceBetweenMarkers(html, CTA_START, CTA_END, fixLinks(ctaContent));
    if (ctaResult.replaced) { html = ctaResult.html; changed = true; }
  }

  // Use the self-hosted Rubik font on every page. Keep the relative path
  // correct for both root pages and generated pages under /products/.
  const fontPrefix = isProductPage ? '../../' : '';
  const googleFontLinks = /<link\\s+[^>]*href=["'][^"']*fonts\\.googleapis\\.com[^"']*["'][^>]*>\\s*/gi;
  const googleFontPreconnects = /<link\s+[^>]*href=["'][^"']*fonts\.gstatic\.com[^"']*["'][^>]*>\s*/gi;
  const usesLocalRubik = html.includes(fontPrefix + 'css/rubik-local.css');
  const cleanedFontHtml = html.replace(googleFontLinks, '').replace(googleFontPreconnects, '');
  if (cleanedFontHtml !== html) { html = cleanedFontHtml; changed = true; }
  if (!usesLocalRubik && html.includes('</head>')) {
    const localFontLinks = '    <link rel="preload" href="' + fontPrefix + 'fonts/rubik/rubik-3.woff2" as="font" type="font/woff2" crossorigin>\\n' +
      '    <link rel="stylesheet" href="' + fontPrefix + 'css/rubik-local.css">\\n';
    html = html.replace('</head>', localFontLinks + '</head>');
    changed = true;
    console.log('  ✅ ' + file + ' → Rubik подключён локально');
  }

  const priceResult = replacePrices(html);
  if (priceResult.replaced) {
    html = priceResult.html;
    changed = true;
    console.log(`  ✅ ${file} → цены обновлены из CSV`);
  }

  if (!ANALYTICS_RE.test(html) && html.includes('</head>')) {
    const analyticsTag = isProductPage ? ANALYTICS_TAG_PRODUCT : ANALYTICS_TAG;
    html = html.replace('</head>', `    ${analyticsTag}\n</head>`);
    changed = true;
    console.log(`  ✅ ${file} → добавлен analytics.js`);
  }

  const ogResult = insertOgTags(html, file);
  if (ogResult.replaced) {
    html = ogResult.html;
    changed = true;
    console.log(`  ✅ ${file} → OG-теги обновлены`);
  }

  if (changed) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`  ✅ ${file} → NAV/FOOTER/CTA/PRICE/ANALYTICS/OG обновлены`);
    return true;
  }
  return false;
}

// ============================================================
//  НОВАЯ ФУНКЦИЯ ДЛЯ ГЕНЕРАЦИИ СТРАНИЦ ТОВАРОВ
// ============================================================
function buildProductPages() {
  const createdPages = [];
  CATEGORIES_TO_GENERATE.forEach(cat => {
    const templatePath = path.resolve(__dirname, '..', 'templates', cat.template);
    if (!fs.existsSync(templatePath)) throw new Error(`[product pages] Не найден шаблон templates/${cat.template}`);
    const csvPath = path.resolve(__dirname, '..', cat.csv);
    if (!fs.existsSync(csvPath)) throw new Error(`[product pages] Не найден CSV ${cat.csv} (шаблон ${cat.template})`);
    const rows = parseCSV(fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, ''));
    const byId = new Map(rows.map(row => [row.id, row]));
    const template = fs.readFileSync(templatePath, 'utf8');
    const outDir = path.resolve(__dirname, '..', 'products', cat.folder);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    cat.items.forEach(p => {
      const row = byId.get(p.id);
      if (!row) throw new Error(`[product pages] ${cat.template} / ${cat.csv}: не найден ID "${p.id}"`);
      const numeric = field => {
        const n = Number(row[field]);
        if (!row[field] || !Number.isFinite(n) || n <= 0 || (field === 'step_count' && !Number.isInteger(n)))
          throw new Error(`[product pages] ${cat.template} / ${cat.csv}, ID "${p.id}": некорректное поле "${field}" = "${row[field]}"`);
        return n;
      };
      const price = numeric('price'), weight = numeric('weight');
      const stepCount = row.step_count ? numeric('step_count') : null;
      let html = template;
      html = html.replace(/\{\{ID\}\}/g, p.id).replace(/\{\{MODEL\}\}/g, p.model)
        .replace(/\{\{LENGTH_MM\}\}/g, p.length_mm).replace(/\{\{LENGTH_CM\}\}/g, p.length_cm)
        .replace(/\{\{PRICE\}\}/g, price.toLocaleString('ru-RU')).replace(/\{\{PRICE_RAW\}\}/g, String(price))
        .replace(/\{\{WEIGHT\}\}/g, weight.toFixed(2).replace('.', ','))
        .replace(/\{\{WEIGHT_RAW\}\}/g, String(weight)).replace(/\{\{STEP_COUNT\}\}/g, stepCount === null ? '—' : String(stepCount))
        .replace(/\{\{PROJECT\}\}/g, p.project).replace(/\{\{SLUG\}\}/g, p.slug)
        .replace(/\{\{PRODUCT_FOLDER\}\}/g, cat.folder);
      const title = cat.product_title_prefix
        ? `${cat.product_title_prefix} ${p.model} по ${cat.project_phrase || p.project}, ${p.length_cm} см — купить`
        : `Стремянка ${p.model} ${p.project} для колодцев, ${p.length_cm} см — купить`;
      const album = cat.album || (cat.csv.includes('ss1-') ? 'Альбом V' : 'Альбом VII');
      const desc = cat.product_title_prefix
        ? `Купить ${cat.product_title_accusative || cat.product_title_prefix.toLowerCase()} ${p.model} по ${cat.project_phrase || p.project}, ${album}. Высота ${p.length_cm} см, масса ${weight.toFixed(2).replace('.', ',')} кг. От производителя, доставка по России.`
        : `Купить стремянку ${p.model} для колодцев по ${p.project}, ${album}. Длина ${p.length_cm} см, масса ${weight.toFixed(2).replace('.', ',')} кг. От производителя, доставка по России.`;
      html = html.replace(/\{\{SEO_TITLE\}\}/g, title).replace(/\{\{SEO_DESC\}\}/g, desc)
        .replace(/\{\{CATALOG_LINK\}\}/g, cat.catalog_link).replace(/\{\{CATALOG_TITLE\}\}/g, cat.title);
      let otherLinks = '';
      cat.items.forEach(other => { if (other.id !== p.id) otherLinks += `<a href="${other.slug}.html">${other.model} (${other.length_cm} см)</a>\n`; });
      html = html.replace(/\{\{OTHER_SIZES\}\}/g, otherLinks);
      const outPath = path.join(outDir, `${p.slug}.html`);
      fs.writeFileSync(outPath, html, 'utf8');
      console.log(`  ✅ products/${cat.folder}/${p.slug}.html создан`);
      createdPages.push(`products/${cat.folder}/${p.slug}.html`);
    });
  });
  return createdPages;
}

function build() {
  let changed = 0;

  console.log('Чтение includes/...');
  const navContent = loadInclude('nav.html');
  const footerContent = loadInclude('footer.html');
  const ctaContent = loadInclude('cta.html');

  if (navContent)    console.log('  ✅ includes/nav.html');
  if (footerContent) console.log('  ✅ includes/footer.html');
  if (ctaContent)    console.log('  ✅ includes/cta.html');

  console.log('\nГенерация страниц товаров...');
  const newProductPages = buildProductPages();

  const allPagesToProcess = [...ALL_HTML_FILES, ...newProductPages];

  console.log('\nОбработка NAV, FOOTER, CTA, PRICE, ANALYTICS, OG...');
  allPagesToProcess.forEach(file => {
    if (processMarkers(file, navContent, footerContent, ctaContent)) changed++;
  });

  console.log('\nОбработка таблиц и JSON-LD...');
  PAGES.forEach(page => {
    const htmlPath = path.resolve(__dirname, '..', page.html);
    if (!fs.existsSync(htmlPath)) { console.warn(`⚠ Нет файла: ${page.html}`); return; }
    let html = fs.readFileSync(htmlPath, 'utf8');
    let changedThisPage = false;

    const allProducts = [];
    const isPriceList = page.html === 'price-list.html';

    page.tables.forEach(t => {
      const csvPath = path.resolve(__dirname, '..', t.csv);
      if (!fs.existsSync(csvPath)) { console.warn(`  ⚠ Нет CSV: ${t.csv}`); return; }
      const csv = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
      const products = parseCSV(csv);

      if (!isPriceList) allProducts.push(...products);

      const newHtml = replaceContainer(html, t.id, buildTable(products, isPriceList));
      if (newHtml !== html) {
        html = newHtml; changedThisPage = true;
        console.log(`  ✅ ${page.html} → #${t.id} (${products.length} строк)`);
      } else {
        console.log(`  · ${page.html} → #${t.id} без изменений`);
      }
    });

    if (!isPriceList) {
      const cleanedHtml = stripOldProductJsonLd(html);
      if (cleanedHtml !== html) {
        html = cleanedHtml; changedThisPage = true;
        console.log(`  ✅ ${page.html} → удалены старые Product JSON-LD`);
      }

      const pageUrl = SITE_URL + '/' + page.html;
      const jsonLd = buildProductListJsonLd(allProducts, pageUrl);
      if (jsonLd) {
        const newHtml = replaceJsonLd(html, jsonLd);
        if (newHtml !== html) {
          html = newHtml; changedThisPage = true;
          console.log(`  ✅ ${page.html} → JSON-LD: ${allProducts.length} товаров`);
        }
      }
    }

    if (changedThisPage) {
      fs.writeFileSync(htmlPath, html, 'utf8');
      changed++;
    }
  });

  console.log('\nГенерация yandex-feed.xml...');
  buildYandexFeed();

  console.log('\nГенерация google-feed.xml...');
  buildGoogleFeed();

  console.log(`\nГотово. Обновлено файлов: ${changed}`);
}

build();
