import { body } from "./dom.js";
import { setTheme } from "./theme.js";

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
