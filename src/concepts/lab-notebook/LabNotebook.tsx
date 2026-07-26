import compBioLogo from "@/assets/comp-bio-logo.png";
import heroBg from "@/assets/hero-bg.jpg";
import "./lab-notebook.css";

const officers = [
  {
    name: "Anthea",
    role: "Co-President",
    image:
      "https://compbioatberkeley.github.io/fetched/officers/sp26/anthea_dd7a1514.jpg",
  },
  {
    name: "Saket",
    role: "Co-President",
    image:
      "https://compbioatberkeley.github.io/fetched/officers/sp26/saket_390d95bb.jpg",
  },
  {
    name: "Qile",
    role: "Operations and Tech Lead",
    image:
      "https://compbioatberkeley.github.io/fetched/officers/sp26/qile_e4b66a5d.jpg",
  },
  {
    name: "Priyam",
    role: "Projects Co-Chair",
    image:
      "https://compbioatberkeley.github.io/fetched/officers/sp26/priyam_e438dedd.jpg",
  },
  {
    name: "Allison",
    role: "Publicity Chair",
    image:
      "https://compbioatberkeley.github.io/fetched/officers/sp26/allison_7c598c4c.webp",
  },
  {
    name: "Nica",
    role: "Professional Development Co-Chair",
    image:
      "https://compbioatberkeley.github.io/fetched/officers/sp26/nica_ed392acc.jpg",
  },
  {
    name: "Marsiah",
    role: "External Vice President",
    image:
      "https://compbioatberkeley.github.io/fetched/officers/sp26/marsiah_16a0617d.jpg",
  },
  {
    name: "Hanson",
    role: "Historian",
    image:
      "https://compbioatberkeley.github.io/fetched/officers/sp26/hanson_2e993cf0.jpg",
  },
];

const primaryLinks = [
  { label: "About", href: "/about" },
  { label: "Calendar", href: "/calendar" },
  { label: "Projects", href: "#projects" },
  { label: "People", href: "#people" },
  { label: "Partner", href: "/collaborations" },
];

function BrandMark() {
  return (
    <span className="ln-brand">
      <span className="ln-brand__label" aria-hidden="true">
        <img src={compBioLogo} alt="" />
      </span>
      <span className="ln-brand__name">
        Comp Bio
        <small>@ Berkeley</small>
      </span>
    </span>
  );
}

function NavigationLinks({ mobile = false }: { mobile?: boolean }) {
  return (
    <nav
      className={mobile ? "ln-nav-links ln-nav-links--mobile" : "ln-nav-links"}
      aria-label={mobile ? "Mobile navigation" : "Primary navigation"}
    >
      {primaryLinks.map((link) => (
        <a href={link.href} key={link.label}>
          {link.label}
        </a>
      ))}
    </nav>
  );
}

