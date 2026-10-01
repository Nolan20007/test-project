const fs = require('fs');
const path = require('path');

const FILES = [
  'index.html',
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

const NAV_END = '<!-- NAV_END -->';
const FOOTER_START = '<!-- FOOTER_START -->';

function addMain(html) {
  // Уже есть? Не трогаем.
  if (/<main[\s>]/i.test(html)) return { html, changed: false };

  const navEndIdx = html.indexOf(NAV_END);
  const footerStartIdx = html.indexOf(FOOTER_START);

  if (navEndIdx === -1 || footerStartIdx === -1) {
    return { html, changed: false, reason: 'no markers' };
  }

  if (footerStartIdx < navEndIdx) {
    return { html, changed: false, reason: 'wrong order' };
  }

  const before = html.slice(0, navEndIdx + NAV_END.length);
  const middle = html.slice(navEndIdx + NAV_END.length, footerStartIdx);
  const after = html.slice(footerStartIdx);

  const newHtml = `${before}\n\n<main>${middle}</main>\n\n${after}`;
  return { html: newHtml, changed: newHtml !== html };
}

function build() {
  let changed = 0;
  FILES.forEach(file => {
    const filePath = path.resolve(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠ Нет файла: ${file}`);
      return;
    }
    const html = fs.readFileSync(filePath, 'utf8');
    const result = addMain(html);

    if (result.changed) {
      fs.writeFileSync(filePath, result.html, 'utf8');
      console.log(`  ✓ ${file} → <main> добавлен`);
      changed++;
    } else {
      const reason = result.reason || 'уже есть';
      console.log(`  · ${file} — без изменений (${reason})`);
    }
  });
  console.log(`\nГотово. Обновлено файлов: ${changed}`);
}

build();
