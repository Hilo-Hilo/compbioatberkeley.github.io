import compBioLogo from "@/assets/comp-bio-logo.png";
import heroBg from "@/assets/hero-bg.jpg";
import "./research-editorial.css";

const officerFaces = [
  {
    name: "Anthea",
    role: "Co-President",
    src: "https://compbioatberkeley.github.io/fetched/officers/sp26/anthea_dd7a1514.jpg",
  },
  {
    name: "Saket",
    role: "Co-President",
    src: "https://compbioatberkeley.github.io/fetched/officers/sp26/saket_390d95bb.jpg",
  },
  {
    name: "Qile",
    role: "Operations and Tech Lead",
    src: "https://compbioatberkeley.github.io/fetched/officers/sp26/qile_e4b66a5d.jpg",
  },
  {
    name: "Priyam",
    role: "Projects Co-Chair",
    src: "https://compbioatberkeley.github.io/fetched/officers/sp26/priyam_e438dedd.jpg",
  },
  {
    name: "Allison",
    role: "Publicity Chair",
    src: "https://compbioatberkeley.github.io/fetched/officers/sp26/allison_7c598c4c.webp",
  },
  {
    name: "Nica",
    role: "Professional Development Co-Chair",
    src: "https://compbioatberkeley.github.io/fetched/officers/sp26/nica_ed392acc.jpg",
  },
  {
    name: "Anisha",
    role: "Internal Vice President",
    src: "https://compbioatberkeley.github.io/fetched/officers/sp26/anisha_9d3444ed.webp",
  },
  {
    name: "Hanson",
    role: "Historian",
    src: "https://compbioatberkeley.github.io/fetched/officers/sp26/hanson_2e993cf0.jpg",
  },
];

