# Computational biology hero artwork

The landing-page artwork combines a protein ribbon, a genomic heatmap, and a
coverage/gene track in one transparent 4:3 composition.

- Source master: `assets-src/hero/compbio-research-atlas-light-master.png`
- Generated web assets: `compbio-research-atlas-{light,dark}-{800,1600}.webp`
- Regeneration command: `npm run assets:hero`

The light master was created with OpenAI image generation from a
user-supplied scientific-layout reference on 2026-07-29, then isolated onto a
true alpha channel. The dark assets are deterministic palette conversions of
that same master, so theme changes do not shift the composition. California
gold is preserved while blue and steel tones become pearl and ice blue.

Edit the source master or the conversion script, not the generated WebP files.
