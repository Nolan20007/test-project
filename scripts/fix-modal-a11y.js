#!/usr/bin/env node
/**
 * fix-modal-a11y.js
 *
 * Шаг 3.2 — доступность модалки #productModal.
 *
 * Что делает за один проход по каждому HTML-файлу:
 *   1. HTML: <div id="productModal"> → добавляет role/aria-modal/aria-labelledby
 *   2. HTML: <span class="close-btn"> → <button type="button" ...>
 *   3. CSS:  в правило .close-btn добавляет background/border/padding/font-family/line-height
 *   4. JS:   добавляет Escape-обработчик, если его ещё нет
 *   5. Бонус: чинит `async async` в l-16-... и tmp-902.html,
 *             удаляя мёртвый CSV-блок loadAllTables
 *
 * Безопасно: пишет только при реальных изменениях, делает бэкап *.bak
 * Идемпотентно: повторный запуск ничего не меняет.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Файлы с модалкой #productModal (cart.html и 404.html исключены — там её нет)
const FILES_WITH_MODAL = [
  'index.html',
  'ss1.html',
  'ss2.html',
  'ssg1.html',
  'tmp-902.html',
  'vl-2-l-19-vodoprovodnaya.html',
  'kl-1-dlya-kanalizacionnyh-kolodcev.html',
  'l-16-dlya-teplovyh-setej.html',
  'dostavka-i-oplata.html',
  'o-kompanii.html',
  'gost-trebovaniya-k-lestnicam.html',
  'kak-vybrat-stremyanku.html',
  'montazh-stremyanok-v-kolodcy.html',
  'price-list.html',
  'politika-konfidencialnosti.html',
  'publichnaya-oferta.html',
];

// Файлы, где нужно почистить мёртвый CSV-блок
const FILES_WITH_DEAD_CSV = [
  'l-16-dlya-teplovyh-setej.html',
  'tmp-902.html',
];

// Список файлов, где Escape уже есть (не трогаем)
const FILES_WITH_ESCAPE_ALREADY = ['index.html'];

// ============================================================
// 1. HTML модалки
// ============================================================

const OLD_MODAL_LINE =
  '<div id="productModal" class="lightbox-modal" onclick="closeModal()">\n' +
  '    <span class="close-btn" title="Закрыть">&times;</span>';

const NEW_MODAL_LINE =
  '<div id="productModal" class="lightbox-modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle" onclick="closeModal()">\n' +
  '    <button type="button" class="close-btn" title="Закрыть" aria-label="Закрыть окно" onclick="closeModal()">&times;</button>';

function fixModalHtml(html) {
  if (html.includes(NEW_MODAL_LINE)) return { html, changed: false, note: 'HTML уже обновлён' };
  if (!html.includes(OLD_MODAL_LINE)) {
    return { html, changed: false, note: '⚠ HTML модалки не найден в ожидаемом виде' };
  }
  return {
    html: html.replace(OLD_MODAL_LINE, NEW_MODAL_LINE),
    changed: true,
    note: 'HTML обновлён',
  };
}

// ============================================================
// 2. CSS .close-btn
// ============================================================

// Добавляем обнуляющие стили кнопки в правило .close-btn
const CLOSE_BTN_MARKER = '/* a11y:button-reset */';
const CLOSE_BTN_EXTRA = `
            ${CLOSE_BTN_MARKER}
            background: transparent;
            border: none;
            padding: 0;
            font-family: inherit;
            line-height: 1;
            color: #f1f1f1;
`;

function fixCloseBtnCss(html) {
  if (html.includes(CLOSE_BTN_MARKER)) {
    return { html, changed: false, note: 'CSS уже обновлён' };
  }

  // Ищем .close-btn { ... } — правило может быть в разных местах,
  // но структура одинаковая: .close-btn {\n ... }
  const re = /(\.close-btn\s*\{)([\s\S]*?)(\})/;
  if (!re.test(html)) {
    return { html, changed: false, note: '⚠ .close-btn не найден в CSS' };
  }

  return {
    html: html.replace(re, (m, open, body, close) => {
      // Не дублируем color, если он уже есть
      const bodyClean = body.includes('color:') ? body : body + '            color: #f1f1f1;\n';
      return open + bodyClean + CLOSE_BTN_EXTRA + '        ' + close;
    }),
    changed: true,
    note: 'CSS .close-btn обновлён',
  };
}

// ============================================================
// 3. Escape-обработчик
// ============================================================

const ESCAPE_MARKER = '/* a11y:escape */';
const ESCAPE_SNIPPET = `
    ${ESCAPE_MARKER}
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
    });
`;

