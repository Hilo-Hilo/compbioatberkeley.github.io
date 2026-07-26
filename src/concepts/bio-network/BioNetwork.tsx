import heroBg from "@/assets/hero-bg.jpg";
import compBioLogo from "@/assets/comp-bio-logo.png";
import "./bio-network.css";

const joinUrl = "/signup";

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
    name: "Anisha",
    role: "Internal Vice President",
    image:
      "https://compbioatberkeley.github.io/fetched/officers/sp26/anisha_9d3444ed.webp",
  },
  {
    name: "Qile",
    role: "Operations and Tech Lead",
    image:
      "https://compbioatberkeley.github.io/fetched/officers/sp26/qile_e4b66a5d.jpg",
  },
  {
    name: "Marsiah",
    role: "External Vice President",
    image:
      "https://compbioatberkeley.github.io/fetched/officers/sp26/marsiah_16a0617d.jpg",
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
    name: "Hanson",
    role: "Historian",
    image:
      "https://compbioatberkeley.github.io/fetched/officers/sp26/hanson_2e993cf0.jpg",
  },
];

const projectProof = [
  {
    name: "Cancer RNA-seq CNV analysis",
    description:
      "A reproducible pipeline for comparing copy-number variation in public single-cell cancer data.",
    href: "https://github.com/CompBio-at-Berkeley-Projects/Fa25-Project4-CNV-Cancer-RNAseq-analysis",
  },
  {
    name: "Alzheimer's disease transcriptomics",
    description:
      "Public human RNA-seq data used to study cell-specific expression changes in disease progression.",
    href: "https://github.com/CompBio-at-Berkeley-Projects/Fa25-Project6-AD-Transcriptomics",
  },
  {
    name: "Cardiovascular risk modeling",
    description:
      "A reproducible NHANES workflow for benchmarking models and exploring risk factors.",
    href: "https://github.com/CompBio-at-Berkeley-Projects/Fa25-Project5-NHANES-Cardiovascular-Disease-Prediction-model",
  },
];

const ExternalArrow = () => (
  <span aria-hidden="true" className="bn-arrow">
    ↗
  </span>
);

