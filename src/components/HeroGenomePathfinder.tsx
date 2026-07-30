import { useEffect, useRef } from "react";

const VISIBILITY = 2;
const TEMPO = 2;
const INTERACTION = 2;
const TARGET_FPS = 30;
const POINT_COUNT = 58;

const BRANCHES = [
  [11, 20, 1],
  [29, 38, -1],
  [42, 50, 1],
] as const;

const EXONS = [7, 15, 25, 34, 44, 53] as const;

const lightPalette = {
  primary: [0, 50, 98],
  secondary: [44, 105, 137],
  muted: [91, 124, 151],
  gold: [253, 181, 21],
} as const;

const darkPalette = {
  primary: [129, 188, 227],
  secondary: [149, 199, 226],
  muted: [132, 163, 193],
  gold: [253, 181, 21],
} as const;

type Palette = typeof lightPalette | typeof darkPalette;
type Rgb = readonly [number, number, number];

interface PathfinderStyles {
  branch: string;
  exon: string;
  gold: string;
  junction: string;
  muted: string;
  primary: string;
}

const rgba = (rgb: Rgb, alpha: number) =>
  `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${Math.max(0, Math.min(1, alpha))})`;

const makeStyles = (palette: Palette): PathfinderStyles => ({
  branch: rgba(palette.secondary, 0.035 + VISIBILITY * 0.14),
  exon: rgba(palette.primary, 0.045 + VISIBILITY * 0.2),
  gold: rgba(palette.gold, 0.12 + VISIBILITY * 0.35),
  junction: rgba(palette.secondary, 0.08 + VISIBILITY * 0.2),
  muted: rgba(palette.muted, VISIBILITY * 0.13),
  primary: rgba(palette.primary, 0.045 + VISIBILITY * 0.17),
});

