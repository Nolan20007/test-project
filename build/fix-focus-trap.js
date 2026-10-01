const fs = require('fs');
const path = require('path');

const FILES = [
  'index.html',
  'ss1.html',
  'ss2.html',
  'tmp-902.html',
  'l-16-dlya-teplovyh-setej.html',
  'ssg1.html',
];

const MODAL_A11Y_BLOCK = `
    /* a11y:focus-trap */
    const modalA11y = initModalA11y(modal, {
        backgroundSelectors: ['header', 'nav', 'main', 'footer'],
        initialFocus: '.close-btn'
    });
`;

function fixFile(html) {
  let result = html;
  let changes = 0;

  // 1. Вставить modalA11y после объявления modal
  if (!result.includes('a11y:focus-trap')) {
    const modalDeclRegex = /(const\s+modal\s*=\s*document\.getElementById\(["']productModal["']\)\s*;)/;
    if (modalDeclRegex.test(result)) {
      result = result.replace(modalDeclRegex, `$1\n${MODAL_A11Y_BLOCK}`);
      changes++;
    }
  }

  // 2. В openModal() добавить modalA11y.open();
  //    Ищем закрывающую } функции openModal и вставляем перед ней
  const openModalRegex = /(function\s+openModal\s*\([^)]*\)\s*\{[\s\S]*?)(\n\s*\})/;
  if (openModalRegex.test(result) && !result.includes('modalA11y.open()')) {
    result = result.replace(openModalRegex, (m, body, closing) => {
      return body + '\n        modalA11y.open();' + closing;
    });
    changes++;
  }

  // 3. closeModal — добавить modalA11y.close() перед "modal.style.display = "none""
  const closeModalRegex = /(function\s+closeModal\s*\([^)]*\)\s*\{\s*)(modal\.style\.display\s*=\s*["']none["']\s*;)/;
  if (closeModalRegex.test(result) && !result.includes('modalA11y.close()')) {
    result = result.replace(closeModalRegex, `$1modalA11y.close();\n        $2`);
    changes++;
  }

  return { html: result, changes };
}

function build() {
  let changedFiles = 0;
  let totalChanges = 0;

  FILES.forEach(file => {
    const filePath = path.resolve(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠ Нет файла: ${file}`);
      return;
    }
    const html = fs.readFileSync(filePath, 'utf8');
    const { html: newHtml, changes } = fixFile(html);

    if (newHtml !== html) {
      fs.writeFileSync(filePath, newHtml, 'utf8');
      console.log(`  ✓ ${file} — ${changes} правок`);
      changedFiles++;
      totalChanges += changes;
    } else {
      console.log(`  · ${file} — без изменений`);
    }
  });

  console.log(`\nГотово. Обновлено файлов: ${changedFiles}. Всего правок: ${totalChanges}`);
}

build();
