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
      { id: 'C-1', slug: 'stremyanka-s-1' },
      { id: 'C-2', slug: 'stremyanka-s-2' },
      { id: 'C-3', slug: 'stremyanka-s-3' },
      { id: 'C-4', slug: 'stremyanka-s-4' },
      { id: 'C-5', slug: 'stremyanka-s-5' },
      { id: 'C-6', slug: 'stremyanka-s-6' },
      { id: 'C-7', slug: 'stremyanka-s-7' },
      { id: 'C-8', slug: 'stremyanka-s-8' },
      { id: 'C-9', slug: 'stremyanka-s-9' },
    ]
  },
  {
    template: 'stremyanki-tpr-902-09-22-84.html',
    folder: 'stremyanki-tpr-902-09-22-84',
    title: 'Стремянки ТПР 902-09-22.84',
    catalog_link: 'ss2.html',
    csv: 'data/ss2-products.csv',
    items: [
      { id: 'C1-00', slug: 'stremyanka-s1-00' },
      { id: 'C1-01', slug: 'stremyanka-s1-01' },
      { id: 'C1-02', slug: 'stremyanka-s1-02' },
      { id: 'C1-03', slug: 'stremyanka-s1-03' },
      { id: 'C1-04', slug: 'stremyanka-s1-04' },
      { id: 'C1-05', slug: 'stremyanka-s1-05' },
      { id: 'C1-06', slug: 'stremyanka-s1-06' },
      { id: 'C1-07', slug: 'stremyanka-s1-07' },
      { id: 'C1-08', slug: 'stremyanka-s1-08' },
      { id: 'C1-09', slug: 'stremyanka-s1-09' },
      { id: 'C1-10', slug: 'stremyanka-s1-10' },
      { id: 'C1-11', slug: 'stremyanka-s1-11' },
      { id: 'C1-12', slug: 'stremyanka-s1-12' },
      { id: 'C1-13', slug: 'stremyanka-s1-13' },
      { id: 'C1-14', slug: 'stremyanka-s1-14' },
      { id: 'C1-15', slug: 'stremyanka-s1-15' },
      { id: 'C1-16', slug: 'stremyanka-s1-16' },
      { id: 'C1-17', slug: 'stremyanka-s1-17' },
      { id: 'C1-18', slug: 'stremyanka-s1-18' },
    ]
  },
  {
    template: 'lestnicy-nts-62-91-111a.html',
    folder: 'lestnicy-nts-62-91-111a',
    title: 'Лестницы-стремянки тепловых сетей НТС 62-91-111А',
    catalog_link: 'nts-62-91-111a.html',
    csv: 'data/nts-62-91-111a-products.csv',
    product_title_prefix: 'Лестница-стремянка для тепловых сетей',
    product_title_accusative: 'лестницу-стремянку для тепловых сетей',
    project_phrase: 'НТС 62-91-111А',
    album: 'нормалям тепловых сетей',
    construction: 'лестница-стремянка',
    construction_spec: 'Уголок 75×75×5 мм',
    step_spec: 'Стальной пруток Ø18 мм',
    installation_text: 'Лестница опирается на приваренные пятаки и крепится к стене тягами. Для тяг в лестнице предусмотрены отверстия диаметром 16 мм. Перед монтажом следует сверить расположение креплений с проектом тепловой камеры.',
    product_description: 'Стальная теплосетевая лестница-стремянка {{MODEL}} по нормалям тепловых сетей НТС 62-91-111А. Предназначена для спуска в тепловые камеры при осмотре, ремонте и обслуживании оборудования. Длина {{LENGTH_MM}} мм, ширина {{WIDTH_MM}} мм, материал — сталь Ст3.',
    items: [
      { id: 'NTSA-L2000', slug: 'lestnica-l-2000' },
      { id: 'NTSA-L2100', slug: 'lestnica-l-2100' },
      { id: 'NTSA-L2200', slug: 'lestnica-l-2200' },
      { id: 'NTSA-L2300', slug: 'lestnica-l-2300' },
      { id: 'NTSA-L2400', slug: 'lestnica-l-2400' },
      { id: 'NTSA-L2500', slug: 'lestnica-l-2500' },
      { id: 'NTSA-L2600', slug: 'lestnica-l-2600' },
      { id: 'NTSA-L2700', slug: 'lestnica-l-2700' },
      { id: 'NTSA-L2800', slug: 'lestnica-l-2800' },
      { id: 'NTSA-L2900', slug: 'lestnica-l-2900' },
      { id: 'NTSA-L3000', slug: 'lestnica-l-3000' },
      { id: 'NTSA-L3100', slug: 'lestnica-l-3100' },
      { id: 'NTSA-L3200', slug: 'lestnica-l-3200' },
      { id: 'NTSA-L3300', slug: 'lestnica-l-3300' },
      { id: 'NTSA-L3400', slug: 'lestnica-l-3400' },
      { id: 'NTSA-L3500', slug: 'lestnica-l-3500' },
      { id: 'NTSA-L3600', slug: 'lestnica-l-3600' },
      { id: 'NTSA-L3700', slug: 'lestnica-l-3700' },
      { id: 'NTSA-L3800', slug: 'lestnica-l-3800' },
      { id: 'NTSA-L3900', slug: 'lestnica-l-3900' },
      { id: 'NTSA-L4000', slug: 'lestnica-l-4000' },
      { id: 'NTSA-L4100', slug: 'lestnica-l-4100' },
      { id: 'NTSA-L4200', slug: 'lestnica-l-4200' },
      { id: 'NTSA-L4300', slug: 'lestnica-l-4300' },
      { id: 'NTSA-L4400', slug: 'lestnica-l-4400' },
      { id: 'NTSA-L4500', slug: 'lestnica-l-4500' },
      { id: 'NTSA-L4600', slug: 'lestnica-l-4600' },
      { id: 'NTSA-L4700', slug: 'lestnica-l-4700' },
      { id: 'NTSA-L4800', slug: 'lestnica-l-4800' },
      { id: 'NTSA-L4900', slug: 'lestnica-l-4900' },
      { id: 'NTSA-L5000', slug: 'lestnica-l-5000' },
      { id: 'NTSA-L5100', slug: 'lestnica-l-5100' },
      { id: 'NTSA-L5200', slug: 'lestnica-l-5200' },
      { id: 'NTSA-L5300', slug: 'lestnica-l-5300' },
      { id: 'NTSA-L5400', slug: 'lestnica-l-5400' },
      { id: 'NTSA-L5500', slug: 'lestnica-l-5500' },
      { id: 'NTSA-L5600', slug: 'lestnica-l-5600' },
      { id: 'NTSA-L5700', slug: 'lestnica-l-5700' },
      { id: 'NTSA-L5800', slug: 'lestnica-l-5800' },
      { id: 'NTSA-L5900', slug: 'lestnica-l-5900' },
      { id: 'NTSA-L6000', slug: 'lestnica-l-6000' },
      { id: 'NTSA-L6100', slug: 'lestnica-l-6100' },
      { id: 'NTSA-L6200', slug: 'lestnica-l-6200' },
      { id: 'NTSA-L6300', slug: 'lestnica-l-6300' },
      { id: 'NTSA-L6400', slug: 'lestnica-l-6400' },
      { id: 'NTSA-L6500', slug: 'lestnica-l-6500' },
      { id: 'NTSA-L6600', slug: 'lestnica-l-6600' },
      { id: 'NTSA-L6700', slug: 'lestnica-l-6700' },
      { id: 'NTSA-L6800', slug: 'lestnica-l-6800' },
      { id: 'NTSA-L6900', slug: 'lestnica-l-6900' },
      { id: 'NTSA-L7000', slug: 'lestnica-l-7000' },
      { id: 'NTSA-L7100', slug: 'lestnica-l-7100' },
      { id: 'NTSA-L7200', slug: 'lestnica-l-7200' },
      { id: 'NTSA-L7300', slug: 'lestnica-l-7300' },
      { id: 'NTSA-L7400', slug: 'lestnica-l-7400' },
      { id: 'NTSA-L7500', slug: 'lestnica-l-7500' },
      { id: 'NTSA-L7600', slug: 'lestnica-l-7600' },
      { id: 'NTSA-L7700', slug: 'lestnica-l-7700' },
      { id: 'NTSA-L7800', slug: 'lestnica-l-7800' },
      { id: 'NTSA-L7900', slug: 'lestnica-l-7900' },
      { id: 'NTSA-L8000', slug: 'lestnica-l-8000' }
    ]
  },
  {
    template: 'lestnicy-nts-62-91-111b.html',
    folder: 'lestnicy-nts-62-91-111b',
    title: 'Лестницы тепловых сетей НТС 62-91-111Б',
    catalog_link: 'nts-62-91-111b.html',
    csv: 'data/nts-62-91-111b-products.csv',
    product_title_prefix: 'Лестница тепловых сетей с перилами',
    product_title_accusative: 'лестницу тепловых сетей с перилами',
    project_phrase: 'НТС 62-91-111Б',
    album: 'нормалям тепловых сетей',
    construction: 'перила',
    construction_spec: 'Стальные перила по конструкции НТС 62-91-111Б',
    step_spec: 'Ступени и несущие элементы — сталь Ст3',
    installation_text: 'Перед установкой необходимо сверить длину лестницы, положение опор и способ крепления с проектом тепловой камеры. Монтаж выполняют с учетом конструкции стен и условий эксплуатации.',
    product_description: 'Стальная лестница с перилами {{MODEL}} по нормалям тепловых сетей НТС 62-91-111Б. Предназначена для спуска в тепловые камеры при осмотре, ремонте и обслуживании оборудования. Длина {{LENGTH_MM}} мм, ширина {{WIDTH_MM}} мм, материал — сталь Ст3.',
    items: [
      { id: 'NTSB-L2000', slug: 'lestnica-l-2000' },
      { id: 'NTSB-L2250', slug: 'lestnica-l-2250' },
      { id: 'NTSB-L2500', slug: 'lestnica-l-2500' },
      { id: 'NTSB-L2750', slug: 'lestnica-l-2750' },
      { id: 'NTSB-L3000', slug: 'lestnica-l-3000' },
      { id: 'NTSB-L3250', slug: 'lestnica-l-3250' },
      { id: 'NTSB-L3500', slug: 'lestnica-l-3500' },
      { id: 'NTSB-L3750', slug: 'lestnica-l-3750' },
      { id: 'NTSB-L4000', slug: 'lestnica-l-4000' }
    ]
  },
  {
    template: 'lestnicy-nts-62-91-111.html',
    folder: 'lestnicy-nts-62-91-111',
    title: 'Лестницы тепловых сетей НТС 62-91-111 с ограждением из дуг',
    catalog_link: 'nts-62-91-111.html',
    csv: 'data/nts-62-91-111-products.csv',
    product_title_prefix: 'Лестница с ограждением из дуг',
    product_title_accusative: 'лестницу с ограждением из дуг',
    project_phrase: 'НТС 62-91-111',
    album: 'нормалям тепловых сетей',
    construction: 'ограждение из дуг',
    construction_spec: 'Ограждение из дуг; уголок 75×75×5 мм',
    step_spec: 'Стальной пруток Ø18 мм',
    installation_text: 'Лестница опирается на приваренные опорные пятаки и крепится к стене тягами. В конструкции предусмотрены отверстия Ø16 мм для установки тяг. Перед монтажом следует сверить расположение креплений с проектом тепловой камеры.',
    product_description: 'Стальная лестница с ограждением из дуг {{MODEL}} по нормалям тепловых сетей НТС 62-91-111. Предназначена для спуска в тепловые камеры при осмотре, ремонте и обслуживании оборудования. Длина {{LENGTH_MM}} мм, ширина {{WIDTH_MM}} мм, материал — сталь Ст3.',
    items: [
      { id: 'NTSS-S1', slug: 'lestnica-s1-3400' },
      { id: 'NTSS-S2', slug: 'lestnica-s2-4000' },
      { id: 'NTSS-S3', slug: 'lestnica-s3-4600' },
      { id: 'NTSS-S4', slug: 'lestnica-s4-5200' }
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
      { id: 'SG-22', slug: 'pozharnaya-stremyanka-sg-22' },
      { id: 'SG-28', slug: 'pozharnaya-stremyanka-sg-28' },
      { id: 'SG-34', slug: 'pozharnaya-stremyanka-sg-34' },
      { id: 'SG-40', slug: 'pozharnaya-stremyanka-sg-40' },
      { id: 'SG-46', slug: 'pozharnaya-stremyanka-sg-46' },
      { id: 'SG-52', slug: 'pozharnaya-stremyanka-sg-52' },
      { id: 'SG-58', slug: 'pozharnaya-stremyanka-sg-58' },
      { id: 'SG-64', slug: 'pozharnaya-stremyanka-sg-64' },
      { id: 'SG-70', slug: 'pozharnaya-stremyanka-sg-70' },
      { id: 'SG-82', slug: 'pozharnaya-stremyanka-sg-82' }
    ]
  },
  {
    type: 'metal',
    template: 'skoby-dlya-kolodcev.html',
    folder: 'skoby-dlya-kolodcev',
    title: 'Скобы для колодцев',
    catalog_link: 'skoby-dlya-kolodcev.html',
    csv: 'data/skoby-dlya-kolodcev-products.csv',
    dimension1_label: 'Длина',
    dimension2_label: 'Ширина',
    items: [
      { id: 'GS-1', slug: 'skoba-gs-1' },
      { id: 'GS-2', slug: 'skoba-gs-2' },
      { id: 'GS-3', slug: 'skoba-gs-3' },
      { id: 'GS-4', slug: 'skoba-gs-4' },
      { id: 'MN-1', slug: 'skoba-mn-1' },
      { id: 'SK-1', slug: 'skoba-sk-1' },
      { id: 'SK-1-K', slug: 'skoba-sk-1-k' },
      { id: 'SK-2', slug: 'skoba-sk-2' },
      { id: 'SK-3', slug: 'skoba-sk-3' },
      { id: 'SK-4', slug: 'skoba-sk-4' },
      { id: 'SK-5', slug: 'skoba-sk-5' },
      { id: 'SK-6', slug: 'skoba-sk-6' },
      { id: 'MN-1-OMEGA', slug: 'skoba-mn1-omega' },
      { id: 'MN-1-3900', slug: 'skoba-mn1-3900' }
    ]
  },
  {
    type: 'metal',
    template: 'soedinitelnye-elementy.html',
    folder: 'soedinitelnye-elementy',
    title: 'Соединительные элементы МС',
    catalog_link: 'soedinitelnye-elementy.html',
    csv: 'data/soedinitelnye-elementy-products.csv',
    dimension1_label: 'Ширина',
    dimension2_label: 'Высота',
    items: [
      { id: 'MS-1', slug: 'soedinitelny-element-ms-1-tpr-901-09-11-84', legacy_slug: 'soedinitelny-element-ms-1', tpr: '901-09-11.84', album: 'ТПР 901-09-11.84. Альбом VI.88', card_image: 'images/soedinitelnye-elementy/ms-1-2-3-4-card.webp', images: 'images/soedinitelnye-elementy/ms-1-2-3-4.webp' },
      { id: 'MS-2', slug: 'soedinitelny-element-ms-2-tpr-901-09-11-84', legacy_slug: 'soedinitelny-element-ms-2', tpr: '901-09-11.84', album: 'ТПР 901-09-11.84. Альбом VI.88', card_image: 'images/soedinitelnye-elementy/ms-1-2-3-4-card.webp', images: 'images/soedinitelnye-elementy/ms-1-2-3-4.webp' },
      { id: 'MS-3', slug: 'soedinitelny-element-ms-3-tpr-901-09-11-84', legacy_slug: 'soedinitelny-element-ms-3', tpr: '901-09-11.84', album: 'ТПР 901-09-11.84. Альбом VI.88', card_image: 'images/soedinitelnye-elementy/ms-1-2-3-4-card.webp', images: 'images/soedinitelnye-elementy/ms-1-2-3-4.webp' },
      { id: 'MS-4', slug: 'soedinitelny-element-ms-4-tpr-901-09-11-84', legacy_slug: 'soedinitelny-element-ms-4', tpr: '901-09-11.84', album: 'ТПР 901-09-11.84. Альбом VI.88', card_image: 'images/soedinitelnye-elementy/ms-1-2-3-4-card.webp', images: 'images/soedinitelnye-elementy/ms-1-2-3-4.webp' },
      { id: 'MS-5', slug: 'soedinitelny-element-ms-5-tpr-901-09-11-84', legacy_slug: 'soedinitelny-element-ms-5', tpr: '901-09-11.84', album: 'ТПР 901-09-11.84. Альбом VI.88', card_image: 'images/soedinitelnye-elementy/ms-5-6-7-8-card.webp', images: 'images/soedinitelnye-elementy/ms-5-6-7-8.webp' },
      { id: 'MS-6', slug: 'soedinitelny-element-ms-6-tpr-901-09-11-84', legacy_slug: 'soedinitelny-element-ms-6', tpr: '901-09-11.84', album: 'ТПР 901-09-11.84. Альбом VI.88', card_image: 'images/soedinitelnye-elementy/ms-5-6-7-8-card.webp', images: 'images/soedinitelnye-elementy/ms-5-6-7-8.webp' },
      { id: 'MS-7', slug: 'soedinitelny-element-ms-7-tpr-901-09-11-84', legacy_slug: 'soedinitelny-element-ms-7', tpr: '901-09-11.84', album: 'ТПР 901-09-11.84. Альбом VI.88', card_image: 'images/soedinitelnye-elementy/ms-5-6-7-8-card.webp', images: 'images/soedinitelnye-elementy/ms-5-6-7-8.webp' },
      { id: 'MS-8', slug: 'soedinitelny-element-ms-8-tpr-901-09-11-84', legacy_slug: 'soedinitelny-element-ms-8', tpr: '901-09-11.84', album: 'ТПР 901-09-11.84. Альбом VI.88', card_image: 'images/soedinitelnye-elementy/ms-5-6-7-8-card.webp', images: 'images/soedinitelnye-elementy/ms-5-6-7-8.webp' },
      { id: 'MS-1-902', slug: 'soedinitelny-element-ms-1-tpr-902-09-22-84', tpr: '902-09-22.84', album: 'ТПР 902-09-22.84. Альбом VIII.88', card_image: 'images/soedinitelnye-elementy/ms-1-2-3-4-card.webp', images: 'images/soedinitelnye-elementy/ms-1-2-3-4.webp' },
      { id: 'MS-2-902', slug: 'soedinitelny-element-ms-2-tpr-902-09-22-84', tpr: '902-09-22.84', album: 'ТПР 902-09-22.84. Альбом VIII.88', card_image: 'images/soedinitelnye-elementy/ms-1-2-3-4-card.webp', images: 'images/soedinitelnye-elementy/ms-1-2-3-4.webp' },
      { id: 'MS-3-902', slug: 'soedinitelny-element-ms-3-tpr-902-09-22-84', tpr: '902-09-22.84', album: 'ТПР 902-09-22.84. Альбом VIII.88', card_image: 'images/soedinitelnye-elementy/ms-1-2-3-4-card.webp', images: 'images/soedinitelnye-elementy/ms-1-2-3-4.webp' },
      { id: 'MS-4-902', slug: 'soedinitelny-element-ms-4-tpr-902-09-22-84', tpr: '902-09-22.84', album: 'ТПР 902-09-22.84. Альбом VIII.88', card_image: 'images/soedinitelnye-elementy/ms-1-2-3-4-card.webp', images: 'images/soedinitelnye-elementy/ms-1-2-3-4.webp' },
      { id: 'MS-5-902', slug: 'soedinitelny-element-ms-5-tpr-902-09-22-84', tpr: '902-09-22.84', album: 'ТПР 902-09-22.84. Альбом VIII.88', card_image: 'images/soedinitelnye-elementy/ms-5-6-7-8-card.webp', images: 'images/soedinitelnye-elementy/ms-5-6-7-8.webp' },
      { id: 'MS-6-902', slug: 'soedinitelny-element-ms-6-tpr-902-09-22-84', tpr: '902-09-22.84', album: 'ТПР 902-09-22.84. Альбом VIII.88', card_image: 'images/soedinitelnye-elementy/ms-5-6-7-8-card.webp', images: 'images/soedinitelnye-elementy/ms-5-6-7-8.webp' },
      { id: 'MS-7-902', slug: 'soedinitelny-element-ms-7-tpr-902-09-22-84', tpr: '902-09-22.84', album: 'ТПР 902-09-22.84. Альбом VIII.88', card_image: 'images/soedinitelnye-elementy/ms-5-6-7-8-card.webp', images: 'images/soedinitelnye-elementy/ms-5-6-7-8.webp' },
      { id: 'MS-8-902', slug: 'soedinitelny-element-ms-8-tpr-902-09-22-84', tpr: '902-09-22.84', album: 'ТПР 902-09-22.84. Альбом VIII.88', card_image: 'images/soedinitelnye-elementy/ms-5-6-7-8-card.webp', images: 'images/soedinitelnye-elementy/ms-5-6-7-8.webp' }
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
  { html: 'nts-62-91-111a.html', skipJsonLd: true, tables: [{ id: 'nomenclature-nts-a', csv: 'data/nts-62-91-111a-products.csv' }] },
  { html: 'skoby-dlya-kolodcev.html', tables: [{ id: 'nomenclature-container', csv: 'data/skoby-dlya-kolodcev-products.csv', dimensionHeaders: ['Габарит 1, см', 'Габарит 2, см'] }] },
  { html: 'soedinitelnye-elementy.html', tables: [{ id: 'nomenclature-container', csv: 'data/soedinitelnye-elementy-products.csv', dimensionHeaders: ['Ширина, см', 'Высота, см'] }] },
  { html: 'nts-62-91-111b.html', skipJsonLd: true, tables: [{ id: 'nomenclature-nts-b', csv: 'data/nts-62-91-111b-products.csv' }] },
  { html: 'nts-62-91-111.html', skipJsonLd: true, tables: [{ id: 'nomenclature-nts-s', csv: 'data/nts-62-91-111-products.csv' }] },
  { html: 'l-16-dlya-teplovyh-setej.html', tables: [
      { id: 'nomenclature-50', csv: 'data/tl-products.csv' },
      { id: 'nomenclature-63', csv: 'data/tl-63-products.csv' }
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
      { id: 'nomenclature-tl-50',                 csv: 'data/tl-products.csv' },
      { id: 'nomenclature-tl-63',                 csv: 'data/tl-63-products.csv' },
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
  const headers = Array.isArray(dimensionHeaders) && dimensionHeaders.length === 2
    ? dimensionHeaders
    : ['Длина, см', 'Ширина, см'];
  let html = `<table class="nomenclature-table"><thead><tr>
    <th>Фото</th><th>Изделие</th><th>${esc(headers[0])}</th><th>${esc(headers[1])}</th>
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
    else if (id.startsWith('NTSS-')) {
        const ntsSlugs = { 'NTSS-S1': 's1-3400', 'NTSS-S2': 's2-4000', 'NTSS-S3': 's3-4600', 'NTSS-S4': 's4-5200' };
        itemUrl = `products/lestnicy-nts-62-91-111/lestnica-${ntsSlugs[id]}.html`;
    }
    else if (id.startsWith('NTSA-')) {
        modelSlug = id.toLowerCase().replace('ntsa-', '').replace('l', 'l-');
        itemUrl = `products/lestnicy-nts-62-91-111a/lestnica-${modelSlug}.html`;
    }
    else if (id.startsWith('NTSB-')) {
        modelSlug = id.toLowerCase().replace('ntsb-', '').replace('l', 'l-');
        itemUrl = `products/lestnicy-nts-62-91-111b/lestnica-${modelSlug}.html`;
    }
    else if (id.startsWith('GS-') || id.startsWith('MN-') || id.startsWith('SK-')) {
        const slug = p.slug || ('skoba-' + id.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
        itemUrl = `products/skoby-dlya-kolodcev/${slug}.html`;
    }
    else if (id.startsWith('MS-')) {
        const metalCategory = CATEGORIES_TO_GENERATE.find(category => category.folder === 'soedinitelnye-elementy');
        const configuredItem = metalCategory && metalCategory.items.find(item => item.id === p.id);
        const slug = configuredItem ? configuredItem.slug : ('soedinitelny-element-' + id.toLowerCase());
        itemUrl = `products/soedinitelnye-elementy/${slug}.html`;
    }

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
    html += `<tr id="${anchor}"${hiddenStyle}>
      <td class="product-thumb-cell">${imageHtml}</td>
      <td>${nameHtml}</td><td>${length}</td><td>${width}</td><td>${weight}</td>
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
  'l-16-dlya-teplovyh-setej.html',
  'nts-62-91-111b.html',
  'nts-62-91-111.html',
  'nts-62-91-111a.html',
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

function buildMetalProductHtml(cat, item, row, rows, template) {
  const slug = item.slug;
  const url = SITE_URL + '/products/' + cat.folder + '/' + slug + '.html';
  const name = String(row.name || '').trim();
  const id = String(row.id || '').trim();
  const isMsCategory = cat.folder === 'soedinitelnye-elementy';
  const price = Number(row.price) > 0 ? Number(row.price) : null;
  const stockStatus = String(row.available || '').trim();
  const installationText = isMsCategory ? '' : String(row.installation || '').trim();
  const album = String(item.album || cat.album || row.drawing_album || '').trim() || 'Не указан в исходных данных каталога';
  const albums = album.split(';').map(value => value.trim()).filter(Boolean);
  const albumsHtml = albums.map(value => '<div>' + esc(value) + '</div>').join('');
  const albumsUspHtml = albums.map(value => '<span>' + esc(value) + '</span>').join('') + '<strong>Полное соответствие</strong>';
  const dimensionOneLabel = String(row.dimension1_label || cat.dimension1_label).trim();
  const dimensionTwoLabel = String(row.dimension2_label || cat.dimension2_label).trim();
  const dimensionOne = String(row.length || '').trim();
  const dimensionTwo = String(row.width || '').trim();
  const dimensionTwoMm = Number(dimensionTwo) * 10;
  const weight = String(row.weight || '').trim();

  const material = String(row.material || '').trim();
  const rodDiameter = String(row.rod_diameter || '').trim();
  const blankLength = String(row.blank_length_mm || '').trim();

  const gallery = String(item.images || row.images || row.image || '').split(';')
    .map(value => value.trim()).filter(Boolean)
    .filter(value => value !== 'images/default-product.svg');
  const sourceImage = String(row.image || '').trim();
  const cardImage = String(item.card_image || row.card_image || '').trim();
  const preferredImage = sourceImage.replace(/vid-(?:mini|card)\.webp$/i, 'vid-1.webp');
  const preferredImageExists = preferredImage && preferredImage !== sourceImage &&
    fs.existsSync(path.resolve(__dirname, '..', preferredImage));
  const validSourceImage = sourceImage && sourceImage !== 'images/default-product.svg'
    ? sourceImage
    : '';
  const fullImage = validSourceImage
    ? (preferredImageExists ? preferredImage : (gallery[0] || validSourceImage))
    : (gallery[0] || '');
  const galleryImages = id.startsWith('MS-') ? gallery.filter(src => src !== fullImage) : gallery;
  const galleryHtml = galleryImages.length
    ? '<section class="product-gallery-section"><h2>Фотографии и чертежи</h2><div class="product-gallery">' +
      galleryImages.map((src, index) => '<a href="../../' + esc(src) + '" target="_blank" rel="noopener"><img src="../../' + esc(src) + '" alt="' + esc(name) + ' — изображение ' + (index + 1) + '" loading="lazy"><span>' +
        (/(chertezh|drawing)/i.test(src) ? 'Чертёж' : /(album)/i.test(src) ? 'Альбом' : 'Фото') + '</span></a>').join('') +
      '</div></section>'
    : '';
  const displayImage = cardImage || fullImage;
  const imageHtml = displayImage
    ? '<img class="mp-main-img" src="../../' + esc(displayImage) + '" data-full-src="../../' + esc(fullImage) + '" alt="' + esc(name) + '" width="400" height="400">'
    : '<img class="mp-main-img product-image-placeholder" src="../../images/default-product.svg" alt="" aria-hidden="true" width="500" height="500">';

  const relatedProducts = rows.filter(other => {
    if (other.id === id) return false;
    if (!isMsCategory) return true;
    const otherItem = cat.items.find(candidate => candidate.id === other.id);
    return Boolean(otherItem && otherItem.tpr === item.tpr);
  }).map(other => {
    const otherItem = cat.items.find(candidate => candidate.id === other.id);
    if (!otherItem) return '';
    return '<a class="related-product" href="' + esc(otherItem.slug) + '.html">' + esc(other.name) + '</a>';
  }).join('');

  const buyControls = price === null
    ? '<p>Стоимость уточняйте при заказе.</p>'
    : '<div class="mp-buy-controls"><div class="quantity-control" style="display:flex; align-items:center; border: 1px solid #c8d9ea; border-radius: 12px; overflow: hidden;">' +
      '<button type="button" onclick="changeQuantity(\'' + esc(id) + '\', -1)" style="background:#f4f4f4; border:none; padding:12px 18px; font-size:20px; cursor:pointer;">−</button>' +
      '<input type="number" id="' + esc(id) + '-qty" value="1" min="1" max="99" data-price="' + price + '" style="width:50px; border:none; text-align:center; font-size:18px; font-weight:bold; padding:10px 0;">' +
      '<button type="button" onclick="changeQuantity(\'' + esc(id) + '\', 1)" style="background:#f4f4f4; border:none; padding:12px 18px; font-size:20px; cursor:pointer;">+</button>' +
      '</div><button type="button" class="cart-button mp-btn-buy" data-item-id="' + esc(id) + '" data-item-name="' + esc(name) +
      '" data-item-length="' + esc(dimensionOne) + '" data-item-weight="' + esc(weight) + '">Добавить в корзину</button></div>';

  const weightForSchema = Number(weight).toFixed(2).replace('.', ',');
  const productDescription = String(row.description || '').trim() || name;
  const description = (isMsCategory ? name : productDescription) + '. ' + dimensionOneLabel + ' ' + dimensionOne +
    ' см, ' + dimensionTwoLabel.toLowerCase() + ' ' + dimensionTwoMm + ' мм, масса ' + weightForSchema + ' кг.' +
    (material ? ' Материал: ' + material + '.' : '') +
    (rodDiameter ? ' Диаметр прутка: ' + rodDiameter + '.' : '') +
    ' Альбом чертежей: ' + album;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    sku: id,
    description,
    brand: { "@type": "Brand", name: "Лестницы и стремянки для колодцев" }
  };
  if (fullImage) schema.image = SITE_URL + '/' + fullImage;
  if (price !== null) schema.offers = {
    "@type": "Offer", url, priceCurrency: "RUB", price: String(price),
    availability: "https://schema.org/InStock"
  };

  const replacements = {
    SEO_TITLE: esc(name + ' — характеристики и цена'),
    SEO_DESC: esc(name + '. Размеры, масса, альбом чертежей и цена. Изготовление и доставка по России.'),
    CANONICAL_URL: url,
    PRODUCT_SCHEMA: JSON.stringify(schema),
    CATALOG_LINK: cat.catalog_link,
    CATALOG_TITLE: cat.title,
    CATALOG_TITLE_LOWER: cat.title.toLowerCase(),
    PRODUCT_NAME: esc(name),
    ID: esc(id),
    PRICE_DISPLAY: price === null ? 'Цена по запросу' : 'от ' + price.toLocaleString('ru-RU') + ' ₽',
    IMAGE_HTML: imageHtml,
    STOCK_STATUS: stockStatus ? '<div class="mp-stock">' + esc(/^в наличии$/i.test(stockStatus) ? '✓ В наличии на складе' : stockStatus) + '</div>' : '',
    INSTALLATION_HTML: !isMsCategory && installationText ? '<h3>Монтаж</h3><p>' + esc(installationText) + '</p>' : '',
    PRODUCT_DESCRIPTION: isMsCategory ? '' : esc(productDescription) + ' ' + esc(dimensionOneLabel) + ' — ' + esc(dimensionOne) +
      ' см, ' + esc(dimensionTwoLabel.toLowerCase()) + ' — ' + esc(dimensionTwo) + ' см, масса — ' + esc(weight) + ' кг.' +
      (material ? ' Материал: ' + esc(material) + '.' : '') +
      (rodDiameter ? ' Диаметр прутка: ' + esc(rodDiameter) + '.' : '') +
      (album !== 'Не указан в исходных данных каталога' ? ' Изделие приведено в альбоме: ' + esc(album) + '.' : ''),
    BUY_CONTROLS: buyControls,
    DIMENSION1_LABEL: esc(dimensionOneLabel),
    DIMENSION1: esc(dimensionOne),
    DIMENSION2_LABEL: esc(dimensionTwoLabel),
    DIMENSION2: esc(dimensionTwo),
    WEIGHT: esc(weight),
    UNIT: esc(row.unit || '1 шт'),
    ALBUM: esc(album),
    ALBUMS_HTML: albumsHtml,
    ALBUMS_USP_HTML: albumsUspHtml,
    MATERIAL_ROW: material ? '<tr><td>Материал</td><td>' + esc(material) + '</td></tr>' : '',
    ROD_DIAMETER_ROW: rodDiameter ? '<tr><td>Диаметр прутка</td><td>' + esc(rodDiameter) + '</td></tr>' : '',
    BLANK_LENGTH_ROW: blankLength ? '<tr><td>Длина заготовки</td><td>' + esc(blankLength) + ' мм</td></tr>' : '',
    GALLERY_HTML: galleryHtml,
    RELATED_PRODUCTS: relatedProducts
  };
  return template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(replacements, key) ? String(replacements[key]) : match
  );
}

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
      if (cat.type === 'metal') {
        const html = buildMetalProductHtml(cat, p, row, rows, template);
        const outPath = path.join(outDir, `${p.slug}.html`);
        fs.writeFileSync(outPath, html, 'utf8');
        console.log(`  ✅ products/${cat.folder}/${p.slug}.html создан`);
        createdPages.push(`products/${cat.folder}/${p.slug}.html`);
        if (p.legacy_slug && p.legacy_slug !== p.slug) {
          const legacyPath = path.join(outDir, `${p.legacy_slug}.html`);
          const legacyUrl = SITE_URL + '/products/' + cat.folder + '/' + p.slug + '.html';
          const redirectHtml = '<!DOCTYPE html>\\n<html lang="ru">\\n<head>\\n' +
            '  <meta charset="UTF-8">\\n' +
            '  <meta http-equiv="refresh" content="0; url=' + legacyUrl + '">\\n' +
            '  <link rel="canonical" href="' + legacyUrl + '">\\n' +
            '  <meta name="robots" content="noindex, follow">\\n' +
            '  <title>Страница товара перемещена</title>\\n' +
            '</head>\\n<body>\\n' +
            '  <p>Страница перемещена. <a href="' + legacyUrl + '">Перейти к товару</a>.</p>\\n' +
            '  <script>window.location.replace(' + JSON.stringify(legacyUrl) + ');</script>\\n' +
            '</body>\\n</html>\\n';
          fs.writeFileSync(legacyPath, redirectHtml, 'utf8');
          console.log(`  ↪ products/${cat.folder}/${p.legacy_slug}.html → ${p.slug}.html`);
        }
        return;
      }
      const numeric = field => {
        const n = Number(row[field]);
        if (!row[field] || !Number.isFinite(n) || n <= 0 || (field === 'step_count' && !Number.isInteger(n)))
          throw new Error(`[product pages] ${cat.template} / ${cat.csv}, ID "${p.id}": некорректное поле "${field}" = "${row[field]}"`);
        return n;
      };
      const getProductData = item => {
        const sourceRow = byId.get(item.id);
        if (!sourceRow) throw new Error(`[product pages] ${cat.template} / ${cat.csv}: не найден ID "${item.id}"`);
        const sourceName = String(sourceRow.name || '').trim();
        const modelMatch = sourceName.match(/(СГ-\d+|С\d+(?:-\d+)?|С-\d+|Л-\d+)/u);
        if (!sourceName || !modelMatch)
          throw new Error(`[product pages] ${cat.csv}, ID "${item.id}": не удалось определить название/модель из CSV name "${sourceRow.name}"`);
        const lengthCm = Number(sourceRow.length);
        if (!sourceRow.length || !Number.isFinite(lengthCm) || lengthCm <= 0)
          throw new Error(`[product pages] ${cat.csv}, ID "${item.id}": некорректное поле "length" = "${sourceRow.length}"`);
        const projectMatch = sourceName.match(/(ТПР \d{3}-\d{2}-\d{2}\.\d{2}|НТС 62-91-111[АБ]?|серия 1\.450\.3-7\.94)/iu);
        const project = projectMatch ? projectMatch[0].replace(/^серия/i, 'Серия') : cat.project_phrase;
        if (!project)
          throw new Error(`[product pages] ${cat.csv}, ID "${item.id}": не удалось определить норматив/проект из CSV name`);
        return { model: modelMatch[0], lengthCm, lengthMm: lengthCm * 10, project };
      };
      const { model, lengthCm, lengthMm, project } = getProductData(p);
      const rawPrice = String(row.price || '').trim();
      const price = rawPrice ? numeric('price') : null, weight = numeric('weight');
      // CSV stores width in centimetres; product templates and JSON-LD use millimetres.
      const widthMm = numeric('width') * 10;
      const stepCount = row.step_count ? numeric('step_count') : null;
      const buyControls = price === null ? '' : `<div class="mp-buy-controls">
                        <div class="quantity-control" style="display:flex; align-items:center; border: 1px solid #c8d9ea; border-radius: 12px; overflow: hidden;">
                            <button type="button" onclick="changeQuantity('{{ID}}', -1)" style="background:#f4f4f4; border:none; padding:12px 18px; font-size:20px; cursor:pointer;">−</button>
                            <input type="number" id="{{ID}}-qty" value="1" min="1" max="99" data-price="{{PRICE_RAW}}" style="width:50px; border:none; text-align:center; font-size:18px; font-weight:bold; padding:10px 0;">
                            <button type="button" onclick="changeQuantity('{{ID}}', 1)" style="background:#f4f4f4; border:none; padding:12px 18px; font-size:20px; cursor:pointer;">+</button>
                        </div>
                        <button type="button" class="mp-btn-buy cart-button"
                                data-item-id="{{ID}}" data-item-name="{{PRODUCT_TITLE}}"
                                data-item-length="{{LENGTH_CM}}" data-item-weight="{{WEIGHT_RAW}}">Добавить в корзину</button>
                    </div>`;
      const offerJsonLd = price === null ? '' : `,
      "offers": ${JSON.stringify({
        "@type": "Offer",
        "url": `https://stremyanki-dlya-kolodcev.ru/products/${cat.folder}/${p.slug}.html`,
        "priceCurrency": "RUB",
        "price": String(price),
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": { "@type": "Organization", "name": "ИП Гневашева Кристина Дмитриевна" }
      })}`;
      const priceDisplay = price === null ? 'Цена по запросу' : `от ${price.toLocaleString('ru-RU')} ₽`;
      let html = template;
      html = html.replace(/\{\{BUY_CONTROLS\}\}/g, buyControls)
        .replace(/\{\{OFFER_JSONLD\}\}/g, offerJsonLd)
        .replace(/\{\{PRICE_DISPLAY\}\}/g, priceDisplay);
      html = html.replace(/\{\{ID\}\}/g, p.id).replace(/\{\{MODEL\}\}/g, model)
        .replace(/\{\{LENGTH_MM\}\}/g, lengthMm).replace(/\{\{LENGTH_CM\}\}/g, lengthCm)
        .replace(/\{\{PRICE\}\}/g, price === null ? 'по запросу' : price.toLocaleString('ru-RU')).replace(/\{\{PRICE_RAW\}\}/g, price === null ? '' : String(price))
        .replace(/\{\{WEIGHT\}\}/g, weight.toFixed(2).replace('.', ','))
        .replace(/\{\{WEIGHT_RAW\}\}/g, String(weight)).replace(/\{\{STEP_COUNT\}\}/g, stepCount === null ? '—' : String(stepCount))
        .replace(/\{\{PROJECT\}\}/g, project).replace(/\{\{SLUG\}\}/g, p.slug)
        .replace(/\{\{PRODUCT_FOLDER\}\}/g, cat.folder)
        .replace(/\{\{WIDTH_MM\}\}/g, String(widthMm))
        .replace(/\{\{CONSTRUCTION\}\}/g, cat.construction || 'стальная конструкция')
        .replace(/\{\{CONSTRUCTION_SPEC\}\}/g, cat.construction_spec || 'Сталь Ст3')
        .replace(/\{\{STEP_SPEC\}\}/g, cat.step_spec || 'Сталь Ст3')
        .replace(/\{\{INSTALLATION_TEXT\}\}/g, cat.installation_text || 'Способ установки согласовывается с проектной документацией.')
        .replace(/\{\{PRODUCT_TITLE\}\}/g, `${cat.product_title_prefix || 'Лестница'} ${model} по ${cat.project_phrase || project}, длина ${lengthMm} мм`)
        .replace(/\{\{PRODUCT_DESCRIPTION\}\}/g, (cat.product_description || 'Стальная лестница {{MODEL}} по {{PROJECT}}, длина {{LENGTH_MM}} мм, ширина {{WIDTH_MM}} мм.').replace(/\{\{MODEL\}\}/g, model).replace(/\{\{PROJECT\}\}/g, project).replace(/\{\{LENGTH_MM\}\}/g, lengthMm).replace(/\{\{WIDTH_MM\}\}/g, String(widthMm)));
      const title = cat.product_title_prefix
        ? `${cat.product_title_prefix} ${model} по ${cat.project_phrase || project}, ${lengthCm} см — купить`
        : `Стремянка ${model} ${project} для колодцев, ${lengthCm} см — купить`;
      const album = cat.album || (cat.csv.includes('ss1-') ? 'Альбом V' : 'Альбом VII');
      const desc = cat.product_title_prefix
        ? `Купить ${cat.product_title_accusative || cat.product_title_prefix.toLowerCase()} ${model} по ${cat.project_phrase || project}, ${album}. Высота ${lengthCm} см, масса ${weight.toFixed(2).replace('.', ',')} кг. От производителя, доставка по России.`
        : `Купить стремянку ${model} для колодцев по ${project}, ${album}. Длина ${lengthCm} см, масса ${weight.toFixed(2).replace('.', ',')} кг. От производителя, доставка по России.`;
      html = html.replace(/\{\{SEO_TITLE\}\}/g, title).replace(/\{\{SEO_DESC\}\}/g, desc)
        .replace(/\{\{CATALOG_LINK\}\}/g, cat.catalog_link).replace(/\{\{CATALOG_TITLE\}\}/g, cat.title);
      let otherLinks = '';
      cat.items.forEach(other => {
        if (other.id === p.id) return;
        const otherData = getProductData(other);
        const linkTitle = cat.product_title_prefix
          ? `${cat.product_title_prefix} ${otherData.model} по ${cat.project_phrase || otherData.project}, длина ${otherData.lengthMm} мм`
          : `${otherData.model} (${otherData.lengthCm} см)`;
        otherLinks += `<a href="${other.slug}.html">${linkTitle}</a>\n`;
      });
      html = html.replace(/\{\{OTHER_SIZES\}\}/g, otherLinks);
      // Machine-readable breadcrumbs for every generated product detail page.
      const productUrl = `${SITE_URL}/products/${cat.folder}/${p.slug}.html`;
      const breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Главная", "item": SITE_URL + "/" },
          { "@type": "ListItem", "position": 2, "name": cat.title, "item": SITE_URL + "/" + cat.catalog_link },
          { "@type": "ListItem", "position": 3, "name": model, "item": productUrl }
        ]
      };
      html = html.replace('</head>',
        '<script type="application/ld+json">\n' +
        JSON.stringify(breadcrumb, null, 2) +
        '\n</script>\n</head>');

      const outPath = path.join(outDir, `${p.slug}.html`);
      fs.writeFileSync(outPath, html, 'utf8');
      console.log(`  ✅ products/${cat.folder}/${p.slug}.html создан`);
      createdPages.push(`products/${cat.folder}/${p.slug}.html`);
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
  CATEGORIES_TO_GENERATE.forEach(cat => {
    const csvPath = path.resolve(__dirname, '..', cat.csv);
    const rows = parseCSV(fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, ''));
    const rowsById = new Map(rows.map(row => [String(row.id), row]));
    lines.push('### ' + cat.title);
    cat.items.forEach(product => {
      const row = rowsById.get(String(product.id));
      const productName = String(row && row.name || '').trim();
      if (!productName) {
        throw new Error('[llms.txt] Не найдено название товара в CSV ' + cat.csv + ' для ID "' + product.id + '"');
      }
      const safeName = productName;
      const url = SITE_URL + '/products/' + cat.folder + '/' + product.slug + '.html';
      lines.push('- [' + safeName + '](' + url + ')');
      productLinkCount += 1;
    });
    lines.push('');
  });
  if (productLinkCount !== 142) {
    throw new Error('[llms.txt] Ожидалось 142 товарные ссылки, сформировано: ' + productLinkCount);
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
