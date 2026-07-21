# Lourence Jude Dayonot — Portfolio

A single-page portfolio site for a Plumbing & Electrical Cost Estimator, styled as a blueprint / takeoff-sheet: navy background, gold accent, mono data type.

## How to view it

Just open `index.html` in a browser — no build step, no server required. Everything is plain HTML/CSS/JS.

> Tip: some browsers restrict local `file://` access for things like `fetch`. This site doesn't use `fetch`, so double-clicking `index.html` works fine. If you ever add something that does need a server, run `python3 -m http.server` inside this folder and open `http://localhost:8000`.

## Folder structure

```
My Portfolio/
├── index.html                 Main page — all sections live here
├── README.md                  This file
├── favicon.ico                Browser tab icon (generated — swap for your own if you like)
├── LICENSE
│
└── assets/
    ├── css/
    │   ├── variables.css      Colors, fonts, layout tokens — start here to re-theme
    │   ├── style.css          Base styles + every component
    │   ├── responsive.css     Breakpoints (tablet, mobile)
    │   └── animations.css     Scroll-reveal + transition rules
    │
    ├── js/
    │   ├── script.js          Main entry point (footer year, etc.)
    │   ├── navbar.js          Mobile menu open/close
    │   ├── scroll-gallery.js  Drag-to-scroll for the Projects gallery
    │   └── animations.js      Reveal-on-scroll (IntersectionObserver)
    │
    ├── images/
    │   ├── profile/           Your headshot
    │   ├── hero/               Optional background photo for the hero section
    │   ├── projects/           Project photos (5 slots)
    │   ├── process/            Optional icons for the 4 process steps
    │   ├── tools/               Software logos
    │   ├── suppliers/           Supplier logos
    │   ├── testimonials/        Client avatar photos
    │   ├── icons/                Contact/social icons (already included, ready to use)
    │   └── ui/                    Decorative textures (already included)
    │
    ├── documents/               Your resume (and anything else you want downloadable)
    └── fonts/                    Empty — the site currently loads fonts from Google Fonts
```

## Adding your own content — exact filenames to use

The page already points at these paths. Drop a file in with the **exact name below** and it appears automatically — no code changes needed. If a file is missing, the site quietly falls back to a matching on-brand placeholder, so nothing looks broken in the meantime.

| Slot | Expected file | Notes |
|---|---|---|
| Your photo | `assets/images/profile/lourence-dayonot.jpg` | Falls back to `profile-placeholder.png` (included), then to a drawn icon. |
| Résumé | `assets/documents/Lourence_Jude_Dayonot_Resume.pdf` | Linked from the nav bar, mobile menu, and the Contact section. |
| Hero background | `assets/images/hero/blueprint-bg.jpg` | Optional. Sits behind the grid pattern at low opacity. |
| Project photos | `assets/images/projects/project1-1.jpg`, `project1-2.jpg`, … | Each project can hold **multiple photos** — see "Multiple photos per project" below. |
| Process icons | `assets/images/process/quantity-takeoff.png`, `market-price.png`, `verification.png`, `final-review.png` | Optional — shown inside the numbered circles. |
| Tool logos | `assets/images/tools/*.png` | See the full list of filenames inside `index.html`'s Tools section. |
| Supplier logos | `assets/images/suppliers/*.png` | Same pattern — filenames match company names. |
| Testimonial avatars | `assets/images/testimonials/client1.jpg`, `client2.jpg`, `client3.jpg` | Falls back to initials if missing. |

Also in `assets/documents/`, feel free to add `Certifications.pdf` and `Portfolio.pdf` and link to them from the Contact section the same way the résumé link works (copy one `<a>` block and change the `href`).

## Multiple photos per project

Each of the 5 project cards can hold several photos, not just one. Clicking the card's photo opens a lightbox with arrows to click through all of that project's photos, zoom in/out, and pan.

**Naming pattern:** `assets/images/projects/project{N}-{photo number}.jpg`, where `N` is the card number (1–5).

For example, to give project 3 four photos:

```
assets/images/projects/project3-1.jpg
assets/images/projects/project3-2.jpg
assets/images/projects/project3-3.jpg
assets/images/projects/project3-4.jpg
```

Notes:
- Up to **6 photos per project** are supported out of the box. To allow more, open `index.html`, find the project's `<div class="proj-photo" ...>` and raise the `data-max-photos="6"` number.
- You don't need all 6 slots filled — the site checks which numbered files actually exist and only uses those. A project with just `project3-1.jpg` behaves like a single photo (no arrows shown); add `project3-2.jpg` and the prev/next arrows and a "1 / 2" counter appear automatically.
- No HTML or JS edits needed to add/remove/reorder photos — just add or delete the numbered files.
- This is handled by `assets/js/project-gallery.js`.



- **Testimonials** — the three quotes are examples. Swap in real client feedback.
- **Projects** — the five project cards use sample names/addresses. Replace with your actual projects.
- **Social links** — the LinkedIn/GitHub icons in the footer point to `#`. Add your real profile URLs.

## Notes on logos

Tool and supplier logos aren't included as files — those are other companies' trademarks, so it's best that you source official logo files directly from each company (usually available on their press/brand page) and drop them into `assets/images/tools/` or `assets/images/suppliers/`. Until then, the site shows clean text-based badges instead, so it still looks intentional either way.

## Fonts

Loaded via Google Fonts CDN in `index.html` (Archivo Black, Inter, IBM Plex Mono) — no files needed in `assets/fonts/`. If you'd rather self-host fonts (e.g. for offline use), download the `.woff2` files into `assets/fonts/` and swap the `<link>` tags in `index.html` for local `@font-face` rules in `variables.css`.

## Browser support

Modern evergreen browsers (Chrome, Edge, Firefox, Safari). Uses CSS Grid, `aspect-ratio`, and `IntersectionObserver` — all widely supported since 2021+.
