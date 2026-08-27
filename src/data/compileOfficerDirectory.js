import { OFFICER_PUBLISHABLE_CONTENT_FIELDS } from "./officerProfileContract.js";

const PROFILE_FIELDS = OFFICER_PUBLISHABLE_CONTENT_FIELDS;

const URL_FIELDS = new Set([
  "personal website",
  "linkedin",
  "github",
  "orcid",
]);

export const normalizeOfficerName = (value) =>
  String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

export const normalizePublicUrl = (value, field = "personal website") => {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";

  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    if (/^www\./i.test(candidate)) {
      candidate = `https://${candidate}`;
    } else if (/^(linkedin|github|orcid)\.org\//i.test(candidate)) {
      candidate = `https://${candidate}`;
    } else if (/^(linkedin|github)\.com\//i.test(candidate)) {
      candidate = `https://${candidate}`;
    } else if (field === "linkedin" && !candidate.includes("/")) {
      candidate = `https://www.linkedin.com/in/${candidate}`;
    } else if (field === "github" && !candidate.includes("/")) {
      candidate = `https://github.com/${candidate}`;
    } else if (field === "orcid" && !candidate.includes("/")) {
      candidate = `https://orcid.org/${candidate}`;
    } else {
      candidate = `https://${candidate}`;
    }
  }

  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";

    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    if (
      field === "linkedin" &&
      (hostname !== "linkedin.com" || !/^\/in\/[^/]+\/?$/i.test(url.pathname))
    ) {
      return "";
    }
    if (
      field === "github" &&
      (hostname !== "github.com" || !/^\/[^/]+\/?$/i.test(url.pathname))
    ) {
      return "";
    }
    if (
      field === "orcid" &&
      (hostname !== "orcid.org" ||
        !/^\/\d{4}-\d{4}-\d{4}-\d{3}[\dX]\/?$/i.test(url.pathname))
    ) {
      return "";
    }

    return url.toString();
  } catch {
    return "";
  }
};

const emptyProfile = () => ({
  "personal website": "",
  linkedin: "",
  github: "",
  orcid: "",
  bio: "",
});

export const compileOfficerDirectory = (roster, submissions) => {
  const rosterIds = new Set();
  const matchIndex = new Map();
  const invalidLinks = [];

  for (const entry of roster) {
    if (!entry.id || rosterIds.has(entry.id)) {
      throw new Error(`Duplicate or missing roster id: ${entry.id || "(blank)"}`);
    }
    rosterIds.add(entry.id);

    for (const candidate of [entry.name, ...(entry.aliases ?? [])]) {
      const normalized = normalizeOfficerName(candidate);
      const existing = matchIndex.get(normalized);
      if (existing && existing !== entry.id) {
        throw new Error(
          `Ambiguous officer name or alias "${candidate}" matches ${existing} and ${entry.id}`,
        );
      }
      matchIndex.set(normalized, entry.id);
    }
  }

  const submissionsByOfficer = new Map();
  const unmatchedSubmissions = [];

  for (const submission of submissions) {
    const officerId = matchIndex.get(normalizeOfficerName(submission.fullName));
    if (!officerId) {
      unmatchedSubmissions.push(submission.fullName || "(blank name)");
      continue;
    }
    if (!submissionsByOfficer.has(officerId)) {
      submissionsByOfficer.set(officerId, []);
    }
    submissionsByOfficer.get(officerId).push(submission);
  }

  const officers = roster.map((entry) => {
    const officer = {
      ...emptyProfile(),
      name: entry.name,
      role: entry.role,
      image: entry.image || "",
    };
    for (const field of PROFILE_FIELDS) {
      const rosterValue = String(entry[field] ?? "").trim();
      if (rosterValue) officer[field] = rosterValue;
    }

    const officerSubmissions = [...(submissionsByOfficer.get(entry.id) ?? [])].sort(
      (a, b) => {
        const timeDifference =
          Date.parse(b.submittedAt || 0) - Date.parse(a.submittedAt || 0);
        if (timeDifference !== 0) return timeDifference;
        return String(b.sourceId ?? "").localeCompare(String(a.sourceId ?? ""));
      },
    );

    for (const field of PROFILE_FIELDS) {
      if (!URL_FIELDS.has(field)) {
        const submittedValue = officerSubmissions
          .map((submission) => String(submission[field] ?? "").trim())
          .find(Boolean);
        if (submittedValue) officer[field] = submittedValue;
        continue;
      }

      for (const submission of officerSubmissions) {
        const submittedValue = String(submission[field] ?? "").trim();
        if (!submittedValue) continue;
        const normalizedUrl = normalizePublicUrl(submittedValue, field);
        if (normalizedUrl) {
          officer[field] = normalizedUrl;
          break;
        }
        invalidLinks.push({
          officer: entry.name,
          field,
          sourceId: submission.sourceId || "",
        });
      }
    }

    return officer;
  });

  return {
    officers,
    audit: {
      unmatchedSubmissions,
      invalidLinks,
      officersWithoutSubmission: roster
        .filter(
          (entry) =>
            !submissionsByOfficer.has(entry.id) &&
            !PROFILE_FIELDS.some(
              (field) =>
                field !== "image" && String(entry[field] ?? "").trim(),
            ),
        )
        .map((entry) => entry.name),
    },
  };
};
