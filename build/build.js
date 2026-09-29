const fs = require('fs');
const path = require('path');

const PAGES = [
  { html: 'ss1.html', productName: 'Стремянки для водопроводных колодцев ТПР 901-09-11.84', tables: [{ id: 'nomenclature-container', csv: 'data/ss1-products.csv' }] },
  { html: 'ss2.html', productName: 'Стремянки для канализационных колодцев ТПР 902-09-22.84', tables: [{ id: 'nomenclature-container', csv: 'data/ss2-products.csv' }] },
  { html: 'kl-1-dlya-kanalizacionnyh-kolodcev.html', productName: 'Канализационные лестницы КЛ-1 (Л-1, Л-18)', tables: [{ id: 'nomenclature-container', csv: 'data/kl1-products.csv' }] },
  { html: 'vl-2-l-19-vodoprovodnaya.html', productName: 'Водопроводные лестницы ВЛ-2 (Л-2, Л-19)', tables: [{ id: 'nomenclature-container', csv: 'data/vdl-products.csv' }] },
  { html: 'ssg1.html', productName: 'Пожарные стремянки СГ серия 1.450.3-7.94', tables: [{ id: 'nomenclature-container', csv: 'data/ssg1-products.csv' }] },
  { html: 'l-16-dlya-teplovyh-setej.html', productName: 'Лестницы тепловых сетей Л-16 (ТС)', tables: [
      { id: 'nomenclature-50', csv: 'data/tl-products.csv' },
      { id: 'nomenclature-63', csv: 'data/tl-63-products.csv' }
  ]},
  { html: 'tmp-902.html', productName: 'Стремянки для колодцев ТМП 902-09-46.88', tables: [
      { id: 'nomenclature-kruglye', csv: 'data/tmp-902-kruglye.csv' },
      { id: 'nomenclature-pryamougolnye', csv: 'data/tmp-902-pryamougolnye.csv' },
      { id: 'nomenclature-perepadnye', csv: 'data/tmp-902-perepadnye.csv' }
  ]},
];

const M_START = '<!-- NOMENCLATURE_START -->';
const M_END   = '<!-- NOMENCLATURE_END -->';
const JSONLD_START = '<!-- JSONLD_PRODUCT_START -->';
const JSONLD_END   = '<!-- JSONLD_PRODUCT_END -->';

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

function buildTable(products) {
  if (!products.length) return '<div class="loading">Нет данных о продукции</div>';
  let html = `<table class="nomenclature-table"><thead><tr>
    <th>Фото</th><th>Изделие</th><th>Длина, см</th><th>Ширина, см</th>
    <th>Масса, кг</th><th>Цена</th><th>ед. изм.</th><th>Наличие</th>
    <th>Количество</th><th>Корзина</th></tr></thead><tbody>`;
  products.forEach(p => {
    const id = esc(p.id), name = esc(p.name), length = esc(p.length), width = esc(p.width),
          weight = esc(p.weight), unit = esc(p.unit), available = esc(p.available),
          img = esc(p.image || 'images/default-product.png'),
          price = parseFloat(p.price) || 0;
    html += `<tr>
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
            data-item-length="${length}" data-item-weight="${weight}">🛒</button></td>
    </tr>`;
  });
  return html + '</tbody></table>';
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

// ==== JSON-LD Product: генерируем разметку для страницы ====
function buildProductJsonLd(page, products, pageUrl) {
  if (!products.length) return '';

  const prices = products
    .map(p => parseFloat(p.price))
    .filter(n => !isNaN(n) && n > 0);

  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  const obj = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": page.productName,
    "description": page.productName + " — цены от производителя, доставка по России.",
    "brand": {
      "@type": "Brand",
      "name": "Производство лестниц и стремянок для колодцев"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "RUB",
      "lowPrice": String(minPrice),
      "highPrice": String(maxPrice),
      "offerCount": String(products.length),
      "availability": "https://schema.org/InStock",
      "url": pageUrl,
      "seller": {
        "@type": "Organization",
        "name": "ИП Гневашева Кристина Дмитриевна"
      }
    }
  };

  return JSON.stringify(obj, null, 2);
}

// Вставляет JSON-LD между маркерами JSONLD_PRODUCT_START/END в <head>
function replaceJsonLd(html, jsonLd) {
  const block = `${JSONLD_START}\n<script type="application/ld+json">\n${jsonLd}\n</script>\n${JSONLD_END}`;

  const re = new RegExp(
    `${JSONLD_START.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}[\\s\\S]*?${JSONLD_END.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}`
  );

  if (re.test(html)) {
    return html.replace(re, block);
  }

  // Если маркеров нет — вставим перед </head>
  return html.replace('</head>', `${block}\n</head>`);
}

function build() {
  let changed = 0;
  PAGES.forEach(page => {
    const htmlPath = path.resolve(__dirname, '..', page.html);
    if (!fs.existsSync(htmlPath)) { console.warn(`⚠ Нет файла: ${page.html}`); return; }
    let html = fs.readFileSync(htmlPath, 'utf8');
    let changedThisPage = false;

    // Собираем товары со всех таблиц страницы
    const allProducts = [];
    page.tables.forEach(t => {
      const csvPath = path.resolve(__dirname, '..', t.csv);
      if (!fs.existsSync(csvPath)) { console.warn(`  ⚠ Нет CSV: ${t.csv}`); return; }
      const csv = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
      const products = parseCSV(csv);
      allProducts.push(...products);

      const newHtml = replaceContainer(html, t.id, buildTable(products));
      if (newHtml !== html) {
        html = newHtml; changedThisPage = true;
        console.log(`  ✓ ${page.html} → #${t.id} (${products.length} строк)`);
      } else {
        console.log(`  · ${page.html} → #${t.id} без изменений`);
      }
    });

    // Генерируем и вставляем JSON-LD
    const pageUrl = 'https://stremyanki-dlya-kolodcev.ru/' + page.html;
    const jsonLd = buildProductJsonLd(page, allProducts, pageUrl);
    if (jsonLd) {
      const newHtml = replaceJsonLd(html, jsonLd);
      if (newHtml !== html) {
        html = newHtml; changedThisPage = true;
        console.log(`  ✓ ${page.html} → JSON-LD Product (${allProducts.length} товаров)`);
      }
    }

    if (changedThisPage) {
      fs.writeFileSync(htmlPath, html, 'utf8');
      changed++;
    }
  });
  console.log(`\nГотово. Обновлено страниц: ${changed}`);
}

build();