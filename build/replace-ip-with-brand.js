// replace-ip-with-brand.js — одноразовый скрипт.
// Заменяет упоминания "ИП Гневашева Кристина Дмитриевна" на бренд
// "Лестницы и стремянки для колодцев" везде, КРОМЕ юридически обязательных страниц.
//
// НЕ трогает:
//   - o-kompanii.html                (страница реквизитов)
//   - publichnaya-oferta.html        (юридический документ)
//   - politika-konfidencialnosti.html (юридический документ)
//   - yandex-feed.xml                (требование Яндекс.Маркета)
//
// В оферте и политике — добавляет связку "осуществляющий деятельность под брендом...".

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Файлы, в которых делаем АВТОЗАМЕНУ ИП → бренд
const FILES_TO_REPLACE = [
  'index.html',
  'ss1.html',
  'ss2.html',
  'tmp-902.html',
  'ssg1.html',
  'skoba-mn.html',
  'kl-1-dlya-kanalizacionnyh-kolodcev.html',
  'vl-2-l-19-vodoprovodnaya.html',
  'l-16-dlya-teplovyh-setej.html',
  'kak-vybrat-stremyanku.html',
  'montazh-stremyanok-v-kolodcy.html',
  'gost-trebovaniya-k-lestnicam.html',
  'humans.txt',
];

// Что заменяем (в JSON-LD и других местах)
const REPLACEMENTS = [
  // Основная замена — точное совпадение строки в JSON-LD
  {
    from: /"name"\s*:\s*"ИП Гневашева Кристина Дмитриевна"/g,
    to:   '"name": "Лестницы и стремянки для колодцев"',
  },
  // На случай, если где-то без кавычек JSON (например, в тексте)
  {
    from: /ИП Гневашева Кристина Дмитриевна/g,
    to:   'Лестницы и стремянки для колодцев',
  },
  {
    from: /ИП Гневашева К\.Д\./g,
    to:   'Лестницы и стремянки для колодцев',
  },
  {
    from: /Производство лестниц и стремянок для колодцев/g,
    to:   'Лестницы и стремянки для колодцев',
  },
];

// Файлы, где делаем ТОЛЬКО добавление связки (не замену ИП)
const OFFER_FILE = 'publichnaya-oferta.html';
const POLICY_FILE = 'politika-konfidencialnosti.html';

// Файлы, которые вообще не трогаем
const SKIP_FILES = [
  'o-kompanii.html',
  'yandex-feed.xml',
];

function processSimpleFile(file) {
  const fullPath = path.join(ROOT, file);
  if (!fs.existsSync(fullPath)) {
    return { file, status: 'not-found', changes: 0 };
  }

  const original = fs.readFileSync(fullPath, 'utf8');
  let updated = original;
  let changes = 0;

  for (const rule of REPLACEMENTS) {
    const before = updated;
    updated = updated.replace(rule.from, rule.to);
    if (updated !== before) {
      // Считаем количество замен
      const matches = before.match(rule.from);
      changes += matches ? matches.length : 1;
    }
  }

  if (updated !== original) {
    fs.writeFileSync(fullPath, updated, 'utf8');
    return { file, status: 'changed', changes };
  }
  return { file, status: 'unchanged', changes: 0 };
}

function processOfferFile(file) {
  const fullPath = path.join(ROOT, file);
  if (!fs.existsSync(fullPath)) {
    return { file, status: 'not-found', changes: 0 };
  }

  const original = fs.readFileSync(fullPath, 'utf8');
  let updated = original;
  let changes = 0;

  // 1) В шапке (highlight): добавляем связку после ОГРНИП
  const headerRe = /(ОГРНИП\s+321595800089601)(\))/;
  if (headerRe.test(updated) &&
      !/осуществляющего деятельность под брендом/.test(updated.slice(0, 2000))) {
    updated = updated.replace(
      headerRe,
      '$1), осуществляющего деятельность под брендом «Лестницы и стремянки для колодцев»$2'
    );
    // убираем возможную двойную скобку
    updated = updated.replace(
      'ОГРНИП 321595800089601), осуществляющего деятельность под брендом «Лестницы и стремянки для колодцев»)',
      'ОГРНИП 321595800089601), осуществляющего деятельность под брендом «Лестницы и стремянки для колодцев»'
    );
    changes++;
  }

  // 2) В п.1.1: добавляем связку
  const p11Re = /(ОГРНИП\s+321595800089601)(\.)/;
  if (p11Re.test(updated) &&
      !/осуществляющий деятельность под брендом/.test(updated.slice(0, 5000))) {
    updated = updated.replace(
      p11Re,
      '$1), осуществляющий деятельность под брендом «Лестницы и стремянки для колодцев»$2'
    );
    changes++;
  }

  if (updated !== original) {
    fs.writeFileSync(fullPath, updated, 'utf8');
    return { file, status: 'changed', changes };
  }
  return { file, status: 'unchanged', changes: 0 };
}

