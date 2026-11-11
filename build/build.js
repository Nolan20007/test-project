const fs = require('fs');
const path = require('path');
const { renderMasterProduct } = require('./master-template-renderer');
const { getProductPath, getProductPathById } = require('./product-url-registry');

const SITE_URL = 'https://stremyanki-dlya-kolodcev.ru';
// Individual product pages are generated from master-template group configs.

const PAGES = [
  { html: 'ss1.html', tables: [{ id: 'nomenclature-container', csv: 'data/ss1-products.csv' }] },
  { html: 'lestnica-podvesnaya-l-16.html', tables: [{ id: 'nomenclature-container', csv: 'data/lestnica-podvesnaya-l-16.csv' }] },
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
  { html: 'nts-62-91-111a.html', tables: [{ id: 'nomenclature-nts-a', csv: 'data/nts-62-91-111a-products.csv' }] },
  { html: 'skoby-dlya-kolodcev.html', tables: [{ id: 'nomenclature-container', csv: 'data/skoby-dlya-kolodcev-products.csv', dimensionHeaders: ['Габарит 1, см', 'Габарит 2, см'] }] },
  { html: 'soedinitelnye-elementy.html', tables: [{ id: 'nomenclature-container', csv: 'data/soedinitelnye-elementy-products.csv', dimensionHeaders: ['Ширина, см', 'Высота, см'] }] },
  { html: 'nts-62-91-111b.html', tables: [{ id: 'nomenclature-nts-b', csv: 'data/nts-62-91-111b-products.csv' }] },
  { html: 'nts-62-91-111.html', skipJsonLd: true, tables: [{ id: 'nomenclature-nts-s', csv: 'data/nts-62-91-111-products.csv' }] },
  { html: 'lestnicy-teplovyh-setej-ts.html', tables: [
      { id: 'nomenclature-50', csv: 'data/lestnica-ts-50-products.csv' },
      { id: 'nomenclature-63', csv: 'data/lestnica-ts-63-products.csv' }
  ]},
  { html: 'tmp-902.html', tables: [
      { id: 'nomenclature-kruglye', csv: 'data/tmp-902-kruglye.csv' },
      { id: 'nomenclature-pryamougolnye', csv: 'data/tmp-902-pryamougolnye.csv' },
      { id: 'nomenclature-perepadnye', csv: 'data/tmp-902-perepadnye.csv' }
  ]},

  { html: 'price-list.html', tables: [
      { id: 'nomenclature-nts-b', csv: 'data/nts-62-91-111b-products.csv' },
      { id: 'nomenclature-nts-s', csv: 'data/nts-62-91-111-products.csv' },
      { id: 'nomenclature-nts-a', csv: 'data/nts-62-91-111a-products.csv' },
      { id: 'nomenclature-ss1',                  csv: 'data/ss1-products.csv' },
      { id: 'nomenclature-ss2',                  csv: 'data/ss2-products.csv' },
      { id: 'nomenclature-l-17',                 csv: 'data/l-17-000SB-products.csv' },
      { id: 'nomenclature-l-3',                  csv: 'data/l-3-sk-2201-88-products.csv' },
      { id: 'nomenclature-l-19',                 csv: 'data/l-19-products.csv' },
      { id: 'nomenclature-tmp-902-kruglye',       csv: 'data/tmp-902-kruglye.csv' },
      { id: 'nomenclature-tmp-902-pryamougolnye', csv: 'data/tmp-902-pryamougolnye.csv' },
      { id: 'nomenclature-tmp-902-perepadnye',    csv: 'data/tmp-902-perepadnye.csv' },
      { id: 'nomenclature-tl-50',                 csv: 'data/lestnica-ts-50-products.csv' },
      { id: 'nomenclature-tl-63',                 csv: 'data/lestnica-ts-63-products.csv' },
      { id: 'nomenclature-ssg1',                  csv: 'data/ssg1-products.csv' },
      { id: 'nomenclature-vl2-22',                csv: 'data/vdl-products-22.csv' },
      { id: 'nomenclature-vl2-25',                csv: 'data/vdl-products-25.csv' },
      { id: 'nomenclature-vl2-28',                csv: 'data/vdl-products-28.csv' },
      { id: 'nomenclature-kl1-25',                csv: 'data/kl1-products.csv' },
      { id: 'nomenclature-kl1-28',                csv: 'data/kl1-products-28.csv' },
      { id: 'nomenclature-skoby',                 csv: 'data/skoby-dlya-kolodcev-products.csv', dimensionHeaders: ['Габарит 1, см', 'Габарит 2, см'] },
      { id: 'nomenclature-ms', csv: 'data/soedinitelnye-elementy-products.csv', dimensionHeaders: ['Ширина, см', 'Высота, см'] }
  ]},
];

