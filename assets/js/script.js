/* ==========================================================================
   script.js
   Main entry point. Small site-wide init tasks that don't belong in a
   dedicated module (navbar.js, scroll-gallery.js, animations.js).

   Note: image fallbacks (real photo missing -> styled placeholder shows
   through) are handled per-element with an inline onerror="" attribute in
   index.html, right next to each <img> — no JS required for that part.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // keep the footer copyright year current automatically
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
