import { officersFa26 } from "@/data/officersFa26";

export const useOfficers = () => {
  return {
    officers: officersFa26,
    loading: false,
    error: null as string | null,
  };
};
