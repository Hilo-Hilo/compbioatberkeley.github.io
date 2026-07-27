"use client";

import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

/**
 * React Bits Pro Depth Card, adapted from an image card into a transparent
 * linked wrapper so irregularly shaped logo artwork remains background-free.
 */
export interface DepthCardProps extends PropsWithChildren {
  href: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
  rel?: string;
  className?: string;
  contentClassName?: string;
  maxRotation?: number;
  maxTranslation?: number;
  disableOnMobile?: boolean;
  respectReducedMotion?: boolean;
  spotlight?: boolean;
  spotlightColor?: string;
  ariaLabel: string;
}

type MotionTarget = {
  x: number;
  y: number;
  rotateX: number;
  rotateY: number;
};

const restingTarget: MotionTarget = {
  x: 0,
  y: 0,
  rotateX: 0,
  rotateY: 0,
};

const DepthCard = ({
  children,
  href,
  target = "_self",
  rel,
  className,
  contentClassName,
  maxRotation = 7,
  maxTranslation = 5,
  disableOnMobile = true,
  respectReducedMotion = true,
  spotlight = true,
  spotlightColor = "hsl(var(--gold) / 0.2)",
  ariaLabel,
}: DepthCardProps) => {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const animationFrame = useRef<number>();
  const targetMotion = useRef<MotionTarget>({ ...restingTarget });
  const currentMotion = useRef<MotionTarget>({ ...restingTarget });
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (!disableOnMobile) {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateMobile = () => setIsMobile(mediaQuery.matches);
    updateMobile();
    mediaQuery.addEventListener("change", updateMobile);
    return () => mediaQuery.removeEventListener("change", updateMobile);
  }, [disableOnMobile]);

  useEffect(() => {
    if (!respectReducedMotion) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, [respectReducedMotion]);

  const effectsDisabled =
    (disableOnMobile && isMobile) ||
    (respectReducedMotion && prefersReducedMotion);

  const resetTransforms = useCallback(() => {
    targetMotion.current = { ...restingTarget };
    currentMotion.current = { ...restingTarget };

    if (innerRef.current) {
      innerRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
    }
    if (contentRef.current) {
      contentRef.current.style.transform =
        "translate3d(0, 0, 24px)";
    }
  }, []);

  useEffect(() => {
    if (!isHovered || effectsDisabled) {
      resetTransforms();
      return;
    }

    const lerp = (start: number, end: number) =>
      start + (end - start) * 0.12;

    const animate = () => {
      const current = currentMotion.current;
      const destination = targetMotion.current;

      current.x = lerp(current.x, destination.x);
      current.y = lerp(current.y, destination.y);
      current.rotateX = lerp(current.rotateX, destination.rotateX);
      current.rotateY = lerp(current.rotateY, destination.rotateY);

      if (innerRef.current) {
        innerRef.current.style.transform =
          `rotateX(${current.rotateX}deg) rotateY(${current.rotateY}deg)`;
      }
      if (contentRef.current) {
        contentRef.current.style.transform =
          `translate3d(${current.x}px, ${current.y}px, 24px)`;
      }

      animationFrame.current = requestAnimationFrame(animate);
    };

    animationFrame.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrame.current !== undefined) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [effectsDisabled, isHovered, resetTransforms]);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (!cardRef.current || effectsDisabled) {
        return;
      }

      const bounds = cardRef.current.getBoundingClientRect();
      const horizontal =
        (event.clientX - bounds.left - bounds.width / 2) / (bounds.width / 2);
      const vertical =
        (event.clientY - bounds.top - bounds.height / 2) / (bounds.height / 2);

      targetMotion.current = {
        x: horizontal * -maxTranslation,
        y: vertical * -maxTranslation,
        rotateX: vertical * -maxRotation,
        rotateY: horizontal * maxRotation,
      };

      if (spotlight && spotlightRef.current) {
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;
        spotlightRef.current.style.background =
          `radial-gradient(180px circle at ${x}px ${y}px, ${spotlightColor}, transparent 72%)`;
      }
    },
    [
      effectsDisabled,
      maxRotation,
      maxTranslation,
      spotlight,
      spotlightColor,
    ],
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    resetTransforms();
  }, [resetTransforms]);

  return (
    <a
      ref={cardRef}
      href={href}
      target={target}
      rel={rel}
      className={cn("relative block focus:outline-none", className)}
      aria-label={ariaLabel}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onBlur={handleMouseLeave}
    >
      <div
        ref={innerRef}
        className="relative flex h-full w-full items-center justify-center transition-transform duration-300 ease-out [transform-style:preserve-3d]"
        style={{ willChange: "transform" }}
      >
        <div
          ref={contentRef}
          className={cn(
            "relative flex h-full w-full items-center justify-center [transform-style:preserve-3d]",
            contentClassName,
          )}
          style={{
            transform: "translate3d(0, 0, 24px)",
            willChange: "transform",
          }}
        >
          {children}
        </div>

        {spotlight && (
          <div
            ref={spotlightRef}
            className={cn(
              "pointer-events-none absolute inset-[-18%] -z-10 rounded-[50%] opacity-0 blur-xl transition-opacity duration-300",
              isHovered && !effectsDisabled && "opacity-100",
            )}
            aria-hidden="true"
          />
        )}
      </div>
    </a>
  );
};

DepthCard.displayName = "DepthCard";

export default DepthCard;
