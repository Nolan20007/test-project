const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const CARD_IMAGES = [
  ['images/ss1/vid-1.webp', 'images/ss1/vid-card.webp'],
  ['images/ss2/vid-1.webp', 'images/ss2/vid-card.webp'],
  ['images/tmp-902/vid-1.webp', 'images/tmp-902/vid-card.webp'],
  ['images/tl/vid-1.webp', 'images/tl/vid-card.webp'],
  ['images/ssg1/vid-1.webp', 'images/ssg1/vid-card.webp'],
  ['images/l-3-sk-2201-88/vid-1.webp', 'images/l-3-sk-2201-88/vid-card.webp'],
  ['images/vdl/vid-1.webp', 'images/vdl/vid-card.webp'],
  ['images/kl1/vid-1.webp', 'images/kl1/vid-card.webp'],
  ['images/l-17-000SB/vid-1.webp', 'images/l-17-000SB/vid-card.webp'],
  ['images/l-19/vid-1.webp', 'images/l-19/vid-card.webp'],
  ['images/nestandart/nestandart-mini.webp', 'images/nestandart/nestandart-card.webp'],
  ['images/scoba-nm/vid-1.webp', 'images/scoba-nm/vid-card.webp'],
  ['images/nts-62-91-111/vid-1.webp', 'images/nts-62-91-111/vid-card.webp'],
  ['images/nts-62-91-111b/vid-1.webp', 'images/nts-62-91-111b/vid-card.webp'],
  ['images/scoba-nm1-3900/vid-1.webp', 'images/scoba-nm1-3900/vid-card.webp'],
  ['images/soedinitelnye-elementy/ms-1-2-3-4.webp', 'images/soedinitelnye-elementy/ms-1-2-3-4-card.webp', 'ms-1-2-3-4-search.webp'],
  ['images/soedinitelnye-elementy/ms-5-6-7-8.webp', 'images/soedinitelnye-elementy/ms-5-6-7-8-card.webp', 'ms-5-6-7-8-search.webp'],
];

async function run() {
  let totalInput = 0;
  let totalOutput = 0;

  for (const [source, destination, searchFilename = 'vid-search.webp'] of CARD_IMAGES) {
    const inputPath = path.join(ROOT, source);
    const outputPath = path.join(ROOT, destination);

    if (!fs.existsSync(inputPath)) {
      throw new Error('Missing source image: ' + source);
    }

    await sharp(inputPath)
      .rotate()
      .resize({
        width: 400,
        height: 400,
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 80, effort: 5 })
      .toFile(outputPath);

    // Поисковое изображение создаётся из исходного изображения группы/товара.
    // Оно используется в товарных фидах Google и Яндекса.
    const searchPath = path.join(path.dirname(inputPath), searchFilename);
    await sharp(inputPath)
      .rotate()
      .resize({
        width: 1200,
        height: 1200,
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 85, effort: 5 })
      .toFile(searchPath);

    const inputSize = fs.statSync(inputPath).size;
    const outputSize = fs.statSync(outputPath).size;
    totalInput += inputSize;
    totalOutput += outputSize;

    console.log(
      source + ' → ' + destination + ' + ' + searchFilename + ':',
      Math.round(inputSize / 1024) + ' KB → ' +
      Math.round(outputSize / 1024) + ' KB'
    );
  }

  console.log(
    'Card images optimized: ' + CARD_IMAGES.length +
    '; total ' + Math.round(totalInput / 1024) + ' KB → ' +
    Math.round(totalOutput / 1024) + ' KB'
  );
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
