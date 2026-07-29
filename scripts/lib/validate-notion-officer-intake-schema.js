const REQUIRED_PROPERTIES = [
  ["Full Name", "title"],
  ["Preferred Name", "rich_text"],
  ["Bio", "rich_text"],
  ["headshot", "files"],
  ["Personal Website", "url"],
  ["Linkedin", "url"],
  ["GitHub", "url"],
  ["ORCID", "url"],
];

export const validateNotionOfficerIntakeSchema = (database) => {
  const properties = database?.properties ?? {};
  const errors = [];

  for (const [name, expectedType] of REQUIRED_PROPERTIES) {
    if (!Object.hasOwn(properties, name)) {
      errors.push(
        `Missing property "${name}"; expected type "${expectedType}".`,
      );
    } else if (properties[name]?.type !== expectedType) {
      const actualType = properties[name]?.type ?? "(missing)";
      errors.push(
        `Property "${name}" has type "${actualType}"; expected "${expectedType}".`,
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Notion officer intake schema mismatch:\n- ${errors.join("\n- ")}`,
    );
  }

  return database;
};
