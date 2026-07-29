import { FaGithub, FaGlobe, FaLinkedin, FaOrcid } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const availableLinks = socialLinks
    .map((link) => ({
      ...link,
      href: link.value.trim() ? link.formatUrl(link.value.trim()) : "",
    }))
    .filter((link) => link.href);
  const hasProfile = Boolean(bio.trim()) || availableLinks.length > 0;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded border border-border bg-card transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none">
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

        {bio.trim() && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {bio}
          </p>
        )}

        {hasProfile && (
          <div className="mt-auto pt-4">
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="inline-flex min-h-9 items-center gap-2 rounded border border-border bg-button-surface px-3 py-2 text-xs font-semibold text-heading transition-colors hover:border-border-strong hover:text-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Info className="h-4 w-4" />
                  View profile
                </button>
              </DialogTrigger>
              <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto rounded border-border bg-popover sm:max-w-lg">
                <DialogHeader className="pr-8">
                  <DialogTitle className="text-xl text-heading">{name}</DialogTitle>
                  <DialogDescription className="text-xs uppercase tracking-[0.1em] text-label">
                    {role}
                  </DialogDescription>
                </DialogHeader>

                {bio.trim() && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-label">
                      About
                    </p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">
                      {bio}
                    </p>
                  </div>
                )}

                {availableLinks.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-label">
                      Links
                    </p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {availableLinks.map((link) => (
                        <a
                          key={link.id}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center gap-3 rounded border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-border-strong hover:text-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <span className="text-muted-foreground">{link.icon}</span>
                          {link.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </article>
  );
};
