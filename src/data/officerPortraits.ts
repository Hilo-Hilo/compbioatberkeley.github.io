import type { Officer } from "@/types/officers";

interface OfficerPortraitFraming {
  objectPosition: string;
}

const defaultFraming: OfficerPortraitFraming = {
  objectPosition: "50% 50%",
};

const framingByImage = {
  "/fetched/officers/sp26/priyam_e438dedd.jpg": {
    objectPosition: "50% 0%",
  },
  "/fetched/officers/sp26/mahesh_51e576e4.jpeg": {
    objectPosition: "50% 58%",
  },
  "/fetched/officers/sp26/john_ff0151b7.jpg": {
    objectPosition: "50% 24%",
  },
  "/fetched/officers/sp26/sreyas_efd7b19f.webp": {
    objectPosition: "50% 6%",
  },
  "/fetched/officers/sp26/allison_7c598c4c.webp": {
    objectPosition: "50% 14%",
  },
} satisfies Record<string, OfficerPortraitFraming>;

export const getOfficerPortraitFraming = (
  officer: Pick<Officer, "image">,
): OfficerPortraitFraming => framingByImage[officer.image] ?? defaultFraming;
