import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { validateOfficerProfileSnapshot } from "../../src/data/officerProfileContract.js";

const MAX_SOURCE_BYTES = 15 * 1024 * 1024;
const MAX_SOURCE_PIXELS = 40_000_000;
const MAX_PORTRAIT_EDGE = 1600;
const ALLOWED_SOURCE_FORMATS = new Set(["jpeg", "png", "webp"]);
const SNAPSHOT_STATE_SCHEMA_VERSION = 1;
const comparePaths = (left, right) => {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
};

const isNotionHostedPortrait = (sourceUrl) => {
  const url = new URL(sourceUrl);
  if (url.protocol !== "https:") return false;
  const hostname = url.hostname.toLowerCase();
  return (
    hostname === "prod-files-secure.s3.us-west-2.amazonaws.com" ||
    (hostname === "s3.us-west-2.amazonaws.com" &&
      url.pathname.startsWith("/secure.notion-static.com/")) ||
    hostname === "secure.notion-static.com" ||
    hostname === "file.notion.so"
  );
};

const targetForPublicPath = (repoRoot, cohort, publicPath) => {
  const expectedPrefix = `/officers/${cohort}/`;
  if (
    !publicPath.startsWith(expectedPrefix) ||
    publicPath.includes("..") ||
    path.extname(publicPath).toLowerCase() !== ".webp"
  ) {
    throw new Error(
      `Portrait target must be a versioned WebP inside ${expectedPrefix}`,
    );
  }
  const publicRoot = path.resolve(repoRoot, "public");
  const targetPath = path.resolve(publicRoot, publicPath.slice(1));
  if (!targetPath.startsWith(`${publicRoot}${path.sep}`)) {
    throw new Error("Portrait target escaped the public directory");
  }
  return targetPath;
};

const cancelResponseBody = async (body, reader, reason) => {
  try {
    if (reader) {
      await reader.cancel(reason);
    } else if (typeof body?.cancel === "function") {
      await body.cancel(reason);
    } else if (typeof body?.destroy === "function") {
      body.destroy(reason);
    }
  } catch {
    // The size-limit error is more useful than a secondary cancellation error.
  }
};

const readBoundedResponseBody = async (
  body,
  { maxBytes, abortController },
) => {
  if (!body) return Buffer.alloc(0);

  const chunks = [];
  let totalBytes = 0;
  const appendChunk = async (chunk, reader) => {
    const buffer = Buffer.from(chunk);
    totalBytes += buffer.length;
    if (totalBytes > maxBytes) {
      const error = new Error(
        "Portrait source exceeds the 15 MB download limit",
      );
      await cancelResponseBody(body, reader, error);
      abortController.abort(error);
      throw error;
    }
    chunks.push(buffer);
  };

  if (typeof body.getReader === "function") {
    const reader = body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        await appendChunk(value, reader);
      }
    } finally {
      reader.releaseLock();
    }
  } else if (typeof body[Symbol.asyncIterator] === "function") {
    for await (const chunk of body) {
      await appendChunk(chunk);
    }
  } else {
    throw new Error("Portrait response body is not a readable stream");
  }

  return Buffer.concat(chunks, totalBytes);
};

const fetchPortrait = async (sourceUrl, fetchImpl) => {
  if (!isNotionHostedPortrait(sourceUrl)) {
    throw new Error("Portrait source must be a Notion-hosted HTTPS raster");
  }

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), 20_000);
  timeout.unref?.();

  try {
    const response = await fetchImpl(sourceUrl, {
      signal: abortController.signal,
    });
    if (!response.ok) {
      throw new Error(`Portrait download failed with HTTP ${response.status}`);
    }

    const declaredSize = Number(
      response.headers.get("content-length") ?? 0,
    );
    if (declaredSize > MAX_SOURCE_BYTES) {
      const error = new Error(
        "Portrait source exceeds the 15 MB download limit",
      );
      await cancelResponseBody(response.body, undefined, error);
      abortController.abort(error);
      throw error;
    }

    return await readBoundedResponseBody(response.body, {
      maxBytes: MAX_SOURCE_BYTES,
      abortController,
    });
  } finally {
    clearTimeout(timeout);
  }
};

