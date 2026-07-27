export type Partner = {
  name: string;
  website: string;
  logoPath: string;
  darkLogoPath?: string;
  logoClassName: string;
  collageClassName: string;
  brandSourceUrl?: string;
  sourceNote?: string;
};

/**
 * The single source of truth for the partner logo wall rendered on Home and
 * Collaborations. Update a partner or asset here and both pages update.
 */
export const partners: Partner[] = [
  {
    name: "Streamind Health",
    website: "https://www.streamindhealth.com/",
    logoPath: "partners/raster/streamind.png",
    darkLogoPath: "partners/raster/streamind-dark.png",
    logoClassName: "max-h-28 w-full",
    collageClassName:
      "col-span-2 md:left-[8%] md:top-[4%] md:w-[34%]",
    brandSourceUrl:
      "https://static.wixstatic.com/media/18bc51_9fa019fc425a48e1a841d82ce7f1ca30~mv2.png",
  },
  {
    name: "NeuroAge Therapeutics",
    website: "https://www.neuroagetx.com/",
    logoPath: "partners/raster/neuroage.png",
    darkLogoPath: "partners/raster/neuroage-dark.png",
    logoClassName: "max-h-28 w-full",
    collageClassName:
      "col-span-2 md:left-[58%] md:top-[5%] md:w-[38%]",
    brandSourceUrl: "https://www.neuroagetx.com/img/logo.webp",
  },
  {
    name: "NovaFlow",
    website: "https://www.novaflowapp.com/",
    logoPath: "partners/raster/novaflow.png",
    logoClassName: "max-h-24 w-full",
    collageClassName:
      "col-span-2 md:left-[15%] md:top-[29%] md:w-[32%]",
    brandSourceUrl: "https://www.novaflowapp.com/",
  },
  {
    name: "GeneGen",
    website: "https://www.biomart.cn/46339/index.htm",
    logoPath: "partners/raster/genegen.png",
    logoClassName: "max-h-24 w-full",
    collageClassName:
      "col-span-2 md:left-[1%] md:top-[49%] md:w-[34%]",
    sourceNote:
      "Transparent reconstruction from the supplied reference because the legacy official domain no longer resolves.",
  },
  {
    name: "Google DeepMind",
    website: "https://deepmind.google/",
    logoPath: "partners/raster/google-deepmind.png",
    darkLogoPath: "partners/raster/google-deepmind-dark.png",
    logoClassName: "max-h-20 w-full",
    collageClassName:
      "col-span-2 md:left-[43%] md:top-[39%] md:w-[31%]",
    brandSourceUrl:
      "https://storage.googleapis.com/gdm-deepmind-com-prod-public/media/images/0xBk-c8kzB5UTrWs/nav__gdm-lockup__light.height-25.svg",
  },
  {
    name: "UCSF",
    website: "https://www.ucsf.edu/",
    logoPath: "partners/raster/ucsf.png",
    darkLogoPath: "partners/raster/ucsf-dark.png",
    logoClassName: "max-h-32 w-full",
    collageClassName:
      "col-span-1 md:left-[70%] md:top-[43%] md:w-[21%]",
    brandSourceUrl: "https://identity.ucsf.edu/brand-guide/logos",
  },
  {
    name: "Coagulant Therapeutics",
    website: "https://www.coagulanttherapeutics.com/",
    logoPath: "partners/raster/coagulant.png",
    darkLogoPath: "partners/raster/coagulant-dark.png",
    logoClassName: "max-h-24 w-full",
    collageClassName:
      "col-span-2 md:left-[31%] md:top-[73%] md:w-[42%]",
    brandSourceUrl:
      "https://images.squarespace-cdn.com/content/v1/6154cdcf4a92db78fc554755/75dd0feb-5f86-47fc-9f1a-72edeebe2f1a/Coagulant+Therapeutics+Logo_RGB.png?format=1500w",
  },
  {
    name: "Progenic Genomics",
    website: "https://progenicgenomics.com/",
    logoPath: "partners/raster/progenic.png",
    darkLogoPath: "partners/raster/progenic-dark.png",
    logoClassName: "max-h-52 w-auto",
    collageClassName:
      "col-span-1 md:left-[85%] md:top-[48%] md:w-[11%]",
    brandSourceUrl:
      "https://progenicgenomics.com/wp-content/uploads/2025/05/cropped-PrognicLogo-Colored.png",
  },
];
