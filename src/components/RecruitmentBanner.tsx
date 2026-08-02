import { ArrowRight, Dna } from "lucide-react";
import { Link } from "react-router-dom";

const RecruitmentBanner = () => (
  <aside
    aria-label="Fall 2026 recruitment announcement"
    className="relative isolate overflow-hidden border-b border-gold/30 bg-gold/[0.12] dark:bg-gold/[0.08]"
  >
    <div
      className="pointer-events-none absolute inset-0 -z-10 opacity-45"
      aria-hidden="true"
      style={{
        backgroundImage:
          "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.16), transparent)",
      }}
    />

    <div className="mx-auto flex min-h-12 max-w-6xl flex-col items-start justify-between gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:gap-6 sm:px-6 lg:px-8">
      <div className="flex items-start gap-2.5 sm:items-center">
        <Dna
          className="mt-0.5 h-4 w-4 shrink-0 text-label sm:mt-0"
          aria-hidden="true"
        />
        <p className="text-[13px] leading-5 text-foreground">
          <strong className="font-bold text-heading">
            We’re recruiting soon for Fall 2026.
          </strong>{" "}
          Sign up for updates and stay tuned.
        </p>
      </div>

      <Link
        to="/signup/"
        className="group ml-6 inline-flex min-h-8 shrink-0 items-center gap-1.5 border-b border-heading/45 text-xs font-bold text-heading transition-colors hover:border-heading hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:ml-0"
      >
        sign up
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </div>
  </aside>
);

export default RecruitmentBanner;
