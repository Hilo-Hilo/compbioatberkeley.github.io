---
name: build-partner-logo-hover
description: Construct, extend, and QA the Computational Biology at Berkeley partner-logo collage with transparent light/dark assets, shared Home and Collaborations data, linked depth-and-zoom hover motion, responsive fallback layout, reduced-motion support, and collision-safe desktop placement. Use when adding or replacing a partner logo, changing collage positions, modifying the DepthCard hover effect, fixing logo overlap, or verifying the partner wall in this repository.
---

# Build Partner Logo Hover

Build the existing irregular logo composition without duplicating data, introducing opaque cards, or letting rest, drift, and hover envelopes collide.

## Read the implementation first

Inspect these files in order:

1. `src/data/partners.ts` — single partner registry and desktop placement.
2. `src/components/PartnerLogoWall.tsx` — shared rendering for Home and Collaborations.
3. `src/components/react-bits/depth-card.tsx` — pointer-driven depth and spotlight behavior.
4. `src/index.css` — drift, lift, scale, shadow, focus, and reduced-motion rules.
5. `src/lib/publicAsset.ts` — GitHub Pages-safe public asset paths.
6. `public/partners/SOURCES.md` and `scripts/build-partner-logos.mjs` — asset provenance and reproducible processing.

Preserve `PartnerLogoWall` as the only rendering implementation. Keep both pages connected to `partners`; never maintain separate Home and Collaborations logo lists.

## Add or replace a partner

1. Verify the organization name and outbound website.
2. Prefer an official transparent SVG, EPS, PNG, or WebP. Keep a low-resolution official mark when no better source exists; do not invent fidelity.
3. Store production assets under `public/partners/raster/`. Add a dark variant only when the original loses contrast in dark mode.
4. Document the original source and any transformation in `public/partners/SOURCES.md`.
5. Update `scripts/build-partner-logos.mjs` when the asset is generated or reproducibly transformed.
6. Add exactly one entry to `src/data/partners.ts` with:
   - `name`
   - canonical `website`
   - local `logoPath`
   - optional `darkLogoPath`
   - `logoClassName`
   - responsive `collageClassName`
   - `brandSourceUrl` or `sourceNote`
7. Resolve assets through `publicAssetPath`; do not concatenate `/` paths that break the GitHub Pages subpath.

Keep transparent pixels transparent. Do not add a white rectangle behind a mark to make dark mode pass.

## Construct the hover effect

Reuse `DepthCard` as the semantic `<a>` wrapper. Keep the motion split into independent layers:

- `.partner-collage-slot`: slow vertical drift and stacking context.
- `.partner-logo-link`: hover/focus lift and `scale(1.065)`.
- `DepthCard` inner layer: pointer-relative `rotateX` and `rotateY`.
- `DepthCard` content layer: small pointer-relative translation at positive Z depth.
- `.partner-logo-image`: transparent artwork and hover drop shadow.
- Caption: organization name plus external-link affordance.

Keep these behavior contracts:

- Open partner websites in a new tab with `rel="noopener noreferrer"`.
- Give every link an accessible name: `Visit {partner.name} website`.
- Make `:focus-visible` equivalent to hover.
- Disable pointer tilt below 768 px.
- Honor `prefers-reduced-motion`.
- Keep motion restrained: use the existing `maxRotation={6}`, `maxTranslation={4}`, 5 px lift, and 1.065 scale unless the entire collision model is revalidated.
- Raise only the active slot with `z-index`; do not use z-index to hide a collision.

Do not add a global cursor, opaque card shell, silk-wave background, or site-wide 3D tilt. Preserve the Signal Light visual language.

## Place the collage

Use the mobile grid as the fallback and apply freeform coordinates only at `md:`:

```ts
collageClassName:
  "col-span-1 md:left-[58%] md:top-[57%] md:w-[16%]"
```

Treat `left`, `top`, and `width` as a composition system:

- Keep primary horizontal wordmarks wider.
- Give tall marks narrower slots.
- Preserve intentional negative space.
- Move neighboring marks in small percentage increments.
- Avoid solving one collision by creating another downstream.

### Validate the full motion envelope

Do not compare resting rectangles only. For each logo, include:

- Half of the scale growth: `width × 0.0325` horizontally and `height × 0.0325` vertically.
- Up to 4 px of pointer translation.
- 5 px of hover lift above the logo.
- Relative drift between neighboring animation phases.
- At least 6–8 px of visual safety margin.

Two logos may overlap on one axis. They must remain separated on the other axis after both envelopes are expanded.

Use the rendered DOM as the authority. Measure every `a[aria-label^="Visit "]` with `getBoundingClientRect()`, expand each rectangle for the maximum motion envelope, and compare every pair. A valid desktop result has zero intersecting pairs on both routes.

## Verify the result

Run:

```bash
npx tsc --noEmit
npx eslint src/data/partners.ts src/components/PartnerLogoWall.tsx src/components/react-bits/depth-card.tsx
VITE_BASE_PATH=/compbioatberkeley.github.io/ npm run build:preview
```

Then check in a real browser:

1. Home and `/collaborations`.
2. Light and dark themes.
3. Resting geometry and maximum hover/focus enlargement.
4. The narrow/mobile grid.
5. Keyboard focus, visible caption, and reduced motion.
6. Every local logo request under the GitHub Pages base path.
7. Every partner link destination without transmitting data.

After pushing `dev`, wait for the staging workflow and repeat the collision check on the public staging URL. A successful build alone is not visual proof.

## Protect repository scope

Stage only files belonging to the requested change. Preserve unrelated local asset work. Push to `dev` for staging unless the user explicitly requests production; leave `main` untouched.
