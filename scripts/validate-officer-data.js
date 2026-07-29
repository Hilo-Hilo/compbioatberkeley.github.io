#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  compileOfficerDirectory,
  normalizePublicUrl,
} from "../src/data/compileOfficerDirectory.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));

const rosterPath = "src/data/officersFa26Roster.json";
const profilesPath = "src/data/officerProfilesFa26.json";
const roster = readJson(rosterPath);
const profiles = readJson(profilesPath);

const allowedRosterFields = new Set(["id", "name", "role", "image", "aliases"]);
const allowedProfileFields = new Set([
  "sourceId",
  "submittedAt",
  "fullName",
  "preferredName",
  "image",
  "bio",
  "personal website",
  "linkedin",
  "github",
  "orcid",
]);

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

const publicFileFor = (urlPath) => {
  if (!urlPath.startsWith("/") || urlPath.includes("..")) return null;
  return path.join(repoRoot, "public", urlPath.slice(1));
};

const validateImages = (records, label) => {
  records.forEach((record, index) => {
    if (!record.image) return;
    const imagePath = publicFileFor(record.image);
    if (!imagePath || !fs.existsSync(imagePath)) {
      errors.push(`${label}[${index}] references missing image ${record.image}`);
    }
  });
};

validateAllowedFields(roster, allowedRosterFields, "roster");
validateAllowedFields(profiles, allowedProfileFields, "profiles");
validateImages(roster, "roster");
validateImages(profiles, "profiles");

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
  validateImages(officers, `${semester} archive`);
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
