import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  assertManagedOfficerProfileStateUnchanged,
  captureManagedOfficerProfileState,
  prepareOfficerProfileWrites,
} from "./officer-profile-sync-files.js";

const snapshot = {
  schemaVersion: 1,
  cohort: "fa26",
  profiles: [],
};

const managedPaths = {
  snapshotPath: "src/data/officerProfilesFa26.json",
  portraitDirectory: "public/officers/fa26",
};

test("stops a streamed portrait above 15 MB without using arrayBuffer", async () => {
  const repoRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "officer-profile-stream-limit-"),
  );
  let canceled = false;
  let receivedSignal;
  let chunkIndex = 0;
  const body = new ReadableStream({
    pull(controller) {
      chunkIndex += 1;
      controller.enqueue(new Uint8Array(8 * 1024 * 1024));
      if (chunkIndex === 3) controller.close();
    },
    cancel() {
      canceled = true;
    },
  });

  await assert.rejects(
    prepareOfficerProfileWrites({
      repoRoot,
      snapshotPath: managedPaths.snapshotPath,
      snapshot,
      portraitCandidates: [
        {
          publicPath: "/officers/fa26/oversized.webp",
          sourceUrl:
            "https://prod-files-secure.s3.us-west-2.amazonaws.com/oversized",
        },
      ],
      fetchImpl: async (_url, { signal }) => {
        receivedSignal = signal;
        return {
          ok: true,
          status: 200,
          headers: { get: () => null },
          body,
          arrayBuffer() {
            throw new Error("arrayBuffer must not be used");
          },
        };
      },
    }),
    /exceeds the 15 MB download limit/,
  );

  assert.equal(canceled, true);
  assert.equal(receivedSignal.aborted, true);
});

test("writes the configured cohort snapshot path instead of a Fall 2026 default", async () => {
  const repoRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "officer-profile-configured-path-"),
  );
  const snapshotPath = "src/data/officerProfilesSp27.json";
  const writes = await prepareOfficerProfileWrites({
    repoRoot,
    snapshotPath,
    snapshot: {
      schemaVersion: 1,
      cohort: "sp27",
      profiles: [],
    },
    portraitCandidates: [],
  });

  assert.equal(writes[0].targetPath, path.join(repoRoot, snapshotPath));
});

test("captures deterministic managed state and accepts an unchanged tree", async () => {
  const repoRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "officer-profile-state-"),
  );
  const missingState = await captureManagedOfficerProfileState({
    repoRoot,
    ...managedPaths,
  });
  assert.equal(missingState.snapshot.status, "missing");
  assert.equal(missingState.portraits.root.status, "missing");

  const snapshotPath = path.join(repoRoot, managedPaths.snapshotPath);
  const portraitDirectory = path.join(
    repoRoot,
    managedPaths.portraitDirectory,
  );
  await fs.mkdir(portraitDirectory, { recursive: true });
  await fs.mkdir(path.dirname(snapshotPath), { recursive: true });
  await fs.writeFile(snapshotPath, "reviewed snapshot\n");
  await fs.writeFile(
    path.join(portraitDirectory, "one.webp"),
    "portrait one",
  );

  const first = await captureManagedOfficerProfileState({
    repoRoot,
    ...managedPaths,
  });
  const second = await captureManagedOfficerProfileState({
    repoRoot,
    ...managedPaths,
  });

  assert.deepEqual(second, first);
  assert.equal(first.snapshot.status, "file");
  assert.match(first.snapshot.sha256, /^[0-9a-f]{64}$/);
  assert.deepEqual(
    first.portraits.entries.map(({ path: entryPath, status }) => ({
      path: entryPath,
      status,
    })),
    [
      {
        path: "public/officers/fa26/one.webp",
        status: "file",
      },
    ],
  );
  await assert.doesNotReject(
    assertManagedOfficerProfileStateUnchanged({
      repoRoot,
      ...managedPaths,
      expectedState: first,
    }),
  );
});

test("detects changed, added, and removed managed files before a write", async () => {
  const repoRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "officer-profile-state-change-"),
  );
  const snapshotPath = path.join(repoRoot, managedPaths.snapshotPath);
  const portraitDirectory = path.join(
    repoRoot,
    managedPaths.portraitDirectory,
  );
  const portraitPath = path.join(portraitDirectory, "one.webp");
  await fs.mkdir(portraitDirectory, { recursive: true });
  await fs.mkdir(path.dirname(snapshotPath), { recursive: true });
  await fs.writeFile(snapshotPath, "snapshot version one\n");
  await fs.writeFile(portraitPath, "portrait version one");

  const expectedState = await captureManagedOfficerProfileState({
    repoRoot,
    ...managedPaths,
  });

  await fs.writeFile(snapshotPath, "snapshot version two\n");
  await assert.rejects(
    assertManagedOfficerProfileStateUnchanged({
      repoRoot,
      ...managedPaths,
      expectedState,
    }),
    /src\/data\/officerProfilesFa26\.json/,
  );

  await fs.writeFile(snapshotPath, "snapshot version one\n");
  const addedPortrait = path.join(portraitDirectory, "two.webp");
  await fs.writeFile(addedPortrait, "portrait two");
  await assert.rejects(
    assertManagedOfficerProfileStateUnchanged({
      repoRoot,
      ...managedPaths,
      expectedState,
    }),
    /public\/officers\/fa26\/two\.webp/,
  );

  await fs.unlink(addedPortrait);
  await fs.unlink(portraitPath);
  await assert.rejects(
    assertManagedOfficerProfileStateUnchanged({
      repoRoot,
      ...managedPaths,
      expectedState,
    }),
    /public\/officers\/fa26\/one\.webp/,
  );
});
