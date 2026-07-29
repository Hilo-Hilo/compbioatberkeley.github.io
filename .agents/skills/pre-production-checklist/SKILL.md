---
name: pre-production-checklist
description: Run and maintain the Computational Biology at Berkeley pre-production checklist before promoting dev to production. Use when preparing a release, reviewing the staging site, changing officer photos, or deciding whether the website is ready for main.
---

# Pre-Production Checklist

Treat staging as the release candidate. Run this checklist before promoting `dev` to `main`, and record any failed gate instead of treating a successful build as production approval.

## Gate 1 — Officer portrait framing

Run this gate first whenever an officer photo, the officer-card crop, or officer data has changed.

1. Inspect every added or modified portrait on the rendered `/officers` page at desktop and mobile widths.
2. Confirm the face is approximately centered in the visible 4:3 image frame, with comfortable space around the head and shoulders.
3. Confirm the portrait is not accidentally enlarged, clipped at the forehead or chin, or pushed toward an edge.
4. Correct composition with a per-photo `object-position` entry in `src/data/officerPortraits.ts`. Preserve the source image and avoid destructive recropping when an offset is sufficient.
5. Keep the default framing at `50% 50%`; add an override only when the rendered crop needs it.
6. If depth is useful, prefer a restrained card shadow or lift. Do not add image scale that makes the face feel more zoomed-in.
7. Recheck the fallback image and all unmodified portraits to ensure the shared card behavior has not regressed.

This gate passes only when every changed portrait has been visually checked in its rendered card and each face is comfortably framed at both widths. TypeScript or build success alone does not pass the gate.

## Gate 2 — `llms.txt` accuracy

Run this gate whenever public routes, the canonical domain, page purpose, contact destinations, or other material site content changes.

1. Treat `public/llms.txt` as the source file that Vite publishes at `/llms.txt`.
2. Compare its main-page links with the public routes in `src/App.tsx`.
3. Compare its descriptions and external links with the current page content, `CNAME`, and shared navigation/footer destinations.
4. Keep the file concise and public-safe. Do not include secrets, private contact information, unpublished data, or temporary staging URLs.
5. Preserve the `llms.txt` structure: one H1 title, a short blockquote summary, optional explanatory text, and H2 sections containing annotated Markdown links.
6. After building, confirm `dist/llms.txt` exists and matches `public/llms.txt`.
7. After pushing `dev`, request the staging `llms.txt` URL directly and confirm it returns the expected plain-text content. After production deployment, repeat the check at `https://compbioatberkeley.github.io/llms.txt`.

This gate passes only when the file accurately describes the current public site, all listed destinations are intentional, and the deployed copy is reachable without authentication.

## Gate 3 — Officer profile publication

Run this gate whenever the officer roster, a form-response snapshot, profile links, bios, or officer-data build logic changes.

1. Run `npm test` and `npm run validate:officers`.
2. Confirm `src/data/officersFa26Roster.json` is the only authority for cohort membership, roles, order, stable IDs, and fallback portraits.
3. Confirm `src/data/officerProfilesFa26.json` contains the real Notion response page ID for provenance and only public profile fields copied from reviewed form responses. Never add email addresses, phone numbers, birthdays, or other private form answers.
4. Review every unmatched submission, invalid profile link, and officer without a current response reported by the validator. An officer without a response may retain only the roster fallback; do not invent a bio or personal link.
5. On the rendered page, open at least one complete profile and confirm its full bio and Website, LinkedIn, GitHub, and ORCID destinations are labeled, keyboard accessible, and correct.
6. Confirm every added or replaced headshot path resolves in a clean build, and complete Gate 1 for its framing.
7. Confirm the Fall 2025 and Spring 2026 archive tabs load from the tracked files under `public/officers/archive/`; a build must not require Notion, Google Sheets, or a prior production deployment.

This gate passes only when the published roster matches the approved cohort, current public submissions enrich the correct people, invalid or private form values cannot leak through, and all officer tabs work from a clean checkout.

## Release discipline

- Run checks against the public staging URL after pushing `dev`.
- Leave `main` untouched until every checklist gate passes.
- Add future gates to this file in release order so this skill remains the single source of truth.
