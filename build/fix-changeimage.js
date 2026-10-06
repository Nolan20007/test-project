// fix-changeimage.js — одноразовый скрипт.
// Удаляет строку "mainImage.src = src;" из функции changeImage
// в 8 файлах товаров. Больше ничего не меняет.

const fs = require('fs');
const path = require('path');

const FILES = [
  'ss1.html',
  'ss2.html',
  'tmp-902.html',
  'l-16-dlya-teplovyh-setej.html',
  'kl-1-dlya-kanalizacionnyh-kolodcev.html',
  'vl-2-l-19-vodoprovodnaya.html',
  'ssg1.html',
  'skoba-mn.html',
];

// Регулярка ищет строку целиком: отступы + "mainImage.src = src;" + перевод строки.
// Удаляем ВМЕСТЕ с переводом строки, чтобы не оставалось пустой строки.
const TARGET_RE = /^[ \t]*mainImage\.src\s*=\s*src\s*;[ \t]*\r?\n/m;

let foundCount = 0;
let skippedCount = 0;

console.log('Проверяю файлы...\n');

FILES.forEach(file => {
  const filePath = path.resolve(__dirname, file);

  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠ ${file} — файл не найден, пропускаю`);
    skippedCount++;
    return;
  }

  const original = fs.readFileSync(filePath, 'utf8');
  const matches = original.match(new RegExp(TARGET_RE, 'g'));

  if (!matches) {
    console.log(`  · ${file} — строка не найдена, файл не тронут`);
    skippedCount++;
    return;
  }

  if (matches.length > 1) {
    console.log(`  ⚠ ${file} — найдено ${matches.length} вхождений, ожидалось 1. Файл НЕ ТРОГАЮ.`);
    skippedCount++;
    return;
  }

  const updated = original.replace(TARGET_RE, '');

  // Финальная страховка: длина должна уменьшиться ровно на длину найденной строки.
  const diff = original.length - updated.length;
  const expected = matches[0].length;

  if (diff !== expected) {
    console.log(`  ⚠ ${file} — неожиданная разница длин (${diff} vs ${expected}). Файл НЕ ТРОГАЮ.`);
    skippedCount++;
    return;
  }

  fs.writeFileSync(filePath, updated, 'utf8');
  console.log(`  ✓ ${file} — удалена 1 строка (${expected} байт)`);
  foundCount++;
});

console.log('\n─────────────────────────────');
console.log(`Итого: изменено файлов — ${foundCount}`);
console.log(`       пропущено файлов — ${skippedCount}`);
console.log('─────────────────────────────');
console.log('\nЕсли что-то пойдёт не так — восстановите файлы из системы контроля версий.');
