export const OFFICER_PUBLISHABLE_CONTENT_FIELDS = Object.freeze([
  "image",
  "bio",
  "personal website",
  "linkedin",
  "github",
  "orcid",
]);

export const OFFICER_PROFILE_FIELDS = Object.freeze([
  "sourceId",
  "submittedAt",
  "fullName",
  "preferredName",
  ...OFFICER_PUBLISHABLE_CONTENT_FIELDS,
]);

export const OFFICER_PROFILE_SNAPSHOT_FIELDS = Object.freeze([
  "schemaVersion",
  "cohort",
  "profiles",
]);

const NOTION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isPlainObject = (value) =>
  Boolean(value) &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype;

const unknownFields = (record, allowedFields) =>
  Object.keys(record).filter((field) => !allowedFields.includes(field));

const localPortraitPatternFor = (cohort) =>
  new RegExp(`^/officers/${cohort.replace(/[^a-z0-9-]/gi, "")}/[^/]+\\.(?:jpe?g|png|webp)$`, "i");

export const validateOfficerProfileSnapshot = (
  snapshot,
  { expectedCohort, intakeStart, intakeEnd } = {},
) => {
  const errors = [];
  if (!isPlainObject(snapshot)) {
    return ["profile snapshot must be a JSON object"];
  }

  for (const field of unknownFields(
    snapshot,
    OFFICER_PROFILE_SNAPSHOT_FIELDS,
  )) {
    errors.push(`profile snapshot contains disallowed field "${field}"`);
  }
  for (const field of OFFICER_PROFILE_SNAPSHOT_FIELDS) {
    if (!(field in snapshot)) {
      errors.push(`profile snapshot is missing required field "${field}"`);
    }
  }

  if (snapshot.schemaVersion !== 1) {
    errors.push("profile snapshot schemaVersion must be 1");
  }
  if (
    typeof snapshot.cohort !== "string" ||
    !/^[a-z]{2}\d{2}$/i.test(snapshot.cohort)
  ) {
    errors.push("profile snapshot cohort must look like fa26");
  } else if (expectedCohort && snapshot.cohort !== expectedCohort) {
    errors.push(
      `profile snapshot cohort ${snapshot.cohort} does not match ${expectedCohort}`,
    );
  }
  const intakeStartTime = Date.parse(intakeStart);
  const intakeEndTime = Date.parse(intakeEnd);
  const hasIntakeWindow = intakeStart !== undefined || intakeEnd !== undefined;
  const hasValidIntakeWindow =
    hasIntakeWindow &&
    !Number.isNaN(intakeStartTime) &&
    !Number.isNaN(intakeEndTime) &&
    intakeStartTime < intakeEndTime;
  if (hasIntakeWindow && !hasValidIntakeWindow) {
    errors.push(
      "intakeStart and intakeEnd must be an increasing timestamp window",
    );
  }

  if (!Array.isArray(snapshot.profiles)) {
    errors.push("profile snapshot profiles must be an array");
    return errors;
  }

  const portraitPattern = localPortraitPatternFor(snapshot.cohort ?? "");
  const sourceIds = new Set();
  let previousSortKey = "";

  snapshot.profiles.forEach((profile, index) => {
    const label = `profiles[${index}]`;
    if (!isPlainObject(profile)) {
      errors.push(`${label} must be a JSON object`);
      return;
    }
    for (const field of unknownFields(profile, OFFICER_PROFILE_FIELDS)) {
      errors.push(`${label} contains disallowed field "${field}"`);
    }
    for (const field of OFFICER_PROFILE_FIELDS) {
      if (!(field in profile)) {
        errors.push(`${label} is missing required field "${field}"`);
      } else if (typeof profile[field] !== "string") {
        errors.push(`${label}.${field} must be a string`);
      }
    }

    if (!NOTION_ID_PATTERN.test(String(profile.sourceId ?? ""))) {
      errors.push(`${label}.sourceId must be a Notion page UUID`);
    } else if (sourceIds.has(profile.sourceId)) {
      errors.push(`${label}.sourceId is duplicated`);
    }
    sourceIds.add(profile.sourceId);

    const submittedTime = Date.parse(profile.submittedAt);
    if (Number.isNaN(submittedTime)) {
      errors.push(`${label}.submittedAt must be a timestamp`);
    } else if (
      hasValidIntakeWindow &&
      (submittedTime < intakeStartTime || submittedTime >= intakeEndTime)
    ) {
      errors.push(`${label}.submittedAt is outside the cohort intake window`);
    }

    if (
      profile.image &&
      (!portraitPattern.test(profile.image) || profile.image.includes(".."))
    ) {
      errors.push(
        `${label}.image must be a local public path inside /officers/${snapshot.cohort}/`,
      );
    }

    const sortKey = `${profile.submittedAt}\u0000${profile.sourceId}`;
    if (previousSortKey && sortKey.localeCompare(previousSortKey) < 0) {
      errors.push("profile snapshot profiles must be sorted deterministically");
    }
    previousSortKey = sortKey;
  });

  return errors;
};
