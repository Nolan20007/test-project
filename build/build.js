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
];

const M_START = '<!-- NOMENCLATURE_START -->';
const M_END   = '<!-- NOMENCLATURE_END -->';
const JSONLD_START = '<!-- JSONLD_PRODUCTS_START -->';
const JSONLD_END   = '<!-- JSONLD_PRODUCTS_END -->';

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
          price = parseFloat(p.price) || 0,
          anchor = safeAnchor(p.id);
    html += `<tr id="${anchor}">
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

// ==== JSON-LD: массив Product ====
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

// ==== НОВОЕ: обновление минимальных цен на index.html ====
function getMinPriceFromCsvs(csvFiles) {
  let min = Infinity;
  csvFiles.forEach(file => {
    const csvPath = path.resolve(__dirname, '..', 'data', file.trim());
    if (!fs.existsSync(csvPath)) {
      console.warn(`  ⚠ Не найден CSV для прайса: ${file}`);
      return;
    }
    const csv = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
    const products = parseCSV(csv);
    products.forEach(p => {
      const price = parseFloat(p.price);
      if (!isNaN(price) && price > 0 && price < min) min = price;
    });
  });
  return min === Infinity ? null : min;
}

function updateIndexPrices(html) {
  // Ищем все маркеры <!-- PRICE_START:min:file1.csv,file2.csv -->...<!-- PRICE_END -->
  const re = /<!--\s*PRICE_START:min:([^>]+?)\s*-->([\s\S]*?)<!--\s*PRICE_END\s*-->/g;
  let updated = 0;

  const newHtml = html.replace(re, (match, csvList, oldContent) => {
    const min = getMinPriceFromCsvs(csvList.split(','));
    if (min === null) return match;

    const formatted = fmtPrice(min) + ' ₽';
    const newBlock = `<!-- PRICE_START:min:${csvList.trim()} -->${formatted}<!-- PRICE_END -->`;
    if (newBlock !== match) updated++;
    return newBlock;
  });

  return { html: newHtml, updated };
}

function build() {
  let changed = 0;

  // 1. Обрабатываем страницы каталога
  PAGES.forEach(page => {
    const htmlPath = path.resolve(__dirname, '..', page.html);
    if (!fs.existsSync(htmlPath)) { console.warn(`⚠ Нет файла: ${page.html}`); return; }
    let html = fs.readFileSync(htmlPath, 'utf8');
    let changedThisPage = false;

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

    if (changedThisPage) {
      fs.writeFileSync(htmlPath, html, 'utf8');
      changed++;
    }
  });

  // 2. Обрабатываем index.html (обновление минимальных цен)
  const indexPath = path.resolve(__dirname, '..', 'index.html');
  if (fs.existsSync(indexPath)) {
    const html = fs.readFileSync(indexPath, 'utf8');
    const result = updateIndexPrices(html);
    if (result.html !== html) {
      fs.writeFileSync(indexPath, result.html, 'utf8');
      console.log(`  ✓ index.html → обновлено цен: ${result.updated}`);
      changed++;
    } else {
      console.log(`  · index.html без изменений`);
    }
  } else {
    console.warn(`⚠ Нет файла: index.html`);
  }

  console.log(`\nГотово. Обновлено страниц: ${changed}`);
}

build();