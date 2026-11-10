import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { activeNotices } from "../src/data/siteNotices.js";

const development = process.argv.includes("--development");
const now = process.env.SITE_NOTICES_NOW ? Date.parse(process.env.SITE_NOTICES_NOW) : Date.now();
const notices = activeNotices(JSON.parse(fs.readFileSync(new URL("../src/data/notices.json", import.meta.url), "utf8")), now);
const env = { ...process.env, SITE_NOTICES_JSON: JSON.stringify(notices) };
const run = (command, args) => execFileSync(command, args, { env, stdio: "inherit" });

run("npm", ["run", "validate:officers"]);
for (const script of ["build:client", "build:server"]) {
  run("npm", ["run", script, ...(development ? ["--", "--mode", "development"] : [])]);
}
run(process.execPath, ["scripts/prerender-site.mjs"]);
run("npm", ["run", "seo:check"]);
