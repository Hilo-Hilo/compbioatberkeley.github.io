import { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: ReactNode;
  lede?: string;
  children?: ReactNode;
}

export const PageHeader = ({ eyebrow, title, lede, children }: PageHeaderProps) => (
  <header className="relative overflow-hidden border-b border-border bg-muted">
    <div className="absolute inset-0 bg-lab-grid opacity-80" aria-hidden="true" />
    <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-4 max-w-[18ch] text-4xl font-bold leading-[1.08] text-heading md:text-5xl">
        {title}
      </h1>
      {lede && (
        <p className="mt-5 max-w-[56ch] text-base leading-relaxed text-muted-foreground md:text-lg">
          {lede}
        </p>
      )}
      {children && <div className="mt-8">{children}</div>}
    </div>
  </header>
);

interface SectionHeadingProps {
  title: string;
  meta?: string;
}

export const SectionHeading = ({ title, meta }: SectionHeadingProps) => (
  <div className="mb-7 flex items-baseline gap-4">
    <h2 className="text-xl font-bold text-heading md:text-2xl">{title}</h2>
    <span className="h-px flex-1 bg-border" aria-hidden="true" />
    {meta && <span className="text-[11px] text-muted-foreground">{meta}</span>}
  </div>
);
