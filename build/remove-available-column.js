const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', 'data');

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

// Разбор CSV-строки с учётом кавычек
function parseCSVLine(line) {
  const out = [];
  let field = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i], nx = line[i + 1];
    if (inQ) {
      if (ch === '"' && nx === '"') { field += '"'; i++; }
      else if (ch === '"') inQ = false;
      else field += ch;
    } else {
      if (ch === '"') inQ = true;
      else if (ch === ',') { out.push(field); field = ''; }
      else field += ch;
    }
  }
  out.push(field);
  return out;
}

// Собрать CSV-строку, экранируя поля с запятыми/кавычками
function buildCSVLine(fields) {
  return fields.map(f => {
    const s = String(f == null ? '' : f);
    if (s.indexOf(',') !== -1 || s.indexOf('"') !== -1 || s.indexOf('\n') !== -1) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }).join(',');
}

function processFile(file) {
  const fullPath = path.join(DATA_DIR, file);
  if (!fs.existsSync(fullPath)) {
    return { file, skipped: true };
  }

  const raw = fs.readFileSync(fullPath, 'utf8').replace(/^\uFEFF/, '');
  const lines = raw.split(/\r?\n/);
  if (lines.length === 0) return { file, skipped: true };

  const header = parseCSVLine(lines[0]);
  const idx = header.indexOf('available');
  if (idx === -1) {
    return { file, skipped: false, changed: false };
  }

  const newHeader = header.filter((_, i) => i !== idx);
  const outLines = [buildCSVLine(newHeader)];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const fields = parseCSVLine(line);
    const newFields = fields.filter((_, j) => j !== idx);
    outLines.push(buildCSVLine(newFields));
  }

  fs.writeFileSync(fullPath, outLines.join('\n') + '\n', 'utf8');
  return { file, skipped: false, changed: true };
}

function run() {
  console.log('=== Удаление колонки "available" из CSV ===\n');

  let changed = 0;
  let unchanged = 0;
  let missing = 0;

  for (const file of CSV_FILES) {
    const r = processFile(file);
    if (r.skipped) {
      console.log(`· ${file} — пропущен (не найден)`);
      missing++;
    } else if (r.changed) {
      console.log(`✓ ${file} — колонка "available" удалена`);
      changed++;
    } else {
      console.log(`· ${file} — колонки "available" нет`);
      unchanged++;
    }
  }

  console.log('\n=== Итог ===');
  console.log(`Файлов изменено: ${changed}`);
  console.log(`Без изменений: ${unchanged}`);
  console.log(`Не найдено: ${missing}`);
}

run();
