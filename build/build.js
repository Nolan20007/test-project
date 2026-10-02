const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://stremyanki-dlya-kolodcev.ru';

const PAGES = [
  { html: 'ss1.html', tables: [{ id: 'nomenclature-container', csv: 'data/ss1-products.csv' }] },
  { html: 'ss2.html', tables: [{ id: 'nomenclature-container', csv: 'data/ss2-products.csv' }] },
  { html: 'kl-1-dlya-kanalizacionnyh-kolodcev.html', tables: [{ id: 'nomenclature-container', csv: 'data/kl1-products.csv' }] },
  { html: 'vl-2-l-19-vodoprovodnaya.html', tables: [{ id: 'nomenclature-container', csv: 'data/vdl-products.csv' }] },
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
  { html: 'price-list.html', tables: [
      { id: 'nomenclature-ss1',                  csv: 'data/ss1-products.csv' },
      { id: 'nomenclature-ss2',                  csv: 'data/ss2-products.csv' },
      { id: 'nomenclature-tmp-902-kruglye',       csv: 'data/tmp-902-kruglye.csv' },
      { id: 'nomenclature-tmp-902-pryamougolnye', csv: 'data/tmp-902-pryamougolnye.csv' },
      { id: 'nomenclature-tmp-902-perepadnye',    csv: 'data/tmp-902-perepadnye.csv' },
      { id: 'nomenclature-tl-50',                 csv: 'data/tl-products.csv' },
      { id: 'nomenclature-tl-63',                 csv: 'data/tl-63-products.csv' },
      { id: 'nomenclature-ssg1',                  csv: 'data/ssg1-products.csv' },
      { id: 'nomenclature-vdl',                   csv: 'data/vdl-products.csv' },
      { id: 'nomenclature-kl1',                   csv: 'data/kl1-products.csv' },
      { id: 'nomenclature-scoba-nm',              csv: 'data/scoba-nm-products.csv' }
  ]},
];

const FEED_SOURCES = [
  { csv: 'data/ss1-products.csv',             page: 'ss1.html',             bigImage: 'images/ss1/vid-1.png',  limit: 20, typePrefix: 'Стремянка, лестница для колодцев' },
  { csv: 'data/ss2-products.csv',             page: 'ss2.html',             bigImage: 'images/ss2/vid-1.png',  limit: 20, typePrefix: 'Стремянка, лестница для колодцев' },
  { csv: 'data/ssg1-products.csv',            page: 'ssg1.html',            bigImage: 'images/ssg1/ssg1-large.png', limit: 20, typePrefix: 'Пожарная стремянка' },
  { csv: 'data/tl-products.csv',              page: 'l-16-dlya-teplovyh-setej.html', bigImage: 'images/tl/vid-1.png', limit: 20, typePrefix: 'Стремянка, лестница тепловых сетей' },
  { csv: 'data/tl-63-products.csv',           page: 'l-16-dlya-teplovyh-setej.html', bigImage: 'images/tl/vid-1.png', limit: 20, typePrefix: 'Стремянка, лестница тепловых сетей' },
  { csv: 'data/kl1-products.csv',             page: 'kl-1-dlya-kanalizacionnyh-kolodcev.html', bigImage: 'images/kl1/kl1-large.png', limit: 20, typePrefix: 'Лестница для колодцев' },
  { csv: 'data/vdl-products.csv',             page: 'vl-2-l-19-vodoprovodnaya.html', bigImage: 'images/vl2-large.png', limit: 20, typePrefix: 'Лестница для колодцев' },
  { csv: 'data/tmp-902-kruglye.csv',          page: 'tmp-902.html',         bigImage: 'images/tmp-902/vid-1.png', limit: 20, typePrefix: 'Стремянка, лестница для колодцев' },
  { csv: 'data/tmp-902-pryamougolnye.csv',    page: 'tmp-902.html',         bigImage: 'images/tmp-902/vid-1.png', limit: 20, typePrefix: 'Стремянка, лестница для колодцев' },
  { csv: 'data/tmp-902-perepadnye.csv',       page: 'tmp-902.html',         bigImage: 'images/tmp-902/vid-1.png', limit: 20, typePrefix: 'Стремянка, лестница для колодцев' },
  { csv: 'data/scoba-nm-products.csv',        page: 'skoba-mn.html',        bigImage: 'images/scoba-nm/vid-1.png', limit: 20, typePrefix: 'Скоба ходовая' },
];

const M_START = '<!-- NOMENCLATURE_START -->';
const M_END   = '<!-- NOMENCLATURE_END -->';
const JSONLD_START = '<!-- JSONLD_PRODUCTS_START -->';
const JSONLD_END   = '<!-- JSONLD_PRODUCTS_END -->';
const NAV_START = '<!-- NAV_START -->';
const NAV_END = '<!-- NAV_END -->';
const FOOTER_START = '<!-- FOOTER_START -->';
const FOOTER_END = '<!-- FOOTER_END -->';

const PRICE_START_RE = /<!--\s*PRICE_START:min:([^>]+?)\s*-->/;
const PRICE_END = '<!-- PRICE_END -->';

const COLLAPSE_THRESHOLD = 11;
const COLLAPSE_SHOW = 10;

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
  const after = html.slice(endIdx);

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
function safeAnchor(id) {
  return 'item-' + String(id).replace(/[^a-zA-Z0-9а-яА-ЯёЁ\-_.]/g, '_');
}

// ===== Подстановка минимальных цен по маркерам PRICE_START/PRICE_END =====
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

