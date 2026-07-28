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
7. After pushing `dev`, request the staging `llms.txt` URL directly and confirm it returns the expected plain-text content. Before production promotion, repeat the check at `https://compbioatberkeley.com/llms.txt`.

This gate passes only when the file accurately describes the current public site, all listed destinations are intentional, and the deployed copy is reachable without authentication.

## Release discipline

- Run checks against the public staging URL after pushing `dev`.
- Leave `main` untouched until every checklist gate passes.
- Add future gates to this file in release order so this skill remains the single source of truth.
