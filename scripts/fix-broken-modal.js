#!/usr/bin/env node
/**
 * fix-broken-modal.js
 *
 * Срочный фикс для tmp-902.html и l-16-dlya-teplovyh-setej.html.
 *
 * Что делает для каждого из двух файлов:
 *   1. HTML: старый <div id="productModal" ...> + <span class="close-btn"> → ARIA + <button>
 *   2. JS: дописывает недостающие функции changeImage/openModal/closeModal/scrollToSlide/
 *           setActiveModalButton/galleryContainer-scroll-listener ПЕРЕД строкой
 *           `window.changeImage = changeImage;` (они там уже есть, но сами функции удалены).
 *   3. JS: добавляет Escape-обработчик после объявления closeModal.
 *   4. JS: удаляет только строку `async async function loadAllTables() {...}` целиком
 *           (по балансу скобок) и строку `window.onload = loadAllTables;`.
 *           `const CSV_SOURCES = [...]` оставляем — это безопасное объявление.
 *   5. Идемпотентность: если все маркеры уже есть — ничего не пишет.
 *
 * Бэкап не делает (по просьбе). Идемпотентно: повторный запуск — no-op.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FILES = ['tmp-902.html', 'l-16-dlya-teplovyh-setej.html'];

// ── 1. HTML модалки ────────────────────────────────────────────
const OLD_MODAL_LINE =
  '<div id="productModal" class="lightbox-modal" onclick="closeModal()">\n' +
  '    <span class="close-btn" title="Закрыть">&times;</span>';

const NEW_MODAL_LINE =
  '<div id="productModal" class="lightbox-modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle" onclick="closeModal()">\n' +
  '    <button type="button" class="close-btn" title="Закрыть" aria-label="Закрыть окно" onclick="closeModal()">&times;</button>';

function fixModalHtml(html) {
  if (html.includes(NEW_MODAL_LINE)) return { html, note: 'HTML уже обновлён' };
  if (!html.includes(OLD_MODAL_LINE)) return { html, note: '⚠ HTML модалки не найден' };
  return { html: html.replace(OLD_MODAL_LINE, NEW_MODAL_LINE), note: 'HTML обновлён' };
}

// ── 2. Восстановление недостающих JS-функций ──────────────────
const RESTORE_MARKER = '/* a11y:restore-broken-fns */';

const RESTORED_FUNCTIONS = `
    ${RESTORE_MARKER}
    function changeImage(src, index) {
        mainImage.src = src;
        const btns = document.querySelectorAll('.image-toggle__btn');
        btns.forEach(b => b.classList.remove('active'));
        if (btns[index]) btns[index].classList.add('active');
        mainImageWrapper.setAttribute('data-current-slide', index);
    }
    mainImageWrapper.onclick = () => openModal();
    function openModal() {
        modal.style.display = "block";
        const slide = parseInt(mainImageWrapper.getAttribute('data-current-slide') || 0);
        setTimeout(() => scrollToSlide(slide), 50);
    }
    function closeModal() { modal.style.display = "none"; }
    function scrollToSlide(index) {
        galleryContainer.scrollTo({ left: galleryContainer.clientWidth * index, behavior: 'smooth' });
        setActiveModalButton(index);
    }
    function setActiveModalButton(index) {
        const buttons = modalNav.querySelectorAll('button');
        buttons.forEach((btn, i) => {
            if (i === index) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    }
    galleryContainer.addEventListener('scroll', () => {
        const itemWidth = galleryContainer.clientWidth;
        if (itemWidth === 0) return;
        const newIndex = Math.round(galleryContainer.scrollLeft / itemWidth);
        setActiveModalButton(newIndex);
    });
`;

function restoreBrokenFns(html) {
  if (html.includes(RESTORE_MARKER)) return { html, note: 'функции уже восстановлены' };

  // Вставляем ПЕРЕД строкой `window.changeImage = changeImage;`
  const anchor = 'window.changeImage = changeImage;';
  const idx = html.indexOf(anchor);
  if (idx === -1) return { html, note: '⚠ анкер window.changeImage не найден' };

  const newHtml = html.slice(0, idx) + RESTORED_FUNCTIONS + '\n    ' + html.slice(idx);
  return { html: newHtml, note: 'функции восстановлены' };
}

// ── 3. Escape-обработчик ─────────────────────────────────────
const ESCAPE_MARKER = '/* a11y:escape */';

