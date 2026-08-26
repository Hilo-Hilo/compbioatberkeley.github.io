import { cn } from "@/lib/utils";
import { publicAssetPath } from "@/lib/publicAsset";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

const heroAssetPath = (theme: "light" | "dark", width: 800 | 1200 | 1600) =>
  publicAssetPath(`/hero/compbio-research-atlas-${theme}-${width}.webp`);

const heroSrcSet = (theme: "light" | "dark") =>
  [800, 1200, 1600]
    .map((width) => `${heroAssetPath(theme, width as 800 | 1200 | 1600)} ${width}w`)
    .join(", ");

const heroImageProps = {
  alt: "",
  width: 1600,
  height: 1200,
  decoding: "async" as const,
  draggable: false,
  fetchpriority: "high" as const,
  loading: "eager" as const,
  sizes: "(min-width: 1024px) 72vw, (min-width: 640px) 110vw, 135vw",
};

interface HeroScienceGraphicProps {
  className?: string;
}

export const HeroScienceGraphic = ({ className }: HeroScienceGraphicProps) => {
  const { resolvedTheme } = useTheme();
  const [darkMedia, setDarkMedia] = useState("(prefers-color-scheme: dark)");
  const themeReady = useRef(false);

  useEffect(() => {
    if (!resolvedTheme) return;

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

    if (!themeReady.current) {
      themeReady.current = true;
      if (resolvedTheme === systemTheme) return;
    }

    setDarkMedia(resolvedTheme === "dark" ? "all" : "not all");
  }, [resolvedTheme]);

  return (
    <span
      className={cn("hero-science-art block", className)}
      aria-hidden="true"
    >
      <picture>
        <source
          media={darkMedia}
          srcSet={heroSrcSet("dark")}
          sizes={heroImageProps.sizes}
        />
        <img
          {...heroImageProps}
          src={heroAssetPath("light", 800)}
          srcSet={heroSrcSet("light")}
          className="h-auto w-full select-none object-contain"
        />
      </picture>
    </span>
  );
};