export const HeroGenomePathfinder = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const context = canvas?.getContext("2d", { alpha: true });

    if (!canvas || !host || !context) return;

    const pathX = new Float32Array(POINT_COUNT);
    const pathY = new Float32Array(POINT_COUNT);
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
    const pointer = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      active: false,
    };

    let width = 0;
    let height = 0;
    let dpr = 1;
    let hostLeft = 0;
    let hostTop = 0;
    let simulatedTime = 0;
    let lastFrameTime = 0;
    let animationFrame = 0;
    let isVisible = true;
    let reducedMotion = reducedMotionQuery.matches;
    let textShield: CanvasGradient | null = null;
    let artworkShield: CanvasGradient | null = null;
    let styles = makeStyles(
      document.documentElement.classList.contains("dark") ? darkPalette : lightPalette,
    );

    const distanceInfluence = (x: number, y: number, radius: number) => {
      if (!pointer.active || INTERACTION === 0) return 0;
      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const sigma = radius * 0.5;
      return Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma)) * INTERACTION;
    };

    const applyContextProtection = () => {
      context.save();
      context.globalCompositeOperation = "destination-out";

      if (textShield) {
        context.fillStyle = textShield;
        context.fillRect(0, 0, width * 0.68, height);
      }

      if (artworkShield) {
        context.fillStyle = artworkShield;
        context.fillRect(width * 0.34, 0, width * 0.66, height);
      }

      context.restore();
    };

    const draw = () => {
      if (!width || !height) return;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      if (pointer.active) {
        const follow = 0.032 + INTERACTION * 0.024;
        pointer.x += (pointer.targetX - pointer.x) * follow;
        pointer.y += (pointer.targetY - pointer.y) * follow;
      }

      const phase = simulatedTime * (0.00004 + TEMPO * 0.00005);
      const pointerRadius = 120 + INTERACTION * 125;

      for (let i = 0; i < POINT_COUNT; i += 1) {
        const u = i / (POINT_COUNT - 1);
        const x = (-0.08 + u * 1.16) * width;
        let y =
          height *
          (0.53 +
            Math.sin(u * Math.PI * 2 + phase) * 0.12 +
            Math.sin(u * Math.PI * 5 - phase * 0.7) * 0.035);
        const influence = distanceInfluence(x, y, pointerRadius);
        y += (pointer.y - y) * influence * 0.12;
        pathX[i] = x;
        pathY[i] = y;
      }

      context.save();
      context.lineCap = "round";
      context.lineJoin = "round";

      for (let i = 0; i < POINT_COUNT - 1; i += 1) {
        context.globalAlpha = Math.sin((i / (POINT_COUNT - 1)) * Math.PI);
        context.beginPath();
        context.moveTo(pathX[i], pathY[i]);
        context.lineTo(pathX[i + 1], pathY[i + 1]);
        context.strokeStyle = styles.primary;
        context.lineWidth = i % 7 === 0 ? 1.35 : 0.9;
        context.stroke();
      }

      context.globalAlpha = 1;

      for (let branchIndex = 0; branchIndex < BRANCHES.length; branchIndex += 1) {
        const branch = BRANCHES[branchIndex];
        const start = branch[0];
        const end = branch[1];
        const direction = branch[2];

        context.beginPath();
        for (let i = start; i <= end; i += 1) {
          const progress = (i - start) / (end - start);
          const dx = pathX[Math.min(POINT_COUNT - 1, i + 1)] - pathX[Math.max(0, i - 1)];
          const dy = pathY[Math.min(POINT_COUNT - 1, i + 1)] - pathY[Math.max(0, i - 1)];
          const length = Math.hypot(dx, dy) || 1;
          const influence = distanceInfluence(pathX[i], pathY[i], pointerRadius);
          const offset =
            Math.sin(progress * Math.PI) *
            direction *
            (16 + INTERACTION * 18 + influence * 13);
          const x = pathX[i] + (-dy / length) * offset;
          const y = pathY[i] + (dx / length) * offset;

          if (i === start) context.moveTo(x, y);
          else context.lineTo(x, y);
        }

        context.strokeStyle = styles.branch;
        context.lineWidth = 0.9;
        context.stroke();

        context.fillStyle = styles.junction;
        context.beginPath();
        context.arc(pathX[start], pathY[start], 2.2, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.arc(pathX[end], pathY[end], 2.2, 0, Math.PI * 2);
        context.fill();
      }

      for (let i = 0; i < EXONS.length; i += 1) {
        const index = EXONS[i];
        const dx = pathX[index + 1] - pathX[index - 1];
        const dy = pathY[index + 1] - pathY[index - 1];

        context.save();
        context.translate(pathX[index], pathY[index]);
        context.rotate(Math.atan2(dy, dx));
        context.fillStyle = styles.exon;
        context.fillRect(-7, -3, 14 + (i % 2) * 5, 6);
        context.restore();
      }

      context.strokeStyle = styles.muted;
      context.lineWidth = 0.8;
      for (let i = 4; i < POINT_COUNT - 4; i += 5) {
        const dx = pathX[i + 1] - pathX[i - 1];
        const dy = pathY[i + 1] - pathY[i - 1];
        const length = Math.hypot(dx, dy) || 1;
        const nx = (-dy / length) * 5;
        const ny = (dx / length) * 5;

        context.beginPath();
        context.moveTo(pathX[i] - nx, pathY[i] - ny);
        context.lineTo(pathX[i] + nx, pathY[i] + ny);
        context.stroke();
      }

      const active = Math.floor(
        (simulatedTime * (0.000012 + TEMPO * 0.00002) * POINT_COUNT) % POINT_COUNT,
      );
      context.save();
      context.translate(pathX[active], pathY[active]);
      context.rotate(Math.PI / 4);
      context.fillStyle = styles.gold;
      context.fillRect(-3.2, -3.2, 6.4, 6.4);
      context.restore();
      context.restore();

      applyContextProtection();
    };

    const resize = () => {
      const bounds = host.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      hostLeft = bounds.left;
      hostTop = bounds.top;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      textShield = context.createRadialGradient(
        width * 0.22,
        height * 0.5,
        0,
        width * 0.22,
        height * 0.5,
        Math.max(width * 0.34, 330),
      );
      textShield.addColorStop(0, "rgba(0, 0, 0, 0.78)");
      textShield.addColorStop(0.5, "rgba(0, 0, 0, 0.62)");
      textShield.addColorStop(1, "rgba(0, 0, 0, 0)");

      artworkShield = context.createRadialGradient(
        width * 0.72,
        height * 0.48,
        0,
        width * 0.72,
        height * 0.48,
        Math.max(width * 0.34, 360),
      );
      artworkShield.addColorStop(0, "rgba(0, 0, 0, 0.28)");
      artworkShield.addColorStop(0.64, "rgba(0, 0, 0, 0.12)");
      artworkShield.addColorStop(1, "rgba(0, 0, 0, 0)");

      pointer.x = width * 0.5;
      pointer.y = height * 0.5;
      pointer.targetX = pointer.x;
      pointer.targetY = pointer.y;
      draw();
    };

    const updateHostOrigin = () => {
      const bounds = host.getBoundingClientRect();
      hostLeft = bounds.left;
      hostTop = bounds.top;
    };

    const updatePointer = (event: PointerEvent) => {
      if (coarsePointerQuery.matches || reducedMotion) return;
      pointer.targetX = event.clientX - hostLeft;
      pointer.targetY = event.clientY - hostTop;
      if (!pointer.active) {
        pointer.x = pointer.targetX;
        pointer.y = pointer.targetY;
      }
      pointer.active = true;
    };

    const deactivatePointer = () => {
      pointer.active = false;
    };

    const animate = (timestamp: number) => {
      animationFrame = 0;
      if (!isVisible || document.hidden || reducedMotion) return;
      if (timestamp - lastFrameTime < 1000 / TARGET_FPS) {
        animationFrame = window.requestAnimationFrame(animate);
        return;
      }

      const delta = lastFrameTime ? Math.min(60, timestamp - lastFrameTime) : 16;
      lastFrameTime = timestamp;
      simulatedTime += delta * (0.18 + TEMPO * 0.82);
      draw();
      animationFrame = window.requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      if (animationFrame || !isVisible || document.hidden || reducedMotion) return;
      lastFrameTime = 0;
      animationFrame = window.requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
      if (!animationFrame) return;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const updateTheme = () => {
      styles = makeStyles(
        document.documentElement.classList.contains("dark") ? darkPalette : lightPalette,
      );
      draw();
    };

    const updateReducedMotion = () => {
      reducedMotion = reducedMotionQuery.matches;
      pointer.active = false;
      draw();
      if (reducedMotion) stopAnimation();
      else startAnimation();
    };

    const updateDocumentVisibility = () => {
      if (document.hidden) stopAnimation();
      else startAnimation();
    };

    const resizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) startAnimation();
        else stopAnimation();
      },
      { threshold: 0.02 },
    );
    const themeObserver = new MutationObserver(updateTheme);

    resizeObserver.observe(host);
    visibilityObserver.observe(host);
    themeObserver.observe(document.documentElement, {
      attributeFilter: ["class"],
      attributes: true,
    });
    host.addEventListener("pointermove", updatePointer, { passive: true });
    host.addEventListener("pointerleave", deactivatePointer, { passive: true });
    window.addEventListener("scroll", updateHostOrigin, { passive: true });
    document.addEventListener("visibilitychange", updateDocumentVisibility);
    reducedMotionQuery.addEventListener("change", updateReducedMotion);
    resize();
    startAnimation();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      themeObserver.disconnect();
      host.removeEventListener("pointermove", updatePointer);
      host.removeEventListener("pointerleave", deactivatePointer);
      window.removeEventListener("scroll", updateHostOrigin);
      document.removeEventListener("visibilitychange", updateDocumentVisibility);
      reducedMotionQuery.removeEventListener("change", updateReducedMotion);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-genome-pathfinder"
      data-interaction="200%"
      data-tempo="200%"
      data-visibility="200%"
      aria-hidden="true"
    />
  );
};
