import { prefersReducedMotion } from "./dom.js";

/* Animated number counters in stat / metric cards. */
const animateStat = (el) => {
  if (el.dataset.animated) return;
  el.dataset.animated = "true";
  const target = Number(el.dataset.target || 0);
  const suffix = el.dataset.suffix || "";
  const fmt = (n) => n.toLocaleString("en-US");

  if (prefersReducedMotion) {
    el.textContent = `${fmt(target)}${suffix}`;
    return;
  }

  const duration = 1500;
  const start = performance.now();

  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const value = Math.floor(eased * target);
    el.textContent = `${fmt(value)}${suffix}`;
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = `${fmt(target)}${suffix}`;
  };
  requestAnimationFrame(tick);
};

const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateStat(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.4 }
);

document.querySelectorAll(".stat[data-target], .metric[data-target]").forEach((el) => {
  el.textContent = "0";
  statObserver.observe(el);
});

/* Skill-level bar fill on reveal. */
const skillBars = document.querySelectorAll(".skill-level__fill");
if (skillBars.length) {
  const skillObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const level = entry.target.dataset.level || "0";
          entry.target.style.width = `${level}%`;
          skillObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  skillBars.forEach((bar) => skillObs.observe(bar));
}
