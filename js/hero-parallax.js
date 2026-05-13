import { prefersReducedMotion } from "./dom.js";

const heroMesh = document.querySelector(".hero-mesh");
if (heroMesh && !prefersReducedMotion) {
  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 700);
        heroMesh.style.transform = `translate3d(0, ${y * 0.22}px, 0)`;
        ticking = false;
      });
    },
    { passive: true }
  );
}
