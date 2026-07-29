import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(
  projectRoot,
  "assets-src/hero/compbio-research-atlas-chroma-source.png",
);
const outputDirectory = path.join(projectRoot, "public/hero");
const outputWidths = [800, 1600];

const clamp = (value, minimum = 0, maximum = 1) =>
  Math.max(minimum, Math.min(maximum, value));

const smoothstep = (start, end, value) => {
  const amount = clamp((value - start) / (end - start));
  return amount * amount * (3 - 2 * amount);
};

const getBackgroundModel = (data, info) => {
  const rows = Array.from({ length: info.height }, () => [0, 0, 0, 0]);
  const columns = Array.from({ length: info.width }, () => [0, 0, 0, 0]);
  const global = [0, 0, 0, 0];

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const index = (y * info.width + x) * info.channels;
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      const screenStrength = (red + blue) / 2 - green;

      if (screenStrength <= 120 || Math.abs(red - blue) >= 90) continue;

      for (let channel = 0; channel < 3; channel += 1) {
        rows[y][channel] += data[index + channel];
        columns[x][channel] += data[index + channel];
        global[channel] += data[index + channel];
      }

      rows[y][3] += 1;
      columns[x][3] += 1;
      global[3] += 1;
    }
  }

  const globalMean = global
    .slice(0, 3)
    .map((value) => value / global[3]);

  const fillMeans = (values) =>
    values.map((entry) =>
      entry[3]
        ? entry.slice(0, 3).map((value) => value / entry[3])
        : globalMean);

  const smooth = (values, radius) =>
    values.map((_, index) => {
      const result = [0, 0, 0];
      let samples = 0;

      for (
        let sample = Math.max(0, index - radius);
        sample <= Math.min(values.length - 1, index + radius);
        sample += 1
      ) {
        for (let channel = 0; channel < 3; channel += 1) {
          result[channel] += values[sample][channel];
        }
        samples += 1;
      }

      return result.map((value) => value / samples);
    });

  return {
    columns: smooth(fillMeans(columns), 14),
    global: globalMean,
    rows: smooth(fillMeans(rows), 10),
  };
};

const keyChromaSource = async (input) => {
  const { data, info } = await sharp(input)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const background = getBackgroundModel(data, info);
  const output = Buffer.alloc(info.width * info.height * 4);
  const safeMargin = Math.round(Math.min(info.width, info.height) * 0.055);

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const sourceIndex = (y * info.width + x) * info.channels;
      const outputIndex = (y * info.width + x) * 4;

      if (
        x < safeMargin
        || x >= info.width - safeMargin
        || y < safeMargin
        || y >= info.height - safeMargin
      ) {
        output[outputIndex] = 0;
        output[outputIndex + 1] = 0;
        output[outputIndex + 2] = 0;
        output[outputIndex + 3] = 0;
        continue;
      }

      const backdrop = [0, 1, 2].map((channel) =>
        clamp(
          background.rows[y][channel]
            + background.columns[x][channel]
            - background.global[channel],
          0,
          255,
        ));
      const red = data[sourceIndex];
      const green = data[sourceIndex + 1];
      const blue = data[sourceIndex + 2];
      const screenStrength = (red + blue) / 2 - green;
      const backgroundStrength =
        (backdrop[0] + backdrop[2]) / 2 - backdrop[1];
      const colorDistance = Math.hypot(
        red - backdrop[0],
        green - backdrop[1],
        blue - backdrop[2],
      );

      let alpha = 1 - clamp(screenStrength / Math.max(1, backgroundStrength));

      if (colorDistance < 4) alpha = 0;
      alpha = clamp((alpha - 0.018) / 0.982);

      if (alpha < 0.035) {
        output[outputIndex] = 0;
        output[outputIndex + 1] = 0;
        output[outputIndex + 2] = 0;
        output[outputIndex + 3] = 0;
        continue;
      }

      const recovered = [0, 1, 2].map((channel) =>
        clamp(
          (data[sourceIndex + channel] - (1 - alpha) * backdrop[channel])
            / alpha,
          0,
          255,
        ));
      const magentaSpill = Math.max(
        0,
        Math.min(recovered[0], recovered[2]) - recovered[1] - 4,
      );

      recovered[0] -= magentaSpill;
      recovered[2] -= magentaSpill;

      for (let channel = 0; channel < 3; channel += 1) {
        output[outputIndex + channel] = Math.round(recovered[channel]);
      }
      output[outputIndex + 3] = Math.round(alpha * 255);
    }
  }

  return sharp(output, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
};

const buildLightVariant = async (input) => {
  const { data, info } = await sharp(input)
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const alpha = data[index + 3];

    if (alpha === 0) continue;

    const maximum = Math.max(red, green, blue);
    const minimum = Math.min(red, green, blue);
    const saturation = maximum ? (maximum - minimum) / maximum : 0;
    const goldWeight =
      smoothstep(0.1, 0.45, (red - blue) / 255)
      * smoothstep(0.08, 0.35, saturation)
      * smoothstep(80, 170, red);
    const luminance = clamp(
      (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255,
    );
    const tone = smoothstep(0.32, 0.94, luminance);
    const navy = [12, 52, 101];
    const steel = [200, 214, 229];
    const neutral = navy.map((channel, channelIndex) =>
      channel * (1 - tone) + steel[channelIndex] * tone);

    data[index] = Math.round(neutral[0] * (1 - goldWeight) + red * goldWeight);
    data[index + 1] = Math.round(
      neutral[1] * (1 - goldWeight) + green * goldWeight,
    );
    data[index + 2] = Math.round(
      neutral[2] * (1 - goldWeight) + blue * goldWeight,
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

const metadata = await sharp(sourcePath).metadata();

if (
  !metadata.width
  || !metadata.height
  || Math.abs(metadata.width / metadata.height - 4 / 3) > 0.001
) {
  throw new Error(
    "Hero chroma source must be a 4:3 PNG.",
  );
}

await mkdir(outputDirectory, { recursive: true });

const darkSource = await keyChromaSource(sourcePath);
const variants = {
  light: await buildLightVariant(darkSource),
  dark: darkSource,
};

for (const [variant, input] of Object.entries(variants)) {
  for (const width of outputWidths) {
    await writeVariant(variant, input, width);
  }
}