export default function ResearchEditorial() {
  return (
    <div className="research-editorial">
      <a className="re-skip-link" href="#main-content">
        Skip to content
      </a>

      <header className="re-site-header">
        <nav className="re-nav re-container" aria-label="Primary navigation">
          <a className="re-brand" href="/">
            <span className="re-brand-mark">
              <img src={compBioLogo} alt="" width="1024" height="1024" />
            </span>
            <span className="re-brand-name">
              Computational Biology
              <span>at Berkeley</span>
            </span>
          </a>

          <div className="re-desktop-nav">
            <a href="#what-we-do">What we do</a>
            <a href="#work">Work</a>
            <a href="/calendar">Calendar</a>
            <a href="#team">Team</a>
            <a href="#partners">Partner</a>
          </div>

          <details className="re-mobile-nav">
            <summary>Menu</summary>
            <div className="re-mobile-nav-panel">
              <a href="#what-we-do">What we do</a>
              <a href="#work">Work</a>
              <a href="/calendar">Calendar</a>
              <a href="#team">Team</a>
              <a href="#partners">Partner</a>
            </div>
          </details>
        </nav>
      </header>

      <main id="main-content">
        <section className="re-hero re-container" aria-labelledby="re-hero-title">
          <div className="re-hero-copy">
            <p className="re-brand-line">Computational Biology at Berkeley</p>
            <h1 id="re-hero-title">Biology meets computation here.</h1>
            <p className="re-hero-deck">
              A student-driven community for learning methods, building research, and finding collaborators across disciplines.
            </p>
            <div className="re-hero-actions">
              <a className="re-button re-button-primary" href="#join">
                Join the community
              </a>
              <a className="re-button re-button-secondary" href="/calendar">
                View calendar
              </a>
            </div>
          </div>

          <figure className="re-hero-media">
            <img
              src={heroBg}
              alt="Microscopy view of a DNA strand"
              width="1920"
              height="1080"
              fetchPriority="high"
              decoding="async"
            />
          </figure>
        </section>

        <section className="re-next re-container" aria-labelledby="re-next-title">
          <div className="re-next-status" aria-hidden="true">
            <span>Next</span>
            <strong>TBA</strong>
          </div>
          <div className="re-next-copy">
            <p className="re-kicker">Next event</p>
            <h2 id="re-next-title">Upcoming dates are being confirmed.</h2>
            <p>
              Workshops and general meetings will appear on the shared calendar as soon as dates are confirmed.
            </p>
          </div>
          <p className="re-next-note">Dates posted soon</p>
        </section>

        <section className="re-section re-container" id="what-we-do" aria-labelledby="re-pathways-title">
          <div className="re-section-heading">
            <h2 id="re-pathways-title">A place to learn, test, and connect.</h2>
            <p>
              Start with a workshop, join a project team, or meet the people already exploring the field.
            </p>
          </div>

          <div className="re-pathways">
            <article className="re-pathway re-pathway-learning">
              <p className="re-pathway-index">Learning</p>
              <div>
                <h3>Learn the methods by using them.</h3>
                <p>
                  Student-taught sessions move from core biology and coding concepts into current tools for genomics and machine learning.
                </p>
              </div>
              <a href="#work">See workshop proof</a>
            </article>

            <article className="re-pathway re-pathway-research">
              <p className="re-pathway-index">Research</p>
              <h3>Build with public biological data.</h3>
              <p>
                Project teams turn open datasets into reproducible analyses, software, and presentations.
              </p>
            </article>

            <article className="re-pathway re-pathway-community">
              <p className="re-pathway-index">Community</p>
              <h3>Find people across majors.</h3>
              <p>
                Biologists, engineers, data scientists, and curious beginners work side by side.
              </p>
              <a href="#team">Meet the student team</a>
            </article>
          </div>
        </section>

        <section className="re-section re-proof re-container" id="work" aria-labelledby="re-proof-title">
          <div className="re-section-heading re-proof-heading">
            <h2 id="re-proof-title">The work is already happening.</h2>
            <p>
              Public repositories and workshop recaps make the learning visible, specific, and easy to explore.
            </p>
          </div>

          <div className="re-proof-layout">
            <article className="re-featured-project">
              <p className="re-proof-type">Featured student project</p>
              <h3>Copy number variation in cancer scRNA-seq</h3>
              <p>
                A reproducible pipeline for comparing CNV patterns in public cancer datasets and separating malignant from normal cells.
              </p>
              <a
                href="https://github.com/CompBio-at-Berkeley-Projects/Fa25-Project4-CNV-Cancer-RNAseq-analysis"
                target="_blank"
                rel="noreferrer"
              >
                Explore the repository <span aria-hidden="true">↗</span>
              </a>
            </article>

            <div className="re-project-index" aria-label="More public projects">
              <a
                href="https://github.com/CompBio-at-Berkeley-Projects/Fa25-Project6-AD-Transcriptomics"
                target="_blank"
                rel="noreferrer"
              >
                <span>Alzheimer&apos;s transcriptomics</span>
                <small>Cell-specific expression from public RNA-seq data</small>
              </a>
              <a
                href="https://github.com/CompBio-at-Berkeley-Projects/Fa25-Project5-NHANES-Cardiovascular-Disease-Prediction-model"
                target="_blank"
                rel="noreferrer"
              >
                <span>Cardiovascular risk modeling</span>
                <small>Reproducible model benchmarking with NHANES data</small>
              </a>
            </div>

            <article className="re-workshop-proof">
              <p className="re-proof-type">Workshop proof</p>
              <h3>Intro to omics, followed by a hands-on scRNA-seq demo.</h3>
              <p>
                Students explored how omics data and single-cell analysis are
                changing biological research.
              </p>
              <a
                href="https://www.linkedin.com/company/computational-biology-at-berkeley/"
                target="_blank"
                rel="noreferrer"
              >
                Read the club updates <span aria-hidden="true">↗</span>
              </a>
            </article>
          </div>
        </section>

        <section className="re-section re-team re-container" id="team" aria-labelledby="re-team-title">
          <div className="re-team-copy">
            <h2 id="re-team-title">Student-led means students shape the work.</h2>
            <p>
              Officers plan the curriculum, guide project teams, run events, and create the community they want to learn in.
            </p>
            <a className="re-text-link" href="/officers">
              Meet all officers
            </a>
          </div>

          <div className="re-face-mosaic" aria-label="Spring 2026 officer portraits">
            {officerFaces.map((officer, index) => (
              <a
                className={`re-face re-face-${index + 1}`}
                href="/officers"
                key={officer.name}
                aria-label={`${officer.name}, ${officer.role}`}
              >
                <img
                  src={officer.src}
                  alt={`${officer.name}, ${officer.role}`}
                  width="360"
                  height="360"
                  loading="lazy"
                  decoding="async"
                />
              </a>
            ))}
          </div>
        </section>

        <section className="re-section re-partner re-container" id="partners" aria-labelledby="re-partner-title">
          <div>
            <h2 id="re-partner-title">Bring students a real research question.</h2>
            <p>
              Faculty, labs, alumni, and industry teams can propose projects, workshops, mentorship, or company visits.
            </p>
          </div>
          <a className="re-button re-button-secondary" href="/collaborations">
            Partner with us
          </a>
        </section>

        <section className="re-signup" id="join" aria-labelledby="re-signup-title">
          <div className="re-container re-signup-inner">
            <div>
              <h2 id="re-signup-title">Start with the next gathering.</h2>
              <p>Find membership and application details. No prior computational biology experience is required.</p>
            </div>
            <a className="re-button re-button-primary" href="/signup">
              Join the community
            </a>
          </div>
        </section>
      </main>

      <footer className="re-footer">
        <div className="re-container re-footer-inner">
          <a className="re-footer-brand" href="/">
            Computational Biology at Berkeley
          </a>
          <div className="re-footer-links" aria-label="Footer links">
            <a href="/about">About</a>
            <a href="/calendar">Calendar</a>
            <a href="https://github.com/CompbioAtBerkeley" target="_blank" rel="noreferrer">
              GitHub
            </a>
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
          </div>
          <p>Built by students at UC Berkeley.</p>
        </div>
      </footer>
    </div>
  );
}
