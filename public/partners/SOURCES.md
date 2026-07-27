# Partner logo sources

This folder is the local, production-safe asset set used by
`src/data/partners.ts`. Both the Home and Collaborations pages render the same
`PartnerLogoWall`, so partner updates stay synchronized.

- Google DeepMind: official Google DeepMind navigation SVG.
- UCSF: official navy RGB logo from the UCSF master logo download package.
- NeuroAge Therapeutics: official website logo (`logo.webp`).
- Coagulant Therapeutics: official website RGB logo, requested at 1500 px.
- GeneGen: faithful high-resolution crop from the supplied reference. The
  legacy official domain (`genegen.cn`) no longer resolves.
- NovaFlow: official inline SVG extracted from the NovaFlow website.
- Streamind Health: official Wix-hosted original, rendered as a 1875 px
  transparent PNG crop.
- Progenic Genomics: official website logo.

The exact source URLs live beside each partner entry in
`src/data/partners.ts`.
