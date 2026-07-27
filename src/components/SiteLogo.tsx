import type { ImgHTMLAttributes } from "react";
import { SITE_LOGO_DARK_SRC, SITE_LOGO_LIGHT_SRC } from "@/lib/siteLogo";
import { cn } from "@/lib/utils";

interface SiteLogoProps {
  alt?: string;
  className?: string;
  imageClassName?: string;
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  themeMode?: "site" | "system";
}

export const SiteLogo = ({
  alt = "",
  className,
  imageClassName,
  loading,
  themeMode = "site",
}: SiteLogoProps) => (
  <span
    className={cn("grid", className)}
    role={alt ? "img" : undefined}
    aria-label={alt || undefined}
    aria-hidden={alt ? undefined : true}
  >
    <img
      src={SITE_LOGO_LIGHT_SRC}
      alt=""
      className={cn(
        "col-start-1 row-start-1",
        themeMode === "site" ? "dark:hidden" : "site-logo-system-light",
        imageClassName,
      )}
      loading={loading}
      aria-hidden="true"
    />
    <img
      src={SITE_LOGO_DARK_SRC}
      alt=""
      className={cn(
        "col-start-1 row-start-1",
        themeMode === "site" ? "hidden dark:block" : "site-logo-system-dark",
        imageClassName,
      )}
      loading={loading}
      aria-hidden="true"
    />
  </span>
);
