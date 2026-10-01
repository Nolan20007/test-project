const fs = require('fs');
const path = require('path');

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
  'tmp-902.html',
  'vl-2-l-19-vodoprovodnaya.html',
];

const NAV_START = '<!-- NAV_START -->';
const NAV_END = '<!-- NAV_END -->';
const FOOTER_START = '<!-- FOOTER_START -->';
const FOOTER_END = '<!-- FOOTER_END -->';

function replaceNavAndFooter(html) {
  // === NAV ===
  // Находим <nav class="nav"> ... </nav>
  const navRegex = /<nav\s+class=["']nav["'][^>]*>[\s\S]*?<\/nav>/i;
  if (navRegex.test(html) && !html.includes(NAV_START)) {
    html = html.replace(navRegex, `${NAV_START}\n${NAV_END}`);
  }

  // === FOOTER ===
  // Находим <footer class="footer"> ... </footer>
  const footerRegex = /<footer\s+class=["']footer["'][^>]*>[\s\S]*?<\/footer>/i;
  if (footerRegex.test(html) && !html.includes(FOOTER_START)) {
    html = html.replace(footerRegex, `${FOOTER_START}\n${FOOTER_END}`);
  }

  return html;
}

function build() {
  let changed = 0;
  HTML_FILES.forEach(file => {
    const filePath = path.resolve(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠ Нет файла: ${file}`);
      return;
    }
    const html = fs.readFileSync(filePath, 'utf8');
    const newHtml = replaceNavAndFooter(html);

    if (newHtml !== html) {
      fs.writeFileSync(filePath, newHtml, 'utf8');
      console.log(`  ✓ ${file} — заменено`);
      changed++;
    } else {
      console.log(`  · ${file} — без изменений`);
    }
  });
  console.log(`\nГотово. Обновлено файлов: ${changed}`);
}

build();
