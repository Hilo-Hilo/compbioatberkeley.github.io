import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const execFileAsync = promisify(execFile);
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const partnerDir = path.join(projectRoot, "public", "partners");
const outputDir = path.join(partnerDir, "raster");

const source = (name) => path.join(partnerDir, name);
const output = (name) => path.join(outputDir, name);

const writeTransparentPng = async ({
  input,
  name,
  width,
  density = 600,
  sharpen = false,
  allowEnlargement = false,
}) => {
  let pipeline = sharp(input, { density })
    .ensureAlpha()
    .trim({ background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .resize({
      width,
      fit: "inside",
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: !allowEnlargement,
    });

  if (sharpen) {
    pipeline = pipeline.sharpen({ sigma: 0.6, m1: 0.8, m2: 0.4 });
  }

  await pipeline
    .png({ compressionLevel: 9, adaptiveFiltering: true, palette: false })
    .toFile(output(name));
};

/**
 * GeneGen's only surviving source is the user's supplied high-resolution
 * reference. Convert its white matte to a smooth alpha edge while
 * decontaminating near-white pixels so the logo stays clean in dark mode.
 */
const buildTransparentGeneGen = async () => {
  const { data, info } = await sharp(source("genegen.png"))
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rgba = Buffer.alloc(info.width * info.height * 4);

  for (let sourceIndex = 0, targetIndex = 0; sourceIndex < data.length; sourceIndex += 3, targetIndex += 4) {
    const red = data[sourceIndex];
    const green = data[sourceIndex + 1];
    const blue = data[sourceIndex + 2];
    const distanceFromWhite = Math.max(255 - red, 255 - green, 255 - blue);
    const alpha = Math.max(0, Math.min(255, Math.round(((distanceFromWhite - 2) / 48) * 255)));
    const opacity = alpha / 255;

    rgba[targetIndex] = opacity > 0
      ? Math.max(0, Math.min(255, Math.round(255 - (255 - red) / opacity)))
      : 0;
    rgba[targetIndex + 1] = opacity > 0
      ? Math.max(0, Math.min(255, Math.round(255 - (255 - green) / opacity)))
      : 0;
    rgba[targetIndex + 2] = opacity > 0
      ? Math.max(0, Math.min(255, Math.round(255 - (255 - blue) / opacity)))
      : 0;
    rgba[targetIndex + 3] = alpha;
  }

  await sharp(rgba, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize({
      width: info.width,
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: true,
    })
    .png({ compressionLevel: 9, adaptiveFiltering: true, palette: false })
    .toFile(output("genegen.png"));
};

const buildUcsfFromMaster = async () => {
  const temporaryDir = await mkdtemp(path.join(tmpdir(), "compbio-ucsf-logo-"));
  const renderedMaster = path.join(temporaryDir, "ucsf-master.png");

  try {
    await execFileAsync("gs", [
      "-dSAFER",
      "-dBATCH",
      "-dNOPAUSE",
      "-dEPSCrop",
      "-sDEVICE=pngalpha",
      "-r1200",
      `-sOutputFile=${renderedMaster}`,
      path.join(projectRoot, "scripts", "partner-logo-sources", "ucsf-logo-navy-rgb.eps"),
    ]);

    await writeTransparentPng({
      input: renderedMaster,
      name: "ucsf.png",
      width: 1400,
      allowEnlargement: true,
    });
  } finally {
    await rm(temporaryDir, { recursive: true, force: true });
  }
};

const buildNovaFlow = async () => {
  const whiteLogo = await readFile(source("novaflow.svg"), "utf8");
  const purpleLogo = whiteLogo.replaceAll("rgb(255,255,255)", "#5146ff");

  await writeTransparentPng({
    input: Buffer.from(purpleLogo),
    name: "novaflow.png",
    width: 1600,
    allowEnlargement: true,
  });
};

const buildDarkVariant = async (inputName, outputName, transform) => {
  const { data, info } = await sharp(output(inputName))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let index = 0; index < data.length; index += 4) {
    if (data[index + 3] === 0) {
      continue;
    }

    const [red, green, blue] = transform(
      data[index],
      data[index + 1],
      data[index + 2],
    );
    data[index] = red;
    data[index + 1] = green;
    data[index + 2] = blue;
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png({ compressionLevel: 9, adaptiveFiltering: true, palette: false })
    .toFile(output(outputName));
};

await Promise.all([
  writeTransparentPng({
    input: source("google-wordmark.png"),
    name: "google-wordmark.png",
    width: 544,
  }),
  writeTransparentPng({
    input: source("neuroage.webp"),
    name: "neuroage.png",
    width: 591,
  }),
  writeTransparentPng({
    input: source("coagulant.webp"),
    name: "coagulant.png",
    width: 1500,
  }),
  writeTransparentPng({
    input: source("streamind.png"),
    name: "streamind.png",
    width: 1875,
  }),
  writeTransparentPng({
    input: source("progenic.png"),
    name: "progenic.png",
    width: 200,
  }),
  writeTransparentPng({
    input: source("drugrepai.png"),
    name: "drugrepai.png",
    width: 1600,
  }),
  buildTransparentGeneGen(),
  buildUcsfFromMaster(),
  buildNovaFlow(),
]);

await Promise.all([
  buildDarkVariant("ucsf.png", "ucsf-dark.png", () => [246, 244, 239]),
  buildDarkVariant("neuroage.png", "neuroage-dark.png", () => [
    151, 211, 158,
  ]),
  buildDarkVariant("streamind.png", "streamind-dark.png", (red, green, blue) => {
    if (blue > red * 1.15 && green < 140 && blue < 190) {
      return [150, 164, 240];
    }
    return [red, green, blue];
  }),
  buildDarkVariant("coagulant.png", "coagulant-dark.png", (red, green, blue) => {
    if (blue > red * 1.12 && green > red * 1.1) {
      return [
        Math.max(red, 118),
        Math.max(green, 184),
        Math.max(blue, 210),
      ];
    }
    return [red, green, blue];
  }),
  buildDarkVariant("progenic.png", "progenic-dark.png", (red, green, blue) => {
    const maximum = Math.max(red, green, blue);
    const minimum = Math.min(red, green, blue);

    if (maximum < 100 && maximum - minimum < 48) {
      return [238, 237, 234];
    }
    if (blue > red * 1.2 && blue > green * 1.15 && maximum < 205) {
      return [167, 151, 246];
    }
    return [red, green, blue];
  }),
  buildDarkVariant("drugrepai.png", "drugrepai-dark.png", (red, green, blue) => {
    if (green > red * 1.25 && green > blue * 1.08 && green < 175) {
      return [108, 182, 148];
    }
    return [red, green, blue];
  }),
]);

console.log(`Built transparent partner logos in ${path.relative(projectRoot, outputDir)}`);
