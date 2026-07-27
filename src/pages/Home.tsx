import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { PartnerLogoWall } from "@/components/PartnerLogoWall";
import { SectionHeading } from "@/components/PageHeader";
import { publicAssetPath } from "@/lib/publicAsset";

const LOGO_SRC = publicAssetPath("comp-bio-logo-berkeley.svg");

const objectives = [
  {
    n: "01",
    title: "Expand understanding",
    body: "Expand members' understanding of computational biology through hands-on learning and research.",
  },
  {
    n: "02",
    title: "Build connections",
    body: "Build connections with peers, faculty, alumni, and industry professionals in the field.",
  },
  {
    n: "03",
    title: "Real-world impact",
    body: "Engage in projects with real-world impact on healthcare and communities.",
  },
];

const Home = () => (
  <div>
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div className="absolute inset-0 bg-lab-grid" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.15fr_0.85fr] md:py-20 lg:gap-14 lg:px-8 lg:py-24">
        <div>
          <p className="eyebrow">Student org / UC Berkeley</p>
          <h1 className="mt-5 max-w-[15ch] text-4xl font-bold leading-[1.08] text-heading sm:text-5xl md:text-6xl">
            Computational Biology at <span className="gold-mark">Berkeley</span>
          </h1>
          <p className="mt-6 max-w-[48ch] text-base leading-relaxed text-muted-foreground md:text-lg">
            A student-driven community exploring the intersection of computer science, biology, and healthcare.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <EnhancedButton asChild variant="primary" size="lg">
              <a
                href="https://forms.gle/rD4XLxwZkxusCx5w5"
                target="_blank"
                rel="noopener noreferrer"
              >
                sign up for updates
                <ExternalLink />
              </a>
            </EnhancedButton>
            <EnhancedButton asChild variant="outline" size="lg">
              <Link to="/about">about us</Link>
            </EnhancedButton>
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <div className="hero-logo-plate w-full max-w-[320px] rounded-lg">
            <img
              src={LOGO_SRC}
              alt="Computational Biology at Berkeley logo"
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <SectionHeading title="What we aim to do" meta="03 objectives" />
      <div className="grid gap-4 md:grid-cols-3">
        {objectives.map((item) => (
          <article
            key={item.n}
            className="rounded border border-border bg-card p-6 transition-colors hover:border-border-strong"
          >
            <p className="text-[11px] text-label">[{item.n}]</p>
            <h3 className="mt-3 text-base font-bold text-heading">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
          </article>
        ))}
      </div>

      <EnhancedButton asChild variant="outline" className="mt-8">
        <Link to="/about">read our mission</Link>
      </EnhancedButton>
    </section>

    <section className="border-t border-border bg-muted">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
        <PartnerLogoWall
          title="Collaborators in our orbit"
          lede="From research institutions to biotech teams, these organizations have shared expertise, projects, and opportunities with our community."
        />
      </div>
    </section>

    <section className="border-t border-border bg-muted">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-7 px-4 py-14 sm:px-6 md:flex-row md:items-center lg:px-8">
        <div>
          <h2 className="text-2xl font-bold text-heading">Come build with us</h2>
          <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
            Workshops, project teams, and a mailing list that tells you when things happen. No prior
            bioinformatics experience required.
          </p>
        </div>
        <EnhancedButton asChild variant="gold" size="lg" className="shrink-0">
          <Link to="/signup">join the list</Link>
        </EnhancedButton>
      </div>
    </section>
  </div>
);

export default Home;
