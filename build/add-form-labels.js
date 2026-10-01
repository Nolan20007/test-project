const fs = require('fs');
const path = require('path');

const FILES = [
  'index.html',
  'cart.html',
  'dostavka-i-oplata.html',
];

// Карта: id поля → текст подписи.
// Берём из placeholder, но приводим к чистой формулировке.
const LABELS = {
  // index.html — #mainContactForm
  mainName: 'Ваше имя',
  mainPhone: 'Телефон, Email или Telegram',
  mainMessage: 'Сообщение',

  // cart.html — #orderForm
  name: 'Ваше Имя или название компании',
  phone: 'Контактный телефон',
  email: 'Email (необязательно)',
  comments: 'Комментарии к заказу',

  // dostavka-i-oplata.html — #deliveryForm
  deliveryName: 'Ваше имя',
  deliveryPhone: 'Телефон, Email или Telegram',
  deliveryMessage: 'Сообщение о доставке',
};

function addLabels(html) {
  let result = html;
  let changes = 0;

  // Для каждого input/textarea с id — если label ещё нет, вставить.
  Object.keys(LABELS).forEach(id => {
    // Уже есть label для этого id? Пропускаем.
    const hasLabel = new RegExp(`<label[^>]*for=["']${id}["']`, 'i').test(result);
    if (hasLabel) return;

    // Ищем тег input или textarea с этим id.
    const tagRe = new RegExp(
      `(<(input|textarea)\\b[^>]*\\bid=["']${id}["'][^>]*>)`,
      'i'
    );
    if (!tagRe.test(result)) return;

    const labelText = LABELS[id].replace(/&/g, '&amp;').replace(/</g, '&lt;');

    result = result.replace(tagRe, (match, tag) => {
      // Добавить aria-required="true" если есть required.
      let newTag = tag;
      if (/\brequired\b/i.test(tag) && !/aria-required/i.test(tag)) {
        newTag = newTag.replace(/(\s*\/?>)$/, ` aria-required="true"$1`);
      }
      return `<label for="${id}" class="visually-hidden">${labelText}</label>\n                ${newTag}`;
    });

    changes++;
  });

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
    const { html: newHtml, changes } = addLabels(html);

    if (newHtml !== html) {
      fs.writeFileSync(filePath, newHtml, 'utf8');
      console.log(`  ✓ ${file} — добавлено label: ${changes}`);
      changedFiles++;
      totalChanges += changes;
    } else {
      console.log(`  · ${file} — без изменений`);
    }
  });

  console.log(`\nГотово. Файлов: ${changedFiles}. Всего label: ${totalChanges}`);
}

build();
