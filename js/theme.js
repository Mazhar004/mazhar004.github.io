import { body, prefersReducedMotion } from "./dom.js";

const themeToggle = document.getElementById("theme-toggle");

const updateThemeToggle = () => {
  if (!themeToggle) return;
  const isDark = body.dataset.theme === "dark";
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
};

const applyTheme = (theme) => {
  body.dataset.theme = theme;
  localStorage.setItem("theme", theme);
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#0c0b09" : "#f4f1ea");
  updateThemeToggle();
};

export const setTheme = (theme, event) => {
  if (!document.startViewTransition || prefersReducedMotion) {
    applyTheme(theme);
    return;
  }

  const x = event?.clientX ?? window.innerWidth / 2;
  const y = event?.clientY ?? window.innerHeight / 2;
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  const transition = document.startViewTransition(() => applyTheme(theme));
  transition.ready.then(() => {
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 650,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  });
};

const storedTheme = localStorage.getItem("theme") || "dark";
applyTheme(storedTheme);

themeToggle?.addEventListener("click", (e) => {
  const next = body.dataset.theme === "dark" ? "light" : "dark";
  setTheme(next, e);
});

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
