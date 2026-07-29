import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import sharp from "sharp";
import {
  buildOfficerProfileSnapshot,
  queryAllNotionPages,
} from "./build-officer-profile-snapshot.js";
import {
  commitManagedWrites,
  normalizeOfficerPortrait,
  prepareOfficerProfileWrites,
} from "./officer-profile-sync-files.js";
import {
  compareOfficerProfileSnapshots,
  parseOfficerProfileSyncMode,
} from "./officer-profile-sync-command.js";
import { validateOfficerProfileSnapshot } from "../../src/data/officerProfileContract.js";

const currentSnapshot = {
  schemaVersion: 1,
  cohort: "fa26",
  profiles: [],
};
const intakeStart = "2026-07-03T22:45:53Z";
const intakeEnd = "2027-01-01T00:00:00Z";
const profileSnapshotPath = "src/data/officerProfilesFa26.json";
const buildSnapshot = (options) =>
  buildOfficerProfileSnapshot({
    intakeStart,
    intakeEnd,
    ...options,
  });

const roster = [
  {
    id: "anisha-s-pallikonda",
    name: "Anisha S. Pallikonda",
    aliases: ["Anisha Pallikonda"],
    role: "Senior Advisor",
    image: "/officers/fa26/anisha-pallikonda.webp",
  },
];

const richText = (value) => [{ plain_text: value }];
const page = ({
  id = "3ac3e3c8-c9b6-8155-96d5-c35c4b8164fb",
  createdTime = "2026-07-29T02:02:08Z",
  name = "Anisha Pallikonda",
  preferredName = "Anisha",
  bio = "",
  headshotUrl = "https://prod-files-secure.s3.us-west-2.amazonaws.com/profile_anisha.jpg",
  headshotType = "file",
} = {}) => ({
  id,
  created_time: createdTime,
  properties: {
    "Full Name": { type: "title", title: richText(name) },
    "Preferred Name": {
      type: "rich_text",
      rich_text: richText(preferredName),
    },
    Bio: { type: "rich_text", rich_text: richText(bio) },
    "Personal Website": { type: "url", url: "https://example.com/anisha" },
    Linkedin: {
      type: "url",
      url: "https://www.linkedin.com/in/anisha-pallikonda/",
    },
    GitHub: { type: "url", url: "https://github.com/anisha" },
    ORCID: { type: "url", url: "https://orcid.org/0000-0002-1825-0097" },
    headshot: {
      type: "files",
      files:
        headshotType === "external"
          ? [{ type: "external", external: { url: headshotUrl } }]
          : headshotUrl
            ? [{ type: "file", file: { url: headshotUrl } }]
            : [],
    },
    Role: { type: "rich_text", rich_text: richText("Form-controlled role") },
    Email: { type: "email", email: "must-not-publish@example.invalid" },
    Phone: { type: "phone_number", phone_number: "+0 000 000 0000" },
    Birthday: { type: "date", date: { start: "1900-01-01" } },
  },
});

test("builds a public-only candidate without letting intake data control the roster", () => {
  const { snapshot, portraitCandidates, audit } =
    buildSnapshot({
      pages: [page({ bio: "A reviewed public biography." })],
      roster,
      currentSnapshot,
    });

  assert.deepEqual(snapshot.profiles, [
    {
      sourceId: "3ac3e3c8-c9b6-8155-96d5-c35c4b8164fb",
      submittedAt: "2026-07-29T02:02:08Z",
      fullName: "Anisha Pallikonda",
      preferredName: "Anisha",
      image:
        "/officers/fa26/anisha-s-pallikonda-2026-07-29-3ac3e3c8.webp",
      bio: "A reviewed public biography.",
      "personal website": "https://example.com/anisha",
      linkedin: "https://www.linkedin.com/in/anisha-pallikonda/",
      github: "https://github.com/anisha",
      orcid: "https://orcid.org/0000-0002-1825-0097",
    },
  ]);
  assert.deepEqual(Object.keys(snapshot.profiles[0]).sort(), [
    "bio",
    "fullName",
    "github",
    "image",
    "linkedin",
    "orcid",
    "personal website",
    "preferredName",
    "sourceId",
    "submittedAt",
  ]);
  assert.equal(
    JSON.stringify(snapshot).includes("must-not-publish@example.invalid"),
    false,
  );
  assert.equal(JSON.stringify(snapshot).includes("Form-controlled role"), false);
  assert.equal("sourceDatabaseId" in snapshot, false);
  assert.equal("sourceDataSourceId" in snapshot, false);
  assert.equal("intakeStart" in snapshot, false);
  assert.equal("intakeEnd" in snapshot, false);
  assert.deepEqual(audit.unmatchedSubmissions, []);
  assert.equal(portraitCandidates[0].officerId, "anisha-s-pallikonda");
  assert.equal(
    portraitCandidates[0].sourceUrl,
    "https://prod-files-secure.s3.us-west-2.amazonaws.com/profile_anisha.jpg",
  );
});

