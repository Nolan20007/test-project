const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const HTML_FILES = [
  'index.html',
  'ss1.html',
  'ss2.html',
  'tmp-902.html',
  'ssg1.html',
  'kl-1-dlya-kanalizacionnyh-kolodcev.html',
  'vl-2-l-19-vodoprovodnaya.html',
  'skoba-mn.html',
  'l-16-dlya-teplovyh-setej.html',
];

// Регулярка эмодзи + опциональный пробел после
// Покрывает: Emoji, Dingbats, Symbols, Miscellaneous, Flags и т.п.
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]+\s?/gu;

function cleanMeta(html) {
  let count = 0;

  // <title>...</title>
  html = html.replace(/(<title>)([\s\S]*?)(<\/title>)/i, (m, open, inner, close) => {
    const cleaned = inner.replace(EMOJI_RE, '');
    if (cleaned !== inner) count++;
    return open + cleaned + close;
  });

  // <meta name="description" content="...">
  html = html.replace(
    /(<meta\s+name=["']description["']\s+content=["'])([\s\S]*?)(["']\s*\/?>)/i,
    (m, open, inner, close) => {
      const cleaned = inner.replace(EMOJI_RE, '');
      if (cleaned !== inner) count++;
      return open + cleaned + close;
    }
  );

  // <meta property="og:title" content="...">
  html = html.replace(
    /(<meta\s+property=["']og:title["']\s+content=["'])([\s\S]*?)(["']\s*\/?>)/i,
    (m, open, inner, close) => {
      const cleaned = inner.replace(EMOJI_RE, '');
      if (cleaned !== inner) count++;
      return open + cleaned + close;
    }
  );

  // <meta property="og:description" content="...">
  html = html.replace(
    /(<meta\s+property=["']og:description["']\s+content=["'])([\s\S]*?)(["']\s*\/?>)/i,
    (m, open, inner, close) => {
      const cleaned = inner.replace(EMOJI_RE, '');
      if (cleaned !== inner) count++;
      return open + cleaned + close;
    }
  );

  return { html, count };
}

function run() {
  console.log('=== Удаление эмодзи из title/description/og: ===\n');

  let totalFiles = 0;
  let totalTags = 0;

  for (const file of HTML_FILES) {
    const fullPath = path.join(ROOT, file);
    if (!fs.existsSync(fullPath)) {
      console.log(`· ${file} — пропущен (не найден)`);
      continue;
    }

    const original = fs.readFileSync(fullPath, 'utf8');
    const result = cleanMeta(original);

    if (result.count > 0) {
      fs.writeFileSync(fullPath, result.html, 'utf8');
      console.log(`✓ ${file} — очищено тегов: ${result.count}`);
      totalFiles++;
      totalTags += result.count;
    } else {
      console.log(`· ${file} — изменений нет`);
    }
  }

  console.log('\n=== Итог ===');
  console.log(`Файлов изменено: ${totalFiles}`);
  console.log(`Тегов очищено: ${totalTags}`);
}

run();
