const { getProductPath, getProductSlug } = require('./product-url-registry');

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function getMasterProductSlug(group, rowOrId) {
  const id = typeof rowOrId === 'string' ? rowOrId : rowOrId && rowOrId.id;
  return getProductSlug(group.id, id);
}

function formatProductTemplate(template, values) {
  return String(template == null ? '' : template).replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match
  );
}


function readGroupHtmlRawField(source, key) {
  const startMarker = '<!-- GROUP_FIELD:' + key + ':START -->';
  const endMarker = '<!-- GROUP_FIELD:' + key + ':END -->';
  const start = String(source || '').indexOf(startMarker);
  const end = String(source || '').indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0) throw new Error('Missing group HTML section: ' + key);
  return String(source).slice(start + startMarker.length, end).trim();
}

function readGroupHtmlField(source, key, values) {
  return formatProductTemplate(readGroupHtmlRawField(source, key), values);
}
function productProject(row, group) {
  if (group.projectFromName === false) return group.project;
  const match = String(row.name || '').match(/\(([^)]+)\)/);
  return match ? match[1].replace(/СБ(?=$|-)/g, 'СБ') : group.project;
}

function getProductModel(row, groupContent = '') {
  const hasGroupModelPattern = String(groupContent || '').includes('<!-- GROUP_FIELD:modelPattern:START -->');
  if (hasGroupModelPattern) {
    const modelPattern = readGroupHtmlRawField(groupContent, 'modelPattern');
    if (modelPattern) {
      const groupModelMatch = String(row && row.name || '').match(new RegExp(modelPattern, 'u'));
      if (groupModelMatch) return groupModelMatch[0];
    }
  }
  const rowId = String(row && row.id || '');
  const klMatch = rowId.match(/^KL-(\d+(?:\.\d+)?)(?:-28)?$/i);
  if (klMatch) return 'КЛ-' + klMatch[1];
  const nameMatch = String(row && row.name || '').match(/СГ-\d+|С\d+|Л-\d+/u);
  const idMatch = rowId.match(/SG-\d+/i);
  return nameMatch ? nameMatch[0] : (idMatch ? idMatch[0] : rowId);
}