test("uses the explicit cohort window and blocks unmatched in-window submissions", () => {
  const beforeWindow = page({
    id: "11111111-1111-4111-8111-111111111111",
    createdTime: "2026-07-03T22:45:52Z",
  });
  const afterWindow = page({
    id: "22222222-2222-4222-8222-222222222222",
    createdTime: "2027-01-01T00:00:00Z",
  });
  const unmatched = page({
    id: "33333333-3333-4333-8333-333333333333",
    name: "Not On The Roster",
  });

  const { snapshot, audit } = buildSnapshot({
    pages: [beforeWindow, afterWindow, unmatched],
    roster,
    currentSnapshot,
  });

  assert.deepEqual(snapshot.profiles, []);
  assert.deepEqual(audit.unmatchedSubmissions, ["Not On The Roster"]);
  assert.equal(audit.outsideCohortCount, 2);
});

test("redownloads an existing response portrait to detect attachment edits", () => {
  const existing = {
    ...currentSnapshot,
    profiles: [
      {
        sourceId: "3ac3e3c8-c9b6-8155-96d5-c35c4b8164fb",
        submittedAt: "2026-07-29T02:02:08Z",
        fullName: "Anisha Pallikonda",
        preferredName: "Anisha",
        image:
          "/officers/fa26/anisha-s-pallikonda-2026-07-29-3ac3e3c8.webp",
        bio: "Keep",
        "personal website": "",
        linkedin: "",
        github: "",
        orcid: "",
      },
    ],
  };

  const { snapshot, portraitCandidates } = buildSnapshot({
    pages: [page()],
    roster,
    currentSnapshot: existing,
  });

  assert.equal(
    snapshot.profiles[0].image,
    "/officers/fa26/anisha-s-pallikonda-2026-07-29-3ac3e3c8.webp",
  );
  assert.equal(portraitCandidates.length, 1);
  assert.equal(
    portraitCandidates[0].publicPath,
    "/officers/fa26/anisha-s-pallikonda-2026-07-29-3ac3e3c8.webp",
  );
});

test("same-response portrait comparison is idempotent and detects new content", async () => {
  const repoRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "officer-profile-existing-portrait-"),
  );
  const expectedPublicPath =
    "/officers/fa26/anisha-s-pallikonda-2026-07-29-3ac3e3c8.webp";
  const existing = {
    ...currentSnapshot,
    profiles: [
      {
        sourceId: "3ac3e3c8-c9b6-8155-96d5-c35c4b8164fb",
        submittedAt: "2026-07-29T02:02:08Z",
        fullName: "Anisha Pallikonda",
        preferredName: "Anisha",
        image: expectedPublicPath,
        bio: "",
        "personal website": "",
        linkedin: "",
        github: "",
        orcid: "",
      },
    ],
  };
  const originalSource = await sharp({
    create: {
      width: 120,
      height: 160,
      channels: 3,
      background: "#2457ff",
    },
  })
    .jpeg()
    .toBuffer();
  const replacementSource = await sharp({
    create: {
      width: 120,
      height: 160,
      channels: 3,
      background: "#f64a63",
    },
  })
    .jpeg()
    .toBuffer();
  const trackedPortrait = await normalizeOfficerPortrait(originalSource);
  const trackedPath = path.join(repoRoot, "public", expectedPublicPath);
  await fs.mkdir(path.dirname(trackedPath), { recursive: true });
  await fs.writeFile(trackedPath, trackedPortrait);

  const candidate = buildSnapshot({
    pages: [page()],
    roster,
    currentSnapshot: existing,
  });
  const prepareWith = (sourceBuffer) =>
    prepareOfficerProfileWrites({
      repoRoot,
      snapshotPath: profileSnapshotPath,
      snapshot: candidate.snapshot,
      portraitCandidates: candidate.portraitCandidates,
      intakeStart,
      intakeEnd,
      fetchImpl: async () => new Response(sourceBuffer),
    });
  const unchangedWrites = await prepareWith(originalSource);
  const unchangedPortrait = unchangedWrites.find(({ publicPath }) => publicPath);
  assert.deepEqual(unchangedPortrait.contents, trackedPortrait);

  const changedWrites = await prepareWith(replacementSource);
  const changedPortrait = changedWrites.find(({ publicPath }) => publicPath);
  assert.notDeepEqual(changedPortrait.contents, trackedPortrait);
});

