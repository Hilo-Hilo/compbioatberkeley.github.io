#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

import {
  compileOfficerDirectory,
  normalizePublicUrl,
} from "../src/data/compileOfficerDirectory.js";
import {
  OFFICER_PROFILE_FIELDS,
  validateOfficerProfileSnapshot,
} from "../src/data/officerProfileContract.js";
import { getOfficerProfileCohort } from "./lib/officer-profile-cohorts.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));

const profileCohort = getOfficerProfileCohort("fa26");
const roster = readJson(profileCohort.roster);
const profileSnapshot = readJson(profileCohort.profiles);
const profiles = profileSnapshot.profiles ?? [];

const allowedRosterFields = new Set(["id", "name", "role", "image", "aliases"]);
const allowedProfileFields = new Set(OFFICER_PROFILE_FIELDS);

const errors = [];
const warnings = [];

const validateAllowedFields = (records, allowedFields, label) => {
  records.forEach((record, index) => {
    for (const field of Object.keys(record)) {
      if (!allowedFields.has(field)) {
        errors.push(`${label}[${index}] contains disallowed field "${field}"`);
      }
    }
  });
};

const publicRoot = path.join(repoRoot, "public");
const publicFileFor = (urlPath) => {
  if (!urlPath.startsWith("/") || urlPath.includes("..")) return null;
  const resolved = path.resolve(publicRoot, urlPath.slice(1));
  if (
    resolved !== publicRoot &&
    !resolved.startsWith(`${publicRoot}${path.sep}`)
  ) {
    return null;
  }
  return resolved;
};

const checkedImagePaths = new Set();
const validateImages = async (records, label) => {
  for (const [index, record] of records.entries()) {
    if (!record.image) continue;
    const imagePath = publicFileFor(record.image);
    if (!imagePath || !fs.existsSync(imagePath)) {
      errors.push(`${label}[${index}] references missing image ${record.image}`);
      continue;
    }
    if (checkedImagePaths.has(imagePath)) continue;
    checkedImagePaths.add(imagePath);

    const fileSize = fs.statSync(imagePath).size;
    if (fileSize > 15 * 1024 * 1024) {
      errors.push(`${label}[${index}] image exceeds the 15 MB limit`);
    }

    try {
      const metadata = await sharp(imagePath, {
        limitInputPixels: 40_000_000,
      }).metadata();
      if (!["jpeg", "png", "webp"].includes(metadata.format ?? "")) {
        errors.push(
          `${label}[${index}] image is not a supported JPEG, PNG, or WebP raster`,
        );
      }
      if (!metadata.width || !metadata.height) {
        errors.push(`${label}[${index}] image has invalid dimensions`);
      }
    } catch {
      errors.push(`${label}[${index}] image could not be decoded safely`);
    }
  }
};

errors.push(
  ...validateOfficerProfileSnapshot(profileSnapshot, {
    expectedCohort: "fa26",
    intakeStart: profileCohort.intakeStart,
    intakeEnd: profileCohort.intakeEnd,
  }),
);
validateAllowedFields(roster, allowedRosterFields, "roster");
validateAllowedFields(profiles, allowedProfileFields, "profiles");
await validateImages(roster, "roster");
await validateImages(profiles, "profiles");

const sourceIds = new Set();
profiles.forEach((profile, index) => {
  if (!profile.sourceId || sourceIds.has(profile.sourceId)) {
    errors.push(`profiles[${index}] has a missing or duplicate sourceId`);
  }
  sourceIds.add(profile.sourceId);
  if (
    profile.sourceId &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      profile.sourceId,
    )
  ) {
    errors.push(`profiles[${index}] sourceId is not a Notion page ID`);
  }

  if (
    !profile.submittedAt ||
    Number.isNaN(Date.parse(profile.submittedAt))
  ) {
    errors.push(`profiles[${index}] has an invalid submittedAt timestamp`);
  }

  for (const field of [
    "personal website",
    "linkedin",
    "github",
    "orcid",
  ]) {
    const value = String(profile[field] ?? "").trim();
    if (!value) continue;
    const normalized = normalizePublicUrl(value, field);
    if (!normalized) {
      errors.push(`profiles[${index}] has an invalid ${field}`);
    } else if (normalized !== value) {
      errors.push(`profiles[${index}] ${field} is not normalized`);
    }
  }
});

let compiled;
try {
  compiled = compileOfficerDirectory(roster, profiles);
} catch (error) {
  errors.push(error instanceof Error ? error.message : String(error));
}

if (compiled) {
  if (compiled.officers.length !== roster.length) {
    errors.push("compiled roster length does not match the approved roster");
  }
  if (compiled.audit.unmatchedSubmissions.length > 0) {
    errors.push(
      `unmatched submissions: ${compiled.audit.unmatchedSubmissions.join(", ")}`,
    );
  }
  if (compiled.audit.invalidLinks.length > 0) {
    warnings.push(
      ...compiled.audit.invalidLinks.map(
        ({ officer, field, sourceId }) =>
          `${officer}: ignored invalid ${field} from ${sourceId}`,
      ),
    );
  }
  if (compiled.audit.officersWithoutSubmission.length > 0) {
    warnings.push(
      `awaiting current profile form: ${compiled.audit.officersWithoutSubmission.join(", ")}`,
    );
  }
}

for (const semester of ["fa25", "sp26"]) {
  const relativeJson = `public/officers/archive/${semester}/officers-${semester}.json`;
  const officers = readJson(relativeJson);
  await validateImages(officers, `${semester} archive`);
  officers.forEach((officer, index) => {
    for (const field of [
      "personal website",
      "linkedin",
      "github",
      "orcid",
    ]) {
      const value = String(officer[field] ?? "").trim();
      if (
        value &&
        (!/^https?:\/\//i.test(value) || !normalizePublicUrl(value, field))
      ) {
        errors.push(
          `${semester} archive[${index}] has invalid ${field}: ${value}`,
        );
      }
    }
  });
}

if (warnings.length > 0) {
  console.warn("Officer data warnings:");
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length > 0) {
  console.error("Officer data validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Officer data valid: ${roster.length} Fall 2026 officers, ${profiles.length} reviewed form responses`,
);
