import { ExternalLink } from "lucide-react";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { PageHeader } from "@/components/PageHeader";

const INTEREST_FORM = "https://forms.gle/rD4XLxwZkxusCx5w5";
const NEWSLETTER_FORM = "https://forms.gle/qCxn93mfunF3Dtep7";

const forms = [
  {
    n: "01",
    title: "Get updates",
    body: "Sign up for our interest form to receive updates about events, courses, and opportunities.",
    src: INTEREST_FORM,
    label: "Interest form",
  },
  {
    n: "02",
    title: "Newsletter",
    body: "Subscribe to our newsletter for in-depth articles and exclusive content.",
    src: NEWSLETTER_FORM,
    label: "Newsletter form",
  },
];

const socials = [
  { name: "instagram", url: "https://www.instagram.com/ucb_compbio/" },
  {
    name: "linkedin",
    url: "https://www.linkedin.com/company/computational-biology-at-berkeley/",
  },
  { name: "linktree", url: "https://linktr.ee/compbioatberkeley" },
];

const SignUp = () => (
  <div>
    <PageHeader
      eyebrow="05 / sign up"
      title="Join our community"
      lede="Stay connected with Computational Biology at Berkeley and be the first to know about events, opportunities, and updates."
    />

    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <div className="grid items-start gap-4 lg:grid-cols-3">
        {forms.map((form) => (
          <article key={form.n} className="flex flex-col overflow-hidden rounded border border-border bg-card">
            <div className="border-b border-border p-5">
              <p className="text-[11px] text-label">[{form.n}]</p>
              <h2 className="mt-2 text-lg font-bold text-heading">{form.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{form.body}</p>
            </div>
            <iframe
              src={form.src}
              title={form.label}
              className="h-[400px] w-full border-0 bg-background"
              loading="lazy"
            >
              Loading...
            </iframe>
            <div className="border-t border-border p-4">
              <EnhancedButton asChild variant="outline" size="sm" className="w-full">
                <a href={form.src} target="_blank" rel="noopener noreferrer">
                  open in new tab
                  <ExternalLink />
                </a>
              </EnhancedButton>
            </div>
          </article>
        ))}

        <article className="flex min-h-[526px] flex-col overflow-hidden rounded border border-border bg-card lg:min-h-0 lg:self-stretch">
          <div className="border-b border-border p-5">
            <p className="text-[11px] text-label">[03]</p>
            <h2 className="mt-2 text-lg font-bold text-heading">Connect with us</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Follow along between meetings. Events, recaps, and opportunities go out here first.
            </p>
          </div>

          <div className="flex flex-1 flex-col gap-2 p-5">
            {socials.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center justify-between rounded border border-border px-4 text-[13px] text-heading hover:border-border-strong hover:bg-muted hover:text-heading"
              >
                {social.name}
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            ))}
            <p className="mt-auto border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
              Questions? Reach out through any of these platforms and we will get back to you soon.
            </p>
          </div>
        </article>
      </div>
    </section>
  </div>
);

export default SignUp;