test("treats a removed or external portrait as reviewable source drift", () => {
  const existing = {
    ...currentSnapshot,
    profiles: [
      {
        sourceId: "3ac3e3c8-c9b6-8155-96d5-c35c4b8164fb",
        submittedAt: "2026-07-29T02:02:08Z",
        fullName: "Anisha Pallikonda",
        preferredName: "Anisha",
        image: "/officers/fa26/anisha-reviewed.webp",
        bio: "",
        "personal website": "",
        linkedin: "",
        github: "",
        orcid: "",
      },
    ],
  };

  const removed = buildSnapshot({
    pages: [page({ headshotUrl: "" })],
    roster,
    currentSnapshot: existing,
  });
  assert.equal(removed.snapshot.profiles[0].image, "");

  const external = buildSnapshot({
    pages: [page({ headshotType: "external" })],
    roster,
    currentSnapshot: existing,
  });
  assert.deepEqual(external.audit.unsupportedPortraits, [
    "Anisha Pallikonda",
  ]);
  assert.deepEqual(external.portraitCandidates, []);
});

test("queries every paginated Notion result", async () => {
  const calls = [];
  const notion = {
    databases: {
      async query(request) {
        calls.push(request);
        if (!request.start_cursor) {
          return {
            results: [{ id: "first" }],
            has_more: true,
            next_cursor: "cursor-2",
          };
        }
        return {
          results: [{ id: "second" }],
          has_more: false,
          next_cursor: null,
        };
      },
    },
  };

  const results = await queryAllNotionPages(notion, "database-id", {
    intakeStart,
    intakeEnd,
  });

  const cohortFilter = {
    and: [
      {
        timestamp: "created_time",
        created_time: { on_or_after: intakeStart },
      },
      {
        timestamp: "created_time",
        created_time: { before: intakeEnd },
      },
    ],
  };

  assert.deepEqual(results.map(({ id }) => id), ["first", "second"]);
  assert.deepEqual(calls, [
    {
      database_id: "database-id",
      page_size: 100,
      filter: cohortFilter,
    },
    {
      database_id: "database-id",
      page_size: 100,
      filter: cohortFilter,
      start_cursor: "cursor-2",
    },
  ]);
});

test("rejects private fields, remote portraits, and cross-cohort timestamps", () => {
  const invalid = {
    ...currentSnapshot,
    profiles: [
      {
        sourceId: "3ac3e3c8-c9b6-8155-96d5-c35c4b8164fb",
        submittedAt: "2025-07-29T02:02:08Z",
        fullName: "Anisha Pallikonda",
        preferredName: "Anisha",
        image: "https://example.com/signed-portrait.jpg",
        bio: "",
        "personal website": "",
        linkedin: "",
        github: "",
        orcid: "",
        email: "must-not-publish@example.invalid",
      },
    ],
  };

  const errors = validateOfficerProfileSnapshot(invalid, {
    expectedCohort: "fa26",
    intakeStart,
    intakeEnd,
  });

  assert.match(errors.join("\n"), /disallowed field "email"/);
  assert.match(errors.join("\n"), /outside the cohort intake window/);
  assert.match(errors.join("\n"), /local public path/);
});

