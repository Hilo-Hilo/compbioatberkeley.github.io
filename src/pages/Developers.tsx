import { ExternalLink } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/PageHeader";
import { publicAssetPath } from "@/lib/publicAsset";

const resources = [
  {
    label: "Developer resource index (Markdown)",
    detail: "A compact machine-readable copy of this page and its capability boundaries.",
    href: publicAssetPath("developers.md"),
  },
  {
    label: "llms.txt",
    detail: "The concise agent entry point, with annotated links to canonical public pages.",
    href: publicAssetPath("llms.txt"),
  },
  {
    label: "Agent instructions",
    detail: "Source-selection rules, freshness guidance, and limits on actions and inference.",
    href: publicAssetPath("agent-instructions.md"),
  },
  {
    label: "XML sitemap",
    detail: "The canonical inventory of public, indexable HTML routes on the production site.",
    href: "https://compbioatberkeley.github.io/sitemap.xml",
  },
  {
    label: "Crawler policy",
    detail: "The current robots.txt policy and production sitemap location.",
    href: publicAssetPath("robots.txt"),
  },
  {
    label: "Website source",
    detail: "The exact public GitHub repository that builds and publishes this static website.",
    href: "https://github.com/CompbioAtBerkeley/compbioatberkeley.github.io",
  },
];

const capabilities = [
  {
    title: "API docs and OpenAPI",
    body: "Not offered. This informational website has no public application API or OpenAPI contract. Its HTML pages and machine-readable discovery files are the supported public interfaces.",
  },
  {
    title: "Authentication API",
    body: "Not applicable. The website does not provide member accounts, API keys, OAuth clients, or an authenticated developer portal. External forms and community platforms use their own terms and access controls.",
  },
  {
    title: "Webhooks",
    body: "Not offered. The organization does not publish webhook events, signing secrets, delivery guarantees, or retry semantics for this site.",
  },
  {
    title: "MCP server",
    body: "Not operated by this website. There is no live Model Context Protocol endpoint or manifest. GitHub repositories and third-party registry entries must not be treated as an MCP service run by Computational Biology at Berkeley.",
  },
  {
    title: "Markdown delivery",
    body: "Direct Markdown resources are available at their explicit .md URLs. Same-URL Accept: text/markdown content negotiation is not provided by the current static GitHub Pages origin.",
  },
];

const Developers = () => (
  <div>
    <PageHeader
      eyebrow="09 / developers"
      title="Developer resources"
      lede="Machine-readable resources and technical capability status for the Computational Biology at Berkeley public website."
    />

    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <SectionHeading title="Supported public resources" meta="06 resources" />
      <p className="mb-8 max-w-[72ch] text-base leading-relaxed text-muted-foreground">
        The canonical public origin is https://compbioatberkeley.github.io. Use the resources below
        to discover pages, select sources, and inspect public website code. Event details, officer
        rosters, forms, and recruitment information are time-sensitive, so re-fetch the relevant
        canonical page instead of relying on an older cached answer.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {resources.map((resource, index) => (
          <article key={resource.label} className="rounded border border-border bg-card p-6">
            <p className="text-[11px] text-label">[{String(index + 1).padStart(2, "0")}]</p>
            <h3 className="mt-3 text-lg font-bold text-heading">{resource.label}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{resource.detail}</p>
            <a
              href={resource.href}
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-link hover:underline"
            >
              open resource
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>

      <div className="mt-16">
        <SectionHeading title="API, authentication, webhook, and MCP status" meta="current scope" />
        <p className="mb-8 max-w-[72ch] text-base leading-relaxed text-muted-foreground">
          This is a static informational publication, not a transactional software product. The
          status below is explicit so developers and agents do not infer capabilities from similarly
          named services, public repositories, or third-party registry results.
        </p>
        <div className="border-y border-border">
          {capabilities.map((capability, index) => (
            <article
              key={capability.title}
              className="grid gap-4 border-b border-border py-8 last:border-b-0 md:grid-cols-[220px_1fr] md:gap-10"
            >
              <div>
                <p className="text-[11px] text-label">[{String(index + 1).padStart(2, "0")}]</p>
                <h3 className="mt-2 text-lg font-bold text-heading">{capability.title}</h3>
              </div>
              <p className="max-w-[72ch] text-sm leading-relaxed text-muted-foreground">
                {capability.body}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-12 rounded border border-border bg-muted p-7 md:p-9">
        <h2 className="text-xl font-bold text-heading">Integration guidance</h2>
        <p className="mt-3 max-w-[72ch] text-sm leading-relaxed text-muted-foreground">
          Read-only retrieval of the public resources above is supported. Do not invent endpoints,
          credentials, tool calls, submissions, or organization actions. If a future API or MCP
          service is launched, this page and the agent guide will identify its canonical endpoint,
          protocol version, authorization model, and operational owner.
        </p>
      </div>
    </section>
  </div>
);

export default Developers;
