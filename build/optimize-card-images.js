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
  ['images/scoba-nm1-3900/vid-1.webp', 'images/scoba-nm1-3900/vid-card.webp'],
];

async function run() {
  let totalInput = 0;
  let totalOutput = 0;

  for (const [source, destination] of CARD_IMAGES) {
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

    const inputSize = fs.statSync(inputPath).size;
    const outputSize = fs.statSync(outputPath).size;
    totalInput += inputSize;
    totalOutput += outputSize;

    console.log(
      source + ' → ' + destination + ': ' +
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
