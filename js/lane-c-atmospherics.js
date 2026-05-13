import { hoverCapable } from "./dom.js";

/* Lane C: Heartbeat sync + now-reading chip + hero shape choreography + name tilt. */
if (window.__laneCInit) {
  // noop
} else {
  window.__laneCInit = true;

  const pRM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Now-reading floating chip ---- */
  const nowReading = document.getElementById("now-reading");
  const nowText = nowReading ? nowReading.querySelector(".now-reading__text") : null;

  const SECTION_LABELS = {
    top: "00 / HOME",
    profile: "01 / PROFILE",
    experience: "02 / EXPERIENCE",
    education: "03 / EDUCATION",
    publications: "04 / PUBLICATIONS",
    skills: "05 / SKILLS",
    projects: "06 / PROJECTS",
    certifications: "07 / CERTIFICATIONS",
    contact: "08 / CONTACT",
  };

  let currentSectionId = "top";
  let textSwapTimer = null;

  const setChipText = (label, instant) => {
    if (!nowText) return;
    if (instant || pRM) {
      nowText.textContent = "NOW · " + label;
      return;
    }
    if (textSwapTimer) clearTimeout(textSwapTimer);
    nowText.classList.add("is-fading");
    textSwapTimer = setTimeout(() => {
      nowText.textContent = "NOW · " + label;
      nowText.classList.remove("is-fading");
      textSwapTimer = null;
    }, 150);
  };

  const updateChip = (id) => {
    if (!nowReading || id === currentSectionId) return;
    currentSectionId = id;
    const label = SECTION_LABELS[id] || id.toUpperCase();
    setChipText(label, false);
  };

  if (nowReading && nowText) {
    setChipText(SECTION_LABELS["top"], true);
    nowReading.removeAttribute("hidden");

    const chipSections = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'))
      .map((a) => a.getAttribute("href").slice(1))
      .filter(Boolean)
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const nowReadingObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          updateChip(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    chipSections.forEach((s) => nowReadingObserver.observe(s));

    let chipScrollRaf = null;
    const updateChipVisibility = () => {
      chipScrollRaf = null;
      if (window.scrollY < 80) {
        nowReading.classList.remove("is-visible");
      } else {
        nowReading.classList.add("is-visible");
      }
    };
    window.addEventListener(
      "scroll",
      () => {
        if (chipScrollRaf) return;
        chipScrollRaf = requestAnimationFrame(updateChipVisibility);
      },
      { passive: true }
    );
    updateChipVisibility();
  }

  /* ---- Hero shape scroll dispersal ---- */
  if (!pRM) {
    const shapesEl = document.querySelector(".hero-stage .shapes");
    const shape1 = document.querySelector(".shape-1");
    const shape2 = document.querySelector(".shape-2");
    const shape3 = document.querySelector(".shape-3");

    if (shapesEl && shape1 && shape2 && shape3) {
      let shapeRaf = null;
      let lastProgress = -1;

      const updateShapes = () => {
        shapeRaf = null;
        const raw = window.scrollY / window.innerHeight;
        const progress = Math.min(Math.max(raw, 0), 1.5);
        if (progress >= 1.5 && lastProgress >= 1.5) return;
        lastProgress = progress;

        const blurAdd = progress * 40;
        const fade = Math.max(1 - progress * 0.7, 0);

        shape1.style.setProperty("--lc-sx1", progress * 200 + "px");
        shape1.style.setProperty("--lc-sy1", progress * -150 + "px");
        shape2.style.setProperty("--lc-sx2", progress * -240 + "px");
        shape2.style.setProperty("--lc-sy2", progress * 100 + "px");
        shape3.style.setProperty("--lc-sx3", progress * 120 + "px");
        shape3.style.setProperty("--lc-sy3", progress * -80 + "px");

        shapesEl.style.setProperty("--lc-blur-add", blurAdd + "px");
        shapesEl.style.setProperty("--lc-fade", fade);

        shape1.style.scale = String(1 + progress * 0.6);
        shape2.style.scale = String(1 + progress * 0.5);
        shape3.style.scale = String(1 + progress * 0.4);
      };

      window.addEventListener(
        "scroll",
        () => {
          if (shapeRaf) return;
          shapeRaf = requestAnimationFrame(updateShapes);
        },
        { passive: true }
      );
      updateShapes();
    }
  }

  /* ---- Hero name micro-tilt ---- */
  if (!pRM && hoverCapable) {
    const heroStage = document.querySelector(".hero-stage");
    const heroName = document.querySelector(".hero-name");

    if (heroStage && heroName) {
      let targetRX = 0;
      let targetRY = 0;
      let currentRX = 0;
      let currentRY = 0;
      let tiltRaf = null;
      let isActive = false;

      const lerp = (a, b, t) => a + (b - a) * t;

      const tiltLoop = () => {
        currentRX = lerp(currentRX, targetRX, 0.08);
        currentRY = lerp(currentRY, targetRY, 0.08);

        heroName.style.transform =
          `perspective(800px) rotateX(${currentRX}deg) rotateY(${currentRY}deg) translateZ(0)`;

        const stillMoving =
          Math.abs(currentRX - targetRX) > 0.02 ||
          Math.abs(currentRY - targetRY) > 0.02;

        if (stillMoving || isActive) {
          tiltRaf = requestAnimationFrame(tiltLoop);
        } else {
          tiltRaf = null;
          heroName.style.transform = "";
        }
      };

      const startLoop = () => {
        if (tiltRaf) return;
        tiltRaf = requestAnimationFrame(tiltLoop);
      };

      const onPointerMove = (e) => {
        if (!isActive) return;
        const rect = heroName.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const nx = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2)));
        const ny = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2)));
        targetRX = ny * -1.5;
        targetRY = nx * 1.5;
      };

      const onPointerLeave = () => {
        isActive = false;
        targetRX = 0;
        targetRY = 0;
        startLoop();
      };

      const onPointerEnter = () => {
        isActive = true;
        startLoop();
      };

      const bindTilt = () => {
        heroStage.addEventListener("pointermove", onPointerMove, { passive: true });
        heroStage.addEventListener("pointerenter", onPointerEnter, { passive: true });
        heroStage.addEventListener("pointerleave", onPointerLeave, { passive: true });
      };

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => setTimeout(bindTilt, 1700));
      } else {
        setTimeout(bindTilt, 1700);
      }
    }
  }
}