// ===== Таблица =====
function buildTable(products, enableCollapse) {
  if (!products.length) return '<div class="loading">Нет данных о продукции</div>';

  const total = products.length;
  const needCollapse = enableCollapse && total > COLLAPSE_THRESHOLD;

  let html = `<table class="nomenclature-table"><thead><tr>
    <th>Фото</th><th>Изделие</th><th>Длина, см</th><th>Ширина, см</th>
    <th>Масса, кг</th><th>Цена</th><th>ед. изм.</th><th>Наличие</th>
    <th>Количество</th><th>Корзина</th></tr></thead><tbody>`;

  products.forEach((p, idx) => {
    const id = esc(p.id), name = esc(p.name), length = esc(p.length), width = esc(p.width),
          weight = esc(p.weight), unit = esc(p.unit), available = esc(p.available),
          img = esc(p.image || 'images/default-product.png'),
          price = parseFloat(p.price) || 0,
          anchor = safeAnchor(p.id);

    const hiddenStyle = (needCollapse && idx >= COLLAPSE_SHOW) ? ' style="display:none;" class="hidden-row"' : '';

    html += `<tr id="${anchor}"${hiddenStyle}>
      <td><img src="${img}" alt="${name}" style="max-height:40px;" loading="lazy" onerror="this.src='images/default-product.png'"></td>
      <td>${name}</td><td>${length}</td><td>${width}</td><td>${weight}</td>
      <td>от ${fmtPrice(price)} руб.</td><td>${unit}</td>
      <td><span class="availability-icon">${available}</span></td>
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
    const obj = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": p.name,
      "sku": p.id,
      "mpn": p.id,
      "image": SITE_URL + '/' + (p.image || 'images/default-product.png'),
      "description": p.name + '. Длина ' + p.length + ' см, ширина ' + p.width + ' см, масса ' + p.weight + ' кг.',
      "brand": { "@type": "Brand", "name": "Производство лестниц и стремянок для колодцев" },
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
    if (src.limit) products = products.slice(0, src.limit);

    products.forEach(p => {
      const price = parseFloat(p.price) || 0;
      if (price <= 0) return;

      const anchor = safeAnchor(p.id);
      const url = `${SITE_URL}/${src.page}#${anchor}`;
      const picture = `${SITE_URL}/${src.bigImage}`;
      const typePrefix = src.typePrefix || 'Стремянка для колодцев';

      offers.push(`    <offer id="${esc(p.id)}" available="true">
      <url>${esc(url)}</url>
      <price>${price}</price>
      <currencyId>RUB</currencyId>
      <categoryId>1</categoryId>
      <picture>${esc(picture)}</picture>
      <name>${esc(p.name)}</name>
      <vendor>Производство лестниц для колодцев</vendor>
      <typePrefix>${esc(typePrefix)}</typePrefix>
      <model>${esc(p.id)}</model>
      <description>${esc(p.name)}. Длина ${esc(p.length)} см, ширина ${esc(p.width)} см, масса ${esc(p.weight)} кг.</description>
    </offer>`);
    });
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${new Date().toISOString().slice(0,16).replace('T',' ')}">
  <shop>
    <name>Производство лестниц и стремянок для колодцев</name>
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
  console.log(`  ✓ yandex-feed.xml создан (${offers.length} товаров)`);
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
];

function processMarkers(file, navContent, footerContent) {
  const filePath = path.resolve(__dirname, '..', file);
  if (!fs.existsSync(filePath)) return false;

  let html = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  if (navContent) {
    const navResult = replaceBetweenMarkers(html, NAV_START, NAV_END, navContent);
    if (navResult.replaced) { html = navResult.html; changed = true; }
  }

  if (footerContent) {
    const footerResult = replaceBetweenMarkers(html, FOOTER_START, FOOTER_END, footerContent);
    if (footerResult.replaced) { html = footerResult.html; changed = true; }
  }

  const priceResult = replacePrices(html);
  if (priceResult.replaced) {
    html = priceResult.html;
    changed = true;
    console.log(`  ✓ ${file} → цены обновлены из CSV`);
  }

  if (changed) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`  ✓ ${file} → NAV/FOOTER/PRICE обновлены`);
    return true;
  }
  return false;
}

function build() {
  let changed = 0;

  console.log('Чтение includes/...');
  const navContent = loadInclude('nav.html');
  const footerContent = loadInclude('footer.html');
  if (navContent)    console.log('  ✓ includes/nav.html');
  if (footerContent) console.log('  ✓ includes/footer.html');

  console.log('\nОбработка NAV, FOOTER, PRICE...');
  ALL_HTML_FILES.forEach(file => {
    if (processMarkers(file, navContent, footerContent)) changed++;
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
        console.log(`  ✓ ${page.html} → #${t.id} (${products.length} строк)`);
      } else {
        console.log(`  · ${page.html} → #${t.id} без изменений`);
      }
    });

    if (!isPriceList) {
      const cleanedHtml = stripOldProductJsonLd(html);
      if (cleanedHtml !== html) {
        html = cleanedHtml; changedThisPage = true;
        console.log(`  ✓ ${page.html} → удалены старые Product JSON-LD`);
      }

      const pageUrl = SITE_URL + '/' + page.html;
      const jsonLd = buildProductListJsonLd(allProducts, pageUrl);
      if (jsonLd) {
        const newHtml = replaceJsonLd(html, jsonLd);
        if (newHtml !== html) {
          html = newHtml; changedThisPage = true;
          console.log(`  ✓ ${page.html} → JSON-LD: ${allProducts.length} товаров`);
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

  console.log(`\nГотово. Обновлено файлов: ${changed}`);
}

build();
