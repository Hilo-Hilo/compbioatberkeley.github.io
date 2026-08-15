# Partner logo sources

This folder is the local, production-safe asset set used by
`src/data/partners.ts`. Both the Home and Collaborations pages render the same
`PartnerLogoWall`, so partner updates stay synchronized.

- Google DeepVariant: represented by Google's standard multicolor Google
  wordmark, sourced from Google's official branding image; the partner link
  opens the official `google/deepvariant` repository.
- UCSF: rendered from the official navy RGB EPS in the UCSF master logo
  download package.
- NeuroAge Therapeutics: official website logo (`logo.webp`).
- Coagulant Therapeutics: official website RGB logo, requested at 1500 px.
- GeneXGen: crop from the supplied @2x reference with its white matte removed.
  Current official website: <https://www.genexgen.com/>.
- NovaFlow: official inline SVG extracted from the NovaFlow website and
  rasterized in the purple treatment shown in the supplied reference.
- Streamind Health: official Wix-hosted original, rendered as a 1875 px
  transparent PNG crop.
- Progenic Genomics: official website logo.
- DrugRepAI: official transparent PNG supplied directly by the partner on
  August 14, 2026; the partner website is <https://www.drugrepai.com/>.

The `raster/` directory contains the transparent production PNGs and
contrast-adjusted dark-theme variants. `npm run assets:partners` reproduces
them. Raster sources are kept at their native dimensions rather than being
artificially enlarged; vector and EPS masters are the only sources rendered at
larger output dimensions.

The exact source URLs live beside each partner entry in
`src/data/partners.ts`.
