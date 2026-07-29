import { serializeOfficerProfileSnapshot } from "./officer-profile-sync-files.js";

export const parseOfficerProfileSyncMode = (args) => {
  const modes = [
    ["--dry-run", "dry-run"],
    ["--check", "check"],
    ["--write", "write"],
  ].filter(([flag]) => args.includes(flag));
  if (modes.length !== 1) {
    throw new Error(
      "Choose exactly one sync mode: --dry-run, --check, or --write",
    );
  }

  const termIndex = args.indexOf("--term");
  const term = termIndex >= 0 ? args[termIndex + 1] : "";
  if (!term || term.startsWith("--")) {
    throw new Error("Pass an explicit cohort with --term, for example --term fa26");
  }

  const recognized = new Set([
    "--dry-run",
    "--check",
    "--write",
    "--term",
    term,
  ]);
  const unknown = args.filter((argument) => !recognized.has(argument));
  if (unknown.length > 0) {
    throw new Error(`Unknown sync argument: ${unknown.join(", ")}`);
  }

  return { mode: modes[0][1], term };
};

export const compareOfficerProfileSnapshots = (current, candidate) => {
  const currentById = new Map(
    current.profiles.map((profile) => [profile.sourceId, profile]),
  );
  const candidateById = new Map(
    candidate.profiles.map((profile) => [profile.sourceId, profile]),
  );
  const added = [];
  const updated = [];
  const removed = [];

  for (const [sourceId, profile] of candidateById) {
    const currentProfile = currentById.get(sourceId);
    if (!currentProfile) {
      added.push(profile.fullName);
    } else if (
      JSON.stringify(currentProfile) !== JSON.stringify(profile)
    ) {
      updated.push(profile.fullName);
    }
  }
  for (const [sourceId, profile] of currentById) {
    if (!candidateById.has(sourceId)) removed.push(profile.fullName);
  }

  for (const names of [added, updated, removed]) {
    names.sort((left, right) => left.localeCompare(right));
  }

  return {
    hasDrift:
      serializeOfficerProfileSnapshot(current) !==
      serializeOfficerProfileSnapshot(candidate),
    added,
    updated,
    removed,
  };
};