export const normalizeOfficerPortrait = async (sourceBuffer) => {
  const input = sharp(sourceBuffer, {
    failOn: "error",
    limitInputPixels: MAX_SOURCE_PIXELS,
  });
  const metadata = await input.metadata();
  if (!ALLOWED_SOURCE_FORMATS.has(metadata.format ?? "")) {
    throw new Error("Portrait must be a JPEG, PNG, or WebP raster");
  }

  return input
    .rotate()
    .resize({
      width: MAX_PORTRAIT_EDGE,
      height: MAX_PORTRAIT_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 88, effort: 5 })
    .toBuffer();
};

export const serializeOfficerProfileSnapshot = (snapshot) =>
  `${JSON.stringify(snapshot, null, 2)}\n`;

export const prepareOfficerProfileWrites = async ({
  repoRoot,
  snapshotPath,
  snapshot,
  portraitCandidates,
  fetchImpl = globalThis.fetch,
  intakeStart,
  intakeEnd,
}) => {
  const contractErrors = validateOfficerProfileSnapshot(snapshot, {
    expectedCohort: snapshot.cohort,
    intakeStart,
    intakeEnd,
  });
  if (contractErrors.length > 0) {
    throw new Error(
      `Officer profile candidate is invalid:\n- ${contractErrors.join("\n- ")}`,
    );
  }

  const writes = [
    {
      targetPath: resolveManagedPath(repoRoot, snapshotPath),
      contents: Buffer.from(serializeOfficerProfileSnapshot(snapshot)),
    },
  ];
  const targets = new Set(writes.map(({ targetPath }) => targetPath));

  for (const candidate of portraitCandidates) {
    const targetPath = targetForPublicPath(
      repoRoot,
      snapshot.cohort,
      candidate.publicPath,
    );
    if (targets.has(targetPath)) {
      throw new Error(`Duplicate managed portrait target ${candidate.publicPath}`);
    }
    targets.add(targetPath);

    const sourceBuffer = await fetchPortrait(
      candidate.sourceUrl,
      fetchImpl,
    );
    const contents = await normalizeOfficerPortrait(sourceBuffer);
    writes.push({
      targetPath,
      publicPath: candidate.publicPath,
      contents,
      sha256: crypto.createHash("sha256").update(contents).digest("hex"),
    });
  }

  return writes;
};

const pathExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const resolveManagedPath = (repoRoot, relativePath) => {
  if (
    typeof relativePath !== "string" ||
    relativePath.length === 0 ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error("Managed officer paths must be non-empty relative paths");
  }
  const resolvedRoot = path.resolve(repoRoot);
  const resolvedPath = path.resolve(resolvedRoot, relativePath);
  if (!resolvedPath.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error("Managed officer path escaped the repository");
  }
  return resolvedPath;
};

const repoRelativePath = (repoRoot, absolutePath) =>
  path.relative(path.resolve(repoRoot), absolutePath).split(path.sep).join("/");

const capturePathState = async (repoRoot, absolutePath) => {
  const relativePath = repoRelativePath(repoRoot, absolutePath);
  let status;
  try {
    status = await fs.lstat(absolutePath);
  } catch (error) {
    if (error?.code === "ENOENT") {
      return { path: relativePath, status: "missing" };
    }
    throw error;
  }

  if (status.isFile()) {
    const contents = await fs.readFile(absolutePath);
    return {
      path: relativePath,
      status: "file",
      sha256: crypto.createHash("sha256").update(contents).digest("hex"),
    };
  }
  if (status.isDirectory()) {
    return { path: relativePath, status: "directory" };
  }
  if (status.isSymbolicLink()) {
    return {
      path: relativePath,
      status: "symlink",
      target: await fs.readlink(absolutePath),
    };
  }
  return { path: relativePath, status: "other" };
};