const FEED_SOURCES = [
  { csv: 'data/ss1-products.csv',             page: 'ss1.html',             bigImage: 'images/ss1/vid-1.png',  typePrefix: 'Стремянка, лестница для колодцев' },
  { csv: 'data/ss2-products.csv',             page: 'ss2.html',             bigImage: 'images/ss2/vid-1.png',  typePrefix: 'Стремянка, лестница для колодцев' },
  { csv: 'data/l-17-000SB-products.csv',      page: 'l-17-000SB.html',      bigImage: 'images/l-17-000SB/vid-1.png', typePrefix: 'Лестница подвесная Л-17 для гидранта' },
  { csv: 'data/l-3-sk-2201-88-products.csv',  page: 'l-3-sk-2201-88.html',  bigImage: 'images/l-3-sk-2201-88/vid-1.png', typePrefix: 'Лестница Л-3 СК 2201-88-36' },
  { csv: 'data/l-19-products.csv',            page: 'l-19.html',            bigImage: 'images/l-19/vid-1.png', typePrefix: 'Лестница для колодцев' },
  { csv: 'data/ssg1-products.csv',            page: 'ssg1.html',            bigImage: 'images/ssg1/vid-1.png', typePrefix: 'Пожарная стремянка' },
  { csv: 'data/lestnica-ts-50-products.csv',              page: 'lestnicy-teplovyh-setej-ts.html', bigImage: 'images/lestnicy-teplovyh-setej-ts/vid-1.png', typePrefix: 'Лестница тепловых сетей ТС' },
  { csv: 'data/lestnica-ts-63-products.csv',           page: 'lestnicy-teplovyh-setej-ts.html', bigImage: 'images/lestnicy-teplovyh-setej-ts/vid-1.png', typePrefix: 'Лестница тепловых сетей ТС' },
  { csv: 'data/vdl-products-22.csv',          page: 'vl-2-l-19-vodoprovodnaya.html', bigImage: 'images/vdl/vid-1.png', typePrefix: 'Лестница для колодцев' },
  { csv: 'data/vdl-products-25.csv',          page: 'vl-2-l-19-vodoprovodnaya.html', bigImage: 'images/vdl/vid-1.png', typePrefix: 'Лестница для колодцев' },
  { csv: 'data/vdl-products-28.csv',          page: 'vl-2-l-19-vodoprovodnaya.html', bigImage: 'images/vdl/vid-1.png', typePrefix: 'Лестница для колодцев' },
  { csv: 'data/kl1-products.csv',             page: 'kl-1-dlya-kanalizacionnyh-kolodcev.html', bigImage: 'images/kl1/vid-1.png', typePrefix: 'Лестница для колодцев' },
  { csv: 'data/kl1-products-28.csv',          page: 'kl-1-dlya-kanalizacionnyh-kolodcev.html', bigImage: 'images/kl1/vid-1.png', typePrefix: 'Лестница для колодцев' },
  { csv: 'data/tmp-902-kruglye.csv',          page: 'tmp-902.html',         bigImage: 'images/tmp-902/vid-1.png', typePrefix: 'Стремянка, лестница для колодцев' },
  { csv: 'data/tmp-902-pryamougolnye.csv',    page: 'tmp-902.html',         bigImage: 'images/tmp-902/vid-1.png', typePrefix: 'Стремянка, лестница для колодцев' },
  { csv: 'data/tmp-902-perepadnye.csv',       page: 'tmp-902.html',         bigImage: 'images/tmp-902/vid-1.png', typePrefix: 'Стремянка, лестница для колодцев' },
  { csv: 'data/skoby-dlya-kolodcev-products.csv', page: 'skoby-dlya-kolodcev.html', bigImage: 'images/default-product.svg', typePrefix: 'Скоба для колодцев' },
  { csv: 'data/soedinitelnye-elementy-products.csv', page: 'soedinitelnye-elementy.html', bigImage: 'images/soedinitelnye-elementy/vid-1.png', typePrefix: 'Соединительный элемент МС' },
  { csv: 'data/nts-62-91-111-products.csv',     page: 'nts-62-91-111.html',   bigImage: 'images/nts-62-91-111/vid-1.webp', typePrefix: 'Лестница тепловых сетей' },
  { csv: 'data/nts-62-91-111b-products.csv',    page: 'nts-62-91-111b.html',  bigImage: 'images/nts-62-91-111b/vid-1.webp', typePrefix: 'Лестница тепловых сетей' },
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

const ANALYTICS_TAG = '<script defer src="js/analytics.js"></script>';
const ANALYTICS_TAG_PRODUCT = '<script defer src="../../js/analytics.js"></script>';
const ANALYTICS_RE = /<script\b(?=[^>]*\bsrc=["'](\.\.\/)?js\/analytics\.js["'])[^>]*>\s*<\/script>/i;

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

function buildTable(products, enableCollapse, dimensionHeaders) {
  if (!products.length) return '<div class="loading">Нет данных о продукции</div>';

  const total = products.length;
  const needCollapse = enableCollapse && total > COLLAPSE_THRESHOLD;

  const hasPricedProducts = products.some(p => Number(p.price) > 0);
  const hasAvailability = products.some(p => String(p.available || '').trim());
  const hasStepCount = products.some(p => String(p.step_count || '').trim() !== '');
  const headers = Array.isArray(dimensionHeaders) && dimensionHeaders.length === 2
    ? dimensionHeaders
    : ['Длина, см', 'Ширина, см'];
  let html = `<table class="nomenclature-table"><thead><tr>
    <th>Фото</th><th>Изделие</th><th>${esc(headers[0])}</th><th>${esc(headers[1])}</th>${hasStepCount ? '<th>Ступени, шт</th>' : ''}
    <th>Масса, кг</th><th>Цена</th><th>ед. изм.</th>${hasAvailability ? '<th>Наличие</th>' : ''}${hasPricedProducts ? '<th>Количество</th><th>Корзина</th>' : ''}</tr></thead><tbody>`;

  products.forEach((p, idx) => {
    const id = esc(p.id), name = esc(p.name), length = esc(p.length), width = esc(p.width),
          weight = esc(p.weight), unit = esc(p.unit),
          img = esc(p.image || 'images/default-product.svg'),
          price = parseFloat(p.price) || 0,
          anchor = safeAnchor(p.id);
    const imageHtml = img !== 'images/default-product.svg'
      ? `<img src="${img}" alt="${name}" width="56" height="56" style="width:56px;height:56px;max-height:56px;object-fit:contain;" loading="lazy" decoding="async" >`
      : '<img class="product-thumb-placeholder-image" src="images/default-product.svg" alt="" aria-hidden="true" width="56" height="56" loading="lazy">';

    // Product detail URLs come only from the central registry.
    const registeredPath = getProductPathById(p.id);
    const itemUrl = registeredPath ? registeredPath.slice(1) : '#';

    const hiddenStyle = (needCollapse && idx >= COLLAPSE_SHOW) ? ' style="display:none;" class="hidden-row"' : '';

    const tableName = (id.startsWith('NTSS-') || id.startsWith('NTSB-') || id.startsWith('NTSA-')) ? name.replace(/,\s*длина\s+\d+\s*мм$/i, '') : name;
    const nameHtml = itemUrl !== '#' ? `<a href="${itemUrl}" style="color: var(--primary-color); text-decoration: underline;">${tableName}</a>` : tableName;

    const priceCell = price > 0 ? `от ${fmtPrice(price)} руб.` : 'по запросу';
    const availabilityCell = id.startsWith('MS-') && String(p.available || '').trim()
      ? '✅'
      : esc(p.available || '—');
    const orderCells = hasPricedProducts ? (price > 0 ? `<td class="cart-cell"><div class="quantity-control">
        <button type="button" onclick="changeQuantity('${id}', -1)">−</button>
        <input type="number" id="${id}-qty" value="1" min="1" max="99" data-price="${price}">
        <button type="button" onclick="changeQuantity('${id}', 1)">+</button>
      </div></td>
      <td><button type="button" class="cart-button" data-item-id="${id}" data-item-name="${name}"
            data-item-length="${length}" data-item-weight="${weight}">В корзину</button></td>` : '<td>—</td><td>—</td>') : '';
    const stepsCell = hasStepCount ? `<td>${esc(p.step_count || '—')}</td>` : '';
    html += `<tr id="${anchor}"${hiddenStyle}>
      <td class="product-thumb-cell">${imageHtml}</td>
      <td>${nameHtml}</td><td>${length}</td><td>${width}</td>${stepsCell}<td>${weight}</td>
      <td>${priceCell}</td><td>${unit}</td>${hasAvailability ? `<td>${availabilityCell}</td>` : ''}${orderCells}
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

  // Category pages describe a collection, not a single purchasable product.
  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "url": pageUrl,
    "mainEntity": {
      "@type": "ItemList",
      "itemListOrder": "https://schema.org/ItemListOrderAscending",
      "numberOfItems": products.length,
      "itemListElement": products.map((p, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": p.name,
        "url": pageUrl + '#' + safeAnchor(p.id)
      }))
    }
  };

  return '<script type="application/ld+json">\n' +
    JSON.stringify(collection, null, 2) +
    '\n</script>';
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

function getFeedImagePath(src, product) {
  const productId = String(product && product.id || '').trim().toUpperCase();
  const baseProductId = productId.replace(/-902$/, '');
  const msGroup = /^MS-[1-4]$/.test(baseProductId) ? 'ms-1-2-3-4' : /^MS-[5-8]$/.test(baseProductId) ? 'ms-5-6-7-8' : '';
  if (msGroup) {
    const groupSearchImage = 'images/soedinitelnye-elementy/' + msGroup + '-search.webp';
    if (fs.existsSync(path.resolve(__dirname, '..', groupSearchImage))) return groupSearchImage;
  }
  const original = src.bigImage;
  const searchImage = original.replace(/vid-1\.(?:png|webp)$/i, 'vid-search.webp');
  if (searchImage !== original && fs.existsSync(path.resolve(__dirname, '..', searchImage))) {
    return searchImage;
  }
  const webpImage = original.replace(/\.png$/i, '.webp');
  if (webpImage !== original && fs.existsSync(path.resolve(__dirname, '..', webpImage))) {
    return webpImage;
  }
  if (fs.existsSync(path.resolve(__dirname, '..', original))) return original;
  throw new Error('[feed] Не найдено изображение товара: ' + original);
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
      
      const picture = `${SITE_URL}/${getFeedImagePath(src, p)}`;
      
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
      
      const picture = `${SITE_URL}/${getFeedImagePath(src, p)}?v=${encodeURIComponent(p.id)}`;
      
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
  'lestnicy-teplovyh-setej-ts.html',
  'nts-62-91-111b.html',
  'nts-62-91-111.html',
  'nts-62-91-111a.html',
  'lestnica-podvesnaya-l-16.html',
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
  'skoby-dlya-kolodcev.html',
  'soedinitelnye-elementy.html',
  'soedinitelnye-elementy-ms-kak-vybrat.html',
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

  // Add the site's existing favicon to pages that do not declare one.
  // Root-relative URLs work for both top-level pages and nested /products/ pages.
  const hasFavicon = /<link\b(?=[^>]*\brel=["'](?:shortcut\s+)?icon["'])[^>]*>/i.test(html);
  if (!hasFavicon && html.includes('</head>')) {
    const faviconLinks = [
      '<link rel="icon" type="image/x-icon" href="/images/favicon.ico">',
      '<link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png">',
      '<link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png">',
      '<link rel="apple-touch-icon" sizes="120x120" href="/images/apple-touch-icon.png">'
    ].join('\n    ');
    html = html.replace('</head>', '    ' + faviconLinks + '\n</head>');
    changed = true;
    console.log('  ✅ ' + file + ' → favicon подключён');
  }

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

  // Shared page-level font and media optimizations are applied during every rebuild.
  // Use the self-hosted Rubik font on every page. Keep the relative path
  // correct for both root pages and generated pages under /products/.
  const fontPrefix = isProductPage ? '../../' : '';
  const googleFontLinks = /<link\s+[^>]*href=["'][^"']*fonts\.googleapis\.com[^"']*["'][^>]*>\s*/gi;
  const googleFontPreconnects = /<link\s+[^>]*href=["'][^"']*fonts\.gstatic\.com[^"']*["'][^>]*>\s*/gi;
  const literalBreak = String.fromCharCode(92) + 'n';
  const brokenFontLinks = 'crossorigin>' + literalBreak + '    <link rel="stylesheet" href="' + fontPrefix + 'css/rubik-local.css">' + literalBreak;
  const fixedFontLinks = 'crossorigin>' + String.fromCharCode(10) + '    <link rel="stylesheet" href="' + fontPrefix + 'css/rubik-local.css">' + String.fromCharCode(10);
  if (html.includes(brokenFontLinks)) { html = html.replace(brokenFontLinks, fixedFontLinks); changed = true; }
  const usesLocalRubik = html.includes(fontPrefix + 'css/rubik-local.css');
  const cleanedFontHtml = html.replace(googleFontLinks, '').replace(googleFontPreconnects, '');
  if (cleanedFontHtml !== html) { html = cleanedFontHtml; changed = true; }
  if (!usesLocalRubik && html.includes('</head>')) {
    const localFontLinks = '    <link rel="preload" href="' + fontPrefix + 'fonts/rubik/rubik-3.woff2" as="font" type="font/woff2" crossorigin>' + String.fromCharCode(10) +
      '    <link rel="stylesheet" href="' + fontPrefix + 'css/rubik-local.css">' + String.fromCharCode(10);
    html = html.replace('</head>', localFontLinks + '</head>');
    changed = true;
    console.log('  ✅ ' + file + ' → Rubik подключён локально');
  }

  // Общие config.js и utils.js переводим на defer для всех страниц.
  // Порядок подключения сохраняется; DOMContentLoaded сработает после defer-скриптов.
  const deferredSharedScripts = html.replace(/<script\b[^>]*>/gi, (tag) => {
    const srcMatch = tag.match(/\bsrc=["']([^"']+)["']/i);
    if (!srcMatch || !/(?:^|\/)(?:config|utils)\.js$/i.test(srcMatch[1]) || /\bdefer\b/i.test(tag)) {
      return tag;
    }
    return tag.replace(/>$/, ' defer>');
  });
  if (deferredSharedScripts !== html) {
    html = deferredSharedScripts;
    changed = true;
    console.log('  ✅ ' + file + ' → config.js и utils.js переведены на defer');
  }

  const priceResult = replacePrices(html);
  if (priceResult.replaced) {
    html = priceResult.html;
    changed = true;
    console.log(`  ✅ ${file} → цены обновлены из CSV`);
  }

  // На главной первая карточка может стать LCP — оставляем её eager.
  // Остальные карточные изображения загружаем только при приближении к viewport.
  if (file === 'index.html') {
    let cardIndex = 0;
    const lazyHtml = html.replace(/<img\b(?=[^>]*\bclass=["'][^"']*\bproduct-image\b)[^>]*>/gi, (tag) => {
      cardIndex += 1;
      if (cardIndex === 1 || /\bloading=["']lazy["']/i.test(tag)) return tag;
      let updated = tag.replace(/>$/, ' loading="lazy">');
      if (!/\bdecoding=/i.test(updated)) updated = updated.replace(/>$/, ' decoding="async">');
      return updated;
    });
    if (lazyHtml !== html) {
      html = lazyHtml;
      changed = true;
      console.log('  ✅ index.html → отложенная загрузка изображений карточек, кроме первой');
    }
  }

  const analyticsTag = isProductPage ? ANALYTICS_TAG_PRODUCT : ANALYTICS_TAG;
  let analyticsTagCount = 0;
  const normalizedAnalyticsHtml = html.replace(/<script\b[^>]*\bsrc=["'][^"']*analytics\.js["'][^>]*>\s*<\/script>/gi, () => {
    analyticsTagCount += 1;
    return analyticsTagCount === 1 ? analyticsTag : '';
  });
  if (normalizedAnalyticsHtml !== html) {
    html = normalizedAnalyticsHtml;
    changed = true;
    console.log('  ✅ ' + file + ' → дубли analytics.js удалены, подключение нормализовано');
  } else if (analyticsTagCount === 0 && html.includes('</head>')) {
    html = html.replace('</head>', '    ' + analyticsTag + '\n</head>');
    changed = true;
    console.log('  ✅ ' + file + ' → добавлен analytics.js с defer');
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

function loadMasterTemplateGroups() {
  const configDir = path.resolve(__dirname, '..', 'data/product-groups');
  if (!fs.existsSync(configDir)) return [];
  return fs.readdirSync(configDir)
    .filter(file => file.endsWith('.json'))
    .sort()
    .map(file => ({
      configPath: path.join(configDir, file),
      group: JSON.parse(fs.readFileSync(path.join(configDir, file), 'utf8'))
    }));
}

function buildProductPages() {
  const createdPages = [];
  // Generate every configured master-template product family. Each group validates
  // its complete CSV set before writing pages; generated pages feed sitemap and llms.txt.
  const masterGroups = loadMasterTemplateGroups();
  const masterGroupData = new Map(masterGroups.map(({ group }) => [group.id, {
    group,
    rows: parseCSV(fs.readFileSync(path.resolve(__dirname, '..', group.csv), 'utf8').replace(/^\uFEFF/, ''))
  }]));
  masterGroups.forEach(({ group }) => {
    const groupRows = masterGroupData.get(group.id).rows;
    const relatedVariantGroups = (group.otherSizesVariantGroupIds || [])
      .map(id => masterGroupData.get(id))
      .filter(Boolean);
    const csvIds = groupRows.map(row => row.id);
    if (Array.isArray(group.productIds)) {
      const missingIds = group.productIds.filter(id => !csvIds.includes(id));
      const extraIds = csvIds.filter(id => !group.productIds.includes(id));
      if (missingIds.length || extraIds.length) {
        throw new Error('[product pages] ' + group.id + ' CSV/config IDs mismatch. Missing: ' + missingIds.join(', ') + '; extra: ' + extraIds.join(', '));
      }
    } else {
      const invalidIds = groupRows.filter(row => !String(row.id).startsWith(group.productIdPrefix || '\u0000')).map(row => row.id);
      if (!group.productIdPrefix || invalidIds.length || groupRows.length !== group.expectedProductCount) {
        throw new Error('[product pages] ' + group.id + ' CSV validation failed. Expected ' + group.expectedProductCount + ' rows with prefix ' + group.productIdPrefix + '; received ' + groupRows.length + '. Invalid IDs: ' + invalidIds.join(', '));
      }
    }
    const groupTemplate = fs.readFileSync(path.resolve(__dirname, '..', group.template), 'utf8');
    const groupContent = group.groupContentTemplate
      ? fs.readFileSync(path.resolve(__dirname, '..', group.groupContentTemplate), 'utf8')
      : '';
    const groupOutDir = path.resolve(__dirname, '..', 'products', group.productFolder);
    if (!fs.existsSync(groupOutDir)) fs.mkdirSync(groupOutDir, { recursive: true });
    groupRows.forEach(row => {
      const html = renderMasterProduct(groupTemplate, group, row, groupRows, relatedVariantGroups, groupContent);
      const relativePath = getProductPath(group.id, row.id).slice(1);
      const outPath = path.resolve(__dirname, '..', relativePath);
      fs.writeFileSync(outPath, html, 'utf8');
      console.log('  ✅ ' + relativePath + ' создан');
      createdPages.push(relativePath);
    });
  });

  // Add the shared image viewer to every generated product page so future catalog
  // pages inherit the same click-to-zoom behavior automatically.
  createdPages.forEach(relativePath => {
    const htmlPath = path.resolve(__dirname, '..', relativePath);
    let html = fs.readFileSync(htmlPath, 'utf8');
    if (!html.includes('js/product-lightbox.js')) {
      const script = '<script src="../../js/product-lightbox.js" defer></script>\n';
      html = html.includes('</body>')
        ? html.replace('</body>', script + '</body>')
        : html + '\\n' + script;
      fs.writeFileSync(htmlPath, html, 'utf8');
    }
  });
  return createdPages;
}


function updateLlmsProductLinks() {
  const llmsPath = path.resolve(__dirname, '..', 'llms.txt');
  if (!fs.existsSync(llmsPath)) {
    console.warn('  ⚠ llms.txt не найден — пропускаю обновление ссылок на товары.');
    return false;
  }

  const startMarker = '<!-- PRODUCT_PAGES_START -->';
  const endMarker = '<!-- PRODUCT_PAGES_END -->';
  let content = fs.readFileSync(llmsPath, 'utf8');
  const start = content.indexOf(startMarker);
  const end = content.indexOf(endMarker);
  if (start === -1 || end === -1 || end < start) {
    throw new Error('В llms.txt отсутствуют корректные маркеры PRODUCT_PAGES.');
  }

  const lines = [];
  let productLinkCount = 0;
  const masterGroups = loadMasterTemplateGroups();
  masterGroups.forEach(({ group }) => {
    const rows = parseCSV(fs.readFileSync(path.resolve(__dirname, '..', group.csv), 'utf8').replace(/^\uFEFF/, ''));
    lines.push('### ' + group.catalogTitle);
    rows.forEach(row => {
      const url = SITE_URL + getProductPath(group.id, row.id);
      lines.push('- [' + String(row.name || '').trim() + '](' + url + ')');
      productLinkCount += 1;
    });
    lines.push('');
  });

  const expectedProductLinks = masterGroups.reduce((total, entry) => total + parseCSV(fs.readFileSync(path.resolve(__dirname, '..', entry.group.csv), 'utf8').replace(/^\uFEFF/, '')).length, 0);
  if (productLinkCount !== expectedProductLinks) {
    throw new Error('[llms.txt] Ожидалось ' + expectedProductLinks + ' товарных ссылок, сформировано: ' + productLinkCount);
  }

  const replacement = startMarker + '\n' + lines.join('\n').trimEnd() + '\n' + endMarker;
  const updated = content.slice(0, start) + replacement + content.slice(end + endMarker.length);
  if (updated === content) return false;

  fs.writeFileSync(llmsPath, updated, 'utf8');
  console.log('  ✅ llms.txt → ссылки на ' + productLinkCount + ' карточек товаров обновлены');
  return true;
}

function buildSitemap(productPages) {
  const excludedPages = new Set(['404.html', 'cart.html']);
  const pages = [...new Set([
    ...ALL_HTML_FILES.filter(file => !excludedPages.has(file)),
    ...productPages
  ])];

  const missingPages = pages.filter(file =>
    !fs.existsSync(path.resolve(__dirname, '..', file))
  );
  if (missingPages.length) {
    throw new Error('[sitemap] Не найдены страницы: ' + missingPages.join(', '));
  }

  const urls = pages.map(file =>
    file === 'index.html' ? SITE_URL + '/' : SITE_URL + '/' + file.replace(/\\/g, '/')
  );
  if (new Set(urls).size !== urls.length) {
    throw new Error('[sitemap] Обнаружены повторяющиеся URL.');
  }

  const xmlEscape = value => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(url => '  <url>\n    <loc>' + xmlEscape(url) + '</loc>\n  </url>'),
    '</urlset>',
    ''
  ].join('\n');

  const sitemapPath = path.resolve(__dirname, '..', 'sitemap.xml');
  const current = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, 'utf8') : '';
  if (current === xml) {
    console.log('  · sitemap.xml без изменений (' + urls.length + ' URL)');
    return false;
  }

  fs.writeFileSync(sitemapPath, xml, 'utf8');
  console.log('  ✅ sitemap.xml создан автоматически (' + urls.length + ' URL)');
  return true;
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
  if (updateLlmsProductLinks()) changed++;
  if (buildSitemap(newProductPages)) changed++;

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

      const newHtml = replaceContainer(html, t.id, buildTable(products, isPriceList, t.dimensionHeaders));
      if (newHtml !== html) {
        html = newHtml; changedThisPage = true;
        console.log(`  ✅ ${page.html} → #${t.id} (${products.length} строк)`);
      } else {
        console.log(`  · ${page.html} → #${t.id} без изменений`);
      }
    });

    if (!isPriceList && !page.skipJsonLd) {
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
