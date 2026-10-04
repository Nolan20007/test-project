const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

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

// Ищем <source ...>  сразу перед  <img ... id="mainImage" ...>
// Регулярка:
//   - (<source\b[^>]*>)  — сам тег source
//   - (\s*<img\b[^>]*id="mainImage"[^>]*>) — img с id="mainImage"
const RE = /(<source\b[^>]*>)(\s*<img\b[^>]*\bid\s*=\s*"mainImage"[^>]*>)/g;

function processFile(relPath) {
    const fullPath = path.join(ROOT, relPath);
    if (!fs.existsSync(fullPath)) {
        return { relPath, skipped: true, patched: 0 };
    }

    const html = fs.readFileSync(fullPath, 'utf8');
    let patched = 0;

    const out = html.replace(RE, (match, sourceTag, imgTag) => {
        if (/\bid\s*=\s*"mainSource"/.test(sourceTag)) {
            // уже есть — не трогаем
            return match;
        }
        patched++;
        const newSource = sourceTag.replace(/^<source\b/, '<source id="mainSource"');
        return newSource + imgTag;
    });

    if (patched > 0 && out !== html) {
        fs.writeFileSync(fullPath, out, 'utf8');
    }

    return { relPath, skipped: false, patched };
}

function run() {
    console.log('=== Добавление id="mainSource" к <source> главной картинки ===\n');

    let totalFiles = 0;
    let totalPatched = 0;

    for (const file of HTML_FILES) {
        const r = processFile(file);
        if (r.skipped) {
            console.log(`· ${file} — пропущен (не найден)`);
            continue;
        }
        if (r.patched > 0) {
            console.log(`✓ ${file} — пропатчено: ${r.patched}`);
            totalFiles++;
            totalPatched += r.patched;
        } else {
            console.log(`· ${file} — изменений нет`);
        }
    }

    console.log('\n=== Итог ===');
    console.log(`Файлов изменено: ${totalFiles}`);
    console.log(`<source> пропатчено: ${totalPatched}`);
}

run();