test("prepares every image before committing and strips raster metadata", async () => {
  const repoRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "officer-profile-sync-"),
  );
  const snapshotPath = path.join(
    repoRoot,
    "src/data/officerProfilesFa26.json",
  );
  await fs.mkdir(path.dirname(snapshotPath), { recursive: true });
  await fs.writeFile(snapshotPath, "old snapshot\n");

  const sourceBuffer = await sharp({
    create: {
      width: 2400,
      height: 1200,
      channels: 3,
      background: "#2457ff",
    },
  })
    .withMetadata({ orientation: 6, comment: "must be stripped" })
    .jpeg()
    .toBuffer();

  const candidate = buildSnapshot({
    pages: [page()],
    roster,
    currentSnapshot,
  });
  const writes = await prepareOfficerProfileWrites({
    repoRoot,
    snapshotPath: profileSnapshotPath,
    snapshot: candidate.snapshot,
    portraitCandidates: candidate.portraitCandidates,
    fetchImpl: async () =>
      new Response(sourceBuffer, {
        status: 200,
        headers: {
          "content-type": "image/jpeg",
          "content-length": String(sourceBuffer.length),
        },
      }),
  });

  assert.equal(await fs.readFile(snapshotPath, "utf8"), "old snapshot\n");
  assert.equal(writes.length, 2);
  const portraitWrite = writes.find(({ publicPath }) => publicPath);
  const metadata = await sharp(portraitWrite.contents).metadata();
  assert.equal(metadata.format, "webp");
  assert.equal(metadata.width, 800);
  assert.equal(metadata.height, 1600);
  assert.equal(metadata.exif, undefined);

  await commitManagedWrites(writes);
  assert.match(
    await fs.readFile(snapshotPath, "utf8"),
    /"schemaVersion": 1/,
  );
  assert.deepEqual(
    await fs.readFile(
      path.join(
        repoRoot,
        "public/officers/fa26/anisha-s-pallikonda-2026-07-29-3ac3e3c8.webp",
      ),
    ),
    portraitWrite.contents,
  );
});

test("a failed portrait fetch leaves the reviewed snapshot untouched", async () => {
  const repoRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "officer-profile-failure-"),
  );
  const snapshotPath = path.join(
    repoRoot,
    "src/data/officerProfilesFa26.json",
  );
  await fs.mkdir(path.dirname(snapshotPath), { recursive: true });
  await fs.writeFile(snapshotPath, "reviewed snapshot\n");
  const candidate = buildSnapshot({
    pages: [page()],
    roster,
    currentSnapshot,
  });

  await assert.rejects(
    prepareOfficerProfileWrites({
      repoRoot,
      snapshotPath: profileSnapshotPath,
      snapshot: candidate.snapshot,
      portraitCandidates: candidate.portraitCandidates,
      fetchImpl: async () => {
        throw new Error("network unavailable");
      },
    }),
    /network unavailable/,
  );
  assert.equal(
    await fs.readFile(snapshotPath, "utf8"),
    "reviewed snapshot\n",
  );
});

test("rejects non-Notion attachment hosts before making a request", async () => {
  const repoRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "officer-profile-host-"),
  );
  let requested = false;
  const candidate = buildSnapshot({
    pages: [
      page({
        headshotUrl:
          "https://untrusted-bucket.s3.amazonaws.com/profile_anisha.jpg",
      }),
    ],
    roster,
    currentSnapshot,
  });

  await assert.rejects(
    prepareOfficerProfileWrites({
      repoRoot,
      snapshotPath: profileSnapshotPath,
      snapshot: candidate.snapshot,
      portraitCandidates: candidate.portraitCandidates,
      fetchImpl: async () => {
        requested = true;
        return new Response();
      },
    }),
    /Notion-hosted HTTPS raster/,
  );
  assert.equal(requested, false);
});

test("reports deterministic officer-level drift and requires one explicit mode", () => {
  const candidate = {
    ...currentSnapshot,
    profiles: [
      {
        sourceId: "3ac3e3c8-c9b6-8155-96d5-c35c4b8164fb",
        submittedAt: "2026-07-29T02:02:08Z",
        fullName: "Anisha Pallikonda",
        preferredName: "Anisha",
        image: "/officers/fa26/anisha-reviewed.webp",
        bio: "",
        "personal website": "",
        linkedin: "",
        github: "",
        orcid: "",
      },
    ],
  };

  assert.deepEqual(
    compareOfficerProfileSnapshots(currentSnapshot, candidate),
    {
      hasDrift: true,
      added: ["Anisha Pallikonda"],
      updated: [],
      removed: [],
    },
  );
  assert.equal(
    compareOfficerProfileSnapshots(candidate, structuredClone(candidate))
      .hasDrift,
    false,
  );
  assert.equal(
    parseOfficerProfileSyncMode(["--term", "fa26", "--check"]).mode,
    "check",
  );
  assert.throws(
    () => parseOfficerProfileSyncMode(["--term", "fa26"]),
    /exactly one/,
  );
  assert.throws(
    () =>
      parseOfficerProfileSyncMode([
        "--term",
        "fa26",
        "--check",
        "--write",
      ]),
    /exactly one/,
  );
});