export default function BioNetwork() {
  return (
    <div className="bio-network">
      <a className="bn-skip" href="#bn-main">
        Skip to content
      </a>

      <header className="bn-site-header">
        <nav className="bn-nav" aria-label="Primary navigation">
          <a className="bn-brand" href="/" aria-label="Comp Bio at Berkeley home">
            <span className="bn-logo-frame">
              <img src={compBioLogo} alt="" />
            </span>
            <span>Comp Bio at Berkeley</span>
          </a>

          <div className="bn-nav-links">
            <a href="#pathways">Explore</a>
            <a href="#projects">Projects</a>
            <a href="#people">People</a>
            <a href="/calendar">Calendar</a>
            <a
              className="bn-nav-join"
              href={joinUrl}
            >
              Join the club
            </a>
          </div>

          <details className="bn-mobile-menu">
            <summary>Menu</summary>
            <div className="bn-mobile-links">
              <a href="#pathways">Explore</a>
              <a href="#projects">Projects</a>
              <a href="#people">People</a>
              <a href="/calendar">Calendar</a>
              <a href={joinUrl}>
                Join the club
              </a>
            </div>
          </details>
        </nav>
      </header>

      <main id="bn-main">
        <section className="bn-hero" aria-labelledby="bn-hero-title">
          <div className="bn-hero-media" aria-hidden="true">
            <img src={heroBg} alt="" />
          </div>
          <div className="bn-hero-scrim" aria-hidden="true" />
          <div className="bn-hero-copy">
            <h1 id="bn-hero-title">Biology is a network. So are we.</h1>
            <p>
              Berkeley students learn, build, and investigate at the edge of
              computation and life.
            </p>
            <div className="bn-hero-actions">
              <a
                className="bn-button bn-button-primary"
                href={joinUrl}
              >
                Join the club
                <ExternalArrow />
              </a>
              <a className="bn-button bn-button-quiet" href="/calendar">
                View calendar
                <span aria-hidden="true" className="bn-arrow">
                  →
                </span>
              </a>
            </div>
          </div>
        </section>

        <section className="bn-event-wrap" aria-labelledby="bn-event-title">
          <div className="bn-event">
            <p className="bn-event-label">Next event</p>
            <div className="bn-event-copy">
              <h2 id="bn-event-title">See what is coming up</h2>
              <p>
                Dates, rooms, and speaker details are updated on the live
                calendar.
              </p>
            </div>
            <a className="bn-text-link" href="/calendar">
              Open the calendar
              <span aria-hidden="true" className="bn-arrow">
                →
              </span>
            </a>
          </div>
        </section>

        <section
          className="bn-section bn-pathways"
          id="pathways"
          aria-labelledby="bn-pathways-title"
        >
          <header className="bn-section-heading">
            <h2 id="bn-pathways-title">One community, three ways in.</h2>
            <p>
              Start with a workshop, find a research question, or meet people
              who want to explore one with you.
            </p>
          </header>

          <div className="bn-sequence" aria-label="Our shared process">
            <span>Observe</span>
            <i aria-hidden="true" />
            <span>Model</span>
            <i aria-hidden="true" />
            <span>Share</span>
          </div>

          <div className="bn-pathway-grid">
            <article className="bn-highlight bn-highlight-research">
              <img
                src={heroBg}
                alt="Close view of a DNA helix in a green microscopic field"
              />
              <div className="bn-highlight-scrim" aria-hidden="true" />
              <div className="bn-highlight-copy">
                <p>Research</p>
                <h3>Ask a question that needs more than one discipline.</h3>
                <a href="#projects">
                  See student work
                  <span aria-hidden="true" className="bn-arrow">
                    →
                  </span>
                </a>
              </div>
            </article>

            <article className="bn-highlight bn-highlight-learning">
              <p>Learning</p>
              <h3>Build foundations through student-led workshops.</h3>
              <p>
                Connect biological questions to practical computational tools,
                one session at a time.
              </p>
              <a href="/calendar">
                Find a workshop
                <span aria-hidden="true" className="bn-arrow">
                  →
                </span>
              </a>
            </article>

            <article className="bn-highlight bn-highlight-community">
              <p>Community</p>
              <h3>Meet collaborators across majors and experience levels.</h3>
              <a href="#people">
                Meet the team
                <span aria-hidden="true" className="bn-arrow">
                  →
                </span>
              </a>
            </article>
          </div>
        </section>

        <section
          className="bn-section bn-proof"
          id="projects"
          aria-labelledby="bn-proof-title"
        >
          <div className="bn-proof-main">
            <header className="bn-section-heading bn-proof-heading">
              <h2 id="bn-proof-title">Work that leaves the meeting room.</h2>
              <p>
                Student teams publish reproducible workflows built around real
                biological questions and public data.
              </p>
            </header>

            <ol className="bn-project-list">
              {projectProof.map((project) => (
                <li key={project.href}>
                  <a href={project.href} target="_blank" rel="noreferrer">
                    <span className="bn-project-name">{project.name}</span>
                    <span className="bn-project-description">
                      {project.description}
                    </span>
                    <ExternalArrow />
                  </a>
                </li>
              ))}
            </ol>

            <a
              className="bn-text-link bn-org-link"
              href="https://github.com/Compbio-at-berkeley-projects"
              target="_blank"
              rel="noreferrer"
            >
              Browse all public projects
              <ExternalArrow />
            </a>
          </div>

          <aside className="bn-workshop-proof" aria-label="Workshop program">
            <div className="bn-workshop-image">
              <img src={heroBg} alt="" />
            </div>
            <div className="bn-workshop-copy">
              <p>Workshops</p>
              <h3>Learn by opening the notebook and trying it together.</h3>
              <p>
                Sessions move from concepts to code, with room to ask the
                questions a lecture leaves behind.
              </p>
              <a href="/calendar">
                See workshops
                <span aria-hidden="true" className="bn-arrow">
                  →
                </span>
              </a>
            </div>
          </aside>
        </section>

        <section
          className="bn-section bn-people"
          id="people"
          aria-labelledby="bn-people-title"
        >
          <div className="bn-people-copy">
            <h2 id="bn-people-title">A network with real faces.</h2>
            <p>
              Officers lead projects, teach workshops, build partnerships, and
              make the club easier to enter.
            </p>
            <a className="bn-text-link" href="/officers">
              Meet every officer
              <span aria-hidden="true" className="bn-arrow">
                →
              </span>
            </a>
          </div>

          <div className="bn-face-mosaic" aria-label="Spring 2026 officer team">
            {officers.map((officer, index) => (
              <a
                href="/officers"
                key={officer.image}
                className={`bn-face bn-face-${index + 1}`}
                aria-label={`${officer.name}, ${officer.role}`}
              >
                <img
                  src={officer.image}
                  alt={`${officer.name}, ${officer.role}`}
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </section>

        <section className="bn-section bn-partner" aria-labelledby="bn-partner-title">
          <div>
            <h2 id="bn-partner-title">Bring your question to the room.</h2>
            <p>
              Faculty, labs, and biotech teams can mentor a project, sponsor a
              workshop, or share a problem.
            </p>
          </div>
          <a className="bn-button bn-button-outline" href="/collaborations">
            Partner with us
            <span aria-hidden="true" className="bn-arrow">
              →
            </span>
          </a>
        </section>

        <section className="bn-signup" aria-labelledby="bn-signup-title">
          <div className="bn-signup-thread" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div>
            <h2 id="bn-signup-title">Find your people in comp bio.</h2>
            <p>
              No prior research experience required. Start with an event, a
              workshop, or a project team.
            </p>
          </div>
          <a
            className="bn-button bn-button-primary"
            href={joinUrl}
          >
            Join the club
            <ExternalArrow />
          </a>
        </section>
      </main>

      <footer className="bn-footer">
        <div className="bn-footer-brand">
          <span className="bn-logo-frame">
            <img src={compBioLogo} alt="" />
          </span>
          <span>Computational Biology at Berkeley</span>
        </div>
        <div className="bn-footer-links">
          <a
            href="https://www.instagram.com/ucb_compbio/"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
          <a
            href="https://www.linkedin.com/company/computational-biology-at-berkeley/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/CompbioAtBerkeley"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
        <p>Built by students at UC Berkeley.</p>
      </footer>
    </div>
  );
}
