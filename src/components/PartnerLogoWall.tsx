import { ExternalLink } from "lucide-react";
import { SectionHeading } from "@/components/PageHeader";
import { partners } from "@/data/partners";
import { publicAssetPath } from "@/lib/publicAsset";
import { cn } from "@/lib/utils";

type PartnerLogoWallProps = {
  title: string;
  lede: string;
};

const formatIndex = (index: number) => String(index + 1).padStart(2, "0");

export const PartnerLogoWall = ({ title, lede }: PartnerLogoWallProps) => (
  <div>
    <SectionHeading
      title={title}
      meta={`${String(partners.length).padStart(2, "0")} organizations`}
    />
    <p className="-mt-3 mb-8 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
      {lede}
    </p>

    <div className="grid grid-cols-2 gap-px overflow-hidden rounded border border-border bg-border sm:grid-cols-3 lg:grid-cols-4">
      {partners.map((partner, index) => (
        <a
          key={partner.name}
          href={partner.website}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex min-h-[210px] flex-col bg-card p-3 text-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:z-10 sm:p-4"
          aria-label={`Visit ${partner.name}`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] text-label">[{formatIndex(index)}]</span>
            <ExternalLink
              className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </div>

          <div
            className={cn(
              "mt-3 flex min-h-[128px] flex-1 items-center justify-center rounded-sm border border-black/10 px-4 py-5",
              partner.logoSurface === "dark" ? "bg-[#17142d]" : "bg-white",
            )}
          >
            <img
              src={publicAssetPath(partner.logoPath)}
              alt={`${partner.name} logo`}
              className={cn("h-auto object-contain", partner.logoClassName)}
              decoding="async"
            />
          </div>

          <span className="mt-3 text-xs font-semibold text-heading">{partner.name}</span>
        </a>
      ))}
    </div>
  </div>
);
