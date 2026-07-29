export const OFFICER_PROFILE_COHORTS = Object.freeze({
  fa26: Object.freeze({
    roster: "src/data/officersFa26Roster.json",
    profiles: "src/data/officerProfilesFa26.json",
    portraits: "public/officers/fa26",
    intakeStart: "2026-07-03T22:45:53Z",
    intakeEnd: "2027-01-01T00:00:00Z",
  }),
});

export const getOfficerProfileCohort = (term) => {
  const cohort = OFFICER_PROFILE_COHORTS[term];
  if (!cohort) {
    throw new Error(
      `Unsupported cohort "${term}". Configured cohorts: ${Object.keys(OFFICER_PROFILE_COHORTS).join(", ")}`,
    );
  }
  return cohort;
};
