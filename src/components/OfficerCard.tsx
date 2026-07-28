import { FaGithub, FaGlobe, FaLinkedin, FaOrcid } from "react-icons/fa";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info } from "lucide-react";
import { Officer } from "@/types/officers";
import { ReactNode } from "react";
import { publicAssetPath } from "@/lib/publicAsset";
import { getOfficerPortraitFraming } from "@/data/officerPortraits";

interface OfficerCardProps {
  officer: Officer;
}

interface SocialLink {
  id: string;
  value: string;
  icon: ReactNode;
  title: string;
  formatUrl: (value: string) => string;
}

export const OfficerCard = ({ officer }: OfficerCardProps) => {
  const name = officer.name || "";
  const role = officer.role || "";
  const image = officer.image ? publicAssetPath(officer.image) : "";
  const portraitFraming = getOfficerPortraitFraming(officer);
  const personalWebsite = officer["personal website"] || "";
  const linkedin = officer.linkedin || "";
  const github = officer.github || "";
  const orcid = officer.orcid || "";
  const bio = officer.bio || "";
  const defaultImage = publicAssetPath("placeholder.svg");
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const socialLinks: SocialLink[] = [
    {
      id: "personalWebsite",
      value: personalWebsite,
      icon: <FaGlobe className="h-4 w-4" />,
      title: "Personal website",
      formatUrl: (value) => (value.startsWith("http") ? value : `https://${value}`),
    },
    {
      id: "linkedin",
      value: linkedin,
      icon: <FaLinkedin className="h-4 w-4" />,
      title: "LinkedIn",
      formatUrl: (value) =>
        value.startsWith("http") ? value : `https://linkedin.com/in/${value}`,
    },
    {
      id: "github",
      value: github,
      icon: <FaGithub className="h-4 w-4" />,
      title: "GitHub",
      formatUrl: (value) =>
        value.startsWith("http") ? value : `https://github.com/${value}`,
    },
    {
      id: "orcid",
      value: orcid,
      icon: <FaOrcid className="h-4 w-4" />,
      title: "ORCID",
      formatUrl: (value) =>
        value.startsWith("http") ? value : `https://orcid.org/${value}`,
    },
  ];

  return (
    <article className="flex h-full flex-col overflow-hidden rounded border border-border bg-card transition-colors hover:border-border-strong">
      <div className="aspect-[4/3] w-full overflow-hidden border-b border-border bg-muted">
        {image ? (
          <img
            src={image}
            alt={name ? `Portrait of ${name}` : "Officer portrait"}
            loading="lazy"
            className="h-full w-full object-cover"
            style={{ objectPosition: portraitFraming.objectPosition }}
            onError={(event) => {
              const target = event.currentTarget;
              target.onerror = null;
              target.src = defaultImage;
              target.classList.add("opacity-40");
            }}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-accent text-4xl font-bold tracking-[0.08em] text-accent-foreground"
            role="img"
            aria-label={`Portrait needed for ${name}`}
          >
            {initials}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-[15px] font-bold leading-snug text-heading">{name}</h3>
        {role && (
          <p className="text-[11px] uppercase tracking-[0.1em] text-label">{role}</p>
        )}

        <div className="mt-auto flex items-center gap-0.5 pt-3">
          {bio && bio.trim() !== "" && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  aria-label={`About ${name}`}
                  className="flex h-9 w-9 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Info className="h-4 w-4" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 border-border bg-popover">
                <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                  About {name}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground">{bio}</p>
              </HoverCardContent>
            </HoverCard>
          )}
          {socialLinks.map((link) => {
            if (!link.value || link.value.trim() === "") return null;
            return (
              <a
                key={link.id}
                href={link.formatUrl(link.value)}
                target="_blank"
                rel="noopener noreferrer"
                title={link.title}
                aria-label={`${name} - ${link.title}`}
                className="flex h-9 w-9 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.icon}
              </a>
            );
          })}
        </div>
      </div>
    </article>
  );
};
