import { ArrowRight, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import "./concept-review.css";

const conceptLinks = [
  {
    id: "research-editorial",
    number: "01",
    title: "Research Editorial",
    summary:
      "A calm, evidence-led direction that makes events, projects, and people easier to scan.",
    dials: "Variance 6 / Motion 4 / Density 4",
  },
  {
    id: "lab-notebook",
    number: "02",
    title: "Lab Notebook",
    summary:
      "A more student-led direction with a tactile campus bulletin rhythm and fast paths into club life.",
    dials: "Variance 8 / Motion 5 / Density 5",
  },
  {
    id: "bio-network",
    number: "03",
    title: "Bio Network",
    summary:
      "An image-led, immersive direction that frames the organization as a connected living research community.",
    dials: "Variance 7 / Motion 6 / Density 4",
  },
];

export const ConceptReviewHome = () => {
  return (
    <main className="concept-review-home">
      <section className="concept-review-intro">
        <a className="concept-review-back" href="/">
          Current site
          <ExternalLink aria-hidden="true" />
        </a>
        <p className="concept-review-kicker">Comp Bio at Berkeley redesign</p>
        <h1>Three directions to compare in the browser.</h1>
        <p className="concept-review-lede">
          Each skeleton uses the same content structure so the layout, tone, and
          interaction differences stay easy to judge.
        </p>
      </section>

      <section className="concept-review-list" aria-label="Design directions">
        {conceptLinks.map((concept) => (
          <a
            className="concept-review-item"
            href={`/concepts/${concept.id}`}
            key={concept.id}
          >
            <span className="concept-review-number">{concept.number}</span>
            <span className="concept-review-copy">
              <strong>{concept.title}</strong>
              <span>{concept.summary}</span>
            </span>
            <span className="concept-review-dials">{concept.dials}</span>
            <ArrowRight className="concept-review-arrow" aria-hidden="true" />
          </a>
        ))}
      </section>

      <aside className="concept-review-note">
        <strong>What to evaluate</strong>
        <p>
          Which direction makes you want to join, attend an event, or trust the
          group with a research collaboration?
        </p>
      </aside>
    </main>
  );
};

interface ConceptFrameProps {
  activeId: string;
  children: ReactNode;
}

export const ConceptFrame = ({ activeId, children }: ConceptFrameProps) => {
  return (
    <div className="concept-frame">
      <header className="concept-switcher">
        <a className="concept-switcher-home" href="/concepts">
          Review all
        </a>
        <nav aria-label="Switch design concept">
          {conceptLinks.map((concept) => (
            <a
              aria-current={activeId === concept.id ? "page" : undefined}
              href={`/concepts/${concept.id}`}
              key={concept.id}
            >
              <span>{concept.number}</span>
              <strong>{concept.title}</strong>
            </a>
          ))}
        </nav>
      </header>
      <div className="concept-frame-content">{children}</div>
    </div>
  );
};
