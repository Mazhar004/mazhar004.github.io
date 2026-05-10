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

/* ---------- data-scroll reveal system (cinematic) ---------- */

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

document.querySelectorAll("[data-scroll]").forEach((el, i) => {
  // gentle stagger if grouped under a parent
  const parent = el.parentElement;
  if (parent) {
    const siblings = Array.from(parent.querySelectorAll("[data-scroll]"));
    const idx = siblings.indexOf(el);
    if (idx >= 0) el.style.setProperty("--scroll-delay", `${idx * 0.06}s`);
  }
  scrollRevealObserver.observe(el);
});

/* ---------- Section-title reveal hookup ---------- */
/* Hooks .section-title elements into the existing scrollRevealObserver
   so the Lane A typesetting reveal fires for every section. */
document.querySelectorAll(".section-title").forEach((el) => scrollRevealObserver.observe(el));

/* ---------- Stat counters with tabular figures ---------- */

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

/* ---------- Project filters ---------- */


filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    /* Card show/hide animation handled by Lane B (capture-phase listener). */
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

/* ---------- Print CV (anchor opens cv.html?print=1, which auto-prints) ---------- */

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

/* ---------- Header height CSS var ---------- */

const setHeaderHeightVar = () => {
  const headerEl = document.querySelector(".site-header");
  if (!headerEl) return;
  const h = Math.round(headerEl.getBoundingClientRect().height);
  document.documentElement.style.setProperty("--header-h", `${h}px`);
};

setHeaderHeightVar();
window.addEventListener("resize", setHeaderHeightVar);

/* ---------- Live local time ---------- */

const timeEl = document.getElementById("local-time");
const tzLabel = document.getElementById("tz-label");

if (timeEl) {
  const tz = "America/Chicago";
  let blinkOn = true;

  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const tzShort = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    timeZoneName: "short",
  }).formatToParts(new Date()).find((p) => p.type === "timeZoneName")?.value || "CT";

  if (tzLabel) tzLabel.textContent = tzShort;

  const tickClock = () => {
    const parts = fmt.formatToParts(new Date());
    const h = parts.find((p) => p.type === "hour")?.value ?? "--";
    const m = parts.find((p) => p.type === "minute")?.value ?? "--";
    const s = parts.find((p) => p.type === "second")?.value ?? "--";
    const sep = blinkOn ? ":" : '<span style="opacity:0.25">:</span>';
    timeEl.innerHTML = `${h}<span class="blink">${sep}</span>${m}<span class="blink">${sep}</span>${s}`;
    blinkOn = !blinkOn;
  };

  tickClock();
  setInterval(tickClock, 1000);
}

/* ---------- Command palette (Cmd-K) ---------- */

const cmdPalette = document.getElementById("cmd-palette");
const cmdInput = document.getElementById("cmd-input");
const cmdList = document.getElementById("cmd-list");
const cmdTrigger = document.getElementById("cmd-k-trigger");

