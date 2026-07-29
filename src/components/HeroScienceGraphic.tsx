import { cn } from "@/lib/utils";
import { publicAssetPath } from "@/lib/publicAsset";
import { useTheme } from "next-themes";

const heroAssetPath = (theme: "light" | "dark", width: 800 | 1600) =>
  publicAssetPath(`/hero/compbio-research-atlas-${theme}-${width}.webp`);

const heroImageProps = {
  alt: "",
  width: 1600,
  height: 1200,
  decoding: "async" as const,
  draggable: false,
  loading: "eager" as const,
  sizes: "(min-width: 1280px) 640px, (min-width: 1024px) 52vw, 92vw",
};

interface HeroScienceGraphicProps {
  className?: string;
}

export const HeroScienceGraphic = ({ className }: HeroScienceGraphicProps) => {
  const { resolvedTheme } = useTheme();
  const documentTheme =
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  const theme = resolvedTheme === "dark" || (!resolvedTheme && documentTheme === "dark")
    ? "dark"
    : "light";

  return (
    <span
      className={cn("hero-science-art block", className)}
      aria-hidden="true"
    >
      <img
        {...heroImageProps}
        src={heroAssetPath(theme, 1600)}
        srcSet={`${heroAssetPath(theme, 800)} 800w, ${heroAssetPath(theme, 1600)} 1600w`}
        className="h-auto w-full select-none object-contain"
      />
    </span>
  );
};
