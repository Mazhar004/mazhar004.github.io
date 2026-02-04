const body = document.body;
const themeToggle = document.getElementById("theme-toggle");
const copyEmailButton = document.getElementById("copy-email");
const yearEl = document.getElementById("year");
const navLinks = document.querySelectorAll(".nav-links a");

const emailAddress = "4h7wixs1l@mozmail.com";

const setTheme = (theme) => {
  body.dataset.theme = theme;
  localStorage.setItem("theme", theme);
};

const storedTheme = localStorage.getItem("theme");
if (storedTheme) {
  setTheme(storedTheme);
}

themeToggle?.addEventListener("click", () => {
  const nextTheme = body.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
});

copyEmailButton?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(emailAddress);
    copyEmailButton.textContent = "Copied!";
    setTimeout(() => {
      copyEmailButton.textContent = "Copy email";
    }, 2000);
  } catch (error) {
    copyEmailButton.textContent = emailAddress;
  }
});

yearEl.textContent = new Date().getFullYear();

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const id = entry.target.getAttribute("id");
      const link = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (!link) {
        return;
      }
      if (entry.isIntersecting) {
        navLinks.forEach((nav) => nav.classList.remove("active"));
        link.classList.add("active");
      }
    });
  },
  { rootMargin: "-50% 0px -50% 0px" }
);

document.querySelectorAll("section[id]").forEach((section) => {
  observer.observe(section);
});
