/* ============================================================
   Editorial Engineering — interactions
   ============================================================ */

const body = document.body;
const themeToggle = document.getElementById("theme-toggle");
const yearEl = document.getElementById("year");
const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");
const navLinks = document.querySelectorAll(".nav-links a");
const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");
const toTopButton = document.getElementById("to-top");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hoverCapable = window.matchMedia("(hover: hover)").matches;

/* ---------- Theme with View Transitions ---------- */

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

const setTheme = (theme, event) => {
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
        pseudoElement: theme === "dark" ? "::view-transition-new(root)" : "::view-transition-new(root)",
      }
    );
  });
};

const storedTheme = localStorage.getItem("theme") || "light";
applyTheme(storedTheme);

themeToggle?.addEventListener("click", (e) => {
  const next = body.dataset.theme === "dark" ? "light" : "dark";
  setTheme(next, e);
});

if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- Mobile nav ---------- */

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", isOpen);
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
    });
  });
}

/* ---------- Reveal on scroll ---------- */

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

document.querySelectorAll(".section-title").forEach((el) => revealObserver.observe(el));

/* ---------- Stagger reveal ---------- */

document.querySelectorAll(".grid, .skills-grid, .projects").forEach((grid) => {
  const items = grid.querySelectorAll(".reveal");
  items.forEach((item, i) => {
    item.style.setProperty("--stagger", `${i * 0.08}s`);
  });
});

/* ---------- Stat counters with tabular figures ---------- */

const animateStat = (el) => {
  if (el.dataset.animated) return;
  el.dataset.animated = "true";
  const target = Number(el.dataset.target || 0);
  const suffix = el.dataset.suffix || "";
  const duration = 1500;
  const start = performance.now();
  const fmt = (n) => n.toLocaleString("en-US");

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

/* ---------- Project filters ---------- */

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    projectCards.forEach((card) => {
      const category = card.dataset.category;
      if (filter === "all" || category === filter) {
        card.classList.remove("is-hidden");
      } else {
        card.classList.add("is-hidden");
      }
    });
  });
});

/* ---------- Scroll progress ---------- */

const scrollProgress = document.getElementById("scroll-progress");

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

/* ---------- Print CV ---------- */

const printCVBtn = document.getElementById("print-cv");
if (printCVBtn) {
  let cvReady = false;
  let cvIframe = null;

  window.addEventListener("message", (e) => {
    if (e.data === "cv-ready") {
      cvReady = true;
      if (cvIframe) cvIframe.contentWindow.print();
    }
  });

  printCVBtn.addEventListener("click", () => {
    if (cvIframe && cvReady) {
      cvIframe.contentWindow.print();
    } else if (!cvIframe) {
      cvIframe = document.createElement("iframe");
      cvIframe.id = "cv-print-frame";
      cvIframe.src = "cv.html";
      cvIframe.style.cssText =
        "position:fixed;width:0;height:0;border:none;left:-9999px";
      document.body.appendChild(cvIframe);
    }
  });
}

/* ---------- Card spotlight + 3D tilt ---------- */

if (!prefersReducedMotion && hoverCapable) {
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      const xRel = (e.clientX - rect.left) / rect.width;
      const yRel = (e.clientY - rect.top) / rect.height;
      card.style.setProperty("--mx", `${xRel * 100}%`);
      card.style.setProperty("--my", `${yRel * 100}%`);

      // Subtle 3D tilt
      const tiltX = (yRel - 0.5) * -6;
      const tiltY = (xRel - 0.5) * 6;
      card.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-2px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

/* ---------- Magnetic buttons ---------- */

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

/* ---------- Ambient air-particle field ---------- */

const particlesCanvas = document.getElementById("particles");

if (particlesCanvas && !prefersReducedMotion && hoverCapable && window.innerWidth > 720) {
  const ctx = particlesCanvas.getContext("2d", { alpha: true });
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = window.innerWidth;
  let height = window.innerHeight;
  let particles = [];
  let mouse = { x: -9999, y: -9999, active: false };

  const PARTICLE_COUNT_DESKTOP = 55;
  const PARTICLE_COUNT_TABLET = 35;

  const sizeCanvas = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    particlesCanvas.width = width * dpr;
    particlesCanvas.height = height * dpr;
    particlesCanvas.style.width = `${width}px`;
    particlesCanvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const initParticles = () => {
    const count = width > 1100 ? PARTICLE_COUNT_DESKTOP : PARTICLE_COUNT_TABLET;
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18 - 0.05, // slight upward drift
        r: Math.random() * 1.5 + 0.6,
        baseAlpha: Math.random() * 0.4 + 0.25,
        phase: Math.random() * Math.PI * 2,
      });
    }
  };

  sizeCanvas();
  initParticles();

  const getColors = () => {
    const isDark = body.dataset.theme === "dark";
    return {
      particle: isDark ? "244, 239, 228" : "10, 10, 10",
      accent: "255, 77, 31", // signal orange
    };
  };

  let frame = 0;

  const tick = () => {
    ctx.clearRect(0, 0, width, height);
    const colors = getColors();
    frame++;

    // Update + draw particles
    for (let p of particles) {
      // Subtle wave drift
      p.phase += 0.005;
      p.x += p.vx + Math.sin(p.phase) * 0.04;
      p.y += p.vy;

      // Cursor influence: gentle pull within radius, weak so it doesn't overwhelm
      if (mouse.active) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist2 = dx * dx + dy * dy;
        const radius = 180;
        if (dist2 < radius * radius) {
          const dist = Math.sqrt(dist2) || 1;
          const force = (1 - dist / radius) * 0.4;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }
      }

      // Wrap edges
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;

      // Subtle pulse alpha
      const alpha = p.baseAlpha * (0.7 + Math.sin(p.phase * 1.3) * 0.3);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${colors.particle}, ${alpha})`;
      ctx.fill();
    }

    // Connect nearby particles with hairline lines (constellation)
    const connectDist = 110;
    const connectDist2 = connectDist * connectDist;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < connectDist2) {
          const opacity = (1 - Math.sqrt(d2) / connectDist) * 0.18;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${colors.particle}, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Cursor glow (very subtle)
    if (mouse.active) {
      const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 130);
      grad.addColorStop(0, `rgba(${colors.accent}, 0.06)`);
      grad.addColorStop(1, `rgba(${colors.accent}, 0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(mouse.x - 130, mouse.y - 130, 260, 260);
    }

    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  document.addEventListener("pointermove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  document.addEventListener("pointerleave", () => { mouse.active = false; });
  window.addEventListener("blur", () => { mouse.active = false; });

  let resizeRaf;
  window.addEventListener("resize", () => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      sizeCanvas();
      initParticles();
    });
  });

  // Pause when tab hidden
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) mouse.active = false;
  });
}

/* ---------- Click ripple ---------- */

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

/* ---------- Scroll-spy nav ---------- */

const sectionIds = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'))
  .map((a) => a.getAttribute("href").slice(1))
  .filter(Boolean);
const sections = sectionIds
  .map((id) => document.getElementById(id))
  .filter(Boolean);

if (sections.length) {
  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            const href = link.getAttribute("href");
            link.classList.toggle("active", href === `#${id}`);
          });
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
  );
  sections.forEach((s) => spyObserver.observe(s));
}

/* ---------- Hero parallax ---------- */

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

/* ---------- Skill bar reveal ---------- */

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
