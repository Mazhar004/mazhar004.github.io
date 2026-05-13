import { prefersReducedMotion } from "./dom.js";

/* data-scroll reveal observer (cinematic). */
const scrollRevealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        scrollRevealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
);

document.querySelectorAll("[data-scroll]").forEach((el) => {
  const parent = el.parentElement;
  if (parent) {
    const siblings = Array.from(parent.querySelectorAll("[data-scroll]"));
    const idx = siblings.indexOf(el);
    if (idx >= 0) el.style.setProperty("--scroll-delay", `${idx * 0.06}s`);
  }
  scrollRevealObserver.observe(el);
});

/* Section titles use the same reveal observer. */
document.querySelectorAll(".section-title").forEach((el) => scrollRevealObserver.observe(el));

/* Scroll progress bar + back-to-top visibility. */
const scrollProgress = document.getElementById("scroll-progress");
const toTopButton = document.getElementById("to-top");

let scrollRaf = null;
const onScroll = () => {
  if (scrollRaf) return;
  scrollRaf = requestAnimationFrame(() => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    if (scrollProgress) scrollProgress.style.width = `${progress}%`;

    if (toTopButton) {
      toTopButton.classList.toggle("visible", window.scrollY > 500);
    }

    scrollRaf = null;
  });
};

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

toTopButton?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
});

/* --header-h CSS var, kept in sync with the sticky header height. */
const setHeaderHeightVar = () => {
  const headerEl = document.querySelector(".site-header");
  if (!headerEl) return;
  const h = Math.round(headerEl.getBoundingClientRect().height);
  document.documentElement.style.setProperty("--header-h", `${h}px`);
};

setHeaderHeightVar();
window.addEventListener("resize", setHeaderHeightVar);
