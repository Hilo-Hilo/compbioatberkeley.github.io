# Computational Biology at Berkeley

The public website for Computational Biology at Berkeley, built with Vite, React, TypeScript, shadcn/ui, and Tailwind CSS.

## Local development

```sh
npm ci
npm test
npm run dev
```

Run `npm run build` for the same credential-free production build used by GitHub Pages. The build validates officer data before compiling the site.

## Officer data

Fall 2026 deliberately separates approved roster decisions from submitted public profile content:

- `src/data/officersFa26Roster.json` owns cohort membership, roles, order, stable IDs, and fallback portraits.
- `src/data/officerProfilesFa26.json` is a reviewed, public-only snapshot of the latest officer form responses.
- `src/data/compileOfficerDirectory.js` matches responses to the roster, keeps the newest nonblank public fields, normalizes links, and ignores unmatched people.
- `public/officers/fa26/` stores stable headshot assets.
- `public/officers/archive/` stores immutable Fall 2025 and Spring 2026 snapshots so historical tabs work in a clean checkout.

Never copy private form fields such as email, phone number, or birthday into the repository. Run:

```sh
npm test
npm run validate:officers
```

The validator reports unmatched responses, invalid public links, missing assets, and officers still waiting for a current profile response. See `scripts/README.md` for the update workflow and `.agents/skills/pre-production-checklist/SKILL.md` before a production promotion.

## Deployment

- Pushes to `dev` deploy the staging GitHub Pages site from the `Hilo-Hilo` staging repository.
- Pushes to `main` deploy production from `CompbioAtBerkeley/compbioatberkeley.github.io`.

Neither build reads Notion or Google Sheets credentials. Form intake is reviewed and versioned before publication, so the same commit produces the same site in local, staging, and production environments.
