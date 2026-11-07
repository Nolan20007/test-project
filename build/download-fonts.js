// Downloads official Rubik variable WOFF2 files and their SIL Open Font License.
// Rebuild trigger after workflow staging fix.
const fs = require('fs');
const path = require('path');

const cssUrl = 'https://fonts.googleapis.com/css2?family=Rubik:wght@300..900&display=swap';
const headers = { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };

async function main() {
  const response = await fetch(cssUrl, { headers });
  if (!response.ok) throw new Error('Google Fonts CSS request failed: ' + response.status);
  const remoteCss = await response.text();
  const blocks = remoteCss.match(/@font-face\s*\{[^}]+\}/g) || [];
  if (!blocks.length) throw new Error('No @font-face rules found in Google Fonts response');

  const fontDir = path.join(__dirname, '..', 'fonts', 'rubik');
  const cssDir = path.join(__dirname, '..', 'css');
  fs.mkdirSync(fontDir, { recursive: true });

  const downloaded = new Map();
  const localBlocks = [];
  for (const block of blocks) {
    if (!/font-style:\s*normal/i.test(block)) continue;
    const match = block.match(/url\((https:[^)]+)\)\s*format\(['"]?woff2['"]?\)/i);
    if (!match) continue;
    const remoteUrl = match[1];
    let filename = downloaded.get(remoteUrl);
    if (!filename) {
      filename = 'rubik-' + (downloaded.size + 1) + '.woff2';
      const fontResponse = await fetch(remoteUrl);
      if (!fontResponse.ok) throw new Error('Font download failed: ' + fontResponse.status + ' ' + remoteUrl);
      fs.writeFileSync(path.join(fontDir, filename), Buffer.from(await fontResponse.arrayBuffer()));
      downloaded.set(remoteUrl, filename);
    }
    localBlocks.push(block.replace(remoteUrl, '../fonts/rubik/' + filename));
  }
  if (!localBlocks.length) throw new Error('No WOFF2 font files found in Google Fonts CSS');

  const licenseResponse = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/rubik/OFL.txt');
  if (!licenseResponse.ok) throw new Error('Rubik license download failed: ' + licenseResponse.status);
  fs.writeFileSync(path.join(fontDir, 'OFL.txt'), await licenseResponse.text());
  fs.writeFileSync(path.join(cssDir, 'rubik-local.css'), localBlocks.join('\n\n') + '\n');
  console.log('Downloaded ' + downloaded.size + ' Rubik WOFF2 file(s); generated css/rubik-local.css');
}

main().catch(error => { console.error(error); process.exit(1); });
