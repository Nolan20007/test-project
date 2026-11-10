function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function slugify(value) {
  return String(value || '').toLowerCase()
    .replace(/[^a-z0-9а-яё]+/giu, '-').replace(/^-+|-+$/g, '');
}

function productProject(row, group) {
  const match = String(row.name || '').match(/\(([^)]+)\)/);
  return match ? match[1].replace(/СБ(?=$|-)/g, 'СБ') : group.project;
}

function renderMasterProduct(template, group, row, rows) {
  if (!group || typeof group !== 'object') throw new Error('A product group configuration is required.');
  if (!row || !row.id || !row.name) throw new Error('Product row must contain id and name.');
  const widthMm = Math.round(Number(row.width) * 10);
  const lengthCm = Number(row.length);
  const weight = Number(String(row.weight).replace(',', '.'));
  const price = Number(String(row.price).replace(/[^\d.,-]/g, '').replace(',', '.'));
  const stepCount = Number(row.step_count);
  if (![widthMm, lengthCm, weight, stepCount].every(Number.isFinite) || widthMm <= 0 || lengthCm <= 0 || weight <= 0 || stepCount <= 0 || !group.construction.availableWidthsMm.includes(widthMm) || lengthCm * 10 < group.construction.lengthRangeMm[0] || lengthCm * 10 > group.construction.lengthRangeMm[1]) {
    throw new Error('Invalid dimensions, weight or step count for ' + row.id);
  }

  const productSlug = slugify(row.id);
  const productName = String(row.name).trim();
  const project = productProject(row, group);
  const gallery = group.gallery.map(item => ({
    label: String(item.label),
    src: item.webp,
    alt: String(item.alt || item.label)
  }));
  if (!gallery.length) throw new Error('Product group gallery must contain at least one image.');
  const mainImage = gallery[0].src;
  const absoluteImage = 'https://stremyanki-dlya-kolodcev.ru/' + mainImage.replace(/^(\.\.\/)+/, '');
  const galleryButtons = gallery.map((item, index) =>
    '<button type="button" class="image-toggle__btn' + (index === 0 ? ' active' : '') +
    '" onclick="event.stopPropagation(); changeImage(' + index + ')">' + escapeHtml(item.label) + '</button>'
  ).join('\n                            ');
  const lightboxButtons = gallery.map((item, index) =>
    '<button type="button" onclick="changeLightboxImage(' + index + ')"' +
    (index === 0 ? ' class="active"' : '') + '>' + escapeHtml(item.label) + '</button>'
  ).join('\n            ');

  const specifications = [
    ['Модель', row.name],
    ['Нормативный документ', project],
    ['Длина', lengthCm + ' см (' + Math.round(lengthCm * 10) + ' мм)'],
    ['Ширина', widthMm + ' мм'],
    ['Масса', weight.toLocaleString('ru-RU') + ' кг'],
    ['Количество ступеней', stepCount + ' шт.'],
    ['Материал стоек', group.construction.stringers],
    ['Материал ступеней', group.construction.steps],
    ['Крючок для навешивания', group.construction.hangingHook],
    ['Материал', group.construction.material]
  ];
  const specsHtml = '<table class="mp-specs-table"><tbody>' + specifications.map(item =>
    '<tr><td>' + escapeHtml(item[0]) + '</td><td>' + escapeHtml(item[1]) + '</td></tr>'
  ).join('') + '</tbody></table>';

  const descriptionHtml = '<h3>Описание конструкции</h3><p>' + escapeHtml(group.description) +
    '</p><p>' + escapeHtml(group.installation) + '</p>';
  const otherProducts = rows.filter(item => item.id !== row.id).map(item => {
    return '<a href="../../' + escapeHtml(group.catalogPage) + '#item-' + encodeURIComponent(String(item.id)) + '">' + escapeHtml(item.name) + '</a>';
  }).join('\n');
  const relatedHtml = '<section class="other-sizes"><h3>Другие модели Л-16</h3><div class="other-sizes__list">' +
    otherProducts + '</div><div class="other-series"><p>Все модели серии представлены в каталоге.</p><a href="../../' +
    escapeHtml(group.catalogPage) + '">Перейти в каталог</a></div></section>';

  const seoTitle = productName + ' — купить с доставкой по России';
  const seoDescription = productName + '. Подвесная лестница Л-16 по ' + project +
    '. Ширина ' + widthMm + ' мм, масса ' + weight.toFixed(2).replace('.', ',') + ' кг. Цена ' + (price > 0 ? price.toLocaleString('ru-RU') + ' ₽' : 'по запросу') + '.';
  const offer = price > 0 ? ',\n      "offers": { "@type": "Offer", "priceCurrency": "RUB", "price": ' + price +
    ', "availability": "https://schema.org/InStock", "url": "https://stremyanki-dlya-kolodcev.ru/products/' +
    group.productFolder + '/' + productSlug + '.html" }' : '';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    sku: row.id,
    mpn: project,
    image: absoluteImage,
    description: seoDescription,
    brand: { '@type': 'Brand', name: 'Лестницы и стремянки для колодцев' }
  };
  if (price > 0) jsonLd.offers = {
    '@type': 'Offer', priceCurrency: 'RUB', price,
    availability: 'https://schema.org/InStock',
    url: 'https://stremyanki-dlya-kolodcev.ru/products/' + group.productFolder + '/' + productSlug + '.html'
  };

  const replacements = {
    '{{PRODUCT_SEO_TITLE}}': escapeHtml(seoTitle),
    '{{PRODUCT_SEO_DESCRIPTION}}': escapeHtml(seoDescription),
    '{{GROUP_PRODUCT_FOLDER}}': escapeHtml(group.productFolder),
    '{{PRODUCT_SLUG}}': productSlug,
    '{{PRODUCT_MAIN_IMAGE_URL}}': absoluteImage,
    '{{GROUP_PROJECT}}': escapeHtml(project),
    '{{PRODUCT_MODEL}}': escapeHtml((productName.match(/Л-16-[\d,]+-[\d,]+/u) || [productName])[0]),
    '{{PRODUCT_SKU}}': escapeHtml(row.id),
    '{{PRODUCT_SCHEMA_IMAGE_URL}}': absoluteImage,
    '{{PRODUCT_LENGTH_CM}}': String(lengthCm),
    '{{PRODUCT_WIDTH_MM}}': String(widthMm),
    '{{PRODUCT_WEIGHT}}': String(weight),
    '{{PRODUCT_OFFER_JSONLD}}': offer,
    '{{PRODUCT_NAME}}': escapeHtml(productName),
    '{{GROUP_HEADER_SUBTITLE}}': escapeHtml(group.headerSubtitle),
    '{{GROUP_CATALOG_URL}}': escapeHtml(group.catalogPage),
    '{{GROUP_CATALOG_TITLE}}': escapeHtml(group.catalogTitle),
    '{{PRODUCT_MAIN_IMAGE}}': escapeHtml(mainImage),
    '{{PRODUCT_GALLERY_CONTROLS}}': galleryButtons,
    '{{PRODUCT_LIGHTBOX_CONTROLS}}': lightboxButtons,
    '{{PRODUCT_GALLERY_JSON}}': JSON.stringify(gallery).replace(/</g, '\\u003c'),
    '{{PRODUCT_LENGTH_MM}}': String(Math.round(lengthCm * 10)),
    '{{PRODUCT_PRICE}}': price > 0 ? price.toLocaleString('ru-RU') + ' ₽' : 'Цена по запросу',
    '{{PRODUCT_BUY_CONTROLS}}': '<div class="mp-buy-controls"><div class="quantity-control" style="display:flex;align-items:center;border:1px solid #c8d9ea;border-radius:12px;overflow:hidden;">' +
      '<button type="button" onclick="changeQuantity(\'' + escapeHtml(String(row.id)) + '\',-1)" aria-label="Уменьшить количество" style="background:#f4f4f4;border:0;padding:12px 16px;font-size:20px;cursor:pointer;">−</button>' +
      '<input type="number" id="' + escapeHtml(String(row.id)) + '-qty" value="1" min="1" max="99" data-price="' + (price > 0 ? price : 0) + '" style="width:55px;text-align:center;border:0;" aria-label="Количество">' +
      '<button type="button" onclick="changeQuantity(\'' + escapeHtml(String(row.id)) + '\',1)" aria-label="Увеличить количество" style="background:#f4f4f4;border:0;padding:12px 16px;font-size:20px;cursor:pointer;">+</button>' +
      '</div><button type="button" class="mp-btn-buy" onclick="addItemToCart(' +
      escapeHtml(JSON.stringify(String(row.id))) + ',' + escapeHtml(JSON.stringify(productName)) +
      ',Math.max(1,Math.min(99,Number(document.getElementById(\'' + escapeHtml(String(row.id)) + '-qty\').value)||1)),' +
      (price > 0 ? price : 0) + ',' + Math.round(lengthCm * 10) + ',' + weight + ')">В корзину</button></div>',
    '{{GROUP_ALBUM_REFERENCE}}': escapeHtml(group.albumReference),
    '{{GROUP_ALBUM_NOTE}}': escapeHtml(group.albumNote),
    '{{PRODUCT_SHORT_DESCRIPTION}}': escapeHtml(seoDescription),
    '{{GROUP_AND_PRODUCT_SPECIFICATIONS}}': specsHtml,
    '{{GROUP_DESCRIPTION_AND_INSTALLATION}}': descriptionHtml,
    '{{GROUP_RELATED_PRODUCTS_AND_SERIES}}': relatedHtml
  };

  let html = template;
  for (const [token, value] of Object.entries(replacements)) html = html.split(token).join(value);
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '<script type="application/ld+json">\n' +
    JSON.stringify(jsonLd, null, 2) + '\n</script>');
  const unresolved = html.match(/\{\{[A-Z0-9_]+\}\}/g);
  if (unresolved) throw new Error('Unresolved template tokens: ' + [...new Set(unresolved)].join(', '));
  return html;
}

module.exports = { renderMasterProduct };
