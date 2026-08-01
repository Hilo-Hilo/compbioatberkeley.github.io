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
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      name: siteIdentity.name,
      alternateName: siteIdentity.alternateName,
      url: canonicalUrl(siteOrigin, "/"),
      logo: canonicalUrl(siteOrigin, siteIdentity.logoPath),
      sameAs: siteIdentity.sameAs,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: page.title,
      description: page.description,
      url,
      isPartOf: {
        "@type": "WebSite",
        name: siteIdentity.name,
        url: canonicalUrl(siteOrigin, "/"),
      },
    },
  ];

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
  const robotsMeta = noindex
    ? '<meta name="robots" content="noindex, nofollow" />'
    : '<meta name="robots" content="index, follow" />';
  html = html.replace(
    "</head>",
    `    ${robotsMeta}\n    <script id="site-structured-data" type="application/ld+json">${jsonForHtml(structuredData)}</script>\n  </head>`,
  );
  html = replaceRequired(
    html,
    /<div\s+id="root"\s*><\/div>/i,
    `<div id="root">${appHtml}</div>`,
    "React root",
  );

  return html;
};
