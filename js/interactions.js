import { prefersReducedMotion, hoverCapable } from "./dom.js";

/* Card spotlight + subtle 3D tilt on pointer move. */
if (!prefersReducedMotion && hoverCapable) {
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      const xRel = (e.clientX - rect.left) / rect.width;
      const yRel = (e.clientY - rect.top) / rect.height;
      card.style.setProperty("--mx", `${xRel * 100}%`);
      card.style.setProperty("--my", `${yRel * 100}%`);

      const tiltX = (yRel - 0.5) * -6;
      const tiltY = (xRel - 0.5) * 6;
      card.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-2px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

/* Magnetic buttons — translate slightly toward cursor. */
if (!prefersReducedMotion && hoverCapable) {
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.28}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });
}

/* Click ripple on .btn and .filter-btn. */
if (!prefersReducedMotion) {
  document.querySelectorAll(".btn, .filter-btn").forEach((el) => {
    el.style.position = el.style.position || "relative";
    el.addEventListener("click", (e) => {
      const rect = el.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      el.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });
}

/* Bento tile hover spotlight (cursor tracking). */
if (!prefersReducedMotion && hoverCapable) {
  document.querySelectorAll(".bento").forEach((tile) => {
    tile.addEventListener("pointermove", (e) => {
      const rect = tile.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      tile.style.setProperty("--mx", `${x}%`);
      tile.style.setProperty("--my", `${y}%`);
    });
  });
}

/* Global cursor spotlight on the background dot pattern.
   Sets --cursor-x / --cursor-y on <html>; base.css uses them in the
   body::before mask so dots brighten in a circle around the pointer.
   Skipped on touch devices and when reduced-motion is preferred. */
if (!prefersReducedMotion && hoverCapable) {
  const root = document.documentElement;
  let raf = null;

  window.addEventListener("pointermove", (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      root.style.setProperty("--cursor-x", `${e.clientX}px`);
      root.style.setProperty("--cursor-y", `${e.clientY}px`);
    });
  }, { passive: true });

  /* When pointer leaves the window, park the spotlight off-screen so it
     disappears instead of getting stuck wherever the cursor was. */
  window.addEventListener("pointerleave", () => {
    root.style.setProperty("--cursor-x", "-300px");
    root.style.setProperty("--cursor-y", "-300px");
  });
}
