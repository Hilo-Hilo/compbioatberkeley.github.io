import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(
  projectRoot,
  "assets-src/hero/compbio-research-atlas-light-master.png",
);
const outputDirectory = path.join(projectRoot, "public/hero");
const outputWidths = [800, 1600];

const isGoldPixel = (red, green, blue) =>
  red > 125
  && red > blue * 1.18
  && green > blue * 1.08
  && red > green * 1.015;

const clearSafeMargin = async (input) => {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (x >= 100 && x < info.width - 100 && y >= 100 && y < info.height - 120) {
        continue;
      }

      const index = (y * info.width + x) * 4;
      data[index] = 0;
      data[index + 1] = 0;
      data[index + 2] = 0;
      data[index + 3] = 0;
    }
  }

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
};

const buildDarkVariant = async (input) => {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const alpha = data[index + 3];

    if (alpha === 0) continue;

    if (isGoldPixel(red, green, blue)) {
      data[index] = Math.min(255, Math.round(red * 1.02));
      data[index + 1] = Math.min(255, Math.round(green * 1.03));
      data[index + 2] = Math.min(255, Math.round(blue * 0.96));
      continue;
    }

    const luminance = Math.max(
      0,
      Math.min(1, (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255),
    );
    const pearl = [247, 243, 232];
    const iceBlue = [139, 164, 194];

    data[index] = Math.round(pearl[0] * (1 - luminance) + iceBlue[0] * luminance);
    data[index + 1] = Math.round(
      pearl[1] * (1 - luminance) + iceBlue[1] * luminance,
    );
    data[index + 2] = Math.round(
      pearl[2] * (1 - luminance) + iceBlue[2] * luminance,
    );
  }

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
};

const writeVariant = async (variant, input, width) => {
  const height = Math.round(width * 0.75);
  const outputPath = path.join(
    outputDirectory,
    `compbio-research-atlas-${variant}-${width}.webp`,
  );

  await sharp(input)
    .resize(width, height, {
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: true,
    })
    .webp({
      quality: 90,
      alphaQuality: 100,
      effort: 6,
      smartSubsample: true,
    })
    .toFile(outputPath);

  console.log(`Wrote ${path.relative(projectRoot, outputPath)}`);
};

const sourceMaster = await sharp(sourcePath).png().toBuffer();
const metadata = await sharp(sourceMaster).metadata();

if (
  metadata.width !== 1600
  || metadata.height !== 1200
  || metadata.hasAlpha !== true
) {
  throw new Error(
    "Hero master must be a 1600x1200 PNG with a transparent alpha channel.",
  );
}

await mkdir(outputDirectory, { recursive: true });

const source = await clearSafeMargin(sourceMaster);
const variants = {
  light: source,
  dark: await buildDarkVariant(source),
};

for (const [variant, input] of Object.entries(variants)) {
  for (const width of outputWidths) {
    await writeVariant(variant, input, width);
  }
}
