# Officer data workflow

Officer data is reviewed before publication. Notion is private intake; the
reviewed Git snapshot is the public publication boundary. A normal build never
queries Notion or Google Sheets.

## Updating Fall 2026

1. Confirm the person and approved role in `src/data/officersFa26Roster.json`. The roster, not the form, controls membership and role.
2. Preview the sanitized Notion-to-Git proposal with `npm run officers:notion:dry-run`.
3. Use `npm run officers:notion:check` when a machine-readable drift result is needed. It performs the same read-only comparison and writes no candidate files.
4. When ready to prepare a reviewable change, run `npm run officers:notion:write`. It may update only the public snapshot and matched portrait files in the working tree.
5. Review the complete Git diff. The command never commits, pushes, deploys, or writes back to Notion.
6. Run `npm test` and `npm run validate:officers`.
7. Run the project pre-production checklist, including rendered portrait inspection at desktop and mobile widths.

Duplicate form responses are supported. `compileOfficerDirectory.js` takes the newest nonblank value per public field, so an optional blank in a newer response does not erase a valid earlier response. Names must match a canonical roster name or a deliberately reviewed alias.

### Command guarantees

- `dry-run` fetches, sanitizes, matches, and compares without changing tracked files.
- `check` is also read-only: it exits cleanly when Git matches the sanitized intake, reports drift separately, and treats authentication, schema, or matching failures as errors.
- `write` refuses to overwrite dirty managed files, fingerprints the snapshot and portrait tree before network work, and rechecks that state immediately before committing. It validates a complete candidate in temporary storage before atomically replacing the snapshot or a portrait.
- Repeating a command against unchanged Notion content is idempotent. Portraits are streamed through a 15 MB bound, decoded, metadata-stripped, and normalized before comparison; expiring attachment query strings do not create a diff, while replacing an attachment on an existing response does.
- The roster remains authoritative for membership, roles, order, stable IDs, and fallback portraits. Form answers may enrich only matched officers.

The explicit cohort window and managed paths live in
`scripts/lib/officer-profile-cohorts.js`. The private upstream database ID is
read only from `NOTION_OFFICERS_DB_ID`; it is not serialized into the public
snapshot or browser bundle. Before querying responses, the sync retrieves the
database schema and requires the expected names and Notion property types, so a
renamed or retyped form field is an operational error rather than publishable
blank content.

### Public privacy allowlist

Only these fields may enter `src/data/officerProfilesFa26.json`:

- `sourceId` using the real Notion response page ID for provenance
- `submittedAt`
- `fullName`
- `preferredName`
- `image`
- `bio`
- `personal website`
- `linkedin`
- `github`
- `orcid`

Email, phone number, birthday, scheduling information, internal notes, and
unknown form properties are private and must never be serialized, logged,
uploaded as workflow artifacts, or copied into Git. Upstream database and data
source identifiers must likewise remain outside the browser-facing snapshot.
Automated checks report only the count of unmatched submissions; inspect their
identities inside the private intake rather than exposing them in public Actions
logs.

### Portrait and provenance review

- Store the reviewed current-term portrait at a stable, versioned path under `public/officers/fa26/`.
- Confirm every profile `sourceId` and `submittedAt` traces to the intended form response.
- Never save temporary Notion URLs. Every submitted portrait is decoded and re-encoded as WebP to strip private metadata; a failed or oversized download aborts before the approved snapshot is changed. Replacing a portrait on the same response is detected by normalized content comparison.
- Inspect every changed portrait on desktop and mobile; verify centering through the project pre-production skill.
- Do not publish an ignored importer cache or treat it as an approved snapshot.

## Historical data

The immutable Fall 2025 and Spring 2026 JSON and portrait assets live in:

```text
public/officers/archive/
├── fa25/
└── sp26/
```

These files are tracked so local, staging, and production builds contain the same historical tabs. Do not replace an archive with whichever records happen to be present in a live form database.

## Legacy import utilities

`fetch-officers-fa25.js` and `fetch-officers-notion.js` are retained only as migration helpers for creating an ignored local staging copy under `public/fetched/`. They are not package scripts, are not invoked by GitHub Actions, and their output is not publishable until it has been reviewed and moved into the versioned sources above.

The historical Notion importer uses `NOTION_API_KEY` and `NOTION_OFFICERS_DB_ID` when run manually. Those credentials must remain outside the repository. The website build and deploy workflows do not require them.

Before release, confirm `git ls-files public/fetched` is empty and that no
current or historical page imports from `/fetched/`. Local files there are
scratch/cache output only; because the directory is under `public/`, remove it
from any local release artifact and validate from a clean checkout.

## Drift monitoring

`.github/workflows/officer-profile-drift.yml` is separate from deployment. It
runs manually and weekly with `contents: read`, passes the read-only Notion
credentials only to `npm run officers:notion:check`, and does not upload
candidate profiles or portraits. The existing secret names live in the
organization repository's protected `github-pages` environment; normal build
and deploy steps do not reference them. Drift is a prompt for a maintainer to
run the controlled review flow; it is never permission to commit or publish
automatically.
