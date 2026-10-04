const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Файлы, которые обрабатываем (те же, что в ALL_HTML_FILES из build.js)
const HTML_FILES = [
    'index.html',
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
    'tipovye-proekty.html',
    'tmp-902.html',
    'vl-2-l-19-vodoprovodnaya.html',
    'skoba-mn.html',
];

// Регулярка для поиска <img ...>
const IMG_RE = /<img\b[^>]*>/gi;

// Достать значение атрибута
function getAttr(tag, name) {
    const re = new RegExp(name + '\\s*=\\s*"([^"]*)"', 'i');
    const m = tag.match(re);
    return m ? m[1] : null;
}

// Проверить, существует ли файл относительно ROOT
function fileExists(relPath) {
    return fs.existsSync(path.join(ROOT, relPath));
}

// Заменить src на webp-вариант
function pngToWebp(src) {
    return src.replace(/\.png$/i, '.webp');
}

// Уже обёрнут в <picture>?
function isInsidePicture(html, idx) {
    // Простейшая проверка: смотрим, стоит ли прямо перед <img> (с учётом пробелов) </source> и <source ...>
    const before = html.slice(Math.max(0, idx - 400), idx);
    return /<source\b[^>]*type\s*=\s*"image\/webp"[^>]*>\s*$/i.test(before);
}

function wrapImg(imgTag) {
    const src = getAttr(imgTag, 'src');
    if (!src) return null;
    if (!/\.png$/i.test(src)) return null;
    if (!fileExists(src)) return null;

    const webpSrc = pngToWebp(src);
    if (!fileExists(webpSrc)) return null;

    return `<picture><source srcset="${webpSrc}" type="image/webp">${imgTag}</picture>`;
}

function processFile(relPath) {
    const fullPath = path.join(ROOT, relPath);
    if (!fs.existsSync(fullPath)) {
        return { relPath, skipped: true, wrapped: 0 };
    }

    let html = fs.readFileSync(fullPath, 'utf8');
    let wrappedCount = 0;

    html = html.replace(IMG_RE, (match, offset) => {
        // Пропускаем те, что уже внутри <picture>
        if (isInsidePicture(html, offset)) return match;

        const wrapped = wrapImg(match);
        if (wrapped) {
            wrappedCount++;
            return wrapped;
        }
        return match;
    });

    if (wrappedCount > 0) {
        fs.writeFileSync(fullPath, html, 'utf8');
    }

    return { relPath, skipped: false, wrapped: wrappedCount };
}

function run() {
    console.log('=== Обёртка <img> в <picture> ===\n');

    let totalWrapped = 0;
    let totalFiles = 0;

    for (const file of HTML_FILES) {
        const result = processFile(file);
        if (result.skipped) {
            console.log(`· ${file} — пропущен (не найден)`);
            continue;
        }
        if (result.wrapped > 0) {
            console.log(`✓ ${file} — обёрнуто ${result.wrapped} <img>`);
            totalWrapped += result.wrapped;
            totalFiles++;
        } else {
            console.log(`· ${file} — изменений нет`);
        }
    }

    console.log('\n=== Итог ===');
    console.log(`Файлов изменено: ${totalFiles}`);
    console.log(`Всего <img> обёрнуто в <picture>: ${totalWrapped}`);
}

run();
