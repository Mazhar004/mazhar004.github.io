/* Lane B: Accordion cascade + project filter channel switch.
   Capture-phase listener intercepts filter clicks before filters.js runs. */
if (window.__laneBInit) {
  // noop
} else {
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
}
