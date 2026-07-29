import type { Officer } from "@/types/officers";

interface OfficerPortraitFraming {
  objectPosition: string;
}

const defaultFraming: OfficerPortraitFraming = {
  objectPosition: "50% 50%",
};

const framingByImage = {
  "/officers/archive/sp26/priyam_e438dedd.jpg": {
    objectPosition: "50% 0%",
  },
  "/officers/archive/sp26/mahesh_51e576e4.jpeg": {
    objectPosition: "50% 58%",
  },
  "/officers/archive/sp26/john_ff0151b7.jpg": {
    objectPosition: "50% 24%",
  },
  "/officers/archive/sp26/sreyas_efd7b19f.webp": {
    objectPosition: "50% 6%",
  },
  "/officers/archive/sp26/allison_7c598c4c.webp": {
    objectPosition: "50% 14%",
  },
  "/officers/fa26/priyam-baruah.jpg": {
    objectPosition: "50% 0%",
  },
  "/officers/fa26/aahan-sharma.jpg": {
    objectPosition: "50% 40%",
  },
  "/officers/fa26/mahesh-arunachalam.jpeg": {
    objectPosition: "90% 25%",
  },
  "/officers/fa26/john-andrianopoulos.jpg": {
    objectPosition: "50% 24%",
  },
  "/officers/fa26/sreyas-yallapragada.webp": {
    objectPosition: "50% 6%",
  },
  "/officers/fa26/allison-cheng.webp": {
    objectPosition: "50% 14%",
  },
  "/officers/fa26/kenneth-sarip.jpg": {
    objectPosition: "50% 35%",
  },
  "/officers/fa26/asmar-khasmammadli.webp": {
    objectPosition: "50% 40%",
  },
  "/officers/fa26/anisha-s-pallikonda-2026-07-29-3ac3e3c8.webp": {
    objectPosition: "50% 35%",
  },
} satisfies Record<string, OfficerPortraitFraming>;

export const getOfficerPortraitFraming = (
  officer: Pick<Officer, "image">,
): OfficerPortraitFraming => framingByImage[officer.image] ?? defaultFraming;
