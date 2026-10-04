const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');

const CSV_FILES = [
    'ss1-products.csv',
    'ss2-products.csv',
    'ssg1-products.csv',
    'tl-products.csv',
    'tl-63-products.csv',
    'kl1-products.csv',
    'vdl-products.csv',
    'tmp-902-kruglye.csv',
    'tmp-902-pryamougolnye.csv',
    'tmp-902-perepadnye.csv',
    'scoba-nm-products.csv',
];

function run() {
    console.log('=== Замена .png → .webp в поле image CSV ===\n');

    let totalChanged = 0;

    for (const file of CSV_FILES) {
        const fullPath = path.join(DATA_DIR, file);
        if (!fs.existsSync(fullPath)) {
            console.log(`· ${file} — не найден`);
            continue;
        }

        const original = fs.readFileSync(fullPath, 'utf8');
        // Заменяем .png на .webp только внутри поля image
        // Простой путь: искать строки, где есть "images/...png", и заменить .png → .webp
        const replaced = original.replace(
            /(images\/[^",\r\n]*?)\.png/g,
            '$1.webp'
        );

        if (replaced !== original) {
            fs.writeFileSync(fullPath, replaced, 'utf8');
            const count = (original.match(/images\/[^",\r\n]*?\.png/g) || []).length;
            console.log(`✓ ${file} — заменено ${count} путей`);
            totalChanged += count;
        } else {
            console.log(`· ${file} — без изменений`);
        }
    }

    console.log('\n=== Итог ===');
    console.log(`Всего заменено: ${totalChanged}`);
}

run();
