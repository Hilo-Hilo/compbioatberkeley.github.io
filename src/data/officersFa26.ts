import type { Officer } from "@/types/officers";
import { compileOfficerDirectory } from "@/data/compileOfficerDirectory.js";
import profileSnapshot from "@/data/officerProfilesFa26.json";
import roster from "@/data/officersFa26Roster.json";

// The official roster owns cohort membership, order, roles, stable IDs, and
// fallback portraits. The form snapshot can enrich only public profile fields.
const compiled = compileOfficerDirectory(roster, profileSnapshot.profiles);

export const officersFa26 = compiled.officers as Officer[];
export const officersFa26Audit = compiled.audit;
