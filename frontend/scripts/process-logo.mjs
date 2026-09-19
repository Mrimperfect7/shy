import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputPath = 'C:/Users/HP/.gemini/antigravity-ide/brain/7ae6858a-2d75-4a37-99d4-ac7fd492ec87/.user_uploaded/media_1788792092665.png';
const publicAssetsDir = path.resolve('public/assets');
const publicDir = path.resolve('public');
const appDir = path.resolve('app');

if (!fs.existsSync(publicAssetsDir)) fs.mkdirSync(publicAssetsDir, { recursive: true });

// Color definitions [R, G, B]
const COLORS = {
  dark: [20, 19, 18],        // #141312 Onyx Charcoal
  white: [250, 248, 245],    // #FAF8F5 Warm Ivory
  gold: [197, 160, 89],      // #C5A059 Champagne Gold
  black: [0, 0, 0]           // #000000 Pure Black
};

// Process an extracted region into a transparent RGBA buffer with specified color
function convertToTransparent(rawBuffer, width, height, channels, color) {
  const out = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const srcIdx = i * channels;
    const r = rawBuffer[srcIdx];
    const g = rawBuffer[srcIdx + 1];
    const b = rawBuffer[srcIdx + 2];
    const brightness = (r + g + b) / 3;

    let alpha = 0;
    if (brightness < 248) {
      // Map 248 -> 0, 20 -> 255
      const factor = Math.max(0, Math.min(1, (248 - brightness) / (248 - 20)));
      alpha = Math.round(factor * 255);
    }

    const destIdx = i * 4;
    out[destIdx] = color[0];
    out[destIdx + 1] = color[1];
    out[destIdx + 2] = color[2];
    out[destIdx + 3] = alpha;
  }
  return out;
}

