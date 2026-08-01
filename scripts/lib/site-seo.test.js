import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { buildPageHtml, buildRobotsTxt, buildSitemapXml } from "./site-seo.js";

const pages = [
  { path: "/", title: "Home", description: "Home page" },
  { path: "/about/", title: "About", description: "About page" },
];
const siteIdentity = {
  name: "Example Organization",
  alternateName: "Example Org",
  logoPath: "/logo.svg",
  sameAs: ["https://social.example.com/example"],
};

const htmlTemplate = `<!doctype html><html><head>
  <title>Fallback</title>
  <meta name="description" content="Fallback description" />
  <link rel="canonical" href="https://example.com/" />
  <meta property="og:title" content="Fallback" />
  <meta property="og:description" content="Fallback description" />
  <meta property="og:url" content="https://example.com/" />
  <meta name="twitter:title" content="Fallback" />
  <meta name="twitter:description" content="Fallback description" />
</head><body><div id="root"></div></body></html>`;

test("the shared public-page registry covers every indexable site route", () => {
  const registry = JSON.parse(
    fs.readFileSync(new URL("../../src/data/sitePages.json", import.meta.url), "utf8"),
  );

  assert.deepEqual(
    registry.map((page) => page.path),
    ["/", "/about/", "/calendar/", "/collaborations/", "/officers/", "/signup/"],
  );
  assert.ok(registry.every((page) => page.title && page.description));
  assert.ok(registry.every((page) => !page.path.startsWith("/concepts")));
});

test("builds a sitemap containing each canonical public URL exactly once", () => {
  const sitemap = buildSitemapXml({
    pages,
    siteOrigin: "https://example.com/",
    lastModified: "2026-07-31",
  });

  assert.match(sitemap, /<loc>https:\/\/example\.com\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/example\.com\/about\/<\/loc>/);
  assert.equal((sitemap.match(/<url>/g) ?? []).length, pages.length);
  assert.equal((sitemap.match(/https:\/\/example\.com\/about\//g) ?? []).length, 1);
  assert.match(sitemap, /<lastmod>2026-07-31<\/lastmod>/);
});

test("embeds rendered content and unique route metadata in the initial HTML", () => {
  const html = buildPageHtml({
    template: htmlTemplate,
    appHtml: "<main><h1>About us</h1></main>",
    page: pages[1],
    siteIdentity,
    siteOrigin: "https://example.com/",
    noindex: false,
  });

  assert.match(html, /<title>About<\/title>/);
  assert.match(html, /name="description" content="About page"/);
  assert.match(html, /rel="canonical" href="https:\/\/example\.com\/about\/"/);
  assert.match(html, /property="og:url" content="https:\/\/example\.com\/about\/"/);
  assert.match(html, /<main><h1>About us<\/h1><\/main>/);
  assert.match(html, /"@type":"WebPage"/);
  assert.match(html, /"@type":"EducationalOrganization"/);
  assert.doesNotMatch(html, /name="robots" content="noindex/);
});

test("marks staging output as noindex and lets crawlers observe that directive", () => {
  const html = buildPageHtml({
    template: htmlTemplate,
    appHtml: "<main>Preview</main>",
    page: pages[0],
    siteIdentity,
    siteOrigin: "https://preview.example.com/",
    noindex: true,
  });

  assert.match(html, /name="robots" content="noindex, nofollow"/);
  assert.equal(buildRobotsTxt({ noindex: true }), "User-agent: *\nAllow: /\n");
  assert.equal(
    buildRobotsTxt({ noindex: false, siteOrigin: "https://example.com/" }),
    "User-agent: *\nAllow: /\n\nSitemap: https://example.com/sitemap.xml\n",
  );
});
