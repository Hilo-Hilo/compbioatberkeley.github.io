export const buildStructuredData = ({ page, siteIdentity, canonicalUrl }) => {
  const organizationId = canonicalUrl("/#organization");
  const websiteId = canonicalUrl("/#website");

  return [
    {
      "@context": "https://schema.org",
      "@type": ["Organization", "EducationalOrganization"],
      "@id": organizationId,
      name: siteIdentity.name,
      alternateName: siteIdentity.alternateName,
      description: siteIdentity.description,
      url: canonicalUrl("/"),
      logo: canonicalUrl(siteIdentity.logoPath),
      sameAs: siteIdentity.sameAs,
      address: {
        "@type": "PostalAddress",
        ...siteIdentity.address,
      },
      contactPoint: {
        "@type": "ContactPoint",
        ...siteIdentity.contactPoint,
        url: canonicalUrl("/contact/"),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": websiteId,
      name: siteIdentity.name,
      alternateName: siteIdentity.websiteAlternateNames ?? siteIdentity.alternateName,
      description: siteIdentity.description,
      url: canonicalUrl("/"),
      inLanguage: "en-US",
      publisher: { "@id": organizationId },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: page.title,
      description: page.description,
      url: canonicalUrl(page.path),
      about: { "@id": organizationId },
      isPartOf: { "@id": websiteId },
      publisher: { "@id": organizationId },
    },
  ];
};
