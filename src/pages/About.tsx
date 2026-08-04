import { PageHeader, SectionHeading } from "@/components/PageHeader";
import { publicAssetPath } from "@/lib/publicAsset";

const work = [
  {
    n: "01",
    title: "Educational excellence",
    body: "Educational workshops in computational biology provide foundational knowledge in biology and computer science, connecting theory with practical application.",
  },
  {
    n: "02",
    title: "Research and projects",
    body: "Research and project teams work on current problems at the intersection of computation and biology.",
  },
  {
    n: "03",
    title: "Professional networking",
    body: "Networking opportunities with faculty, alumni, and biotech companies help members build meaningful professional relationships.",
  },
  {
    n: "04",
    title: "Community impact",
    body: "Community projects use computational biology to support healthcare, sustainability, and related fields.",
  },
];

const About = () => (
  <div>
    <PageHeader
      eyebrow="01 / about"
      title="Our mission"
      lede="Computational Biology at Berkeley is a student organization dedicated to bridging the gap between biology and computation."
    />

    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <div className="border-l-2 border-gold pl-6 md:pl-8">
        <p className="max-w-[62ch] text-lg leading-relaxed md:text-xl">
          We provide a collaborative environment where students can deepen their knowledge, work on
          interdisciplinary projects, and connect with leaders in academia and industry.
        </p>
      </div>

      <figure className="mt-12">
        <img
          src={publicAssetPath("community/sp26/attending-members-club-photoshoot.webp")}
          alt="Computational Biology at Berkeley members posing together outside a campus building."
          width={2400}
          height={1600}
          loading="lazy"
          decoding="async"
          className="aspect-[3/2] w-full rounded border border-border object-cover"
        />
        <figcaption className="mt-3 max-w-[65ch] text-sm leading-relaxed text-muted-foreground">
          Attending members of Computational Biology at Berkeley at our Spring 2026 club
          photoshoot.
        </figcaption>
      </figure>

      <div className="mt-16">
        <SectionHeading title="What we do" meta="04 areas" />
        <div className="grid gap-4 md:grid-cols-2">
          {work.map((item) => (
            <article
              key={item.n}
              className="rounded border border-border bg-card p-6 transition-colors hover:border-border-strong"
            >
              <p className="text-[11px] text-label">[{item.n}]</p>
              <h3 className="mt-3 text-lg font-bold text-heading">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default About;
