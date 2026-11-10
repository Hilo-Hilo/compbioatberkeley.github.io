import fs from "node:fs/promises";
import { activeNotices, validateNotices } from "../src/data/siteNotices.js";

const expected = activeNotices(JSON.parse(await fs.readFile(new URL("../src/data/notices.json", import.meta.url), "utf8")));
const response = await fetch("https://compbioatberkeley.github.io/notices.json", {
  cache: "no-store", signal: AbortSignal.timeout(30_000),
});
if (!response.ok) throw new Error(`Cannot check deployed notices: HTTP ${response.status}`);
const deployed = validateNotices(await response.json());
const deploy = JSON.stringify(expected) !== JSON.stringify(deployed);
if (process.env.GITHUB_OUTPUT) await fs.appendFile(process.env.GITHUB_OUTPUT, `deploy=${deploy}\n`);
console.log(deploy ? "Notice expiration requires a deployment." : "Published notices are current; no deployment needed.");
