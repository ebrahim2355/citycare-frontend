import { flushSync } from "react-dom";

interface Origin {
  x: number;
  y: number;
}

const resolve = (theme: string) =>
  theme === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme;

export function switchTheme(theme: string, setTheme: (theme: string) => void, origin?: Origin) {
  const root = document.documentElement;
  const next = resolve(theme);
  const current = root.classList.contains("dark") ? "dark" : "light";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (next === current || reduceMotion || typeof document.startViewTransition !== "function") {
    setTheme(theme);
    return;
  }

  const { x, y } = origin ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  const transition = document.startViewTransition(() => {
    root.classList.remove("light", "dark");
    root.classList.add(next);
    root.style.colorScheme = next;
    flushSync(() => setTheme(theme));
  });

  transition.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 550, easing: "cubic-bezier(0.22, 0.75, 0.25, 1)", pseudoElement: "::view-transition-new(root)" }
      );
    })
    .catch(() => {});
}