async function main() {
  console.log('--- Generating Brand Assets for SHYN.ISH ---');

  const srcImg = sharp(inputPath);

  // 1. EMBLEM CROP (Square, 202x203)
  console.log('1. Extracting Emblem...');
  const emblemRaw = await srcImg.clone().extract({
    left: 410,
    top: 52,
    width: 202,
    height: 203
  }).raw().toBuffer({ resolveWithObject: true });

  for (const [name, rgb] of Object.entries(COLORS)) {
    const buf = convertToTransparent(emblemRaw.data, emblemRaw.info.width, emblemRaw.info.height, emblemRaw.info.channels, rgb);
    
    // Save standard & 2x upscaled
    const filename = name === 'dark' ? 'shyn-emblem.png' : `shyn-emblem-${name}.png`;
    await sharp(buf, { raw: { width: 202, height: 203, channels: 4 } })
      .resize(512, 514, { kernel: 'lanczos3', fit: 'inside' })
      .png()
      .toFile(path.join(publicAssetsDir, filename));
    console.log(`Saved: public/assets/${filename}`);
  }

  // 2. WORDMARK CROP (811x221)
  console.log('2. Extracting Wordmark...');
  const wordmarkRaw = await srcImg.clone().extract({
    left: 105,
    top: 263,
    width: 811,
    height: 221
  }).raw().toBuffer({ resolveWithObject: true });

  for (const [name, rgb] of Object.entries(COLORS)) {
    const buf = convertToTransparent(wordmarkRaw.data, wordmarkRaw.info.width, wordmarkRaw.info.height, wordmarkRaw.info.channels, rgb);
    const filename = name === 'dark' ? 'shyn-wordmark.png' : `shyn-wordmark-${name}.png`;
    await sharp(buf, { raw: { width: 811, height: 221, channels: 4 } })
      .resize(1622, 442, { kernel: 'lanczos3', fit: 'inside' })
      .png()
      .toFile(path.join(publicAssetsDir, filename));
    console.log(`Saved: public/assets/${filename}`);
  }

  // 3. FULL VERTICAL LOCKUP (811x432)
  console.log('3. Extracting Full Vertical Lockup...');
  const fullRaw = await srcImg.clone().extract({
    left: 105,
    top: 52,
    width: 811,
    height: 432
  }).raw().toBuffer({ resolveWithObject: true });

  for (const [name, rgb] of Object.entries(COLORS)) {
    const buf = convertToTransparent(fullRaw.data, fullRaw.info.width, fullRaw.info.height, fullRaw.info.channels, rgb);
    const filename = name === 'dark' ? 'shyn-logo.png' : `shyn-logo-${name}.png`;
    await sharp(buf, { raw: { width: 811, height: 432, channels: 4 } })
      .resize(1622, 864, { kernel: 'lanczos3', fit: 'inside' })
      .png()
      .toFile(path.join(publicAssetsDir, filename));
    console.log(`Saved: public/assets/${filename}`);
  }

  // 4. HORIZONTAL LOCKUP (Emblem on left + Wordmark on right)
  console.log('4. Composing Horizontal Lockup...');
  // Height target: 200px.
  // Emblem scaled to: 160x160.
  // Wordmark scaled to: height 120px (width ~ 440px).
  // Total canvas: width ~ 640px, height: 160px.
  for (const [name, rgb] of Object.entries(COLORS)) {
    const emblemBuf = convertToTransparent(emblemRaw.data, emblemRaw.info.width, emblemRaw.info.height, emblemRaw.info.channels, rgb);
    const wordmarkBuf = convertToTransparent(wordmarkRaw.data, wordmarkRaw.info.width, wordmarkRaw.info.height, wordmarkRaw.info.channels, rgb);

    const emblemResized = await sharp(emblemBuf, { raw: { width: 202, height: 203, channels: 4 } })
      .resize(150, 150, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    const wordmarkResized = await sharp(wordmarkBuf, { raw: { width: 811, height: 221, channels: 4 } })
      .resize({ height: 130, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer({ resolveWithObject: true });

    const spacing = 24;
    const canvasWidth = 150 + spacing + wordmarkResized.info.width;
    const canvasHeight = 160;

    const emblemTop = Math.round((canvasHeight - 150) / 2);
    const wordmarkTop = Math.round((canvasHeight - wordmarkResized.info.height) / 2);

    const horizontalLockup = await sharp({
      create: {
        width: canvasWidth,
        height: canvasHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([
      { input: emblemResized, left: 0, top: emblemTop },
      { input: wordmarkResized.data, left: 150 + spacing, top: wordmarkTop }
    ])
    .png()
    .toBuffer();

    const filename = name === 'dark' ? 'shyn-logo-horizontal.png' : `shyn-logo-horizontal-${name}.png`;
    await sharp(horizontalLockup).toFile(path.join(publicAssetsDir, filename));
    console.log(`Saved: public/assets/${filename}`);
  }

  // 5. FAVICON & ICONS
  console.log('5. Generating Favicons and App Icons...');
  // Elegant gold/dark square icon
  const emblemGoldBuf = convertToTransparent(emblemRaw.data, emblemRaw.info.width, emblemRaw.info.height, emblemRaw.info.channels, COLORS.gold);
  const emblemDarkBuf = convertToTransparent(emblemRaw.data, emblemRaw.info.width, emblemRaw.info.height, emblemRaw.info.channels, COLORS.dark);

  // App Icon (512x512 with dark onyx background and gold emblem)
  const emblemGoldResized = await sharp(emblemGoldBuf, { raw: { width: 202, height: 203, channels: 4 } })
    .resize(320, 320, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const appIcon = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 20, g: 19, b: 18, alpha: 1 } // Onyx background
    }
  })
  .composite([
    { input: emblemGoldResized, left: 96, top: 96 }
  ])
  .png()
  .toBuffer();

  await sharp(appIcon).toFile(path.join(publicDir, 'icon.png'));
  await sharp(appIcon).toFile(path.join(appDir, 'icon.png'));
  console.log('Saved: icon.png (512x512)');

  // Apple Touch Icon (180x180)
  const appleIcon = await sharp(appIcon).resize(180, 180).png().toBuffer();
  await sharp(appleIcon).toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp(appleIcon).toFile(path.join(appDir, 'apple-icon.png'));
  console.log('Saved: apple-touch-icon.png (180x180)');

  // Favicon (48x48 ICO/PNG)
  const favicon32 = await sharp(appIcon).resize(48, 48).png().toBuffer();
  await sharp(favicon32).toFile(path.join(publicDir, 'favicon.ico'));
  await sharp(favicon32).toFile(path.join(appDir, 'favicon.ico'));
  console.log('Saved: favicon.ico');

  // 6. SVG Components / Wrappers
  console.log('6. Generating SVG components...');
  // We can write SVG wrappers embedding the clean high-res vectors/PNGs
  const goldLogoBase64 = (await sharp(path.join(publicAssetsDir, 'shyn-logo-gold.png')).toBuffer()).toString('base64');
  const darkLogoBase64 = (await sharp(path.join(publicAssetsDir, 'shyn-logo.png')).toBuffer()).toString('base64');
  const whiteLogoBase64 = (await sharp(path.join(publicAssetsDir, 'shyn-logo-white.png')).toBuffer()).toString('base64');

  fs.writeFileSync(
    path.join(publicAssetsDir, 'shyn-logo.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 811 432" width="100%" height="100%">
      <image href="data:image/png;base64,${darkLogoBase64}" width="811" height="432" />
    </svg>`
  );
  fs.writeFileSync(
    path.join(publicAssetsDir, 'shyn-logo-white.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 811 432" width="100%" height="100%">
      <image href="data:image/png;base64,${whiteLogoBase64}" width="811" height="432" />
    </svg>`
  );
  fs.writeFileSync(
    path.join(publicAssetsDir, 'shyn-logo-gold.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 811 432" width="100%" height="100%">
      <image href="data:image/png;base64,${goldLogoBase64}" width="811" height="432" />
    </svg>`
  );

  console.log('--- All SHYN.ISH branding assets successfully created! ---');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