if (cmdPalette && cmdInput && cmdList) {
  const items = [
    { label: "Profile", section: "Sections", icon: "01", href: "#profile" },
    { label: "Experience", section: "Sections", icon: "02", href: "#experience" },
    { label: "Education", section: "Sections", icon: "03", href: "#education" },
    { label: "Publications", section: "Sections", icon: "04", href: "#publications" },
    { label: "Skills", section: "Sections", icon: "05", href: "#skills" },
    { label: "Projects", section: "Sections", icon: "06", href: "#projects" },
    { label: "Certifications", section: "Sections", icon: "07", href: "#certifications" },
    { label: "Contact", section: "Sections", icon: "08", href: "#contact" },

    { label: "Toggle theme", section: "Actions", icon: "☼", action: "theme" },
    { label: "Download CV", section: "Actions", icon: "↓", action: "cv" },
    { label: "Copy email", section: "Actions", icon: "@", action: "email" },
    { label: "Back to top", section: "Actions", icon: "↑", action: "top" },

    { label: "GitHub", section: "Links", icon: "GH", href: "https://github.com/mazhar004", external: true },
    { label: "LinkedIn", section: "Links", icon: "LN", href: "https://www.linkedin.com/in/mazhar004/", external: true },
    { label: "Stack Overflow", section: "Links", icon: "SO", href: "https://stackoverflow.com/users/11755018/mazhar", external: true },
    { label: "Google Scholar", section: "Links", icon: "GS", href: "https://scholar.google.com/citations?user=k7h0b8gAAAAJ", external: true },
    { label: "ORCID", section: "Links", icon: "OR", href: "https://orcid.org/0000-0001-7118-8248", external: true },
    { label: "Research Gate", section: "Links", icon: "RG", href: "https://www.researchgate.net/profile/Mazhar-Hossain", external: true },
  ];

  let filtered = items.slice();
  let activeIndex = 0;

  const fuzzy = (str, query) => {
    if (!query) return true;
    const s = str.toLowerCase();
    const q = query.toLowerCase().trim();
    if (s.includes(q)) return true;
    let i = 0;
    for (const ch of q) {
      i = s.indexOf(ch, i);
      if (i === -1) return false;
      i++;
    }
    return true;
  };

  const renderList = () => {
    cmdList.innerHTML = "";
    if (filtered.length === 0) {
      cmdList.innerHTML = '<li class="cmd-empty">No matches. Try another query.</li>';
      return;
    }

    let lastSection = null;
    filtered.forEach((item, idx) => {
      if (item.section !== lastSection) {
        const sectionEl = document.createElement("li");
        sectionEl.className = "cmd-section-label";
        sectionEl.textContent = item.section;
        cmdList.appendChild(sectionEl);
        lastSection = item.section;
      }

      const li = document.createElement("li");
      li.className = "cmd-item" + (idx === activeIndex ? " is-active" : "");
      li.dataset.idx = idx;
      li.innerHTML = `
        <span class="cmd-item-left">
          <span class="cmd-item-icon">${item.icon}</span>
          <span>${item.label}</span>
        </span>
        <span class="cmd-item-hint">${item.external ? "↗" : item.action ? "↵" : "→"}</span>
      `;
      li.addEventListener("click", () => activate(idx));
      li.addEventListener("mouseenter", () => {
        activeIndex = idx;
        updateActiveClass();
      });
      cmdList.appendChild(li);
    });
  };

  const updateActiveClass = () => {
    cmdList.querySelectorAll(".cmd-item").forEach((el) => {
      el.classList.toggle("is-active", Number(el.dataset.idx) === activeIndex);
    });
    const active = cmdList.querySelector(".cmd-item.is-active");
    active?.scrollIntoView({ block: "nearest" });
  };

  const activate = (idx) => {
    const item = filtered[idx];
    if (!item) return;

    if (item.action === "theme") {
      const next = body.dataset.theme === "dark" ? "light" : "dark";
      setTheme(next);
    } else if (item.action === "cv") {
      document.getElementById("print-cv")?.click();
    } else if (item.action === "email") {
      navigator.clipboard?.writeText("princemazhar.mp@gmail.com");
      cmdInput.value = "✓ email copied";
      setTimeout(() => { cmdInput.value = ""; filterAndRender(); }, 900);
      return;
    } else if (item.action === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (item.href) {
      if (item.external) {
        window.open(item.href, "_blank", "noopener");
      } else {
        const target = document.querySelector(item.href);
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    closePalette();
  };

  const filterAndRender = () => {
    const q = cmdInput.value.trim();
    filtered = items.filter((it) => fuzzy(it.label, q) || fuzzy(it.section, q));
    activeIndex = 0;
    renderList();
  };

  const openPalette = (fromKeyboard = false) => {
    cmdPalette.classList.toggle("is-instant", fromKeyboard);
    cmdPalette.classList.add("is-open");
    cmdInput.value = "";
    filtered = items.slice();
    activeIndex = 0;
    renderList();
    setTimeout(() => cmdInput.focus(), 50);
    document.body.style.overflow = "hidden";
  };

  const closePalette = () => {
    cmdPalette.classList.remove("is-open");
    cmdPalette.classList.remove("is-instant");
    document.body.style.overflow = "";
  };

  cmdInput.addEventListener("input", filterAndRender);

  cmdInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closePalette();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, filtered.length - 1);
      updateActiveClass();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      updateActiveClass();
    } else if (e.key === "Enter") {
      e.preventDefault();
      activate(activeIndex);
    }
  });

  cmdPalette.addEventListener("click", (e) => {
    if (e.target === cmdPalette) closePalette();
  });

  cmdTrigger?.addEventListener("click", () => openPalette(false));

  document.addEventListener("keydown", (e) => {
    const isMac = navigator.platform.toLowerCase().includes("mac");
    const meta = isMac ? e.metaKey : e.ctrlKey;
    if (meta && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (cmdPalette.classList.contains("is-open")) closePalette();
      else openPalette(true);
    } else if (e.key === "Escape" && cmdPalette.classList.contains("is-open")) {
      closePalette();
    }
  });

  renderList();
}

