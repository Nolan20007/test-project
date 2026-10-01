const fs = require('fs');
const path = require('path');

// Только страницы товаров
const FILES = [
  'ss1.html',
  'ss2.html',
  'ssg1.html',
  'kl-1-dlya-kanalizacionnyh-kolodcev.html',
  'vl-2-l-19-vodoprovodnaya.html',
  'l-16-dlya-teplovyh-setej.html',
  'tmp-902.html',
];

function cleanupFile(html) {
  let result = html;
  let changes = 0;

  // 1. Удалить window.CONFIG = {...};
  const configRegex = /window\.CONFIG\s*=\s*\{[\s\S]*?\};\s*\n?/;
  if (configRegex.test(result)) {
    result = result.replace(configRegex, '');
    changes++;
  }

  // 2. Удалить const CSV_URL = '...';
  const csvUrlRegex = /const\s+CSV_URL\s*=\s*['"][^'"]*['"]\s*;\s*\n?/;
  if (csvUrlRegex.test(result)) {
    result = result.replace(csvUrlRegex, '');
    changes++;
  }

  // 3. Удалить блоки: parseCSV, loadProductData, showErrorMessage, generateTableHTML, loadNomenclatureTable
  const functionNames = [
    'parseCSV',
    'loadProductData',
    'showErrorMessage',
    'generateTableHTML',
    'loadNomenclatureTable',
  ];

  functionNames.forEach(fnName => {
    // Ищем: function fnName(...) { ... }
    const regex = new RegExp(
      `function\\s+${fnName}\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?\\n    \\}\\s*\\n?`,
      'm'
    );
    if (regex.test(result)) {
      result = result.replace(regex, '');
      changes++;
    }
  });

  // 4. Удалить window.onload = loadNomenclatureTable;
  const onloadRegex = /window\.onload\s*=\s*loadNomenclatureTable\s*;\s*\n?/;
  if (onloadRegex.test(result)) {
    result = result.replace(onloadRegex, '');
    changes++;
  }

  return { html: result, changes };
}

function build() {
  let changedFiles = 0;
  let totalChanges = 0;

  FILES.forEach(file => {
    const filePath = path.resolve(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠ Нет файла: ${file}`);
      return;
    }
    const html = fs.readFileSync(filePath, 'utf8');
    const { html: newHtml, changes } = cleanupFile(html);

    if (newHtml !== html) {
      fs.writeFileSync(filePath, newHtml, 'utf8');
      console.log(`  ✓ ${file} — ${changes} удалений`);
      changedFiles++;
      totalChanges += changes;
    } else {
      console.log(`  · ${file} — без изменений`);
    }
  });

  console.log(`\nГотово. Обновлено файлов: ${changedFiles}. Всего удалений: ${totalChanges}`);
}

build();
