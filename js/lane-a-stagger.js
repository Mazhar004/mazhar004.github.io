import { prefersReducedMotion } from "./dom.js";

/* Lane A: Deep stagger. Sets --stagger-delay + --i on each child of a
   [data-stagger] container so CSS can choreograph entrance animations. */
if (window.__laneAInit) {
  // noop — module already loaded
} else {
  window.__laneAInit = true;
  if (!prefersReducedMotion) {
    document.querySelectorAll("[data-stagger]").forEach((container) => {
      Array.from(container.children).forEach((child, i) => {
        child.style.setProperty("--stagger-delay", `calc(${i} * 60ms)`);
        child.style.setProperty("--i", String(i));
      });
    });
  }
}