/* ---------- Bento card hover spotlight (cursor tracking on bento tiles) ---------- */

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

/* ===== Lane A: Deep stagger ===== */
(function laneAStagger() {
  if (window.__laneAInit) return;
  window.__laneAInit = true;
  if (prefersReducedMotion) return;

  document.querySelectorAll("[data-stagger]").forEach((container) => {
    Array.from(container.children).forEach((child, i) => {
      child.style.setProperty("--stagger-delay", `calc(${i} * 60ms)`);
      child.style.setProperty("--i", String(i));
    });
  });
})();

/* ===== Lane B: Accordion cascade + filter channel ===== */
(function laneBMicrointeractions() {
  if (window.__laneBInit) return;
  window.__laneBInit = true;

  const _prm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Accordion cascade ---- */

  function openAccordion(details) {
    const body = details.querySelector(".accordion-body");
    const chevron = details.querySelector(".accordion-chevron");
    if (!body) return;

    details.setAttribute("open", "");
    const targetH = body.scrollHeight;
    body.style.height = "0px";
    body.style.opacity = "0";

    const anim = body.animate(
      [
        { height: "0px", opacity: "0" },
        { height: targetH + "px", opacity: "1" },
      ],
      { duration: 450, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }
    );

    if (chevron) {
      chevron.classList.add("lb-glow");
      setTimeout(() => chevron.classList.remove("lb-glow"), 500);
    }

    anim.onfinish = () => {
      body.style.height = "auto";
      body.style.opacity = "1";
      cascadeChildren(body);
    };
  }

  function cascadeChildren(body) {
    const children = Array.from(
      body.querySelectorAll("p.exp-highlight, ul li, .tags")
    );
    children.forEach((el, i) => {
      setTimeout(() => {
        const a = el.animate(
          [
            { opacity: "0", transform: "translateY(8px)" },
            { opacity: "1", transform: "translateY(0)" },
          ],
          { duration: 320, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }
        );
        a.onfinish = () => {
          el.style.opacity = "";
          el.style.transform = "";
        };
      }, i * 60);
    });
  }

  function closeAccordion(details) {
    const body = details.querySelector(".accordion-body");
    if (!body) return;

    const currentH = body.getBoundingClientRect().height;
    body.style.height = currentH + "px";

    const anim = body.animate(
      [
        { height: currentH + "px", opacity: "1" },
        { height: "0px", opacity: "0" },
      ],
      { duration: 400, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }
    );

    anim.onfinish = () => {
      details.removeAttribute("open");
      body.style.height = "";
      body.style.opacity = "";
    };
  }

  document.querySelectorAll(".accordion-item summary").forEach((summary) => {
    if (summary.dataset.lbBound) return;
    summary.dataset.lbBound = "1";

    summary.addEventListener("click", (e) => {
      if (_prm) return;
      e.preventDefault();
      const details = summary.closest("details");
      if (!details) return;
      if (details.hasAttribute("open")) {
        closeAccordion(details);
      } else {
        openAccordion(details);
      }
    });
  });

  /* ---- Filter channel switch ---- */

  const CHANNEL_MAP = {
    all: "CH 01 / ALL",
    ml: "CH 02 / ML",
    data: "CH 03 / DATA",
    web: "CH 04 / WEB",
  };

  const labelEl = document.getElementById("filter-channel-label");
  let labelTimer = null;

  function showChannelLabel(filter) {
    if (!labelEl || _prm) return;
    clearTimeout(labelTimer);
    labelEl.textContent = CHANNEL_MAP[filter] || filter.toUpperCase();
    labelEl.classList.add("lb-visible");
    labelTimer = setTimeout(() => labelEl.classList.remove("lb-visible"), 1200);
  }

  function animateHide(card) {
    if (_prm) {
      card.classList.add("is-hidden");
      return;
    }
    card.animate(
      [
        { opacity: "1", transform: "scale(1) translateY(0)" },
        { opacity: "0", transform: "scale(0.96) translateY(8px)" },
      ],
      { duration: 300, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }
    ).onfinish = () => {
      card.classList.add("is-hidden");
      card.style.opacity = "";
      card.style.transform = "";
    };
  }

  function animateShow(card, visibleIndex) {
    card.classList.remove("is-hidden");
    if (_prm) return;
    card.style.opacity = "0";
    card.style.transform = "translateY(12px)";
    setTimeout(() => {
      card.animate(
        [
          { opacity: "0", transform: "translateY(12px)" },
          { opacity: "1", transform: "translateY(0)" },
        ],
        { duration: 400, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }
      ).onfinish = () => {
        card.style.opacity = "";
        card.style.transform = "";
      };
    }, visibleIndex * 50);
  }

  const _filterBtns = document.querySelectorAll(".filter-btn");
  const _projectCards = document.querySelectorAll(".project-card");
  let _currentFilter = "all";

  _filterBtns.forEach((btn) => {
    if (btn.dataset.lbBound) return;
    btn.dataset.lbBound = "1";

    btn.addEventListener(
      "click",
      () => {
        const filter = btn.dataset.filter;
        if (filter === _currentFilter) return;
        _currentFilter = filter;

        showChannelLabel(filter);

        let visibleIndex = 0;
        _projectCards.forEach((card) => {
          const cat = card.dataset.category;
          const shouldShow = filter === "all" || cat === filter;
          if (shouldShow) {
            animateShow(card, visibleIndex++);
          } else {
            animateHide(card);
          }
        });
      },
      true
    );
  });
})();

