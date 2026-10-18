const fs = require('fs');
const path = require('path');

// МЕНЯЙ ЗДЕСЬ: старый и новый email
const OLD_EMAIL = 'sales@stremyanki-dlya-kolodcev.ru';
const NEW_EMAIL = 'sales@stremyanki-dlya-kolodcev.ru';

const searchRegex = new RegExp(OLD_EMAIL.replace(/\./g, '\\.'), 'g');
const extensions = ['.html', '.js', '.php', '.json', '.xml', '.txt'];

let changed = 0;

function processDirectory(dir) {
    for (const file of fs.readdirSync(dir)) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== '.git' && file !== 'node_modules') processDirectory(fullPath);
        } else if (extensions.includes(path.extname(fullPath))) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const newContent = content.replace(searchRegex, () => NEW_EMAIL);
            if (newContent !== content) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log('✅ ' + fullPath);
                changed++;
            }
        }
    }
}

console.log('🔄 Замена: ' + OLD_EMAIL + ' -> ' + NEW_EMAIL);
processDirectory('.');
console.log('🎉 Готово. Изменено файлов: ' + changed);
