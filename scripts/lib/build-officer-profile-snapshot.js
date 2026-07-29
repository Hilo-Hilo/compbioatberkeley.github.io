import {
  normalizeOfficerName,
  normalizePublicUrl,
} from "../../src/data/compileOfficerDirectory.js";
export { OFFICER_PROFILE_FIELDS as PUBLIC_PROFILE_FIELDS } from "../../src/data/officerProfileContract.js";

const textFromProperty = (property) => {
  const values = property?.title ?? property?.rich_text ?? [];
  return values.map((value) => value?.plain_text ?? "").join("").trim();
};

const urlFromProperty = (property, field) =>
  normalizePublicUrl(property?.url, field);

const portraitFromProperty = (property) => {
  const file = property?.files?.[0];
  if (!file) return { sourceUrl: "", unsupported: false };
  if (file.type !== "file") {
    return { sourceUrl: "", unsupported: true };
  }
  return {
    sourceUrl: String(file.file?.url ?? "").trim(),
    unsupported: false,
  };
};

const buildRosterIndex = (roster) => {
  const index = new Map();
  for (const officer of roster) {
    for (const candidate of [officer.name, ...(officer.aliases ?? [])]) {
      const normalized = normalizeOfficerName(candidate);
      const existing = index.get(normalized);
      if (existing && existing.id !== officer.id) {
        throw new Error(
          `Ambiguous officer name or alias "${candidate}" matches ${existing.id} and ${officer.id}`,
        );
      }
      index.set(normalized, officer);
    }
  }
  return index;
};

const versionedPortraitPath = (
  snapshot,
  officer,
  submittedAt,
  sourceId,
) => {
  const date = new Date(submittedAt).toISOString().slice(0, 10);
  const sourceVersion = sourceId.replace(/[^a-z0-9]/gi, "").slice(0, 8);
  return `/officers/${snapshot.cohort}/${officer.id}-${date}-${sourceVersion}.webp`;
};

export const buildOfficerProfileSnapshot = ({
  pages,
  roster,
  currentSnapshot,
  intakeStart,
  intakeEnd,
}) => {
  const rosterIndex = buildRosterIndex(roster);
  const currentBySourceId = new Map(
    currentSnapshot.profiles.map((profile) => [profile.sourceId, profile]),
  );
  const profiles = [];
  const portraitCandidates = [];
  const unmatchedSubmissions = [];
  const unsupportedPortraits = [];
  let outsideCohortCount = 0;

  const intakeStartTime = Date.parse(intakeStart);
  const intakeEndTime = Date.parse(intakeEnd);
  if (
    Number.isNaN(intakeStartTime) ||
    Number.isNaN(intakeEndTime) ||
    intakeStartTime >= intakeEndTime
  ) {
    throw new Error(
      "Officer profile intakeStart and intakeEnd must be an increasing timestamp window",
    );
  }

  for (const page of pages) {
    const submittedAt = String(page.created_time ?? "");
    const submittedTime = Date.parse(submittedAt);
    if (
      Number.isNaN(submittedTime) ||
      submittedTime < intakeStartTime ||
      submittedTime >= intakeEndTime
    ) {
      outsideCohortCount += 1;
      continue;
    }

    const properties = page.properties ?? {};
    const fullName =
      textFromProperty(properties["Full Name"]) ||
      textFromProperty(properties.Name);
    const officer = rosterIndex.get(normalizeOfficerName(fullName));
    if (!officer) {
      unmatchedSubmissions.push(fullName || "(blank name)");
      continue;
    }

    const sourceId = String(page.id ?? "");
    const existing = currentBySourceId.get(sourceId);
    const existingOfficer = existing
      ? rosterIndex.get(normalizeOfficerName(existing.fullName))
      : undefined;
    const versionedImage = versionedPortraitPath(
      currentSnapshot,
      officer,
      submittedAt,
      sourceId,
    );
    const reviewedImage =
      existingOfficer?.id === officer.id &&
      existing.image === versionedImage
        ? existing.image
        : "";
    const portrait = portraitFromProperty(properties.headshot);
    if (portrait.unsupported) unsupportedPortraits.push(fullName);
    const image = portrait.unsupported
      ? reviewedImage || ""
      : portrait.sourceUrl
        ? versionedImage
        : "";

    profiles.push({
      sourceId,
      submittedAt,
      fullName,
      preferredName: textFromProperty(properties["Preferred Name"]),
      image,
      bio: textFromProperty(properties.Bio),
      "personal website": urlFromProperty(
        properties["Personal Website"],
        "personal website",
      ),
      linkedin: urlFromProperty(properties.Linkedin, "linkedin"),
      github: urlFromProperty(properties.GitHub, "github"),
      orcid: urlFromProperty(properties.ORCID, "orcid"),
    });

    if (portrait.sourceUrl) {
      portraitCandidates.push({
        sourceId,
        officerId: officer.id,
        publicPath: image,
        sourceUrl: portrait.sourceUrl,
      });
    }
  }

  profiles.sort((left, right) => {
    const timeDifference =
      Date.parse(left.submittedAt) - Date.parse(right.submittedAt);
    if (timeDifference !== 0) return timeDifference;
    return left.sourceId.localeCompare(right.sourceId);
  });

  portraitCandidates.sort((left, right) =>
    left.publicPath.localeCompare(right.publicPath),
  );
  unmatchedSubmissions.sort((left, right) => left.localeCompare(right));
  unsupportedPortraits.sort((left, right) => left.localeCompare(right));

  return {
    snapshot: {
      ...currentSnapshot,
      profiles,
    },
    portraitCandidates,
    audit: {
      outsideCohortCount,
      unmatchedSubmissions,
      unsupportedPortraits,
    },
  };
};

export const queryAllNotionPages = async (
  notion,
  databaseId,
  { intakeStart, intakeEnd },
) => {
  const results = [];
  let startCursor;
  const filter = {
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

  do {
    const request = {
      database_id: databaseId,
      page_size: 100,
      filter,
      ...(startCursor ? { start_cursor: startCursor } : {}),
    };
    const response = await notion.databases.query(request);
    results.push(...response.results);
    if (response.has_more && !response.next_cursor) {
      throw new Error("Notion pagination ended without a next cursor");
    }
    startCursor = response.has_more ? response.next_cursor : undefined;
  } while (startCursor);

  return results;
};
