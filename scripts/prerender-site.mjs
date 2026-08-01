import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { buildPageHtml, buildRobotsTxt, buildSitemapXml } from "./lib/site-seo.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDirectory = path.join(projectRoot, "dist");
const serverDirectory = path.join(projectRoot, ".seo-ssr");
const siteIdentity = JSON.parse(
  await fs.readFile(path.join(projectRoot, "src/data/siteIdentity.json"), "utf8"),
);
const siteOrigin = (
  process.env.VITE_SITE_ORIGIN || siteIdentity.productionOrigin
).replace(/\/$/, "");
const noindex = process.env.VITE_NOINDEX === "true";

const pages = JSON.parse(
  await fs.readFile(path.join(projectRoot, "src/data/sitePages.json"), "utf8"),
);
const template = await fs.readFile(path.join(distDirectory, "index.html"), "utf8");
const serverEntry = path.join(serverDirectory, "entry-server.js");
const { render } = await import(pathToFileURL(serverEntry).href);

for (const page of pages) {
  const appHtml = render(page.path);
  const html = buildPageHtml({
    template,
    appHtml,
    page,
    siteIdentity,
    siteOrigin,
    noindex,
  });
  const routeDirectory = page.path === "/"
    ? distDirectory
    : path.join(distDirectory, page.path.replace(/^\/+|\/+$/g, ""));

  await fs.mkdir(routeDirectory, { recursive: true });
  await fs.writeFile(path.join(routeDirectory, "index.html"), html);
}

await fs.writeFile(
  path.join(distDirectory, "robots.txt"),
  buildRobotsTxt({ noindex, siteOrigin }),
);

const sitemapPath = path.join(distDirectory, "sitemap.xml");
if (noindex) {
  await fs.rm(sitemapPath, { force: true });
} else {
  const lastModified = process.env.SEO_LAST_MODIFIED || execFileSync(
    "git",
    ["log", "-1", "--format=%cs"],
    { cwd: projectRoot, encoding: "utf8" },
  ).trim();
  await fs.writeFile(
    sitemapPath,
    buildSitemapXml({ pages, siteOrigin, lastModified }),
  );
}

await fs.rm(serverDirectory, { recursive: true, force: true });