function processPolicyFile(file) {
  const fullPath = path.join(ROOT, file);
  if (!fs.existsSync(fullPath)) {
    return { file, status: 'not-found', changes: 0 };
  }

  const original = fs.readFileSync(fullPath, 'utf8');
  let updated = original;
  let changes = 0;

  // п.1.3: добавляем связку после ОГРНИП
  const re = /(ОГРНИП\s+321595800089601)(\)\s*,?\s*далее\s+—\s+Оператор)/;
  if (re.test(updated) &&
      !/осуществляющий деятельность под брендом/.test(updated)) {
    updated = updated.replace(
      re,
      '$1), осуществляющий деятельность под брендом «Лестницы и стремянки для колодцев»$2'
    );
    changes++;
  }

  if (updated !== original) {
    fs.writeFileSync(fullPath, updated, 'utf8');
    return { file, status: 'changed', changes };
  }
  return { file, status: 'unchanged', changes: 0 };
}

function run() {
  console.log('=== Замена "ИП Гневашева" на "Лестницы и стремянки для колодцев" ===\n');
  console.log('Файлы, где ИП заменяется на бренд:');
  FILES_TO_REPLACE.forEach(f => console.log('  · ' + f));
  console.log('\nФайлы, где добавляется связка (ИП остаётся):');
  console.log('  · ' + OFFER_FILE);
  console.log('  · ' + POLICY_FILE);
  console.log('\nФайлы, которые НЕ трогаем:');
  SKIP_FILES.forEach(f => console.log('  · ' + f));
  console.log('');

  let totalChanged = 0;
  let totalChanges = 0;

  console.log('--- Замена в файлах ---');
  for (const file of FILES_TO_REPLACE) {
    const r = processSimpleFile(file);
    if (r.status === 'changed') {
      console.log(`✓ ${file} — замен: ${r.changes}`);
      totalChanged++;
      totalChanges += r.changes;
    } else if (r.status === 'unchanged') {
      console.log(`· ${file} — без изменений`);
    } else {
      console.log(`⚠ ${file} — не найден`);
    }
  }

  console.log('\n--- Добавление связки ---');
  const offerRes = processOfferFile(OFFER_FILE);
  if (offerRes.status === 'changed') {
    console.log(`✓ ${OFFER_FILE} — добавлено связок: ${offerRes.changes}`);
    totalChanged++;
    totalChanges += offerRes.changes;
  } else if (offerRes.status === 'unchanged') {
    console.log(`· ${OFFER_FILE} — без изменений`);
  } else {
    console.log(`⚠ ${OFFER_FILE} — не найден`);
  }

  const policyRes = processPolicyFile(POLICY_FILE);
  if (policyRes.status === 'changed') {
    console.log(`✓ ${POLICY_FILE} — добавлено связок: ${policyRes.changes}`);
    totalChanged++;
    totalChanges += policyRes.changes;
  } else if (policyRes.status === 'unchanged') {
    console.log(`· ${POLICY_FILE} — без изменений`);
  } else {
    console.log(`⚠ ${POLICY_FILE} — не найден`);
  }

  console.log('\n=== Итог ===');
  console.log(`Файлов изменено: ${totalChanged}`);
  console.log(`Всего замен/добавлений: ${totalChanges}`);
  console.log('\nЕсли что-то пошло не так — восстановите файлы из git.');
}

run();