function renderMasterProduct(template, group, row, rows, relatedVariantGroups = [], groupContent = '', similarProductGroups = []) {
  if (!group || typeof group !== 'object') throw new Error('A product group configuration is required.');
  if (!row || !row.id || !row.name) throw new Error('Product row must contain id and name.');
  const widthCm = Number(row.width);
  const widthMm = Math.round(widthCm * 10);
  const lengthCm = Number(row.length);
  const weight = Number(String(row.weight).replace(',', '.'));
  const price = Number(String(row.price).replace(/[^\d.,-]/g, '').replace(',', '.'));
  const stepCount = Number(row.step_count);
  const hasStepCount = Number.isInteger(stepCount) && stepCount > 0;
  if (![widthMm, widthCm, lengthCm, weight].every(Number.isFinite) || widthMm <= 0 || lengthCm <= 0 || weight <= 0 || (row.step_count && !hasStepCount) || !group.construction.availableWidthsMm.includes(widthMm) || lengthCm * 10 < group.construction.lengthRangeMm[0] || lengthCm * 10 > group.construction.lengthRangeMm[1]) {
    throw new Error('Invalid dimensions or weight for ' + row.id);
  }

  const productPath = getProductPath(group.id, row.id);
  const productSlug = getMasterProductSlug(group, row);
  const project = productProject(row, group);
  const model = getProductModel(row, groupContent);
  const values = {
    id: String(row.id), model, lengthCm, lengthMm: Math.round(lengthCm * 10),
    widthCm, widthMm, weight, weightFormatted: weight.toFixed(2).replace('.', ','),
    price, priceFormatted: price > 0 ? price.toLocaleString('ru-RU') : 'по запросу',
    stepCount: hasStepCount ? stepCount : '',
    stepCountFormatted: hasStepCount ? stepCount + ' шт.' : '',
    project, albumReference: row.drawing_album || group.albumReference || '',
    dimension1Label: escapeHtml(row.dimension1_label || group.dimension1Label || 'Длина'),
    dimension2Label: escapeHtml(row.dimension2_label || group.dimension2Label || 'Ширина'),
    dimension2LabelLower: escapeHtml(String(row.dimension2_label || group.dimension2Label || 'Ширина').toLowerCase()),
    rowDescription: escapeHtml(row.description || group.rowDescriptionFallback || ''),
    material: escapeHtml(row.material || ''),
    rodDiameter: escapeHtml(row.rod_diameter || ''),
    blankLengthMm: escapeHtml(row.blank_length_mm || ''),
    mountingHeightMm: escapeHtml(row.mounting_height_mm || ''),
    mountingOffsetMm: escapeHtml(row.mounting_offset_mm || ''),
    materialRowHtml: row.material ? '<tr><td>Материал</td><td>' + escapeHtml(row.material) + '</td></tr>' : '',
    rodDiameterRowHtml: row.rod_diameter ? '<tr><td>Диаметр прутка</td><td>' + escapeHtml(row.rod_diameter) + '</td></tr>' : '',
    blankLengthRowHtml: row.blank_length_mm ? '<tr><td>Длина заготовки</td><td>' + escapeHtml(row.blank_length_mm) + ' мм</td></tr>' : '',
    drawingAlbumRowHtml: row.drawing_album ? '<tr><td>Чертёжный альбом</td><td>' + escapeHtml(row.drawing_album) + '</td></tr>' : ''
  };
  const productName = formatProductTemplate(group.productNameTemplate || row.name, values);
  values.productName = productName;
  const headerTitle = formatProductTemplate(group.headerTitleTemplate || productName, values);
  const breadcrumbName = formatProductTemplate(group.breadcrumbNameTemplate || productName, values);
  const skuLine = formatProductTemplate(group.skuLineTemplate || ('Артикул: {id} | Длина: {lengthMm} мм'), values);
  // Product pages use one consistent stock label; CSV and group overrides do not change it.
  const stockText = '✓ В наличии на складе';
  const priceDisplay = price > 0 ? 'от ' + values.priceFormatted + ' ₽' : 'Цена по запросу';
  const shortDescription = groupContent ? readGroupHtmlField(groupContent, 'shortDescription', values) : formatProductTemplate(group.shortDescriptionTemplate || (group.groupTitle + ' — длина ' + lengthCm + ' см, ширина ' + widthCm + ' см (' + widthMm + ' мм), масса ' + weight.toLocaleString('ru-RU') + ' кг.'), values);
  const cartItemName = formatProductTemplate(group.cartItemNameTemplate || productName, values);
  const normalizeProductImagePath = source => {
    const value = String(source || '').trim().replace(/^\/+/, '');
    return value.startsWith('../') ? value : '../../' + value;
  };
  const sourceImage = String(row.image || '').trim();
  const rowGallery = String(row.images || '').split(';').map(value => value.trim())
    .filter(value => value && value !== 'images/default-product.svg');
  const preferredImage = sourceImage
    ? sourceImage.replace(/vid-mini\.webp$/i, 'vid-1.webp').replace(/-mini\.webp$/i, '.webp')
    : '';
  const gallerySources = [];
  if (preferredImage && preferredImage !== sourceImage && (!rowGallery.length || rowGallery.includes(preferredImage))) gallerySources.push(preferredImage);
  if (rowGallery.length) gallerySources.push(...rowGallery);
  else if (sourceImage && sourceImage !== 'images/default-product.svg' && preferredImage === sourceImage) gallerySources.push(sourceImage);
  const uniqueGallerySources = [...new Set(gallerySources.length ? gallerySources : ['images/default-product.svg'])];
  const rowBasedGallery = uniqueGallerySources.map((source, index) => {
    const fileName = source.split('/').pop() || '';
    const photoMatch = fileName.match(/foto-?(\d+)/i);
    const label = /chertezh|drawing/i.test(fileName) ? 'Чертёж'
      : /album/i.test(fileName) ? 'Альбом'
      : photoMatch ? 'Фото ' + photoMatch[1]
      : index === 0 ? 'Вид 1' : 'Изображение ' + (index + 1);
    return {
      label,
      src: normalizeProductImagePath(source),
      alt: productName + (label === 'Вид 1' ? ' — общий вид' : ' — ' + label.toLowerCase())
    };
  });
  const gallery = Array.isArray(group.gallery) && group.gallery.length
    ? group.gallery.map(item => ({
        label: String(item.label),
        src: item.webp,
        alt: formatProductTemplate(item.alt || item.label, values)
      }))
    : rowBasedGallery;
  if (!gallery.length) throw new Error('Product group gallery must contain at least one image.');
  const mainImage = group.mainImageFromCard && sourceImage
    ? normalizeProductImagePath(sourceImage.replace(/-mini\.webp$/i, '-card.webp'))
    : gallery[0].src;
  const absoluteImage = 'https://stremyanki-dlya-kolodcev.ru/' + mainImage.replace(/^(\.\.\/)+/, '');
  const galleryButtons = gallery.map((item, index) =>
    '<button type="button" class="image-toggle__btn' + (index === 0 ? ' active' : '') +
    '" onclick="event.stopPropagation(); changeImage(' + index + ')">' + escapeHtml(item.label) + '</button>'
  ).join('\n                            ');
  const lightboxButtons = gallery.map((item, index) =>
    '<button type="button" data-slide="' + index + '" onclick="scrollToSlide(' + index + ')"' +
    (index === 0 ? ' class="active"' : '') + '>' + escapeHtml(item.label) + '</button>'
  ).join('\n            ');
  const lightboxGallery = gallery.map(item =>
    '<div class="gallery-item"><img src="' + escapeHtml(item.src) + '" alt="' + escapeHtml(item.alt) + '" loading="lazy" decoding="async"></div>'
  ).join('\n            ');

  const widthDisplay = group.widthDisplayUnit === 'both' ? widthMm + ' мм (' + widthCm + ' см)' : widthMm + ' мм';
  const specifications = Array.isArray(group.specifications)
    ? group.specifications.map(item => [item.label, formatProductTemplate(item.valueTemplate != null ? item.valueTemplate : item.value, values)])
    : [
        ['Модель', row.name],
        [group.normativeLabel || 'Нормативный документ', project],
        ['Длина', lengthCm + ' см (' + Math.round(lengthCm * 10) + ' мм)'],
        ['Ширина', widthDisplay],
        ['Масса', weight.toLocaleString('ru-RU') + ' кг']
      ];
  if (!Array.isArray(group.specifications)) {
    if (hasStepCount) specifications.push(['Количество ступеней', stepCount + ' шт.']);
    if (group.construction.type) specifications.push(['Тип конструкции', group.construction.type]);
    if (group.construction.stringers) specifications.push(['Материал стоек', group.construction.stringers]);
    if (group.construction.steps) specifications.push(['Материал ступеней', group.construction.steps]);
    if (group.construction.hangingHook) specifications.push(['Крючок для навешивания', group.construction.hangingHook]);
    if (group.construction.material) specifications.push(['Материал', group.construction.material]);
    if (group.construction.finish) specifications.push(['Защитное покрытие', group.construction.finish]);
  }
  let specsHtml = groupContent ? readGroupHtmlField(groupContent, 'specifications', values) :
    '<table class="mp-specs-table"><tbody>' + specifications.map(item =>
      '<tr><td>' + escapeHtml(item[0]) + '</td><td>' + escapeHtml(item[1]) + '</td></tr>'
    ).join('') + '</tbody></table>';
  if (hasStepCount) {
    const stepCountRow = '<tr><td>Количество ступеней</td><td>' + stepCount + ' шт.</td></tr>';
    let replacedStepCountRow = false;
    specsHtml = specsHtml.replace(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi, rowHtml => {
      if (!replacedStepCountRow && /<td\b[^>]*>\s*(?:Количество|Число)\s+ступеней\s*<\/td>/i.test(rowHtml)) {
        replacedStepCountRow = true;
        return stepCountRow;
      }
      return rowHtml;
    });
    if (!replacedStepCountRow) {
      if (/<\/tbody>/i.test(specsHtml)) {
        specsHtml = specsHtml.replace(/<\/tbody>/i, stepCountRow + '</tbody>');
      } else if (/<\/table>/i.test(specsHtml)) {
        specsHtml = specsHtml.replace(/<\/table>/i, stepCountRow + '</table>');
      } else {
        specsHtml += '<table class="mp-specs-table"><tbody>' + stepCountRow + '</tbody></table>';
      }
    }
  }

  const descriptionHtml = groupContent ? readGroupHtmlField(groupContent, 'description', values) :
    (Array.isArray(group.descriptionSections)
      ? group.descriptionSections.map(section =>
          (section.heading ? '<h2>' + escapeHtml(section.heading) + '</h2>' : '') +
          '<p>' + escapeHtml(formatProductTemplate(section.text, values)) + '</p>'
        ).join('')
      : '<h3>Описание конструкции</h3><p>' + escapeHtml(group.description) + '</p><p>' + escapeHtml(group.installation) + '</p>');
  // Large product families use a compact, expandable related-size navigator.
  const otherSizesTitle = groupContent
    ? readGroupHtmlField(groupContent, 'otherSizesTitle', values)
    : group.otherSizesSwitcherTitle || group.otherSizesTitle || ('Другие размеры ' + group.groupTitle);
  const otherSizesLinkTextTemplate = groupContent
    ? readGroupHtmlRawField(groupContent, 'otherSizesLinkTextTemplate')
    : group.otherSizesLinkTextTemplate;
  const otherSizesLabel = group.otherSizesLabel || 'Л-16';
  const renderSizeLinks = (variantGroup, variantRows, currentRow, panelIndex) => {
    const lengthVaries = new Set(variantRows.map(item => Number(item.length))).size > 1;
    const widthVaries = new Set(variantRows.map(item => Number(item.width))).size > 1;
    const allRows = variantRows.filter(item =>
      !(variantGroup.id === group.id && item.id === currentRow.id) &&
      (!variantGroup.otherSizesMatchProject || productProject(item, variantGroup) === project)
    ).slice().sort((a, b) => Number(a.length) - Number(b.length) || String(a.id).localeCompare(String(b.id)));
    const orderedRows = allRows;
    const renderLink = item => {
      const itemLength = Number(item.length);
      const itemWidth = Number(item.width);
      let dimensions;
      if (lengthVaries && widthVaries) dimensions = itemLength + ' × ' + itemWidth + ' см';
      else if (widthVaries) dimensions = itemWidth + ' см';
      else dimensions = itemLength + ' см';
      const itemId = String(item.id);
      const model = variantGroup.id === 'ograzhdenie-osg-seriya-14503-794'
        ? itemId.replace(/^OSG-/i, 'ОСГ-')
        : variantGroup.id === 'pozharnye-stremyanki-seriya-14503-794'
          ? itemId.replace(/^SG-/i, 'СГ-')
          : getProductModel(item, variantGroup.id === group.id ? groupContent : '');
      const linkValues = {
        id: itemId,
        model,
        lengthCm: itemLength, lengthMm: Math.round(itemLength * 10),
        widthCm: itemWidth, widthMm: Math.round(itemWidth * 10),
        weight: Number(String(item.weight).replace(',', '.')),
        weightFormatted: Number(String(item.weight).replace(',', '.')).toFixed(2).replace('.', ','),
        project
      };
      const linkTemplate = variantGroup.id === group.id
        ? otherSizesLinkTextTemplate
        : variantGroup.otherSizesLinkTextTemplate;
      const linkText = formatProductTemplate(linkTemplate || (model + ' — ' + itemLength + ' см'), linkValues);
      return '<a class="other-sizes__link" href="' + escapeHtml(getMasterProductSlug(variantGroup, item)) + '.html"><span>' + escapeHtml(linkText) + '</span></a>';
    };
    const linksHtml = orderedRows.map(renderLink).join('');
    const panelId = 'other-sizes-panel-' + panelIndex;
    return '<div class="other-sizes__variant-panel" id="' + panelId + '" data-variant-id="' + escapeHtml(variantGroup.id) + '"' +
      (panelIndex === 0 ? '' : ' hidden') + '><div class="other-sizes__links other-sizes__links--collapsed">' + linksHtml + '</div></div>';
  };
  const configuredVariantIds = Array.isArray(group.otherSizesVariantGroupIds) ? group.otherSizesVariantGroupIds : [];
  const relatedVariants = configuredVariantIds.length
    ? [{ group, rows }, ...relatedVariantGroups.filter(item => item && item.group && item.rows && item.group.id !== group.id)]
        .filter((item, index, all) => all.findIndex(candidate => candidate.group.id === item.group.id) === index)
    : [{ group, rows }];
  let otherSizesHtml;
  if (rows.length > 20) {
    const hasVariantSwitcher = relatedVariants.length > 1;
    const variantButtons = hasVariantSwitcher
      ? '<div class="other-sizes__variants" role="tablist" aria-label="Выбор исполнения">' +
        relatedVariants.map((item, index) => '<button type="button" class="other-sizes__variant' +
          (item.group.id === group.id ? ' active' : '') + '" role="tab" aria-selected="' + (item.group.id === group.id ? 'true' : 'false') +
          '" aria-controls="other-sizes-panel-' + index + '" onclick="selectOtherSizesVariant(this)">' +
          escapeHtml(item.group.otherSizesVariantLabel || item.group.otherSizesLabel || item.group.groupTitle) +
          (item.group.otherSizesVariantDimensions ? '<span>' + escapeHtml(item.group.otherSizesVariantDimensions) + '</span>' : '') +
          '</button>').join('') + '</div>'
      : '';
    const panels = relatedVariants.map((item, index) => renderSizeLinks(item.group, item.rows, row, index)).join('');
    otherSizesHtml = '<section class="other-sizes other-sizes--large" aria-label="' + escapeHtml(otherSizesTitle) + '">' +
      '<div class="other-sizes__heading"><h2 class="other-sizes__title">' + escapeHtml(otherSizesTitle) + '</h2>' +
      '<button type="button" class="other-sizes__collapse-toggle" aria-label="Показать все размеры" data-show-all-label="Показать все размеры" data-collapse-label="Свернуть список размеров" aria-expanded="false" data-icon-toggle="true" onclick="toggleOtherSizes(this)"><span class="other-sizes__collapse-label">Показать все</span><span class="other-sizes__collapse-icon" aria-hidden="true">⌄</span></button></div>' +
      variantButtons + panels + '</section>';
  } else {
    let otherSizeRows = rows.filter(item => item.id !== row.id);
    if (Number.isInteger(group.otherSizesLimit) && group.otherSizesLimit > 0) {
      const currentLength = Number(row.length);
      otherSizeRows = otherSizeRows.slice()
        .sort((a, b) => Math.abs(Number(a.length) - currentLength) - Math.abs(Number(b.length) - currentLength))
        .slice(0, group.otherSizesLimit)
        .sort((a, b) => Number(a.length) - Number(b.length));
    }
    const lengthVaries = new Set(rows.map(item => Number(item.length))).size > 1;
    const widthVaries = new Set(rows.map(item => Number(item.width))).size > 1;
    otherSizesHtml = '<section class="other-sizes" aria-label="' + escapeHtml(otherSizesTitle) + '"><div class="other-sizes__heading"><h2 class="other-sizes__title">' +
      escapeHtml(otherSizesTitle) + '</h2>' +
      (otherSizeRows.length > 2 ? '<button type="button" class="other-sizes__collapse-toggle" aria-label="Показать все размеры" data-show-all-label="Показать все размеры" data-collapse-label="Свернуть список размеров" aria-expanded="false" data-icon-toggle="true" onclick="toggleOtherSizes(this)"><span class="other-sizes__collapse-label">Показать все</span><span class="other-sizes__collapse-icon" aria-hidden="true">⌄</span></button>' : '') +
      '</div><div class="other-sizes__variant-panel"><div class="other-sizes__links other-sizes__links--collapsed">' + otherSizeRows.map(item => {
        const itemLength = Number(item.length);
        const itemWidth = Number(item.width);
        let dimensions;
        if (lengthVaries && widthVaries) dimensions = itemLength + ' × ' + itemWidth + ' см';
        else if (widthVaries) dimensions = itemWidth + ' см';
        else dimensions = itemLength + ' см';
        const itemId = String(item.id);
        const model = group.id === 'ograzhdenie-osg-seriya-14503-794'
          ? itemId.replace(/^OSG-/i, 'ОСГ-')
          : group.id === 'pozharnye-stremyanki-seriya-14503-794'
            ? itemId.replace(/^SG-/i, 'СГ-')
            : getProductModel(item, groupContent);
        const linkValues = {
          id: itemId,
          model,
          lengthCm: itemLength, lengthMm: Math.round(itemLength * 10),
          widthCm: itemWidth, widthMm: Math.round(itemWidth * 10),
          weight: Number(String(item.weight).replace(',', '.')),
          weightFormatted: Number(String(item.weight).replace(',', '.')).toFixed(2).replace('.', ','),
          project
        };
        const linkText = formatProductTemplate(otherSizesLinkTextTemplate || (model + ' — ' + itemLength + ' см'), linkValues);
        return '<a class="other-sizes__link" href="' + escapeHtml(getMasterProductSlug(group, item)) + '.html"><span>' + escapeHtml(linkText) + '</span></a>';
      }).join('') + '</div></div></section>';
  }
  const uniqueSimilarGroups = (Array.isArray(similarProductGroups) ? similarProductGroups : [])
    .filter((item, index, all) => item && item.group && item.group.id && item.group.id !== group.id &&
      Array.isArray(item.rows) && all.findIndex(candidate => candidate && candidate.group && candidate.group.id === item.group.id) === index);
  const similarProductLinks = uniqueSimilarGroups.flatMap(item => item.rows.map(similarRow => {
    const similarGroupId = String(item.group.id);
    const similarProductId = String(similarRow.id);
    const modelMatch = String(similarRow.name || '').match(/С-?\d+(?:-\d+)?/u);
    const model = similarGroupId === 'kl-1-25' || similarGroupId === 'kl-1-28'
      ? similarProductId.replace(/^KL-/i, 'КЛ-')
      : similarGroupId === 'ograzhdenie-osg-seriya-14503-794'
      ? similarProductId.replace(/^OSG-/i, 'ОСГ-')
      : similarGroupId === 'pozharnye-stremyanki-seriya-14503-794'
        ? similarProductId.replace(/^SG-/i, 'СГ-')
        : similarGroupId === 'l-1-l-2-sk-2201-88-35'
          ? similarProductId.replace(/^L-/i, 'Л-')
          : (modelMatch ? modelMatch[0] : similarProductId.replace(/^C/, 'С'));
    const lengthCm = Number(similarRow.length);
    const labelValues = { id: similarRow.id, model, name: similarRow.name, lengthCm, lengthMm: Math.round(lengthCm * 10) };
    const label = item.group.similarProductLabelTemplate
      ? formatProductTemplate(item.group.similarProductLabelTemplate, labelValues)
      : 'Стремянка ' + model + ' — ' + lengthCm + ' см';
    return '<a class="other-sizes__link" href="' + escapeHtml(getProductPath(item.group.id, similarRow.id)) + '"><span>' +
      escapeHtml(label) + '</span></a>';
  }));
  const similarGroupTitle = uniqueSimilarGroups
    .map(item => item.group.otherSizesLabel || item.group.groupTitle || item.group.project)
    .filter(Boolean).join(', ');
  const similarProductsTitle = 'Похожие товары — ' + similarGroupTitle;
  const similarProductsHtml = similarProductLinks.length
    ? '<section class="other-sizes other-sizes--similar" aria-label="' + escapeHtml(similarProductsTitle) + '">' +
      '<div class="other-sizes__heading"><h2 class="other-sizes__title">' + escapeHtml(similarProductsTitle) + '</h2>' +
      '<button type="button" class="other-sizes__collapse-toggle" aria-label="Показать все похожие товары" data-show-all-label="Показать все похожие товары" data-collapse-label="Свернуть список похожих товаров" aria-controls="similar-products-panel" aria-expanded="false" data-icon-toggle="true" onclick="toggleOtherSizes(this)"><span class="other-sizes__collapse-label">Показать все</span><span class="other-sizes__collapse-icon" aria-hidden="true">⌄</span></button></div>' +
      '<div class="other-sizes__variant-panel" id="similar-products-panel"><div class="other-sizes__links other-sizes__links--collapsed">' +
      similarProductLinks.join('') +
      '</div></div></section>'
    : '';
  const categoryCards = [{"href":"../../ss1.html","src":"../../images/ss1/vid-card.webp","alt":"Стремянки С-(1–9)","label":"Стремянки С-(1–9)"},{"href":"../../ss2.html","src":"../../images/ss2/vid-card.webp","alt":"Стремянки С1-(00–18)","label":"Стремянки С1-(00–18)"},{"href":"../../kl-1-dlya-kanalizacionnyh-kolodcev.html","src":"../../images/kl1/vid-card.webp","alt":"Канализационные лестницы КЛ-1","label":"Канализационные лестницы КЛ-1"},{"href":"../../ssg1.html","src":"../../images/ssg1/vid-card.webp","alt":"Пожарные стремянки СГ","label":"Пожарные стремянки СГ"},{"href":"../../l-3-sk-2201-88.html","src":"../../images/l-3-sk-2201-88/vid-card.webp","alt":"Лестницы Л-3","label":"Лестницы Л-3"},{"href":"../../vl-2-l-19-vodoprovodnaya.html","src":"../../images/vdl/vid-card.webp","alt":"Водопроводные лестницы ВЛ-2","label":"Водопроводные лестницы ВЛ-2"},{"href":"../../l-17-000SB.html","src":"../../images/l-17-000SB/vid-card.webp","alt":"Лестницы Л-17","label":"Лестницы Л-17"},{"href":"../../l-19.html","src":"../../images/l-19/vid-card.webp","alt":"Лестницы Л-19","label":"Лестницы Л-19"},{"href":"../../lestnica-podvesnaya-l-16.html","src":"../../images/lestnica-podvesnaya-l-16/vid-card.webp","alt":"Подвесные лестницы Л-16","label":"Подвесные лестницы Л-16"},{"href":"../../lestnicy-teplovyh-setej-ts.html","src":"../../images/lestnicy-teplovyh-setej-ts/vid-card.webp","alt":"Лестницы тепловых сетей ТС","label":"Лестницы тепловых сетей ТС"},{"href":"../../nts-62-91-111b.html","src":"../../images/nts-62-91-111b/vid-card.webp","alt":"Лестницы НТС 62-91-111Б","label":"Лестницы НТС 62-91-111Б"},{"href":"../../nts-62-91-111.html","src":"../../images/nts-62-91-111/vid-card.webp","alt":"Лестницы НТС 62-91-111","label":"Лестницы НТС 62-91-111"},{"href":"../../nts-62-91-111a.html","src":"../../images/nts-62-91-111a/vid-1.webp","alt":"Лестницы НТС 62-91-111А","label":"Лестницы НТС 62-91-111А"},{"href":"../../skoby-dlya-kolodcev.html","src":"../../images/skoby-dlya-kolodcev/skoba-mn1-omega/vid-card.webp","alt":"Скобы для колодцев","label":"Скобы для колодцев"},{"href":"../../soedinitelnye-elementy.html","src":"../../images/soedinitelnye-elementy/vid-1.webp","alt":"Соединительные элементы МС","label":"Соединительные элементы МС"},{"href":"../../tmp-902.html","src":"../../images/tmp-902/vid-card.webp","alt":"Стремянки ТМП 902","label":"Стремянки ТМП 902"}];
  const renderCategoryCards = items => items.map(item => '<a class="other-categories__card" href="' + item.href + '"><img src="' + item.src + '" alt="' + item.alt + '" loading="lazy" decoding="async"><span>' + item.label + '</span></a>').join('');
  const categoriesHtml = '<section class="other-categories" aria-label="Другие категории товаров"><div class="other-categories__heading"><span>Другие категории товаров</span><button type="button" class="other-categories__toggle" aria-expanded="false" aria-controls="other-categories-extra" onclick="toggleOtherCategories(this)"><span class="other-categories__action">Показать остальные категории</span></button></div><nav class="other-categories__grid other-categories__grid--featured" aria-label="Популярные категории">' + renderCategoryCards(categoryCards.slice(0, 4)) + '</nav><nav id="other-categories-extra" class="other-categories__grid other-categories__grid--more" aria-label="Остальные категории" hidden>' + renderCategoryCards(categoryCards.slice(4)) + '</nav></section>';

  const seoTitle = formatProductTemplate(group.seoTitleTemplate || (productName + ' — купить с доставкой по России'), values);
  const seoDescription = formatProductTemplate(group.seoDescriptionTemplate ||
    (productName + '. ' + group.groupTitle + ' по ' + project + '. Длина ' + lengthCm + ' см, ширина ' + widthMm + ' мм, масса ' + values.weightFormatted + ' кг. Цена ' + (price > 0 ? 'от ' + price.toLocaleString('ru-RU') + ' ₽' : 'по запросу') + '.'), values);
  const schemaImagePath = group.schemaImage || gallery[0].src;
  const schemaImage = /^https?:\/\//i.test(schemaImagePath) ? schemaImagePath : 'https://stremyanki-dlya-kolodcev.ru/' + String(schemaImagePath).replace(/^(\.\.\/)+/, '');
  const schemaName = formatProductTemplate(group.schemaNameTemplate || productName, values);
  const schemaDescription = formatProductTemplate(group.schemaDescriptionTemplate || seoDescription, values);
  const schemaMpn = formatProductTemplate(group.schemaMpnTemplate || project, values);
  const productUrl = 'https://stremyanki-dlya-kolodcev.ru' + productPath;
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Product',
    name: schemaName, sku: row.id, mpn: schemaMpn, image: schemaImage,
    description: schemaDescription,
    brand: group.schemaBrand || { '@type': 'Brand', name: 'Лестницы и стремянки для колодцев' }
  };
  if (price > 0) jsonLd.offers = {
    '@type': 'Offer', url: productUrl, priceCurrency: 'RUB', price: String(price),
    availability: 'https://schema.org/InStock',
    ...(group.schemaItemCondition ? { itemCondition: group.schemaItemCondition } : {}),
    ...(group.schemaSeller ? { seller: group.schemaSeller } : {})
  };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://stremyanki-dlya-kolodcev.ru/' },
      { '@type': 'ListItem', position: 2, name: group.catalogTitle, item: 'https://stremyanki-dlya-kolodcev.ru/' + group.catalogPage },
      { '@type': 'ListItem', position: 3, name: model, item: productUrl }
    ]
  };
  const extraContentHtml = groupContent ? readGroupHtmlField(groupContent, 'extraContent', values) : group.extraContentHtml || '';
  const replacements = {
    '{{PRODUCT_SEO_TITLE}}': escapeHtml(seoTitle),
    '{{PRODUCT_SEO_DESCRIPTION}}': escapeHtml(seoDescription),
    '{{GROUP_PRODUCT_FOLDER}}': escapeHtml(group.productFolder),
    '{{PRODUCT_SLUG}}': productSlug,
    '{{PRODUCT_MAIN_IMAGE_URL}}': absoluteImage,
    '{{GROUP_PROJECT}}': escapeHtml(project),
    '{{PRODUCT_MODEL}}': escapeHtml(model),
    '{{PRODUCT_SKU}}': escapeHtml(row.id),
    '{{PRODUCT_SCHEMA_IMAGE_URL}}': schemaImage,
    '{{PRODUCT_LENGTH_CM}}': String(lengthCm),
    '{{PRODUCT_WIDTH_MM}}': String(widthMm),
    '{{PRODUCT_WEIGHT}}': String(weight),

    '{{PRODUCT_NAME}}': escapeHtml(productName),
    '{{PRODUCT_HEADER_TITLE}}': escapeHtml(headerTitle),
    '{{PRODUCT_BREADCRUMB_NAME}}': escapeHtml(breadcrumbName),
    '{{PRODUCT_MAIN_IMAGE_ALT}}': escapeHtml(gallery[0].alt || productName + ' — общий вид'),
    '{{PRODUCT_SKU_LINE}}': escapeHtml(skuLine),
    '{{PRODUCT_STOCK_STATUS}}': escapeHtml(stockText),
    '{{PRODUCT_PRICE_DISPLAY}}': escapeHtml(priceDisplay),
    '{{GROUP_EXTRA_CONTENT}}': extraContentHtml,
    '{{GROUP_BREADCRUMB_JSONLD}}': '<script type="application/ld+json">\n' + JSON.stringify(breadcrumbJsonLd, null, 2) + '\n</script>',
    '{{GROUP_HEADER_SUBTITLE}}': escapeHtml(group.headerSubtitle),
    '{{GROUP_CATALOG_URL}}': escapeHtml(group.catalogPage),
    '{{GROUP_CATALOG_TITLE}}': escapeHtml(group.catalogTitle),
    '{{PRODUCT_MAIN_IMAGE}}': escapeHtml(mainImage),
    '{{PRODUCT_GALLERY_CONTROLS}}': galleryButtons,
    '{{PRODUCT_LIGHTBOX_CONTROLS}}': lightboxButtons,
    '{{PRODUCT_LIGHTBOX_GALLERY}}': lightboxGallery,
    '{{PRODUCT_GALLERY_JSON}}': JSON.stringify(gallery).replace(/</g, '\\u003c'),
    '{{PRODUCT_LENGTH_MM}}': String(Math.round(lengthCm * 10)),
    '{{PRODUCT_PRICE}}': price > 0 ? 'от ' + price.toLocaleString('ru-RU') + ' ₽' : 'Цена по запросу',
    '{{PRODUCT_BUY_CONTROLS}}': '<div class="mp-buy-controls"><div class="quantity-control" style="display:flex;align-items:center;border:1px solid #c8d9ea;border-radius:12px;overflow:hidden;">' +
      '<button type="button" onclick="changeQuantity(\'' + escapeHtml(String(row.id)) + '\',-1)" aria-label="Уменьшить количество" style="background:#f4f4f4;border:0;padding:12px 16px;font-size:20px;cursor:pointer;">−</button>' +
      '<input type="number" id="' + escapeHtml(String(row.id)) + '-qty" value="1" min="1" max="99" data-price="' + (price > 0 ? price : 0) + '" style="width:55px;text-align:center;border:0;" aria-label="Количество">' +
      '<button type="button" onclick="changeQuantity(\'' + escapeHtml(String(row.id)) + '\',1)" aria-label="Увеличить количество" style="background:#f4f4f4;border:0;padding:12px 16px;font-size:20px;cursor:pointer;">+</button>' +
      '</div><button type="button" class="mp-btn-buy" onclick="addItemToCart(' +
      escapeHtml(JSON.stringify(String(row.id))) + ',' + escapeHtml(JSON.stringify(cartItemName)) +
      ',Math.max(1,Math.min(99,Number(document.getElementById(\'' + escapeHtml(String(row.id)) + '-qty\').value)||1)),' +
      (price > 0 ? price : 0) + ',' + (group.cartLengthUnit === 'cm' ? lengthCm : Math.round(lengthCm * 10)) + ',' + weight + ')">' +
      escapeHtml(group.buyButtonLabel || 'В корзину') + '</button></div>',
    '{{GROUP_ALBUM_REFERENCE}}': escapeHtml(group.albumReference),
    '{{GROUP_ALBUM_NOTE}}': escapeHtml(group.albumNote),
    '{{PRODUCT_SHORT_DESCRIPTION}}': escapeHtml(shortDescription),
    '{{GROUP_AND_PRODUCT_SPECIFICATIONS}}': specsHtml,
    '{{GROUP_DESCRIPTION_AND_INSTALLATION}}': descriptionHtml,
    '{{GROUP_OTHER_SIZES}}': otherSizesHtml,
    '{{GROUP_SIMILAR_PRODUCTS}}': similarProductsHtml,
    '{{GROUP_OTHER_CATEGORIES}}': categoriesHtml
  };

  const productJsonLdHtml = '<script type="application/ld+json">\\n' + JSON.stringify(jsonLd, null, 2) + '\\n</script>';
  let html = template.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, productJsonLdHtml)
    .replace(/Стремянка для колодцев/g, escapeHtml(group.schemaProductType || 'Стремянка для колодцев'));
  for (const [token, value] of Object.entries(replacements)) html = html.split(token).join(value);
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '<script type="application/ld+json">\n' +
    JSON.stringify(jsonLd, null, 2) + '\n</script>');
  const unresolved = html.match(/\{\{[A-Z0-9_]+\}\}/g);
  if (unresolved) throw new Error('Unresolved template tokens: ' + [...new Set(unresolved)].join(', '));
  return html;
}

module.exports = { renderMasterProduct, getMasterProductSlug };
