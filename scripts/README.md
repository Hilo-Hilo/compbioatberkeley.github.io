# Officer data workflow

Officer data is reviewed before publication. A normal build never queries Notion or Google Sheets.

## Updating Fall 2026

1. Confirm the person and approved role in `src/data/officersFa26Roster.json`. The roster, not the form, controls membership and role.
2. Copy only the latest public form fields into `src/data/officerProfilesFa26.json`: the real Notion response page ID as `sourceId`, submission time, full and preferred names, headshot path, bio, personal website, LinkedIn, GitHub, and ORCID.
3. Save the reviewed headshot under `public/officers/fa26/` and reference that stable path from the profile snapshot.
4. Do not copy email, phone, birthday, scheduling, or any other private response field.
5. Run `npm test` and `npm run validate:officers`.
6. Run the project pre-production checklist, including rendered portrait inspection at desktop and mobile widths.

Duplicate form responses are supported. `compileOfficerDirectory.js` takes the newest nonblank value per public field, so an optional blank in a newer response does not erase a valid earlier response. Names must match a canonical roster name or a deliberately reviewed alias.

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
