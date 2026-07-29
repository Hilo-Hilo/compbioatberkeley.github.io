# Computational biology hero artwork

The landing-page artwork combines a protein ribbon, a genomic heatmap, and a
coverage/gene track in one transparent 4:3 composition.

- Source: `assets-src/hero/compbio-research-atlas-chroma-source.png`
- Generated web assets: `compbio-research-atlas-{light,dark}-{800,1600}.webp`
- Regeneration command: `npm run assets:hero`

The source was created with OpenAI image generation from a user-supplied
scientific-layout reference on 2026-07-29. The build script estimates the
chroma field, reconstructs antialiased edge colors, removes residual magenta
spill, and produces one shared alpha geometry. The clean pearl/ice/gold source
becomes the dark asset directly; the light asset is a smooth deterministic
navy/steel/gold palette conversion. Theme changes therefore never shift the
composition or introduce binary color seams around the gold details.

The website renders the result as a masked background field so it can bleed
through the right side of the hero without becoming a bounded illustration.
Edit the chroma source or conversion script, not the generated WebP files.
