#!/usr/bin/env node

import "dotenv/config";

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { Client } from "@notionhq/client";

import { compileOfficerDirectory } from "../src/data/compileOfficerDirectory.js";
import { validateOfficerProfileSnapshot } from "../src/data/officerProfileContract.js";
import {
  buildOfficerProfileSnapshot,
  queryAllNotionPages,
} from "./lib/build-officer-profile-snapshot.js";
import {
  compareOfficerProfileSnapshots,
  parseOfficerProfileSyncMode,
} from "./lib/officer-profile-sync-command.js";
import {
  assertManagedOfficerProfileStateUnchanged,
  captureManagedOfficerProfileState,
  commitManagedWrites,
  prepareOfficerProfileWrites,
} from "./lib/officer-profile-sync-files.js";
import { getOfficerProfileCohort } from "./lib/officer-profile-cohorts.js";
import { validateNotionOfficerIntakeSchema } from "./lib/validate-notion-officer-intake-schema.js";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));

const managedFilesAreClean = ({ profiles, portraits }) => {
  const status = execFileSync(
    "git",
    ["status", "--porcelain", "--", profiles, portraits],
    {
      cwd: repoRoot,
      encoding: "utf8",
    },
  ).trim();
  if (status) {
    throw new Error(
      `Refusing --write because managed officer files are dirty:\n${status}`,
    );
  }
};

const hashFile = (filePath) =>
  crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");

const inspectPreparedPortraits = (writes) => {
  const changed = [];
  for (const write of writes.filter(({ publicPath }) => publicPath)) {
    if (
      !fs.existsSync(write.targetPath) ||
      hashFile(write.targetPath) !== write.sha256
    ) {
      changed.push(write.publicPath);
    }
  }
  return changed;
};

const formatNames = (label, names) => {
  if (names.length === 0) return;
  console.log(`${label} (${names.length}): ${names.join(", ")}`);
};

const run = async () => {
  const { mode, term } = parseOfficerProfileSyncMode(process.argv.slice(2));
  const files = getOfficerProfileCohort(term);

  const roster = readJson(files.roster);
  const currentSnapshot = readJson(files.profiles);
  const currentErrors = validateOfficerProfileSnapshot(currentSnapshot, {
    expectedCohort: term,
    intakeStart: files.intakeStart,
    intakeEnd: files.intakeEnd,
  });
  if (currentErrors.length > 0) {
    throw new Error(
      `The reviewed profile snapshot is invalid:\n- ${currentErrors.join("\n- ")}`,
    );
  }

  let managedState;
  if (mode === "write") {
    managedFilesAreClean(files);
    managedState = await captureManagedOfficerProfileState({
      repoRoot,
      snapshotPath: files.profiles,
      portraitDirectory: files.portraits,
    });
  }

  const notionToken = process.env.NOTION_API_KEY;
  const configuredDatabaseId = process.env.NOTION_OFFICERS_DB_ID;
  if (!notionToken || !configuredDatabaseId) {
    throw new Error(
      "NOTION_API_KEY and NOTION_OFFICERS_DB_ID are required for controlled profile sync",
    );
  }
  const notion = new Client({ auth: notionToken });
  const database = await notion.databases.retrieve({
    database_id: configuredDatabaseId,
  });
  validateNotionOfficerIntakeSchema(database);
  const pages = await queryAllNotionPages(
    notion,
    configuredDatabaseId,
    {
      intakeStart: files.intakeStart,
      intakeEnd: files.intakeEnd,
    },
  );
  const { snapshot, portraitCandidates, audit } =
    buildOfficerProfileSnapshot({
      pages,
      roster,
      currentSnapshot,
      intakeStart: files.intakeStart,
      intakeEnd: files.intakeEnd,
    });
  if (audit.unmatchedSubmissions.length > 0) {
    throw new Error(
      `${audit.unmatchedSubmissions.length} in-window submission${audit.unmatchedSubmissions.length === 1 ? "" : "s"} did not match the reviewed roster. Review the private intake directly; unmatched names were not written to logs.`,
    );
  }
  if (audit.unsupportedPortraits.length > 0) {
    throw new Error(
      `Only Notion-hosted file uploads are accepted for portraits: ${audit.unsupportedPortraits.join(", ")}`,
    );
  }

  const candidateErrors = validateOfficerProfileSnapshot(snapshot, {
    expectedCohort: term,
    intakeStart: files.intakeStart,
    intakeEnd: files.intakeEnd,
  });
  if (candidateErrors.length > 0) {
    throw new Error(
      `The sanitized candidate is invalid:\n- ${candidateErrors.join("\n- ")}`,
    );
  }

  const compiled = compileOfficerDirectory(roster, snapshot.profiles);
  if (compiled.audit.unmatchedSubmissions.length > 0) {
    throw new Error("The sanitized candidate contains unmatched submissions");
  }

  const writes = await prepareOfficerProfileWrites({
    repoRoot,
    snapshotPath: files.profiles,
    snapshot,
    portraitCandidates,
    intakeStart: files.intakeStart,
    intakeEnd: files.intakeEnd,
  });
  const profileDrift = compareOfficerProfileSnapshots(
    currentSnapshot,
    snapshot,
  );
  const changedPortraits = inspectPreparedPortraits(writes);
  const hasDrift = profileDrift.hasDrift || changedPortraits.length > 0;

  console.log(
    `Officer profile ${mode} (${term}): ${snapshot.profiles.length} reviewed response${snapshot.profiles.length === 1 ? "" : "s"}, ${compiled.audit.officersWithoutSubmission.length} officer${compiled.audit.officersWithoutSubmission.length === 1 ? "" : "s"} awaiting a current response.`,
  );
  formatNames("Added responses", profileDrift.added);
  formatNames("Updated responses", profileDrift.updated);
  formatNames("Removed responses", profileDrift.removed);
  if (changedPortraits.length > 0) {
    console.log(`Changed portraits (${changedPortraits.length})`);
  }
  console.log(hasDrift ? "Public profile drift detected." : "No public profile drift.");

  if (mode === "write") {
    if (!hasDrift) return;
    await assertManagedOfficerProfileStateUnchanged({
      repoRoot,
      snapshotPath: files.profiles,
      portraitDirectory: files.portraits,
      expectedState: managedState,
    });
    await commitManagedWrites(writes);
    console.log(
      "Prepared a reviewed working-tree change. No commit, push, deploy, or Notion write was performed.",
    );
    return;
  }
  if (mode === "check" && hasDrift) {
    process.exitCode = 2;
  }
};

run().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Officer profile sync failed",
  );
  process.exitCode = 1;
});
