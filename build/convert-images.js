const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const IMAGES_DIR = path.join(ROOT, 'images');

// Файлы, которые НЕ конвертируем в WebP
const EXCLUDE_BASENAMES = new Set([
    'favicon-32x32.png',
    'favicon-16x16.png',
    'apple-touch-icon.png',
    'android-chrome-192x192.png',
    'android-chrome-512x512.png',
    'favicon.ico',
]);

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    for (const item of fs.readdirSync(dir)) {
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

async function run() {
    console.log('=== Конвертация PNG → WebP ===\n');
    console.log('Папка:', IMAGES_DIR);
    console.log('Исключения:', Array.from(EXCLUDE_BASENAMES).join(', '));
    console.log('Качество WebP: 85\n');

    if (!fs.existsSync(IMAGES_DIR)) {
        console.warn('⚠ Папка images/ не найдена.');
        return;
    }

    const tasks = [];

    walkDir(IMAGES_DIR, (fullPath, stat) => {
        const ext = path.extname(fullPath).toLowerCase();
        const base = path.basename(fullPath);
        if (ext !== '.png') return;
        if (EXCLUDE_BASENAMES.has(base)) return;
        tasks.push({ fullPath, stat });
    });

    console.log(`Найдено PNG для конвертации: ${tasks.length}\n`);

    let converted = 0;
    let skipped = 0;
    let failed = 0;
    let totalIn = 0;
    let totalOut = 0;

    for (const task of tasks) {
        const inputPath = task.fullPath;
        const outputPath = inputPath.replace(/\.png$/i, '.webp');
        const rel = path.relative(ROOT, inputPath);

        try {
            await sharp(inputPath)
                .webp({ quality: 85 })
                .toFile(outputPath);

            const outStat = fs.statSync(outputPath);
            const saved = task.stat.size - outStat.size;
            const pct = task.stat.size > 0
                ? ((saved / task.stat.size) * 100).toFixed(1)
                : '0.0';

            totalIn += task.stat.size;
            totalOut += outStat.size;
            converted++;

            console.log(
                `✓ ${rel}\n` +
                `    ${formatBytes(task.stat.size)} → ${formatBytes(outStat.size)}  (−${pct}%)`
            );
        } catch (err) {
            console.error(`✗ ${rel} — ошибка: ${err.message}`);
            failed++;
        }
    }

    console.log('\n=== Итог ===');
    console.log(`Сконвертировано: ${converted}`);
    console.log(`Пропущено (исключения): ${skipped}`);
    console.log(`Ошибок: ${failed}`);
    if (totalIn > 0) {
        const pct = ((1 - totalOut / totalIn) * 100).toFixed(1);
        console.log(`Суммарно: ${formatBytes(totalIn)} → ${formatBytes(totalOut)}  (−${pct}%)`);
        console.log(`Сэкономлено: ${formatBytes(totalIn - totalOut)}`);
    }
}

run().catch(err => {
    console.error('Критическая ошибка:', err);
    process.exit(1);
});
