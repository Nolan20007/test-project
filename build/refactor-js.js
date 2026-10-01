const fs = require('fs');
const path = require('path');

const FILES = [
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
  'tmp-902.html',
  'vl-2-l-19-vodoprovodnaya.html',
];

// Ключевые строки подключения модулей
const MODULES_TAG = `<script src="js/config.js"></script>
    <script src="js/utils.js"></script>`;

// Паттерны для удаления дублирующих блоков
const PATTERNS = [
  // const CONFIG = {...};
  /const\s+CONFIG\s*=\s*\{[\s\S]*?\};\s*\n/,
  // function showToast(...) {...}
  /function\s+showToast\s*\([^)]*\)\s*\{[\s\S]*?\n    \}\s*\n/,
  // function sanitizeInput(...) {...}
  /function\s+sanitizeInput\s*\([^)]*\)\s*\{[\s\S]*?\n    \}\s*\n/,
  // function validatePhone(...) {...}
  /function\s+validatePhone\s*\([^)]*\)\s*\{[\s\S]*?\n    \}\s*\n/,
  // function validateEmail(...) {...}
  /function\s+validateEmail\s*\([^)]*\)\s*\{[\s\S]*?\n    \}\s*\n/,
  // function getCart() {...}
  /function\s+getCart\s*\([^)]*\)\s*\{[\s\S]*?\n    \}\s*\n/,
  // function updateCartCountDisplay() {...}
  /function\s+updateCartCountDisplay\s*\([^)]*\)\s*\{[\s\S]*?\n    \}\s*\n/,
  // document.addEventListener('DOMContentLoaded', updateCartCountDisplay);
  /document\.addEventListener\s*\(\s*['"]DOMContentLoaded['"]\s*,\s*updateCartCountDisplay\s*\)\s*;\s*\n/,
  // window.addEventListener('storage', updateCartCountDisplay);
  /window\.addEventListener\s*\(\s*['"]storage['"]\s*,\s*updateCartCountDisplay\s*\)\s*;\s*\n/,
];

function refactorFile(html) {
  let result = html;
  let changes = 0;

  // 1. Проверяем, есть ли уже подключение config.js
  const hasConfig = result.includes('src="js/config.js"');
  const hasUtils = result.includes('src="js/utils.js"');

  // 2. Вставляем модули после <link rel="stylesheet" href="css/common.css">
  if (!hasConfig || !hasUtils) {
    const target = /(<link\s+rel=["']stylesheet["']\s+href=["']css\/common\.css["']\s*>)/;
    if (target.test(result)) {
      result = result.replace(target, `$1\n\n    ${MODULES_TAG}`);
      changes++;
    }
  }

  // 3. Удаляем дублирующие блоки
  PATTERNS.forEach(pattern => {
    if (pattern.test(result)) {
      result = result.replace(pattern, '');
      changes++;
    }
  });

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
    const { html: newHtml, changes } = refactorFile(html);

    if (newHtml !== html) {
      fs.writeFileSync(filePath, newHtml, 'utf8');
      console.log(`  ✓ ${file} — ${changes} изменений`);
      changedFiles++;
      totalChanges += changes;
    } else {
      console.log(`  · ${file} — без изменений`);
    }
  });

  console.log(`\nГотово. Обновлено файлов: ${changedFiles}. Всего изменений: ${totalChanges}`);
}

build();
