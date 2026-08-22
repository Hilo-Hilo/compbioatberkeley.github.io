import { buildStructuredData } from "../../src/lib/siteStructuredData.js";

const escapeXml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const canonicalUrl = (siteOrigin, pathname) =>
  new URL(pathname.replace(/^\//, ""), `${siteOrigin.replace(/\/$/, "")}/`).href;

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const replaceRequired = (html, pattern, replacement, label) => {
  if (!pattern.test(html)) {
    throw new Error(`Unable to find ${label} in the Vite HTML template.`);
  }
  return html.replace(pattern, replacement);
};

const jsonForHtml = (value) => JSON.stringify(value).replaceAll("<", "\\u003c");

export const buildSitemapXml = ({ pages, siteOrigin, lastModified }) => {
  const urls = pages
    .map(
      (page) => `  <url>
    <loc>${escapeXml(canonicalUrl(siteOrigin, page.path))}</loc>
    <lastmod>${escapeXml(lastModified)}</lastmod>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
};

export const buildRobotsTxt = ({ noindex, siteOrigin }) => {
  // Let crawlers fetch staging pages so they can observe the page-level noindex.
  // A robots.txt file under a GitHub project-pages subpath is not host-wide policy.
  if (noindex) return "User-agent: *\nAllow: /\n";
  const sitemapUrl = canonicalUrl(siteOrigin, "/sitemap.xml");
  return `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`;
};

export const buildNotFoundHtml = ({ template, basePath = "/", sitemapUrl }) => {
  const normalizedBasePath = `/${basePath.replace(/^\/+|\/+$/g, "")}/`;
  const prefix = normalizedBasePath === "//" ? "/" : normalizedBasePath;
  const withBasePath = prefix === "/"
    ? template
    : template.replaceAll('href="/', `href="${prefix}`);

  if (!sitemapUrl) return withBasePath;
  return withBasePath.replace(/href="[^"]*\/sitemap\.xml"/, `href="${sitemapUrl}"`);
};

export const buildPageHtml = ({
  template,
  appHtml,
  page,
  siteIdentity,
  siteOrigin,
  noindex,
}) => {
  const url = canonicalUrl(siteOrigin, page.path);
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  const structuredData = buildStructuredData({
    page,
    siteIdentity,
    canonicalUrl: (pathname) => canonicalUrl(siteOrigin, pathname),
  });

  let html = replaceRequired(
    template,
    /<title>[^<]*<\/title>/i,
    `<title>${title}</title>`,
    "title",
  );
  html = replaceRequired(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?\s*>/i,
    `<meta name="description" content="${description}" />`,
    "meta description",
  );
  html = replaceRequired(
    html,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?\s*>/i,
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
    "canonical link",
  );

  const replacements = [
    ["og:title", title],
    ["og:description", description],
    ["og:url", escapeHtml(url)],
  ];
  for (const [property, content] of replacements) {
    html = replaceRequired(
      html,
      new RegExp(`<meta\\s+property="${property}"\\s+content="[^"]*"\\s*\\/?\\s*>`, "i"),
      `<meta property="${property}" content="${content}" />`,
      property,
    );
  }

  const twitterReplacements = [
    ["twitter:title", title],
    ["twitter:description", description],
  ];
  for (const [name, content] of twitterReplacements) {
    html = replaceRequired(
      html,
      new RegExp(`<meta\\s+name="${name}"\\s+content="[^"]*"\\s*\\/?\\s*>`, "i"),
      `<meta name="${name}" content="${content}" />`,
      name,
    );
  }

  html = html.replace(/\s*<meta\s+name="robots"[^>]*>/i, "");
  html = html.replace(/\s*<meta\s+name="google-site-verification"[^>]*>/i, "");
  const robotsMeta = noindex
    ? '<meta name="robots" content="noindex, nofollow" />'
    : '<meta name="robots" content="index, follow" />';
  const verificationMeta = siteIdentity.googleSiteVerification
    ? `<meta name="google-site-verification" content="${escapeHtml(siteIdentity.googleSiteVerification)}" />`
    : "";
  html = html.replace(
    "</head>",
    `    ${robotsMeta}\n    ${verificationMeta}\n    <script id="site-structured-data" type="application/ld+json">${jsonForHtml(structuredData)}</script>\n  </head>`,
  );
  html = replaceRequired(
    html,
    /<div\s+id="root"\s*><\/div>/i,
    `<div id="root">${appHtml}</div>`,
    "React root",
  );

  return html;
};
