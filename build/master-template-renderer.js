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
  const otherSizesHtml = '<section class="other-sizes" aria-label="Другие размеры стремянок Л-16"><h2 class="other-sizes__title">Другие размеры стремянок Л-16</h2><div class="other-sizes__links">' + rows.filter(item => item.id !== row.id).map(item => {
    const itemLength = Number(item.length);
    const itemWidth = Math.round(Number(item.width) * 10);
    return '<a class="other-sizes__link" href="' + escapeHtml(slugify(item.id)) + '.html">Л-16 (' + itemLength + ' см), ' + itemWidth + ' мм</a>';
  }).join('') + '</div></section>';
  const categoryCards = [{"href":"../../ss1.html","src":"../../images/ss1/vid-card.webp","alt":"Стремянки С-(1–9)","label":"Стремянки С-(1–9)"},{"href":"../../ss2.html","src":"../../images/ss2/vid-card.webp","alt":"Стремянки С1-(00–18)","label":"Стремянки С1-(00–18)"},{"href":"../../kl-1-dlya-kanalizacionnyh-kolodcev.html","src":"../../images/kl1/vid-card.webp","alt":"Канализационные лестницы КЛ-1","label":"Канализационные лестницы КЛ-1"},{"href":"../../ssg1.html","src":"../../images/ssg1/vid-card.webp","alt":"Пожарные стремянки СГ","label":"Пожарные стремянки СГ"},{"href":"../../l-3-sk-2201-88.html","src":"../../images/l-3-sk-2201-88/vid-card.webp","alt":"Лестницы Л-3","label":"Лестницы Л-3"},{"href":"../../vl-2-l-19-vodoprovodnaya.html","src":"../../images/vdl/vid-card.webp","alt":"Водопроводные лестницы ВЛ-2","label":"Водопроводные лестницы ВЛ-2"},{"href":"../../l-17-000SB.html","src":"../../images/l-17-000SB/vid-card.webp","alt":"Лестницы Л-17","label":"Лестницы Л-17"},{"href":"../../l-19.html","src":"../../images/l-19/vid-card.webp","alt":"Лестницы Л-19","label":"Лестницы Л-19"},{"href":"../../lestnica-podvesnaya-l-16.html","src":"../../images/lestnica-podvesnaya-l-16/vid-card.webp","alt":"Подвесные лестницы Л-16","label":"Подвесные лестницы Л-16"},{"href":"../../lestnicy-teplovyh-setej-ts.html","src":"../../images/lestnicy-teplovyh-setej-ts/vid-card.webp","alt":"Лестницы тепловых сетей ТС","label":"Лестницы тепловых сетей ТС"},{"href":"../../nts-62-91-111b.html","src":"../../images/nts-62-91-111b/vid-card.webp","alt":"Лестницы НТС 62-91-111Б","label":"Лестницы НТС 62-91-111Б"},{"href":"../../nts-62-91-111.html","src":"../../images/nts-62-91-111/vid-card.webp","alt":"Лестницы НТС 62-91-111","label":"Лестницы НТС 62-91-111"},{"href":"../../nts-62-91-111a.html","src":"../../images/nts-62-91-111a/vid-1.webp","alt":"Лестницы НТС 62-91-111А","label":"Лестницы НТС 62-91-111А"},{"href":"../../skoby-dlya-kolodcev.html","src":"../../images/skoby-dlya-kolodcev/skoba-mn1-omega/vid-card.webp","alt":"Скобы для колодцев","label":"Скобы для колодцев"},{"href":"../../soedinitelnye-elementy.html","src":"../../images/soedinitelnye-elementy/vid-1.webp","alt":"Соединительные элементы МС","label":"Соединительные элементы МС"},{"href":"../../tmp-902.html","src":"../../images/tmp-902/vid-card.webp","alt":"Стремянки ТМП 902","label":"Стремянки ТМП 902"}];
  const renderCategoryCards = items => items.map(item => '<a class="other-categories__card" href="' + item.href + '"><img src="' + item.src + '" alt="' + item.alt + '" loading="lazy" decoding="async"><span>' + item.label + '</span></a>').join('');
  const categoriesHtml = '<section class="other-categories" aria-label="Другие категории товаров"><div class="other-categories__heading"><span>Другие категории товаров</span><button type="button" class="other-categories__toggle" aria-expanded="false" aria-controls="other-categories-extra" onclick="toggleOtherCategories(this)"><span class="other-categories__action">Показать остальные категории</span></button></div><nav class="other-categories__grid other-categories__grid--featured" aria-label="Популярные категории">' + renderCategoryCards(categoryCards.slice(0, 4)) + '</nav><nav id="other-categories-extra" class="other-categories__grid other-categories__grid--more" aria-label="Остальные категории" hidden>' + renderCategoryCards(categoryCards.slice(4)) + '</nav></section>';

  const seoTitle = productName + ' — купить с доставкой по России';
  const seoDescription = productName + '. Подвесная лестница Л-16 по ' + project +
    '. Длина ' + lengthCm + ' см, ширина ' + widthMm + ' мм, масса ' + weight.toFixed(2).replace('.', ',') + ' кг. Цена ' + (price > 0 ? price.toLocaleString('ru-RU') + ' ₽' : 'по запросу') + '.';
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
    '{{PRODUCT_SHORT_DESCRIPTION}}': escapeHtml('Л-16 (' + lengthCm + ' см), ширина ' + widthMm + ' мм, масса ' + weight.toLocaleString('ru-RU') + ' кг.'),
    '{{GROUP_AND_PRODUCT_SPECIFICATIONS}}': specsHtml,
    '{{GROUP_DESCRIPTION_AND_INSTALLATION}}': descriptionHtml,
    '{{GROUP_OTHER_SIZES}}': otherSizesHtml,
    '{{GROUP_OTHER_CATEGORIES}}': categoriesHtml
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