export default function LabNotebook() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="lab-notebook">
      <a className="ln-skip-link" href="#lab-main">
        Skip to content
      </a>

      <header className="ln-header">
        <div className="ln-shell ln-header__inner">
          <a className="ln-brand-link" href="/" aria-label="Comp Bio at Berkeley home">
            <BrandMark />
          </a>

          <NavigationLinks />

          <details className="ln-mobile-menu">
            <summary>Menu</summary>
            <NavigationLinks mobile />
          </details>
        </div>
      </header>

      <main id="lab-main">
        <section className="ln-shell ln-hero" aria-labelledby="lab-hero-title">
          <div className="ln-hero__copy">
            <p className="ln-eyebrow">A student-run Berkeley community</p>
            <h1 id="lab-hero-title">
              Biology meets code.
              <span>Students build here.</span>
            </h1>
            <p className="ln-hero__intro">
              Learn the science, ship real projects, and find your people across Berkeley.
            </p>
            <div className="ln-actions" aria-label="Get involved">
              <a className="ln-button ln-button--primary" href="/signup">
                Join the club
              </a>
              <a className="ln-button ln-button--secondary" href="/calendar">
                View calendar
              </a>
            </div>
          </div>

          <div className="ln-hero__visual">
            <figure className="ln-hero-photo">
              <img
                src={heroBg}
                alt="A close view of a DNA helix representing computational biology"
                fetchPriority="high"
              />
            </figure>

            <aside className="ln-next-event" id="next-event" aria-labelledby="next-event-title">
              <div>
                <p className="ln-note-label">Next event</p>
                <h2 id="next-event-title">Upcoming dates are being confirmed.</h2>
              </div>
              <a href="/calendar">View calendar</a>
            </aside>
          </div>
        </section>

        <section className="ln-section ln-shell" id="learn" aria-labelledby="learn-title">
          <header className="ln-section-heading">
            <h2 id="learn-title">Three ways in. One community.</h2>
            <p>
              Start with a workshop, join a research team, or simply meet people who
              share your questions.
            </p>
          </header>

          <div className="ln-highlights">
            <article className="ln-highlight ln-highlight--learn">
              <div className="ln-highlight__index" aria-hidden="true">
                learn
              </div>
              <div>
                <h3>Learn by doing</h3>
                <p>
                  Build foundations in biology and computation through practical,
                  student-led workshops.
                </p>
              </div>
            </article>

            <article className="ln-highlight ln-highlight--research">
              <img
                src={heroBg}
                alt=""
                loading="lazy"
              />
              <div>
                <h3>Turn questions into research</h3>
                <p>
                  Work alongside peers on problems that connect data, code, and living
                  systems.
                </p>
              </div>
            </article>

            <article className="ln-highlight ln-highlight--community">
              <div>
                <h3>Find your collaborators</h3>
                <p>
                  Meet students across majors, experience levels, and research
                  interests.
                </p>
              </div>
              <span className="ln-community-mark" aria-hidden="true">
                <img src={compBioLogo} alt="" loading="lazy" />
              </span>
            </article>
          </div>
        </section>

        <section className="ln-section ln-shell ln-proof" id="projects" aria-labelledby="proof-title">
          <header className="ln-proof__heading">
            <h2 id="proof-title">Workshops start it. Projects make it real.</h2>
            <p>
              Learn with the club, then keep building with a team and a question worth
              exploring.
            </p>
          </header>

          <article className="ln-project-sheet">
            <div className="ln-project-sheet__lead">
              <p className="ln-note-label">Student project teams</p>
              <h3>Move from an idea to a reproducible result.</h3>
              <p>
                Teams make room for research, engineering, documentation, and
                presentation skills.
              </p>
              <a
                href="https://github.com/Compbio-at-berkeley-projects"
                target="_blank"
                rel="noreferrer"
              >
                Browse project work
              </a>
            </div>

            <div className="ln-workshop-loop" aria-label="How workshops connect to projects">
              <div>
                <strong>Learn together</strong>
                <span>Get the concepts and tools into your hands.</span>
              </div>
              <div>
                <strong>Apply with a team</strong>
                <span>Test an idea against a real biological question.</span>
              </div>
              <div>
                <strong>Share the work</strong>
                <span>Document what worked, what failed, and what comes next.</span>
              </div>
              <a
                href="https://github.com/CompbioAtBerkeley"
                target="_blank"
                rel="noreferrer"
              >
                Visit the club GitHub
              </a>
            </div>
          </article>
        </section>

        <section className="ln-section ln-shell ln-people" id="people" aria-labelledby="people-title">
          <header className="ln-section-heading ln-section-heading--people">
            <h2 id="people-title">Meet the students making it happen.</h2>
            <a href="/officers">Meet all officers</a>
          </header>

          <div className="ln-officer-mosaic">
            {officers.map((officer) => (
              <figure className="ln-officer" key={officer.name}>
                <img
                  src={officer.image}
                  alt={`${officer.name}, ${officer.role}`}
                  loading="lazy"
                />
                <figcaption>
                  <strong>{officer.name}</strong>
                  <span>{officer.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="ln-section ln-shell">
          <div className="ln-partner-invite">
            <h2>Bring a problem students can help explore.</h2>
            <div>
              <p>
                We welcome guest speakers, workshop collaborators, project partners,
                and sponsors.
              </p>
              <a className="ln-text-link" href="/collaborations">
                Start a collaboration
              </a>
            </div>
          </div>
        </section>

        <section className="ln-section ln-shell ln-signup" id="signup" aria-labelledby="signup-title">
          <div>
            <h2 id="signup-title">Stay close to what we are building.</h2>
            <p>Get workshop news, project openings, and community updates.</p>
          </div>
          <a
            className="ln-button ln-button--primary"
            href="/signup"
          >
            Join the club
          </a>
        </section>
      </main>

      <footer className="ln-footer">
        <div className="ln-shell ln-footer__inner">
          <a className="ln-brand-link" href="/" aria-label="Comp Bio at Berkeley home">
            <BrandMark />
          </a>
          <nav aria-label="Social links">
            <a href="https://www.instagram.com/ucb_compbio/" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a
              href="https://www.linkedin.com/company/computational-biology-at-berkeley/"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
            <a href="https://github.com/CompbioAtBerkeley" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </nav>
          <p>© {currentYear} Comp Bio at Berkeley</p>
        </div>
      </footer>
    </div>
  );
}