function addEscape(html) {
  if (html.includes(ESCAPE_MARKER)) return { html, note: 'Escape уже есть' };

  // Ищем объявление `function closeModal() { ... }` — после него ставим.
  // Так как мы только что восстановили функцию, она точно есть в виде одной строки:
  const re = /(function\s+closeModal\s*\(\s*\)\s*\{\s*modal\.style\.display\s*=\s*"none";\s*\})/;
  const m = re.exec(html);
  if (!m) return { html, note: '⚠ function closeModal не найдена' };

  const snippet =
    '\n\n    ' + ESCAPE_MARKER + '\n' +
    "    document.addEventListener('keydown', function (e) {\n" +
    "        if (e.key === 'Escape') closeModal();\n" +
    '    });\n';

  const insertAt = m.index + m[0].length;
  return { html: html.slice(0, insertAt) + snippet + html.slice(insertAt), note: 'Escape добавлен' };
}

// ── 4. Удаление сломанной строки loadAllTables ────────────────
function removeBrokenLoadAllTables(html) {
  const marker = 'async async function loadAllTables';
  const idx = html.indexOf(marker);
  if (idx === -1) return { html, note: 'мёртвая loadAllTables не найдена (ок)' };

  // Находим начало строки
  const lineStart = html.lastIndexOf('\n', idx) + 1;

  // Идём от idx до открывающей `{`
  const openBrace = html.indexOf('{', idx);
  if (openBrace === -1) return { html, note: '⚠ нет открывающей скобки' };

  // Считаем баланс скобок
  let depth = 1;
  let i = openBrace + 1;
  while (i < html.length && depth > 0) {
    const ch = html[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    i++;
  }
  if (depth !== 0) return { html, note: '⚠ не сбалансированы скобки' };

  // `i` теперь указывает на символ сразу после закрывающей `}`
  // Захватим до конца строки (включая `\n`)
  let end = i;
  while (end < html.length && html[end] !== '\n') end++;
  if (end < html.length) end++; // съесть \n

  let newHtml = html.slice(0, lineStart) + html.slice(end);

  // Также удаляем строку `window.onload = loadAllTables;`
  const onloadLine = 'window.onload = loadAllTables;';
  const onloadIdx = newHtml.indexOf(onloadLine);
  if (onloadIdx !== -1) {
    const lineStart2 = newHtml.lastIndexOf('\n', onloadIdx) + 1;
    let end2 = onloadIdx + onloadLine.length;
    while (end2 < newHtml.length && newHtml[end2] !== '\n') end2++;
    if (end2 < newHtml.length) end2++;
    newHtml = newHtml.slice(0, lineStart2) + newHtml.slice(end2);
  }

  // Схлопываем возможные двойные пустые строки
  newHtml = newHtml.replace(/\n{3,}/g, '\n\n');

  return { html: newHtml, note: 'мёртвая loadAllTables удалена' };
}

// ── Прогон ───────────────────────────────────────────────────
function process(filename) {
  const full = path.join(ROOT, filename);
  if (!fs.existsSync(full)) {
    console.log(`  ⚠ ${filename}: файл не найден`);
    return { file: filename, changed: false, notes: ['файл не найден'] };
  }

  let html = fs.readFileSync(full, 'utf8');
  const original = html;
  const notes = [];

  const r1 = fixModalHtml(html);           html = r1.html; notes.push(r1.note);
  const r2 = restoreBrokenFns(html);       html = r2.html; notes.push(r2.note);
  const r3 = addEscape(html);              html = r3.html; notes.push(r3.note);
  const r4 = removeBrokenLoadAllTables(html); html = r4.html; notes.push(r4.note);

  const changed = html !== original;
  if (changed) fs.writeFileSync(full, html, 'utf8');
  return { file: filename, changed, notes };
}

function main() {
  console.log('🔧 fix-broken-modal.js — срочный фикс tmp-902 и l-16\n');
  let changedCount = 0;

  FILES.forEach(f => {
    const r = process(f);
    const icon = r.changed ? '✓' : '·';
    const status = r.changed ? 'ОБНОВЛЁН' : 'без изменений';
    console.log(`  ${icon} ${f.padEnd(40)} ${status}`);
    r.notes.forEach(n => console.log(`      → ${n}`));
    if (r.changed) changedCount++;
  });

  console.log(`\nГотово. Обновлено: ${changedCount} из ${FILES.length}\n`);
  console.log('Проверь глазами в конце <script>:');
  console.log('  - /* a11y:restore-broken-fns */ с функциями changeImage/openModal/...');
  console.log('  - /* a11y:escape */ document.addEventListener(\'keydown\', ...)');
  console.log('  - нет строки "async async function loadAllTables"');
  console.log('  - нет строки "window.onload = loadAllTables;"');
  console.log('  - в HTML: <div id="productModal" role="dialog" ...> + <button class="close-btn" ...>');
}

main();
