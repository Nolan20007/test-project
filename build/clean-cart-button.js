// Одноразовый скрипт: чистит старые стили .cart-button из <style> HTML-страниц.
// Запуск: node build/clean-cart-button.js

const fs = require('fs');
const path = require('path');

const FILES = [
  'index.html',
  'ss1.html',
  'ss2.html',
  'ssg1.html',
  'skoba-mn.html',
  'tmp-902.html',
  'l-16-dlya-teplovyh-setej.html',
  'kl-1-dlya-kanalizacionnyh-kolodcev.html',
  'vl-2-l-19-vodoprovodnaya.html',
  'price-list.html',
];

/**
 * Удаляет блок CSS по селектору: `selector { ... }`.
 * Поддерживает вложенные фигурные скобки (на случай media-запросов и т.п.).
 * Ищет по "голому" селектору, без учёта регистра.
 */
function removeCssBlock(css, selector) {
  const re = new RegExp(
    selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{',
    'g'
  );
  let result = css;
  let removed = 0;

  let match;
  while ((match = re.exec(result)) !== null) {
    const startIdx = match.index;
    let i = match.index + match[0].length;
    let depth = 1;
    while (i < result.length && depth > 0) {
      if (result[i] === '{') depth++;
      else if (result[i] === '}') depth--;
      i++;
    }
    if (depth !== 0) break; // незакрытый блок — прерываемся

    // Захватываем также пробелы/переносы до и после блока
    let before = startIdx;
    while (before > 0 && /[\s]/.test(result[before - 1])) before--;

    let after = i;
    while (after < result.length && /[\s]/.test(result[after])) after++;

    result = result.slice(0, before) + result.slice(after);
    removed++;

    re.lastIndex = 0; // после модификации строки индекс сбрасываем
  }

  return { css: result, removed };
}

/**
 * Из селектора `.quantity-control button, .cart-button {` убирает `.cart-button`.
 * Если в селекторе остаётся несколько — оставляет остальные.
 */
function stripFromSelector(css, keep, drop) {
  // Ищем строку вида: keep, drop {   или   drop, keep {   или   keep, drop, third {
  const re = new RegExp(
    '([^{}]*?)' + drop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*,?\\s*',
    'g'
  );

  return css.replace(re, (match, prefix) => {
    // Не трогаем блоки, где drop не в начале списка селекторов
    if (!prefix.trim().endsWith(',') && prefix.trim() !== '') {
      // это случай ".something .cart-button" — оставим как есть
      return match;
    }
    // Убираем drop из списка
    return prefix.replace(/,\s*$/, ', ') === ', ' ? '' : prefix;
  });
}

function cleanFile(fileName) {
  const filePath = path.resolve(__dirname, '..', fileName);

  if (!fs.existsSync(filePath)) {
    return { fileName, status: 'missing', changes: [] };
  }

  let html = fs.readFileSync(filePath, 'utf8');
  const original = html;
  const changes = [];

  // 1. Убираем `.cart-button` из составного селектора
  //    ".quantity-control button, .cart-button {" → ".quantity-control button {"
  const compoundRe = /(\.quantity-control\s+button)\s*,\s*\.cart-button\s*\{/g;
  if (compoundRe.test(html)) {
    html = html.replace(compoundRe, '$1 {');
    changes.push('убрал .cart-button из составного селектора');
  }

  // 2. Убираем блок `.cart-button:hover { ... }`
  const hoverResult = removeCssBlock(html, '.cart-button:hover');
  if (hoverResult.removed > 0) {
    html = hoverResult.css;
    changes.push(`удалил блок .cart-button:hover (${hoverResult.removed})`);
  }

  // 3. Убираем блок `.cart-button { ... }` (без :hover)
  //    Пробуем несколько раз — на случай нескольких вхождений.
  let totalRemoved = 0;
  let guard = 10;
  while (guard-- > 0) {
    const r = removeCssBlock(html, '.cart-button');
    if (r.removed === 0) break;
    html = r.css;
    totalRemoved += r.removed;
  }
  if (totalRemoved > 0) {
    changes.push(`удалил блок .cart-button (${totalRemoved})`);
  }

  if (html === original) {
    return { fileName, status: 'no-changes', changes: [] };
  }

  fs.writeFileSync(filePath, html, 'utf8');
  return { fileName, status: 'cleaned', changes };
}

// === Запуск ===
console.log('Чистка .cart-button из HTML...\n');

let cleanedCount = 0;
let noChangesCount = 0;
let missingCount = 0;

for (const file of FILES) {
  const r = cleanFile(file);
  if (r.status === 'cleaned') {
    console.log(`✓ ${r.fileName}`);
    r.changes.forEach(c => console.log(`    · ${c}`));
    cleanedCount++;
  } else if (r.status === 'no-changes') {
    console.log(`· ${r.fileName} — нечего чистить`);
    noChangesCount++;
  } else if (r.status === 'missing') {
    console.log(`✗ ${r.fileName} — файл не найден`);
    missingCount++;
  }
}

console.log(`\nГотово.`);
console.log(`  Обработано: ${cleanedCount}`);
console.log(`  Без изменений: ${noChangesCount}`);
console.log(`  Не найдено: ${missingCount}`);

if (missingCount > 0) {
  console.log('\n⚠ Некоторые файлы не найдены — проверьте список FILES внутри скрипта.');
  process.exit(1);
}
