/* ==========================================================================
   script.js
   Main entry point: small site-wide init tasks + the photo lightbox
   (click the profile photo or any project photo to zoom).

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

  initLightbox();
});

/* ==========================================================================
   Lightbox — click the profile photo or a project photo to open it full
   size, then zoom in/out (buttons, mouse wheel, or pinch on touch) and
   drag to pan while zoomed in.
   ========================================================================== */
function initLightbox() {
  const triggers = document.querySelectorAll('.js-zoomable');
  if (!triggers.length) return;

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 4;
  const ZOOM_STEP = 0.5;

  let overlay = null;
  let stage = null;
  let img = null;
  let scale = 1;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let panStartX = 0;
  let panStartY = 0;
  let lastFocused = null;

  // two-finger pinch tracking
  let pinchStartDist = null;
  let pinchStartScale = 1;

  function applyTransform() {
    if (scale <= 1) { panX = 0; panY = 0; }
    img.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    stage.style.cursor = scale > 1 ? 'grab' : 'zoom-out';
  }

  function setZoom(next) {
    scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    applyTransform();
  }

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    stage = document.createElement('div');
    stage.className = 'lightbox-stage';

    img = document.createElement('img');
    stage.appendChild(img);

    const toolbar = document.createElement('div');
    toolbar.className = 'lightbox-toolbar';

    const zoomOutBtn = makeBtn('&minus;', 'Zoom out');
    const zoomInBtn = makeBtn('&plus;', 'Zoom in');
    const resetBtn = makeBtn('1:1', 'Reset zoom');
    const closeBtn = makeBtn('&times;', 'Close');

    zoomOutBtn.addEventListener('click', (e) => { e.stopPropagation(); setZoom(scale - ZOOM_STEP); });
    zoomInBtn.addEventListener('click', (e) => { e.stopPropagation(); setZoom(scale + ZOOM_STEP); });
    resetBtn.addEventListener('click', (e) => { e.stopPropagation(); setZoom(1); });
    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });

    toolbar.append(zoomOutBtn, zoomInBtn, resetBtn, closeBtn);

    const caption = document.createElement('div');
    caption.className = 'lightbox-caption';
    caption.id = 'lightboxCaption';

    overlay.append(stage, toolbar, caption);
    document.body.appendChild(overlay);

    // click backdrop (not the image / toolbar) to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target === stage) closeLightbox();
    });

    // click the image itself: zoom in, or zoom back out if already zoomed
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isDragging) return;
      setZoom(scale > 1 ? 1 : 2);
    });

    // mouse wheel to zoom, centered roughly on cursor
    stage.addEventListener('wheel', (e) => {
      e.preventDefault();
      setZoom(scale + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
    }, { passive: false });

    // drag to pan when zoomed in
    stage.addEventListener('mousedown', (e) => {
      if (scale <= 1) return;
      isDragging = true;
      stage.classList.add('dragging');
      dragStartX = e.clientX; dragStartY = e.clientY;
      panStartX = panX; panStartY = panY;
    });
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      panX = panStartX + (e.clientX - dragStartX);
      panY = panStartY + (e.clientY - dragStartY);
      applyTransform();
    });
    window.addEventListener('mouseup', () => {
      isDragging = false;
      stage.classList.remove('dragging');
    });

    // touch: pinch to zoom, one-finger drag to pan
    stage.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        pinchStartDist = touchDist(e.touches);
        pinchStartScale = scale;
      } else if (e.touches.length === 1 && scale > 1) {
        isDragging = true;
        dragStartX = e.touches[0].clientX; dragStartY = e.touches[0].clientY;
        panStartX = panX; panStartY = panY;
      }
    }, { passive: true });

    stage.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && pinchStartDist) {
        const dist = touchDist(e.touches);
        setZoom(pinchStartScale * (dist / pinchStartDist));
      } else if (e.touches.length === 1 && isDragging) {
        panX = panStartX + (e.touches[0].clientX - dragStartX);
        panY = panStartY + (e.touches[0].clientY - dragStartY);
        applyTransform();
      }
    }, { passive: true });

    stage.addEventListener('touchend', () => {
      isDragging = false;
      pinchStartDist = null;
    });

    document.addEventListener('keydown', onKeydown);
  }

  function touchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  }

  function makeBtn(html, label) {
    const b = document.createElement('button');
    b.className = 'lb-btn';
    b.type = 'button';
    b.innerHTML = html;
    b.setAttribute('aria-label', label);
    return b;
  }

  function onKeydown(e) {
    if (!overlay) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === '+' || e.key === '=') setZoom(scale + ZOOM_STEP);
    if (e.key === '-') setZoom(scale - ZOOM_STEP);
  }

  function openLightbox(src, alt, triggerEl) {
    lastFocused = triggerEl;
    if (!overlay) buildOverlay();

    img.src = src;
    img.alt = alt || '';
    scale = 1; panX = 0; panY = 0;
    applyTransform();

    const caption = overlay.querySelector('.lightbox-caption');
    if (alt) { caption.textContent = alt; caption.style.display = 'block'; }
    else { caption.style.display = 'none'; }

    document.body.style.overflow = 'hidden';
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('open'));

    const closeBtn = overlay.querySelector('.lightbox-toolbar .lb-btn:last-child');
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { if (overlay) overlay.style.display = 'none'; }, 220);
    if (lastFocused) lastFocused.focus();
  }

  triggers.forEach(el => {
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    const label = el.getAttribute('alt') ? `Zoom in on ${el.getAttribute('alt')}` : 'Zoom in on image';
    el.setAttribute('aria-label', label);

    el.addEventListener('click', () => openLightbox(el.src, el.getAttribute('alt'), el));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(el.src, el.getAttribute('alt'), el);
      }
    });
  });
}
