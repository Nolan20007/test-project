const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.resolve(__dirname, '..', 'images');

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath, callback);
        } else {
            callback(fullPath, stat);
        }
    }
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function run() {
    console.log('=== Аудит изображений ===\n');
    console.log('Папка:', IMAGES_DIR);
    console.log('');

    if (!fs.existsSync(IMAGES_DIR)) {
        console.warn('⚠ Папка images/ не найдена.');
        return;
    }

    const pngFiles = [];
    let totalPngBytes = 0;

    walkDir(IMAGES_DIR, (fullPath, stat) => {
        const ext = path.extname(fullPath).toLowerCase();
        if (ext === '.png') {
            const rel = path.relative(path.resolve(__dirname, '..'), fullPath);
            pngFiles.push({ rel, size: stat.size });
            totalPngBytes += stat.size;
        }
    });

    if (pngFiles.length === 0) {
        console.log('PNG-файлов не найдено.');
        return;
    }

    pngFiles.sort((a, b) => b.size - a.size);

    console.log('Найдено PNG-файлов:', pngFiles.length);
    console.log('Суммарный вес PNG:', formatBytes(totalPngBytes));
    console.log('');
    console.log('Все файлы (отсортированы по убыванию размера):');
    console.log('-'.repeat(80));

    for (const f of pngFiles) {
        console.log(`${formatBytes(f.size).padStart(10)}  ${f.rel}`);
    }

    console.log('-'.repeat(80));

    const big = pngFiles.filter(f => f.size > 100 * 1024);
    const mid = pngFiles.filter(f => f.size > 30 * 1024 && f.size <= 100 * 1024);
    const small = pngFiles.filter(f => f.size <= 30 * 1024);

    console.log('');
    console.log('Статистика по размерам:');
    console.log(`  > 100 KB: ${big.length} шт., суммарно ${formatBytes(big.reduce((s, f) => s + f.size, 0))}`);
    console.log(`  30–100 KB: ${mid.length} шт., суммарно ${formatBytes(mid.reduce((s, f) => s + f.size, 0))}`);
    console.log(`  ≤ 30 KB: ${small.length} шт., суммарно ${formatBytes(small.reduce((s, f) => s + f.size, 0))}`);
}

run();
