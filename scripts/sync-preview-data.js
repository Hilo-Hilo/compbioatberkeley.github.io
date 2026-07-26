#!/usr/bin/env node

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = path.resolve(__dirname, "../public");
const sourceOrigin =
  process.env.PREVIEW_DATA_ORIGIN || "https://compbioatberkeley.github.io";

const currentSemester = () => {
  const now = new Date();
  const prefix = now.getMonth() <= 6 ? "sp" : "fa";
  return `${prefix}${String(now.getFullYear()).slice(-2)}`;
};

const destinationFor = (urlPath) => {
  const destination = path.resolve(publicRoot, urlPath.replace(/^\/+/, ""));
  if (
    destination !== publicRoot &&
    !destination.startsWith(`${publicRoot}${path.sep}`)
  ) {
    throw new Error(`Refusing to write outside public/: ${urlPath}`);
  }
  return destination;
};

const download = async (urlPath) => {
  const response = await fetch(new URL(urlPath, sourceOrigin));
  if (!response.ok) {
    throw new Error(`Failed to fetch ${urlPath}: ${response.status}`);
  }

  const destination = destinationFor(urlPath);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  const bytes = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(destination, bytes);
  return bytes;
};

const syncSemester = async (semester) => {
  const jsonPath = `/fetched/officers/${semester}/officers-${semester}.json`;
  const jsonBytes = await download(jsonPath);
  const officers = JSON.parse(jsonBytes.toString("utf8"));
  const imagePaths = [
    ...new Set(
      officers
        .map((officer) => officer.image)
        .filter(
          (image) =>
            typeof image === "string" && image.startsWith("/fetched/"),
        ),
    ),
  ];

  await Promise.all(imagePaths.map(download));
  console.log(
    `Synced ${officers.length} ${semester} officers and ${imagePaths.length} images`,
  );
};

for (const semester of [...new Set(["fa25", currentSemester()])]) {
  await syncSemester(semester);
}
