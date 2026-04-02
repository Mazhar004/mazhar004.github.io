const body = document.body;
const themeToggle = document.getElementById("theme-toggle");
const yearEl = document.getElementById("year");
const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");
const navLinks = document.querySelectorAll(".nav-links a");
const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");
const toTopButton = document.getElementById("to-top");

const updateThemeToggle = () => {
  if (!themeToggle) {
    return;
  }
  const isDark = body.dataset.theme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";
  themeToggle.setAttribute("aria-label", label);
};

const setTheme = (theme) => {
  body.dataset.theme = theme;
  localStorage.setItem("theme", theme);
  updateThemeToggle();
};

const storedTheme = localStorage.getItem("theme");
if (storedTheme) {
  setTheme(storedTheme);
} else {
  setTheme("light");
}

themeToggle?.addEventListener("click", () => {
  const nextTheme = body.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
});

yearEl.textContent = new Date().getFullYear();

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

navLinks.forEach((nav) => nav.classList.remove("active"));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

const animateStat = (el) => {
  if (el.dataset.animated) {
    return;
  }
  el.dataset.animated = "true";
  const target = Number(el.dataset.target || 0);
  const suffix = el.dataset.suffix || "";
  const duration = 1200;
  const start = performance.now();

  const fmt = (n) => n.toLocaleString("en-US");

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.floor(progress * target);
    el.textContent = `${fmt(value)}${suffix}`;
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = `${fmt(target)}${suffix}`;
    }
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

document.querySelectorAll(".stat[data-target]").forEach((stat) => {
  statObserver.observe(stat);
});

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

window.addEventListener("scroll", () => {
  if (window.scrollY > 400) {
    toTopButton?.classList.add("visible");
  } else {
    toTopButton?.classList.remove("visible");
  }
});

toTopButton?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// === Interactive Enhancements ===


// Page-wide mouse-tracking glow
const pageGlow = document.getElementById('page-glow');
if (pageGlow) {
  document.addEventListener('mousemove', (e) => {
    pageGlow.style.left = `${e.clientX}px`;
    pageGlow.style.top = `${e.clientY}px`;
    pageGlow.classList.add('visible');
  });
  document.addEventListener('mouseleave', () => {
    pageGlow.classList.remove('visible');
  });
}

// Staggered reveal delays
document.querySelectorAll('.grid, .skills-grid, .projects').forEach((grid) => {
  const items = grid.querySelectorAll('.reveal');
  items.forEach((item, i) => {
    item.style.setProperty('--stagger', `${i * 0.1}s`);
  });
});

// Scroll progress indicator
const scrollProgress = document.getElementById('scroll-progress');
if (scrollProgress) {
  window.addEventListener('scroll', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    scrollProgress.style.width = `${progress}%`;
  }, { passive: true });
}

// Skill level bar animation
const skillBars = document.querySelectorAll('.skill-level__fill');
if (skillBars.length > 0) {
  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const level = entry.target.dataset.level || '0';
          entry.target.style.width = `${level}%`;
          skillObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  skillBars.forEach((bar) => skillObserver.observe(bar));
}
