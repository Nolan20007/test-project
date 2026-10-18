const fs = require('fs');
const path = require('path');

// Сюда вписываем старый и новый адреса
const OLD_EMAIL = 'sales@stremyanki-dlya-kolodcev.ru';
const NEW_EMAIL = 'stremyanki-dlya-kolodcev@mail.ru';

// Регулярное выражение для поиска старого email (экранируем точки)
const searchRegex = new RegExp(OLD_EMAIL.replace(/\./g, '\\.'), 'g');

// Расширения файлов, которые нужно проверять
const extensions = ['.html', '.js', '.php', '.json', '.xml', '.txt'];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Исключаем папку .git, чтобы не сломать гит
            if (file !== '.git' && file !== 'node_modules') {
                processDirectory(fullPath);
            }
        } else {
            // Проверяем расширение файла
            if (extensions.includes(path.extname(fullPath))) {
                let content = fs.readFileSync(fullPath, 'utf8');
                
                if (searchRegex.test(content)) {
                    // Делаем замену
                    const newContent = content.replace(searchRegex, NEW_EMAIL);
                    fs.writeFileSync(fullPath, newContent, 'utf8');
                    console.log(`✅ Обновлен файл: ${fullPath}`);
                }
            }
        }
    }
}

console.log(`🔄 Начинаю замену ${OLD_EMAIL} на ${NEW_EMAIL}...`);
processDirectory('.');
console.log('🎉 Замена завершена!');
