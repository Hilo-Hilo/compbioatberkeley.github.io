import { ExternalLink } from "lucide-react";
import { FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { SiLinktree } from "react-icons/si";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { PageHeader } from "@/components/PageHeader";
import { publicAssetPath } from "@/lib/publicAsset";

const INTEREST_FORM = "https://forms.gle/EQmWP1JWzDzrFji79";
const NEWSLETTER_FORM = "https://forms.gle/qCxn93mfunF3Dtep7";
const RECRUITMENT_POST = "https://www.instagram.com/p/DcUXakNy7cj/";

const forms = [
  {
    eyebrow: "Fall 2026 interest form",
    title: "Express interest",
    body: "Tell us you are interested and receive application updates, event announcements, and opportunities.",
    src: INTEREST_FORM,
    cta: "Fill out the interest form",
    preview: "/forms/interest-form-preview.webp",
    featured: true,
  },
  {
    eyebrow: "Monthly newsletter",
    title: "Get the newsletter",
    body: "Subscribe for club news, upcoming socials, general meetings, and professional opportunities.",
    src: NEWSLETTER_FORM,
    cta: "Sign up for the newsletter",
    preview: "/forms/newsletter-form-preview.webp",
    featured: false,
  },
];

const socials = [
  {
    name: "Instagram",
    detail: "@ucb_compbio",
    url: "https://www.instagram.com/ucb_compbio/",
    icon: FaInstagram,
  },
  {
    name: "LinkedIn",
    detail: "CompBio at Berkeley",
    url: "https://www.linkedin.com/company/computational-biology-at-berkeley/",
    icon: FaLinkedinIn,
  },
  {
    name: "Linktree",
    detail: "All club links",
    url: "https://linktr.ee/compbioatberkeley",
    icon: SiLinktree,
  },
];

const SignUp = () => (
  <div>
    <PageHeader
      eyebrow="Stay connected"
      title="Join our community"
      lede="Stay connected with Computational Biology at Berkeley and be the first to know about events, opportunities, and updates."
    />

    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="overflow-hidden rounded border border-border bg-card lg:col-span-2">
          <div className="grid lg:grid-cols-[minmax(280px,0.72fr)_1.28fr]">
            <a
              href={RECRUITMENT_POST}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View the Fall 2026 recruitment timeline on Instagram (opens in a new tab)"
              className="group relative block overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            >
              <img
                src={publicAssetPath("/recruitment/fa26/recruitment-timeline.webp")}
                alt="Fall 2026 recruitment timeline: applications open August 26, Calapalooza August 27, info sessions September 2 and 7, officers event September 3, applicant social September 8, applications due September 11 at 5 PM, and interviews September 12–13."
                width="1080"
                height="1350"
                loading="eager"
                decoding="async"
                className="h-full max-h-[42rem] w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.015]"
              />
              <span className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded bg-background/95 px-4 py-3 text-sm font-bold text-heading shadow-sm backdrop-blur-sm">
                View the original post
                <ExternalLink className="h-4 w-4 shrink-0 text-link" aria-hidden="true" />
              </span>
            </a>

            <div className="flex flex-col justify-center p-6 md:p-8 lg:p-10">
              <p className="eyebrow">Fall 2026 recruitment</p>
              <h2 className="mt-3 text-3xl font-bold text-heading">Recruitment starts August 26</h2>
              <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
                Applications and coffee chats open August 26. Meet us at Calapalooza, join an info
                session, and get to know our project managers and officers before applications close
                September 11 at 5 PM.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <EnhancedButton asChild variant="gold" size="lg">
                  <a href={INTEREST_FORM} target="_blank" rel="noopener noreferrer">
                    Express interest
                    <ExternalLink />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </EnhancedButton>
                <EnhancedButton asChild variant="outline" size="lg">
                  <a href={RECRUITMENT_POST} target="_blank" rel="noopener noreferrer">
                    View timeline on Instagram
                    <ExternalLink />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </EnhancedButton>
              </div>
            </div>
          </div>
        </article>

        {forms.map((form) => (
          <article
            key={form.title}
            className={
              form.featured
                ? "relative isolate flex min-h-64 flex-col overflow-hidden rounded border border-primary bg-primary p-6 text-primary-foreground md:p-8"
                : "relative isolate flex min-h-64 flex-col overflow-hidden rounded border border-border bg-card p-6 md:p-8"
            }
          >
            <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
              <img
                src={publicAssetPath(form.preview)}
                alt=""
                width="960"
                height="600"
                loading="lazy"
                decoding="async"
                draggable="false"
                className={
                  form.featured
                    ? "h-full w-full object-cover object-top opacity-[0.18] grayscale contrast-75"
                    : "h-full w-full object-cover object-top opacity-[0.14] grayscale contrast-75 dark:opacity-[0.1]"
                }
              />
              <span
                className={
                  form.featured
                    ? "absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/70"
                    : "absolute inset-0 bg-gradient-to-r from-card via-card/95 to-card/75"
                }
              />
            </div>

            <div className="flex flex-1 flex-col">
              <div>
                <p
                  className={
                    form.featured
                      ? "text-[11px] uppercase tracking-[0.14em] text-primary-foreground/75"
                      : "eyebrow"
                  }
                >
                  {form.eyebrow}
                </p>
                <h2
                  className={
                    form.featured
                      ? "mt-3 text-2xl font-bold text-primary-foreground"
                      : "mt-3 text-2xl font-bold text-heading"
                  }
                >
                  {form.title}
                </h2>
                <p
                  className={
                    form.featured
                      ? "mt-3 max-w-[48ch] text-sm leading-relaxed text-primary-foreground/80"
                      : "mt-3 max-w-[48ch] text-sm leading-relaxed text-muted-foreground"
                  }
                >
                  {form.body}
                </p>
              </div>

              <div className="mt-auto pt-8">
                <EnhancedButton
                  asChild
                  variant={form.featured ? "gold" : "outline"}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <a href={form.src} target="_blank" rel="noopener noreferrer">
                    {form.cta}
                    <ExternalLink />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </EnhancedButton>
              </div>
            </div>
          </article>
        ))}

        <article className="rounded border border-border bg-card p-6 md:p-8 lg:col-span-2">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
            <div>
              <p className="eyebrow">Social channels</p>
              <h2 className="mt-3 text-2xl font-bold text-heading">Connect with us</h2>
              <p className="mt-3 max-w-[42ch] text-sm leading-relaxed text-muted-foreground">
                Follow along between meetings. Events, recaps, and opportunities go out here first.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {socials.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${social.name} (opens in a new tab)`}
                    className="flex min-h-28 items-center gap-4 rounded border border-border bg-background p-4 text-heading transition-colors duration-150 hover:border-border-strong hover:bg-muted hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <Icon className="h-9 w-9 shrink-0 text-link" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-sm font-bold">
                        {social.name}
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                      </span>
                      <span className="mt-1 block truncate text-xs text-muted-foreground">
                        {social.detail}
                      </span>
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
);

export default SignUp;
