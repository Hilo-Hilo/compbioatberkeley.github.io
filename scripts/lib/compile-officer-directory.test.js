import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { compileOfficerDirectory } from "../../src/data/compileOfficerDirectory.js";

test("keeps official membership, order, and roles while enriching matched officers", () => {
  const roster = [
    {
      id: "alpha-officer",
      name: "Alpha Officer",
      role: "Official President",
      image: "/officers/alpha.jpg",
    },
    {
      id: "beta-officer",
      name: "Beta Officer",
      role: "Official Treasurer",
      image: "",
    },
  ];
  const submissions = [
    {
      sourceId: "submission-beta",
      fullName: "Beta Officer",
      preferredName: "Beta",
      submittedAt: "2026-07-04T00:00:00Z",
      role: "Unofficial role from the form",
      bio: "A current bio.",
      linkedin: "https://www.linkedin.com/in/beta/",
    },
    {
      sourceId: "submission-unmatched",
      fullName: "Not In The Cohort",
      submittedAt: "2026-07-05T00:00:00Z",
      bio: "Must not become an officer.",
    },
  ];

  const result = compileOfficerDirectory(roster, submissions);

  assert.deepEqual(
    result.officers.map(({ name, role }) => ({ name, role })),
    [
      { name: "Alpha Officer", role: "Official President" },
      { name: "Beta Officer", role: "Official Treasurer" },
    ],
  );
  assert.equal(result.officers[0].image, "/officers/alpha.jpg");
  assert.equal(result.officers[1].bio, "A current bio.");
  assert.equal(
    result.officers[1].linkedin,
    "https://www.linkedin.com/in/beta/",
  );
  assert.deepEqual(result.audit.unmatchedSubmissions, ["Not In The Cohort"]);
});

test("publishes a complete profile without replacing the canonical full name", () => {
  const roster = [
    {
      id: "hanson-wen",
      name: "Hanson Wen",
      role: "Web Development and Operations Lead",
      image: "/officers/fa26/hanson-wen.jpg",
    },
  ];
  const submissions = [
    {
      sourceId: "hanson-july-form",
      fullName: "Hanson Wen",
      preferredName: "Hanson",
      submittedAt: "2026-07-29T00:31:13Z",
      bio: "I'm interested in agents, lab automation, and large neural nets for biology.",
      "personal website": "hansonwen.dev/",
      linkedin: "www.linkedin.com/in/hanson-wen/",
      github: "github.com/Hilo-Hilo",
      orcid: "https://orcid.org/0009-0005-4776-087X",
    },
  ];

  const { officers } = compileOfficerDirectory(roster, submissions);

  assert.deepEqual(officers[0], {
    name: "Hanson Wen",
    role: "Web Development and Operations Lead",
    image: "/officers/fa26/hanson-wen.jpg",
    bio: "I'm interested in agents, lab automation, and large neural nets for biology.",
    "personal website": "https://hansonwen.dev/",
    linkedin: "https://www.linkedin.com/in/hanson-wen/",
    github: "https://github.com/Hilo-Hilo",
    orcid: "https://orcid.org/0009-0005-4776-087X",
  });
});

test("uses reviewed public roster content when intake arrives outside Notion", () => {
  const roster = [
    {
      id: "manual-officer",
      name: "Manual Officer",
      role: "Professional Development Chair",
      image: "/officers/fa26/manual-officer.webp",
      bio: "A reviewed public biography.",
      linkedin: "https://www.linkedin.com/in/manual-officer",
    },
  ];

  const { officers, audit } = compileOfficerDirectory(roster, []);

  assert.equal(officers[0].bio, "A reviewed public biography.");
  assert.equal(
    officers[0].linkedin,
    "https://www.linkedin.com/in/manual-officer",
  );
  assert.equal(officers[0].image, "/officers/fa26/manual-officer.webp");
  assert.deepEqual(audit.officersWithoutSubmission, []);
});

test("uses the newest nonblank value from duplicate submissions", () => {
  const roster = [
    {
      id: "duplicate-officer",
      name: "Duplicate Officer",
      role: "Official Role",
      image: "/officers/fallback.jpg",
    },
  ];
  const submissions = [
    {
      sourceId: "older",
      fullName: "Duplicate Officer",
      submittedAt: "2026-07-05T00:00:00Z",
      bio: "Keep this older bio when the optional replacement is blank.",
      "personal website": "https://example.com/older",
      github: "",
      image: "",
    },
    {
      sourceId: "newer",
      fullName: "Duplicate Officer",
      submittedAt: "2026-07-08T00:00:00Z",
      bio: "   ",
      "personal website": "",
      github: "newer-account",
      image: "/officers/newer.jpg",
    },
  ];

  const { officers } = compileOfficerDirectory(roster, submissions);

  assert.equal(
    officers[0].bio,
    "Keep this older bio when the optional replacement is blank.",
  );
  assert.equal(
    officers[0]["personal website"],
    "https://example.com/older",
  );
  assert.equal(officers[0].github, "https://github.com/newer-account");
  assert.equal(officers[0].image, "/officers/newer.jpg");
});

