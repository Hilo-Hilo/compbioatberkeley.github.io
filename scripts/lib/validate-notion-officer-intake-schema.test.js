import assert from "node:assert/strict";
import test from "node:test";

import { validateNotionOfficerIntakeSchema } from "./validate-notion-officer-intake-schema.js";

const requiredProperties = {
  "Full Name": { id: "title", type: "title", title: {} },
  "Preferred Name": { id: "preferred", type: "rich_text", rich_text: {} },
  Bio: { id: "bio", type: "rich_text", rich_text: {} },
  headshot: { id: "headshot", type: "files", files: {} },
  "Personal Website": { id: "website", type: "url", url: {} },
  Linkedin: { id: "linkedin", type: "url", url: {} },
  GitHub: { id: "github", type: "url", url: {} },
  ORCID: { id: "orcid", type: "url", url: {} },
};

test("accepts the expected Notion officer intake schema", () => {
  const database = {
    object: "database",
    id: "database-id",
    properties: {
      ...requiredProperties,
      Email: { id: "email", type: "email", email: {} },
    },
  };

  assert.equal(validateNotionOfficerIntakeSchema(database), database);
});

test("rejects a schema with a missing required property", () => {
  const properties = { ...requiredProperties };
  delete properties.Bio;

  assert.throws(
    () => validateNotionOfficerIntakeSchema({ properties }),
    {
      message:
        'Notion officer intake schema mismatch:\n- Missing property "Bio"; expected type "rich_text".',
    },
  );
});

test("rejects a required property with the wrong Notion type", () => {
  const properties = {
    ...requiredProperties,
    headshot: { id: "headshot", type: "url", url: {} },
  };

  assert.throws(
    () => validateNotionOfficerIntakeSchema({ properties }),
    {
      message:
        'Notion officer intake schema mismatch:\n- Property "headshot" has type "url"; expected "files".',
    },
  );
});

test("reports every schema mismatch in deterministic field order", () => {
  const properties = {
    ...requiredProperties,
    "Full Name": { id: "title", type: "rich_text", rich_text: {} },
    ORCID: { id: "orcid", type: "number", number: {} },
  };
  delete properties["Preferred Name"];

  assert.throws(
    () => validateNotionOfficerIntakeSchema({ properties }),
    {
      message:
        'Notion officer intake schema mismatch:\n' +
        '- Property "Full Name" has type "rich_text"; expected "title".\n' +
        '- Missing property "Preferred Name"; expected type "rich_text".\n' +
        '- Property "ORCID" has type "number"; expected "url".',
    },
  );
});