function fixEscapeHandler(html, filename) {
  if (FILES_WITH_ESCAPE_ALREADY.includes(filename)) {
    return { html, changed: false, note: 'Escape уже есть (index.html)' };
  }
  if (html.includes(ESCAPE_MARKER)) {
    return { html, changed: false, note: 'Escape уже добавлен' };
  }

  // Ищем `function closeModal() { ... }` и вставляем после него.
  // В разных файлах closeModal определён по-разному:
  //   - index.html:       function closeModal() { modal.style.display = "none"; }
  //   - ss1.html и др.:   function closeModal() { modal.style.display = "none"; }
  //   - kl-1...:          function closeModal() { modal.style.display = "none"; }
  // Все они имеют вид `function closeModal() { ... }` — ищем закрывающую скобку.
  const re = /(function\s+closeModal\s*\(\s*\)\s*\{[^}]*\})/;
  const m = re.exec(html);
  if (!m) {
    return { html, changed: false, note: '⚠ function closeModal() не найдена' };
  }

  const insertAt = m.index + m[0].length;
  const newHtml = html.slice(0, insertAt) + '\n' + ESCAPE_SNIPPET + html.slice(insertAt);
  return { html: newHtml, changed: true, note: 'Escape добавлен' };
}

// ============================================================
// 4. Чистка мёртвого CSV-блока (async async)
// ============================================================

function removeDeadCsvBlock(html, filename) {
  if (!FILES_WITH_DEAD_CSV.includes(filename)) {
    return { html, changed: false, note: '' };
  }
  if (!html.includes('async async function loadAllTables')) {
    return { html, changed: false, note: 'мёртвый CSV-блок не найден' };
  }

  // Удаляем: объявление CSV_SOURCES + функцию loadAllTables + вызов window.onload = loadAllTables;
  // Всё это лежит в одном <script> в конце файла. Найдём блок от `const CSV_SOURCES` до `window.onload = loadAllTables;` включительно.

  const startMarker = 'const CSV_SOURCES = [';
  const endMarker = 'window.onload = loadAllTables;';

  const startIdx = html.indexOf(startMarker);
  const endIdx = html.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    return { html, changed: false, note: '⚠ не удалось найти границы CSV-блока' };
  }

  const before = html.slice(0, startIdx);
  const after = html.slice(endIdx + endMarker.length);

  // Заодно уберём лишние пустые строки на стыке
  const cleaned = (before.replace(/\s+$/, '\n\n') + after.replace(/^\s+/, '\n')).replace(/\n{3,}/g, '\n\n');

  return { html: cleaned, changed: true, note: 'мёртвый CSV-блок удалён (async async исправлен)' };
}

// ============================================================
// Прогон
// ============================================================

function processFile(filename) {
  const fullPath = path.join(ROOT, filename);
  if (!fs.existsSync(fullPath)) {
    console.log(`  ⚠ ${filename}: файл не найден, пропуск`);
    return { file: filename, changed: false, notes: [] };
  }

  let html = fs.readFileSync(fullPath, 'utf8');
  const original = html;
  const notes = [];

  // 1. HTML модалки
  const r1 = fixModalHtml(html);
  html = r1.html;
  if (r1.note) notes.push(r1.note);

  // 2. CSS .close-btn
  const r2 = fixCloseBtnCss(html);
  html = r2.html;
  if (r2.note) notes.push(r2.note);

  // 3. Escape
  const r3 = fixEscapeHandler(html, filename);
  html = r3.html;
  if (r3.note) notes.push(r3.note);

  // 4. Чистка мёртвого CSV-блока
  const r4 = removeDeadCsvBlock(html, filename);
  html = r4.html;
  if (r4.note) notes.push(r4.note);

  const changed = html !== original;
  if (changed) {
    // Бэкап — только если его ещё нет
    const bakPath = fullPath + '.bak';
    if (!fs.existsSync(bakPath)) {
      fs.writeFileSync(bakPath, original, 'utf8');
    }
    fs.writeFileSync(fullPath, html, 'utf8');
  }

  return { file: filename, changed, notes };
}

function main() {
  console.log('🔧 fix-modal-a11y.js — Шаг 3.2\n');

  let changedCount = 0;
  const skipped = [];

  // Файлы с модалкой
  FILES_WITH_MODAL.forEach(f => {
    const res = processFile(f);
    const icon = res.changed ? '✓' : '·';
    const status = res.changed ? 'ОБНОВЛЁН' : 'без изменений';
    console.log(`  ${icon} ${f.padEnd(42)} ${status}`);
    res.notes.forEach(n => console.log(`      → ${n}`));
    if (res.changed) changedCount++;
    if (!res.changed && res.notes.some(n => n.startsWith('⚠'))) skipped.push(f);
  });

  console.log('');
  console.log(`Готово. Обновлено файлов: ${changedCount} из ${FILES_WITH_MODAL.length}`);
  if (skipped.length) {
    console.log(`⚠ Файлы с предупреждениями: ${skipped.join(', ')}`);
  }
  console.log('');
  console.log('Проверь один файл глазами, например ss1.html:');
  console.log('  - <div id="productModal" role="dialog" ...>');
  console.log('  - <button type="button" class="close-btn" ...>');
  console.log('  - в CSS .close-btn есть background: transparent; border: none;');
  console.log('  - в JS есть /* a11y:escape */ document.addEventListener(\'keydown\', ...)');
  console.log('');
  console.log('Бэкапы сохранены как *.html.bak (только при первом изменении).');
  console.log('Откат: переименуй нужный .bak обратно в .html.');
}

main();
