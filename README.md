# Mazhar Hossain — Portfolio

Personal portfolio site for **Mazhar Hossain** — Data Engineer with 6+ years across data pipelines, ML systems, and production APIs.

**Live site:** https://mazhar004.github.io/

## Stack

Vanilla HTML, CSS, and JavaScript — no build step, no framework. Served as a static site via GitHub Pages.

- `index.html` — main page (hero, experience, education, publications, skills, projects, certifications, contact)
- `cv.html` — printable CV view (rendered into the parent page via hidden iframe + `postMessage`)
- `styles.css` — design tokens, layout, animations, themes
- `script.js` — theme toggle, scroll/intersection effects, command palette, CV print handler
- `static/` — logo SVGs, favicon, social preview image
- `sitemap.xml`, `robots.txt`, `site.webmanifest` — SEO + PWA basics

## Local preview

It's a static site — open `index.html` directly, or serve it:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deployment

Auto-deploys to GitHub Pages on push to `master`.

## Analytics

Google Analytics 4 is wired into `index.html`. The Measurement ID placeholder `G-XXXXXXXXXX` needs to be replaced with the real ID from the GA4 property. The ID is public by design — GA4 tags live in client-side JS on every site that uses GA. To block spam from other domains, configure a hostname filter in GA4 Admin → Data Filters.

## License

Code is open. Content (text, CV, project descriptions) is © Mazhar Hossain.
