/* Lane D: One-time Cmd-K discoverability toast.
   Shows after the user scrolls a bit, then sets a localStorage flag so it
   never reappears. */
if (window.__laneDInit) {
  // noop
} else {
  window.__laneDInit = true;

  const STORAGE_KEY = "mh-cmdk-hint-seen";
  if (typeof localStorage === "undefined" || localStorage.getItem(STORAGE_KEY) !== "1") {
    const trigger = document.getElementById("cmd-k-trigger");
    if (trigger) {
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
    }
  }
}