/* ===== Lane C: Heartbeat sync + now-reading + hero shape choreography + name tilt ===== */
(function laneCAtmospherics() {
  if (window.__laneCInit) return;
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
})();

/* ===== Lane D: Cmd-K discoverability hint ===== */
(function laneDCmdHint() {
  if (window.__laneDInit) return;
  window.__laneDInit = true;

  const STORAGE_KEY = "mh-cmdk-hint-seen";
  if (typeof localStorage !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1") return;

  const trigger = document.getElementById("cmd-k-trigger");
  if (!trigger) return;

  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || "");
  const shortcut = isMac ? "⌘K" : "Ctrl+K";

  const toast = document.createElement("div");
  toast.className = "cmdk-hint";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.innerHTML =
    '<kbd class="cmdk-hint__key">' + shortcut + '</kbd>' +
    '<span class="cmdk-hint__text">Search this page</span>' +
    '<button type="button" class="cmdk-hint__close" aria-label="Dismiss hint">×</button>';
  document.body.appendChild(toast);

  let dismissTimer = null;
  let shown = false;

  const dismiss = () => {
    if (!shown) return;
    shown = false;
    toast.classList.remove("is-visible");
    if (dismissTimer) { clearTimeout(dismissTimer); dismissTimer = null; }
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch (_) {}
    setTimeout(() => toast.remove(), 400);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("keydown", onKey);
  };

  const onScroll = () => {
    if (shown) return;
    if (window.scrollY < 220) return;
    shown = true;
    requestAnimationFrame(() => toast.classList.add("is-visible"));
    dismissTimer = setTimeout(dismiss, 5500);
  };

  const onKey = (e) => {
    if (!shown) return;
    if (e.key === "Escape" || (e.key === "k" && (e.metaKey || e.ctrlKey))) {
      dismiss();
    }
  };

  toast.querySelector(".cmdk-hint__close").addEventListener("click", dismiss);
  trigger.addEventListener("click", dismiss, { once: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("keydown", onKey);
})();