const captureDirectoryTree = async (repoRoot, directoryPath) => {
  const root = await capturePathState(repoRoot, directoryPath);
  if (root.status !== "directory") {
    return { root, entries: [] };
  }

  const entries = [];
  const visit = async (currentPath) => {
    const names = (await fs.readdir(currentPath)).sort(comparePaths);
    for (const name of names) {
      const entryPath = path.join(currentPath, name);
      const entry = await capturePathState(repoRoot, entryPath);
      entries.push(entry);
      if (entry.status === "directory") {
        await visit(entryPath);
      }
    }
  };
  await visit(directoryPath);
  entries.sort((left, right) => comparePaths(left.path, right.path));
  return { root, entries };
};

export const captureManagedOfficerProfileState = async ({
  repoRoot,
  snapshotPath,
  portraitDirectory,
}) => {
  const resolvedSnapshotPath = resolveManagedPath(repoRoot, snapshotPath);
  const resolvedPortraitDirectory = resolveManagedPath(
    repoRoot,
    portraitDirectory,
  );
  return {
    schemaVersion: SNAPSHOT_STATE_SCHEMA_VERSION,
    snapshot: await capturePathState(repoRoot, resolvedSnapshotPath),
    portraits: await captureDirectoryTree(
      repoRoot,
      resolvedPortraitDirectory,
    ),
  };
};

const indexCapturedState = (state) => {
  const entries = [
    state.snapshot,
    state.portraits.root,
    ...state.portraits.entries,
  ];
  return new Map(entries.map((entry) => [entry.path, JSON.stringify(entry)]));
};

export const assertManagedOfficerProfileStateUnchanged = async ({
  repoRoot,
  snapshotPath,
  portraitDirectory,
  expectedState,
}) => {
  if (
    !expectedState ||
    expectedState.schemaVersion !== SNAPSHOT_STATE_SCHEMA_VERSION
  ) {
    throw new Error("Expected managed officer state is missing or unsupported");
  }
  const currentState = await captureManagedOfficerProfileState({
    repoRoot,
    snapshotPath,
    portraitDirectory,
  });
  const expectedEntries = indexCapturedState(expectedState);
  const currentEntries = indexCapturedState(currentState);
  const changedPaths = [...new Set([
    ...expectedEntries.keys(),
    ...currentEntries.keys(),
  ])]
    .filter(
      (entryPath) =>
        expectedEntries.get(entryPath) !== currentEntries.get(entryPath),
    )
    .sort(comparePaths);

  if (changedPaths.length > 0) {
    throw new Error(
      `Managed officer files changed while the sync was running; refusing to write:\n- ${changedPaths.join("\n- ")}`,
    );
  }
};

export const commitManagedWrites = async (writes) => {
  const transactionId = crypto.randomUUID();
  const prepared = [];

  try {
    for (const write of writes) {
      await fs.mkdir(path.dirname(write.targetPath), { recursive: true });
      const temporaryPath = `${write.targetPath}.tmp-${transactionId}`;
      const backupPath = `${write.targetPath}.backup-${transactionId}`;
      await fs.writeFile(temporaryPath, write.contents, { flag: "wx" });
      prepared.push({
        ...write,
        temporaryPath,
        backupPath,
        hadOriginal: await pathExists(write.targetPath),
        committed: false,
      });
    }

    for (const write of prepared) {
      if (write.hadOriginal) {
        await fs.rename(write.targetPath, write.backupPath);
      }
      await fs.rename(write.temporaryPath, write.targetPath);
      write.committed = true;
    }

    await Promise.allSettled(
      prepared
        .filter(({ hadOriginal }) => hadOriginal)
        .map(({ backupPath }) => fs.unlink(backupPath)),
    );
  } catch (error) {
    for (const write of [...prepared].reverse()) {
      if (write.committed && (await pathExists(write.targetPath))) {
        await fs.unlink(write.targetPath);
      }
      if (write.hadOriginal && (await pathExists(write.backupPath))) {
        await fs.rename(write.backupPath, write.targetPath);
      }
      if (await pathExists(write.temporaryPath)) {
        await fs.unlink(write.temporaryPath);
      }
    }
    throw error;
  }
};
