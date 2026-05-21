/* Magnetic arrow field — a grid of small arrows drawn on a full-viewport
   canvas that rotate to point toward the cursor (atan2). Arrows near the
   pointer brighten to the accent color and lengthen, for a "magnetic" feel.
   Mirrors the new UI's .arrow-field. Skipped on touch / reduced-motion. */
import { prefersReducedMotion, hoverCapable } from "./dom.js";

const canvas = document.querySelector(".arrow-field");

if (canvas && !prefersReducedMotion && hoverCapable) {
  const ctx = canvas.getContext("2d");
  const GAP = 48; // spacing between arrows
  const REACH = 240; // px radius of the magnetic influence
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let w = 0;
  let h = 0;
  let mx = -9999;
  let my = -9999;
  let raf = null;
  let base = "rgba(15,23,42,0.16)";
  let near = "#3b82f6";

  const readColors = () => {
    const dark = document.body.dataset.theme === "dark";
    near = getComputedStyle(document.body).getPropertyValue("--signal").trim() || "#3b82f6";
    base = dark ? "rgba(176,189,212,0.20)" : "rgba(15,23,42,0.15)";
  };

  const resize = () => {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (mx < -9000) {
      mx = w / 2;
      my = h / 2;
    }
  };

  const draw = () => {
    raf = null;
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (let y = GAP / 2; y < h; y += GAP) {
      for (let x = GAP / 2; x < w; x += GAP) {
        const dx = mx - x;
        const dy = my - y;
        const dist = Math.hypot(dx, dy);
        const ang = Math.atan2(dy, dx);
        const prox = Math.max(0, 1 - dist / REACH);
        const len = 8 + prox * 8;
        const head = 3 + prox * 1.5;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ang);
        if (prox > 0.03) {
          ctx.strokeStyle = near;
          ctx.globalAlpha = 0.28 + prox * 0.72;
        } else {
          ctx.strokeStyle = base;
          ctx.globalAlpha = 1;
        }
        ctx.beginPath();
        ctx.moveTo(-len / 2, 0);
        ctx.lineTo(len / 2, 0);
        ctx.moveTo(len / 2, 0);
        ctx.lineTo(len / 2 - head, -head + 0.5);
        ctx.moveTo(len / 2, 0);
        ctx.lineTo(len / 2 - head, head - 0.5);
        ctx.stroke();
        ctx.restore();
      }
    }
  };

  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(draw);
  };

  window.addEventListener(
    "pointermove",
    (e) => {
      mx = e.clientX;
      my = e.clientY;
      schedule();
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    resize();
    schedule();
  });

  new MutationObserver(() => {
    readColors();
    schedule();
  }).observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });

  readColors();
  resize();
  draw();
}
