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
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 4;
  const ZOOM_STEP = 0.5;

  let overlay = null;
  let stage = null;
  let img = null;
  let caption = null;
  let prevBtn = null;
  let nextBtn = null;

  let photos = [];
  let photoIndex = 0;
  let galleryName = '';

  let scale = 1;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let panStartX = 0;
  let panStartY = 0;
  let lastFocused = null;

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

  function showPhoto(newIndex) {
    photoIndex = (newIndex + photos.length) % photos.length;
    img.src = photos[photoIndex];
    scale = 1; panX = 0; panY = 0;
    applyTransform();
    updateCaption();
  }

  function updateCaption() {
    if (!galleryName) { caption.style.display = 'none'; return; }
    caption.style.display = 'block';
    caption.textContent = photos.length > 1
      ? `${galleryName} — ${photoIndex + 1} / ${photos.length}`
      : galleryName;
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

    prevBtn = document.createElement('button');
    prevBtn.className = 'lightbox-nav prev';
    prevBtn.type = 'button';
    prevBtn.setAttribute('aria-label', 'Previous photo');
    prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg>';

    nextBtn = document.createElement('button');
    nextBtn.className = 'lightbox-nav next';
    nextBtn.type = 'button';
    nextBtn.setAttribute('aria-label', 'Next photo');
    nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>';

    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPhoto(photoIndex - 1); });
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showPhoto(photoIndex + 1); });

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

    caption = document.createElement('div');
    caption.className = 'lightbox-caption';

    overlay.append(stage, prevBtn, nextBtn, toolbar, caption);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target === stage) closeLightbox();
    });

    // click the image itself: zoom in, or zoom back out if already zoomed
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isDragging) return;
      setZoom(scale > 1 ? 1 : 2);
    });

    stage.addEventListener('wheel', (e) => {
      e.preventDefault();
      setZoom(scale + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
    }, { passive: false });

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
    if (!overlay || overlay.style.display === 'none') return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === '+' || e.key === '=') setZoom(scale + ZOOM_STEP);
    if (e.key === '-') setZoom(scale - ZOOM_STEP);
    if (e.key === 'ArrowRight' && photos.length > 1) showPhoto(photoIndex + 1);
    if (e.key === 'ArrowLeft' && photos.length > 1) showPhoto(photoIndex - 1);
  }

  function openLightbox(photoList, startIndex, name, triggerEl) {
    lastFocused = triggerEl;
    if (!overlay) buildOverlay();

    photos = photoList;
    galleryName = name || '';
    photoIndex = startIndex || 0;

    const multi = photos.length > 1;
    prevBtn.style.display = multi ? 'flex' : 'none';
    nextBtn.style.display = multi ? 'flex' : 'none';

    showPhoto(photoIndex);

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

  // event delegation: works for photos that are added to the page later
  // (e.g. project galleries loaded async by project-gallery.js)
  document.addEventListener('click', (e) => {
    const el = e.target.closest('.js-zoomable');
    if (!el) return;
    openZoomableElement(el);
  });

  document.addEventListener('keydown', (e) => {
    const el = document.activeElement;
    if (!el || !el.classList || !el.classList.contains('js-zoomable')) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openZoomableElement(el);
    }
  });

  function openZoomableElement(el) {
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');

    const galleryData = el.getAttribute('data-gallery');
    if (galleryData) {
      const list = JSON.parse(galleryData);
      const startIndex = parseInt(el.getAttribute('data-index') || '0', 10);
      const name = el.getAttribute('data-gallery-name') || el.getAttribute('alt') || '';
      openLightbox(list, startIndex, name, el);
    } else {
      openLightbox([el.src], 0, el.getAttribute('alt') || '', el);
    }
  }
}
