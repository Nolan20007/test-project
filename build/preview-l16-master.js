const fs = require('fs');
const path = require('path');
const { renderMasterProduct } = require('./master-template-renderer');

function parseCSV(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i + 1];
    if (quoted) {
      if (ch === '"' && next === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (ch !== '\r') field += ch;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  const headers = rows.shift().map(value => value.trim());
  return rows.filter(values => values.some(value => value.trim())).map(values => {
    const result = {};
    headers.forEach((header, index) => result[header] = (values[index] || '').trim());
    return result;
  });
}

const root = path.resolve(__dirname, '..');
const group = JSON.parse(fs.readFileSync(path.join(root, 'data/product-groups/lestnica-podvesnaya-l-16.json'), 'utf8'));
const template = fs.readFileSync(path.join(root, 'templates/master-template.html'), 'utf8');
const rows = parseCSV(fs.readFileSync(path.join(root, group.csv), 'utf8').replace(/^\uFEFF/, ''));
const selected = rows[0];
const csvIds = rows.map(row => row.id);
const missingIds = group.productIds.filter(id => !csvIds.includes(id));
const extraIds = csvIds.filter(id => !group.productIds.includes(id));
if (missingIds.length || extraIds.length) throw new Error('CSV/config product IDs mismatch.');
for (const image of group.gallery) {
  for (const variant of [image.webp, image.png].filter(Boolean)) {
    const imagePath = path.resolve(root, 'products', group.productFolder, variant);
    if (!fs.existsSync(imagePath)) throw new Error('Missing gallery image: ' + variant);
  }
}
if (!fs.existsSync(path.resolve(root, selected.image))) throw new Error('Missing product main image: ' + selected.image);
let html = renderMasterProduct(template, group, selected, rows);

function injectInclude(startMarker, endMarker, includePath) {
  const include = fs.readFileSync(path.join(root, includePath), 'utf8').replace(
    /(href|src)="(?!\/|#|[a-z]+:|\/\/|\.\.\/)([^"]+)"/gi,
    (match, attr, url) => attr + '="../../' + url + '"'
  );
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker);
  if (start < 0 || end < start) throw new Error('Missing include markers: ' + startMarker);
  html = html.slice(0, start + startMarker.length) + '\n' + include + '\n' + html.slice(end);
}

injectInclude('<!-- NAV_START -->', '<!-- NAV_END -->', 'includes/nav.html');
injectInclude('<!-- CTA_START -->', '<!-- CTA_END -->', 'includes/cta.html');
injectInclude('<!-- FOOTER_START -->', '<!-- FOOTER_END -->', 'includes/footer.html');

if (/\{\{[A-Z0-9_]+\}\}/.test(html)) throw new Error('Preview still contains unresolved template variables.');
const output = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'tmp/l16-master-preview.html');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, html, 'utf8');
console.log('Master template preview created: ' + output);
console.log('Product: ' + selected.id + ' (' + rows.length + ' CSV rows available)');