test("lets Anisha replace her portrait without blanking an older public profile", () => {
  const roster = [
    {
      id: "anisha-s-pallikonda",
      name: "Anisha S. Pallikonda",
      aliases: ["Anisha Pallikonda"],
      role: "Senior Advisor",
      image: "/officers/fa26/anisha-fallback.webp",
    },
  ];
  const submissions = [
    {
      sourceId: "older-anisha-response",
      fullName: "Anisha Pallikonda",
      submittedAt: "2026-07-10T00:00:00Z",
      image: "",
      bio: "An older reviewed public biography.",
      linkedin: "https://www.linkedin.com/in/anisha/",
    },
    {
      sourceId: "3ac3e3c8-c9b6-8155-96d5-c35c4b8164fb",
      fullName: "Anisha Pallikonda",
      submittedAt: "2026-07-29T02:02:08Z",
      image:
        "/officers/fa26/anisha-s-pallikonda-2026-07-29-3ac3e3c8.webp",
      bio: "",
      linkedin: "",
    },
  ];

  const { officers } = compileOfficerDirectory(roster, submissions);

  assert.equal(
    officers[0].image,
    "/officers/fa26/anisha-s-pallikonda-2026-07-29-3ac3e3c8.webp",
  );
  assert.equal(officers[0].bio, "An older reviewed public biography.");
  assert.equal(
    officers[0].linkedin,
    "https://www.linkedin.com/in/anisha/",
  );
  assert.equal(officers[0].name, "Anisha S. Pallikonda");
  assert.equal(officers[0].role, "Senior Advisor");
});

test("uses aliases deliberately and rejects ambiguous matching rules", () => {
  const roster = [
    {
      id: "ben-tong",
      name: "Ben Tong",
      aliases: ["Benjamin Tong"],
      role: "Secretary",
      image: "",
    },
  ];
  const submissions = [
    {
      sourceId: "ben-form",
      fullName: "Benjamin Tong",
      submittedAt: "2026-07-07T00:00:00Z",
      bio: "Matched through a reviewed alias.",
    },
  ];

  assert.equal(
    compileOfficerDirectory(roster, submissions).officers[0].bio,
    "Matched through a reviewed alias.",
  );

  assert.throws(
    () =>
      compileOfficerDirectory(
        [
          ...roster,
          {
            id: "other-ben",
            name: "Other Ben",
            aliases: ["Benjamin Tong"],
            role: "Other",
            image: "",
          },
        ],
        submissions,
      ),
    /Ambiguous officer name or alias/,
  );
});

test("drops malformed platform links and falls back to the newest valid value", () => {
  const roster = [
    {
      id: "link-officer",
      name: "Link Officer",
      role: "Officer",
      image: "",
    },
  ];
  const submissions = [
    {
      sourceId: "older-valid",
      fullName: "Link Officer",
      submittedAt: "2026-07-01T00:00:00Z",
      linkedin: "linkedin.com/in/link-officer",
      github: "valid-account",
      orcid: "0000-0002-1825-0097",
    },
    {
      sourceId: "newer-invalid",
      fullName: "Link Officer",
      submittedAt: "2026-07-02T00:00:00Z",
      linkedin: "https://www.linkedin.com/mynetwork/grow/",
      github: "https://example.com/not-github",
      orcid: "not-an-orcid",
    },
  ];

  const { officers, audit } = compileOfficerDirectory(roster, submissions);

  assert.equal(
    officers[0].linkedin,
    "https://linkedin.com/in/link-officer",
  );
  assert.equal(officers[0].github, "https://github.com/valid-account");
  assert.equal(officers[0].orcid, "https://orcid.org/0000-0002-1825-0097");
  assert.equal(audit.invalidLinks.length, 3);
});

test("compiles the tracked Fall 2026 public snapshot without changing roster authority", () => {
  const roster = JSON.parse(
    fs.readFileSync(
      new URL("../../src/data/officersFa26Roster.json", import.meta.url),
      "utf8",
    ),
  );
  const profileSnapshot = JSON.parse(
    fs.readFileSync(
      new URL("../../src/data/officerProfilesFa26.json", import.meta.url),
      "utf8",
    ),
  );

  const { officers, audit } = compileOfficerDirectory(
    roster,
    profileSnapshot.profiles,
  );
  const hanson = officers.find((officer) => officer.name === "Hanson Wen");
  const anisha = officers.find(
    (officer) => officer.name === "Anisha S. Pallikonda",
  );

  assert.equal(officers.length, 27);
  assert.deepEqual(Object.keys(profileSnapshot).sort(), [
    "cohort",
    "profiles",
    "schemaVersion",
  ]);
  assert.equal(new Set(officers.map((officer) => officer.name)).size, 27);
  assert.equal(audit.unmatchedSubmissions.length, 0);
  assert.equal(
    hanson.bio,
    "I'm interested in agents, lab automation, and large neural nets for biology.",
  );
  assert.equal(hanson["personal website"], "https://hansonwen.dev/");
  assert.equal(hanson.linkedin, "https://www.linkedin.com/in/hanson-wen/");
  assert.equal(hanson.github, "https://github.com/Hilo-Hilo");
  assert.equal(hanson.orcid, "https://orcid.org/0009-0005-4776-087X");
  assert.equal(anisha.role, "Senior Advisor");
  assert.equal(
    anisha.image,
    "/officers/fa26/anisha-s-pallikonda-2026-07-29-3ac3e3c8.webp",
  );
  assert.equal(anisha.bio, "");
  assert.equal(
    audit.officersWithoutSubmission.includes("Anisha S. Pallikonda"),
    false,
  );
  assert.deepEqual(Object.keys(hanson).sort(), [
    "bio",
    "github",
    "image",
    "linkedin",
    "name",
    "orcid",
    "personal website",
    "role",
  ]);
});
