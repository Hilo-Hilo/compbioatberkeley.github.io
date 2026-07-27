import type { CSSProperties } from "react";
import { ExternalLink, MousePointer2 } from "lucide-react";
import { SectionHeading } from "@/components/PageHeader";
import DepthCard from "@/components/react-bits/depth-card";
import { partners, type Partner } from "@/data/partners";
import { publicAssetPath } from "@/lib/publicAsset";
import { cn } from "@/lib/utils";

type PartnerLogoWallProps = {
  title: string;
  lede: string;
};

type CollageStyle = CSSProperties & {
  "--logo-delay": string;
};

const PartnerMark = ({
  partner,
  index,
}: {
  partner: Partner;
  index: number;
}) => {
  const style: CollageStyle = {
    "--logo-delay": `${index * -0.68}s`,
  };

  const imageClasses = cn(
    "partner-logo-image h-auto object-contain",
    partner.logoClassName,
  );

  return (
    <li
      className={cn(
        "partner-collage-slot relative flex min-h-32 items-center justify-center md:absolute md:min-h-0",
        partner.collageClassName,
      )}
      style={style}
    >
      <DepthCard
        href={partner.website}
        target="_blank"
        rel="noopener noreferrer"
        className="partner-logo-link group relative flex w-full items-center justify-center text-foreground focus-visible:rounded-sm"
        contentClassName="min-h-[inherit]"
        maxRotation={6}
        maxTranslation={4}
        ariaLabel={`Visit ${partner.name} website`}
      >
        <span
          className="pointer-events-none absolute inset-[-20%] -z-10 rounded-[50%] bg-background/90 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
          aria-hidden="true"
        />

        {partner.darkLogoPath ? (
          <>
            <img
              src={publicAssetPath(partner.logoPath)}
              alt={`${partner.name} logo`}
              className={cn(imageClasses, "dark:hidden")}
              loading="lazy"
              decoding="async"
            />
            <img
              src={publicAssetPath(partner.darkLogoPath)}
              alt={`${partner.name} logo`}
              className={cn(imageClasses, "hidden dark:block")}
              loading="lazy"
              decoding="async"
            />
          </>
        ) : (
          <img
            src={publicAssetPath(partner.logoPath)}
            alt={`${partner.name} logo`}
            className={imageClasses}
            loading="lazy"
            decoding="async"
          />
        )}

        <span className="partner-logo-caption pointer-events-none absolute left-1/2 top-[calc(100%+0.65rem)] z-30 flex -translate-x-1/2 translate-y-1 items-center gap-1.5 whitespace-nowrap rounded-full border border-border-strong bg-background/95 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground opacity-0 shadow-sm backdrop-blur-sm transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          {partner.name}
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </span>
      </DepthCard>
    </li>
  );
};

export const PartnerLogoWall = ({ title, lede }: PartnerLogoWallProps) => (
  <div>
    <SectionHeading
      title={title}
      meta={`${String(partners.length).padStart(2, "0")} organizations`}
    />

    <div className="-mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <p className="max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
        {lede}
      </p>
      <p className="flex shrink-0 items-center gap-2 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
        <MousePointer2 className="h-3.5 w-3.5 text-label" aria-hidden="true" />
        select a mark to visit
      </p>
    </div>

    <div className="partner-collage-stage relative mt-8 overflow-x-clip border-y border-border md:overflow-visible">
      <div className="absolute inset-0 bg-lab-grid opacity-45" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--background)/0)_15%,hsl(var(--background))_78%)]"
        aria-hidden="true"
      />

      <svg
        className="pointer-events-none absolute inset-0 hidden h-full w-full text-border-strong md:block"
        viewBox="0 0 1120 610"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M151 121C288 172 364 268 521 271C684 275 750 143 936 114"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="3 11"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M123 338C276 303 355 472 529 470C710 468 811 362 997 388"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="3 11"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx="521" cy="271" r="4" fill="hsl(var(--gold))" />
        <circle cx="529" cy="470" r="4" fill="hsl(var(--gold))" />
      </svg>

      <ul className="relative z-10 grid grid-cols-2 gap-x-6 gap-y-8 px-2 py-10 sm:px-6 md:block md:h-[610px] md:px-0 md:py-0">
        {partners.map((partner, index) => (
          <PartnerMark key={partner.name} partner={partner} index={index} />
        ))}
      </ul>
    </div>
  </div>
);
