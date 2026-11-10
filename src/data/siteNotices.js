const fields = ["id", "title", "startsAt", "endsAt", "dateLabel", "shortDateLabel", "timeLabel", "description", "url", "linkLabel"];

export function validateNotices(notices) {
  if (!Array.isArray(notices)) throw new Error("Notices must be an array");
  const ids = new Set();
  for (const notice of notices) {
    for (const field of fields) {
      if (typeof notice[field] !== "string" || !notice[field].trim() || /[\r\n]/.test(notice[field])) {
        throw new Error(`Notice requires a single-line ${field}`);
      }
    }
    if (Object.keys(notice).some((field) => !fields.includes(field))) throw new Error("Unknown notice field");
    if (!/^[a-z0-9-]+$/.test(notice.id) || ids.has(notice.id)) throw new Error("Notice IDs must be unique slugs");
    ids.add(notice.id);
    for (const field of ["startsAt", "endsAt"]) {
      if (!/(?:Z|[+-]\d{2}:\d{2})$/.test(notice[field]) || !Number.isFinite(Date.parse(notice[field]))) {
        throw new Error(`Notice ${field} requires a valid timezone-aware timestamp`);
      }
    }
    if (Date.parse(notice.endsAt) <= Date.parse(notice.startsAt)) throw new Error("Notice must end after it starts");
    const url = new URL(notice.url);
    if (url.protocol !== "https:" || url.username || url.password) throw new Error("Notice links must use HTTPS without credentials");
  }
  return notices;
}

export function activeNotices(notices, now = Date.now()) {
  if (!Number.isFinite(now)) throw new Error("Invalid notice clock");
  return validateNotices(notices).filter((notice) => Date.parse(notice.endsAt) > now);
}

export function renderNoticeGuide(template, notices) {
  validateNotices(notices);
  const escape = (value) => value.replace(/[\\[\]*_<>`]/g, "\\$&");
  const section = notices.length ? `## Current notices\n\n${notices.map((notice) =>
    `- [${escape(notice.title)}](${notice.url}): ${escape(notice.dateLabel)}, ${escape(notice.timeLabel)}. ${escape(notice.description)} Expires ${notice.endsAt}.`
  ).join("\n")}\n` : "";
  const marker = /<!-- notices:start -->[\s\S]*?<!-- notices:end -->/;
  if (!marker.test(template)) throw new Error("Missing notice guide markers");
  return template.replace(marker, `<!-- notices:start -->\n${section}<!-- notices:end -->`);
}
