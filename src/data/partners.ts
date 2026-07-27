export type Partner = {
  name: string;
  website: string;
  logoPath: string;
  logoClassName: string;
  logoSurface?: "light" | "dark";
  brandSourceUrl?: string;
  sourceNote?: string;
};

/**
 * The single source of truth for the partner logo wall rendered on Home and
 * Collaborations. Update a partner or asset here and both pages update.
 */
export const partners: Partner[] = [
  {
    name: "Google DeepMind",
    website: "https://deepmind.google/",
    logoPath: "partners/google-deepmind.svg",
    logoClassName: "max-h-14 w-full max-w-[210px]",
    brandSourceUrl:
      "https://storage.googleapis.com/gdm-deepmind-com-prod-public/media/images/0xBk-c8kzB5UTrWs/nav__gdm-lockup__light.height-25.svg",
  },
  {
    name: "UCSF",
    website: "https://www.ucsf.edu/",
    logoPath: "partners/ucsf.png",
    logoClassName: "max-h-24 w-full max-w-[150px]",
    brandSourceUrl: "https://identity.ucsf.edu/brand-guide/logos",
  },
  {
    name: "NeuroAge Therapeutics",
    website: "https://www.neuroagetx.com/",
    logoPath: "partners/neuroage.webp",
    logoClassName: "max-h-20 w-full max-w-[210px]",
    brandSourceUrl: "https://www.neuroagetx.com/img/logo.webp",
  },
  {
    name: "Coagulant Therapeutics",
    website: "https://www.coagulanttherapeutics.com/",
    logoPath: "partners/coagulant.webp",
    logoClassName: "max-h-20 w-full max-w-[220px]",
    brandSourceUrl:
      "https://images.squarespace-cdn.com/content/v1/6154cdcf4a92db78fc554755/75dd0feb-5f86-47fc-9f1a-72edeebe2f1a/Coagulant+Therapeutics+Logo_RGB.png?format=1500w",
  },
  {
    name: "GeneGen",
    website: "https://www.biomart.cn/46339/index.htm",
    logoPath: "partners/genegen.png",
    logoClassName: "max-h-16 w-full max-w-[220px]",
    sourceNote:
      "Faithful crop from the supplied reference because the legacy official domain no longer resolves.",
  },
  {
    name: "NovaFlow",
    website: "https://www.novaflowapp.com/",
    logoPath: "partners/novaflow.svg",
    logoClassName: "max-h-14 w-full max-w-[210px]",
    logoSurface: "dark",
    brandSourceUrl: "https://www.novaflowapp.com/",
  },
  {
    name: "Streamind Health",
    website: "https://www.streamindhealth.com/",
    logoPath: "partners/streamind.png",
    logoClassName: "max-h-20 w-full max-w-[220px]",
    brandSourceUrl:
      "https://static.wixstatic.com/media/18bc51_9fa019fc425a48e1a841d82ce7f1ca30~mv2.png",
  },
  {
    name: "Progenic Genomics",
    website: "https://progenicgenomics.com/",
    logoPath: "partners/progenic.png",
    logoClassName: "max-h-24 w-full max-w-24",
    brandSourceUrl:
      "https://progenicgenomics.com/wp-content/uploads/2025/05/cropped-PrognicLogo-Colored.png",
  },
];
