type SiteTheme = "light" | "dark";

interface BioThemeTransitionOptions {
  nextTheme: SiteTheme;
  setTheme: (theme: SiteTheme) => void;
  trigger: HTMLElement;
}

let themeTransitionActive = false;

const applyTheme = (
  nextTheme: SiteTheme,
  setTheme: BioThemeTransitionOptions["setTheme"],
) => {
  const root = document.documentElement;
  root.classList.toggle("dark", nextTheme === "dark");
  root.style.colorScheme = nextTheme;
  setTheme(nextTheme);
};

const runFallbackBloom = ({
  nextTheme,
  originX,
  originY,
  revealRadius,
  setTheme,
}: {
  nextTheme: SiteTheme;
  originX: number;
  originY: number;
  revealRadius: number;
  setTheme: BioThemeTransitionOptions["setTheme"];
}) => {
  const bloom = document.createElement("span");
  const bloomSize = 80;
  const revealScale = (revealRadius + bloomSize) / (bloomSize / 2);
  const translatedOrigin = `translate3d(${originX - bloomSize / 2}px, ${
    originY - bloomSize / 2
  }px, 0)`;

  bloom.className = `theme-bio-bloom theme-bio-bloom--${nextTheme}`;
  bloom.setAttribute("aria-hidden", "true");
  document.body.appendChild(bloom);

  if (typeof bloom.animate !== "function") {
    bloom.remove();
    applyTheme(nextTheme, setTheme);
    themeTransitionActive = false;
    return;
  }

  const growth = bloom.animate(
    [
      {
        opacity: 0.35,
        transform: `${translatedOrigin} scale(0.04)`,
      },
      {
        opacity: 1,
        transform: `${translatedOrigin} scale(${revealScale * 1.025})`,
        offset: 0.82,
      },
      {
        opacity: 1,
        transform: `${translatedOrigin} scale(${revealScale})`,
      },
    ],
    {
      duration: 640,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      fill: "forwards",
    },
  );

  growth.finished
    .then(() => {
      applyTheme(nextTheme, setTheme);
      return bloom.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 260,
        easing: "cubic-bezier(0.4, 0, 1, 1)",
        fill: "forwards",
      }).finished;
    })
    .catch(() => {
      applyTheme(nextTheme, setTheme);
    })
    .finally(() => {
      bloom.remove();
      themeTransitionActive = false;
    });
};

export const runBioThemeTransition = ({
  nextTheme,
  setTheme,
  trigger,
}: BioThemeTransitionOptions) => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reduceMotion) {
    applyTheme(nextTheme, setTheme);
    return;
  }

  if (themeTransitionActive) return;
  themeTransitionActive = true;

  const triggerBounds = trigger.getBoundingClientRect();
  const originX = triggerBounds.left + triggerBounds.width / 2;
  const originY = triggerBounds.top + triggerBounds.height / 2;
  const horizontalReach = Math.max(originX, window.innerWidth - originX);
  const verticalReach = Math.max(originY, window.innerHeight - originY);
  const revealRadius = Math.hypot(horizontalReach, verticalReach);
  const membraneColor =
    nextTheme === "dark"
      ? "rgb(138 190 235 / 0.52)"
      : "rgb(255 183 18 / 0.58)";

  trigger.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(0.92)", offset: 0.32 },
      { transform: "scale(1)" },
    ],
    {
      duration: 460,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    },
  );

  if (!document.startViewTransition) {
    runFallbackBloom({
      nextTheme,
      originX,
      originY,
      revealRadius,
      setTheme,
    });
    return;
  }

  try {
    const transition = document.startViewTransition(() => {
      applyTheme(nextTheme, setTheme);
    });

    transition.ready
      .then(() => {
        const newTheme = document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${originX}px ${originY}px)`,
              `circle(${revealRadius * 0.32}px at ${originX}px ${originY}px)`,
              `circle(${revealRadius}px at ${originX}px ${originY}px)`,
            ],
            filter: [
              `drop-shadow(0 0 0 ${membraneColor}) saturate(1)`,
              `drop-shadow(0 0 18px ${membraneColor}) saturate(1.08)`,
              "drop-shadow(0 0 0 transparent) saturate(1)",
            ],
          },
          {
            duration: 820,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );

        const oldTheme = document.documentElement.animate(
          {
            opacity: [1, 0.94],
            transform: ["scale(1)", "scale(0.992)"],
          },
          {
            duration: 540,
            easing: "cubic-bezier(0.4, 0, 1, 1)",
            fill: "forwards",
            pseudoElement: "::view-transition-old(root)",
          },
        );

        return Promise.allSettled([newTheme.finished, oldTheme.finished]);
      })
      .catch(() => undefined);

    transition.finished.finally(() => {
      themeTransitionActive = false;
    }).catch(() => undefined);
  } catch {
    themeTransitionActive = false;
    applyTheme(nextTheme, setTheme);
  }
};
