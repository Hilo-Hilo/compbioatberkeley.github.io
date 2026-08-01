import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDirectory = path.join(projectRoot, "dist");
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
const llmsText = await fs.readFile(path.join(projectRoot, "public/llms.txt"), "utf8");

const canonicalUrl = (pathname) =>
  new URL(pathname.replace(/^\//, ""), `${siteOrigin}/`).href;
const occurrences = (text, value) => text.split(value).length - 1;

for (const page of pages) {
  const routeDirectory = page.path === "/"
    ? distDirectory
    : path.join(distDirectory, page.path.replace(/^\/+|\/+$/g, ""));
  const html = await fs.readFile(path.join(routeDirectory, "index.html"), "utf8");
  const url = canonicalUrl(page.path);

  assert.match(html, /<div id="root">[\s\S]+<\/div>/, `${page.path} must contain rendered React HTML`);
  assert.match(html, /<h1\b/, `${page.path} must contain a rendered h1`);
  assert.equal(occurrences(html, `<title>${page.title}</title>`), 1, `${page.path} must have one title`);
  assert.equal(
    occurrences(html, `<link rel="canonical" href="${url}" />`),
    1,
    `${page.path} must have one self-canonical URL`,
  );
  assert.match(html, /"@type":"EducationalOrganization"/);
  assert.match(html, /"@type":"WebPage"/);
  assert.equal(
    occurrences(
      html,
      `<meta name="google-site-verification" content="${siteIdentity.googleSiteVerification}" />`,
    ),
    1,
    `${page.path} must contain the Google Search Console verification token exactly once`,
  );
  assert.match(
    html,
    noindex
      ? /<meta name="robots" content="noindex, nofollow" \/>/
      : /<meta name="robots" content="index, follow" \/>/,
  );

  if (!noindex) {
    assert.ok(
      llmsText.includes(url),
      `${page.path} canonical must also be present in public/llms.txt`,
    );
  }
}

const robots = await fs.readFile(path.join(distDirectory, "robots.txt"), "utf8");
const notFound = await fs.readFile(path.join(distDirectory, "404.html"), "utf8");
assert.match(notFound, /name="robots" content="noindex, nofollow"/);
await assert.rejects(
  fs.access(path.join(distDirectory, "concepts", "index.html")),
  undefined,
  "Concept-review routes must not be emitted as indexable static pages",
);

if (noindex) {
  assert.equal(robots, "User-agent: *\nAllow: /\n");
  await assert.rejects(fs.access(path.join(distDirectory, "sitemap.xml")));
} else {
  assert.equal(
    robots,
    `User-agent: *\nAllow: /\n\nSitemap: ${siteOrigin}/sitemap.xml\n`,
  );
  const sitemap = await fs.readFile(path.join(distDirectory, "sitemap.xml"), "utf8");
  assert.equal(occurrences(sitemap, "<url>"), pages.length);
  for (const page of pages) {
    assert.equal(occurrences(sitemap, `<loc>${canonicalUrl(page.path)}</loc>`), 1);
  }
}

console.log(
  `SEO build valid: ${pages.length} rendered routes, ${noindex ? "staging noindex" : "production sitemap published"}`,
);
