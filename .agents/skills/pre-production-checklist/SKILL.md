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

## Gate 3 — Search discovery and route metadata

Run this gate whenever public routes, metadata, canonical-domain behavior, or the Pages build changes.

1. Treat `src/data/siteIdentity.json` and `src/data/sitePages.json` as the shared registries for public identity, canonical origin, indexable routes, and route-specific titles and descriptions. Compare them with the public routes in `src/App.tsx` and the main-page links in `public/llms.txt`.
2. Run `npm test` and `npm run build`. Confirm every registered route produces `dist/<route>/index.html` with rendered page content rather than an empty React root.
3. Serve `dist` with a plain static server and request every canonical route directly. Each registered route must return `200`; unknown and `/concepts` routes must remain non-indexable.
4. Inspect each generated page's initial HTML. Confirm it has one unique title, description, self-referencing canonical URL, Open Graph URL, `index, follow` directive, Google Search Console verification tag, and valid Organization/WebPage JSON-LD.
5. Confirm `dist/sitemap.xml` lists every registered production canonical exactly once and no staging, concept-review, or unknown URL. Confirm `dist/robots.txt` allows crawling and references the production sitemap.
6. Run a staging build with `VITE_NOINDEX=true` and the staging `VITE_SITE_ORIGIN`. Confirm every generated page says `noindex, nofollow`, `dist/robots.txt` allows crawlers to fetch and observe that directive without advertising a sitemap, and no sitemap is published. On GitHub project Pages, remember that a robots file below the host root is not a host-wide crawl policy.
7. After deployment, request the production routes, `/robots.txt`, and `/sitemap.xml` directly. In Google Search Console, submit the sitemap and use URL Inspection on the homepage and at least one inner page.

This gate passes only when production routes are directly crawlable with consistent canonical metadata, preview routes cannot become duplicate search results, and the deployed sitemap matches the public route registry.

## Gate 4 — Officer profile publication

Run this gate whenever the officer roster, a form-response snapshot, profile links, bios, or officer-data build logic changes.

1. Run `npm test` and `npm run validate:officers`.
2. Confirm `src/data/officersFa26Roster.json` is the only authority for cohort membership, roles, order, stable IDs, and reviewed fallback public content. For manual submissions received outside Notion, publish only the same allowlisted public content fields and never fabricate a Notion provenance ID.
3. Treat Notion as private intake. Use `officers:notion:dry-run` or `officers:notion:check` before `officers:notion:write`, then inspect the resulting Git diff. Confirm the sync did not commit, push, deploy, or write back to Notion.
4. Confirm `src/data/officerProfilesFa26.json` contains the real Notion response page ID for provenance and only the allowlisted public fields: source ID, submission time, full and preferred names, headshot path, bio, personal website, LinkedIn, GitHub, and ORCID. Confirm upstream database/data-source IDs and the intake window are absent from this browser-facing snapshot.
5. Search the diff for email addresses, phone numbers, birthdays, scheduling information, internal notes, and unknown form properties. None may enter Git, logs, or workflow artifacts.
6. Review every unmatched submission, invalid profile link, and officer without a current response reported by the validator. An officer without a response may retain only the roster fallback; do not invent a bio or personal link.
7. Confirm write preparation was atomic and idempotent: dirty managed files were not overwritten, managed files were rechecked after network work, validation completed before replacement, and repeating the sync against unchanged source data creates no diff.
8. Confirm every replaced portrait uses its stable versioned path, matches the recorded response provenance, contains no private metadata, and resolves in a clean build. Confirm changing an attachment on the same response is detected. Complete Gate 1 for its rendered framing.
9. Confirm `public/fetched` remains untracked, no page imports from `/fetched/`, and a clean release artifact does not contain local legacy cache files.
10. Confirm the Fall 2025 and Spring 2026 archive tabs load from the intentional tracked snapshots under `public/officers/archive/`; do not confuse immutable archives with duplicate current data.
11. On the rendered page, open at least one complete profile and confirm its full bio and Website, LinkedIn, GitHub, and ORCID destinations are labeled, keyboard accessible, and correct.
12. Confirm local, staging, and production builds remain credential-free. If the optional drift workflow changed, verify it has read-only repository permissions, passes secrets only to the check command, fails on a missing or retyped Notion property, publishes no candidate artifact, and cannot commit or deploy.

This gate passes only when the published roster matches the approved cohort, current public submissions enrich the correct people through a reviewed Git snapshot, invalid or private form values cannot leak through, cache and archive boundaries remain clear, and all officer tabs work from a clean credential-free checkout.

## Release discipline

- Run checks against the public staging URL after pushing `dev`.
- Leave `main` untouched until every checklist gate passes.
- Add future gates to this file in release order so this skill remains the single source of truth.
