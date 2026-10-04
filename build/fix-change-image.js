const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Те же страницы, что в wrap-picture.js
const HTML_FILES = [
    'kl-1-dlya-kanalizacionnyh-kolodcev.html',
    'l-16-dlya-teplovyh-setej.html',
    'ss1.html',
    'ss2.html',
    'ssg1.html',
    'tmp-902.html',
    'vl-2-l-19-vodoprovodnaya.html',
    'skoba-mn.html',
];

// ---------- 1. Патч кнопок .image-toggle__btn ----------
//
// Было:  changeImage('path/to/vid-1.png', 0)
// Стало: changeImage('path/to/vid-1.png','path/to/vid-1.webp', 0)
//
// Регулярка:
//   - находит changeImage(  '<png-путь>'  ,  <число>  )
//   - запоминает png-путь и номер слайда
//   - вставляет webp-путь вторым аргументом
//
// Идемпотентность: если уже есть два аргумента (строка + строка + число) — не трогаем.
const BTN_RE = /changeImage\(\s*'([^']+\.png)'\s*,\s*(\d+)\s*\)/gi;

function patchButtons(html) {
    let count = 0;
    const out = html.replace(BTN_RE, (match, pngSrc, idx) => {
        const webpSrc = pngSrc.replace(/\.png$/i, '.webp');
        count++;
        return `changeImage('${pngSrc}','${webpSrc}', ${idx})`;
    });
    return { html: out, count };
}

// ---------- 2. Патч функции changeImage ----------
//
// Было:
//   function changeImage(src, index) {
//       mainImage.src = src;
//       ...
//   }
//
// Стало:
//   function changeImage(pngSrc, webpSrc, index) {
//       const source = document.getElementById('mainSource');
//       if (source) source.srcset = webpSrc;
//       mainImage.src = pngSrc;
//       ...
//   }
//
// Регулярка ищет только старое определение (два аргумента, первый — src, внутри mainImage.src = src).
// Если уже пропатчено (внутри есть mainSource.srcset) — пропускаем.

const FN_RE = /function\s+changeImage\s*\(\s*src\s*,\s*index\s*\)\s*\{([\s\S]*?)\n(\s*)\}/;

function patchFunction(html) {
    if (html.includes("getElementById('mainSource')")) {
        // Уже пропатчено
        return { html, patched: false };
    }

    const m = html.match(FN_RE);
    if (!m) {
        return { html, patched: false };
    }

    const oldBody = m[1];      // тело старой функции без закрывающей }
    const closeIndent = m[2];  // отступ перед закрывающей }

    const newFn =
        `function changeImage(pngSrc, webpSrc, index) {\n` +
        `        const source = document.getElementById('mainSource');\n` +
        `        if (source) source.srcset = webpSrc;\n` +
        `        mainImage.src = pngSrc;${oldBody}\n` +
        `${closeIndent}}`;

    const out = html.replace(FN_RE, newFn);
    return { html: out, patched: true };
}

// ---------- Основной проход ----------

function processFile(relPath) {
    const fullPath = path.join(ROOT, relPath);
    if (!fs.existsSync(fullPath)) {
        return { relPath, skipped: true, buttons: 0, fn: false };
    }

    let html = fs.readFileSync(fullPath, 'utf8');
    const before = html;

    // 1. Кнопки
    const btnResult = patchButtons(html);
    html = btnResult.html;

    // 2. Функция
    const fnResult = patchFunction(html);
    html = fnResult.html;

    const changed = (html !== before);
    if (changed) {
        fs.writeFileSync(fullPath, html, 'utf8');
    }

    return {
        relPath,
        skipped: false,
        buttons: btnResult.count,
        fn: fnResult.patched,
        changed,
    };
}

function run() {
    console.log('=== Патч changeImage (кнопки + функция) ===\n');

    let totalFiles = 0;
    let totalButtons = 0;
    let totalFns = 0;

    for (const file of HTML_FILES) {
        const r = processFile(file);

        if (r.skipped) {
            console.log(`· ${file} — пропущен (не найден)`);
            continue;
        }

        if (r.changed) {
            totalFiles++;
            if (r.buttons > 0) totalButtons += r.buttons;
            if (r.fn) totalFns++;

            const parts = [];
            if (r.buttons > 0) parts.push(`кнопок: ${r.buttons}`);
            if (r.fn) parts.push('функция: пропатчена');
            console.log(`✓ ${file} — ${parts.join(', ')}`);
        } else {
            console.log(`· ${file} — изменений нет (уже пропатчен или не найден шаблон)`);
        }
    }

    console.log('\n=== Итог ===');
    console.log(`Файлов изменено: ${totalFiles}`);
    console.log(`Кнопок пропатчено: ${totalButtons}`);
    console.log(`Функций changeImage пропатчено: ${totalFns}`);
}

run();
