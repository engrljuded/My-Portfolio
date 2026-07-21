/* ==========================================================================
   project-gallery.js
   Each project card can show more than one photo. For a card with
   data-project-id="3", drop files named:
     assets/images/projects/project3-1.jpg
     assets/images/projects/project3-2.jpg
     assets/images/projects/project3-3.jpg
     ... up to data-max-photos (default 6)
   Only the files that actually exist are used — no code changes needed
   to add, remove, or reorder photos, just add/remove numbered files.
   A card with just one photo (project3-1.jpg only) still works fine,
   it simply won't show the prev/next arrows or the counter.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.proj-photo[data-project-id]').forEach(setupProjectGallery);
});

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function setupProjectGallery(container) {
  const id = container.getAttribute('data-project-id');
  const name = container.getAttribute('data-project-name') || `Project ${id}`;
  const maxPhotos = parseInt(container.getAttribute('data-max-photos') || '6', 10);

  const candidates = [];
  for (let i = 1; i <= maxPhotos; i++) {
    candidates.push(`assets/images/projects/project${id}-${i}.jpg`);
  }

  Promise.all(candidates.map(preloadImage)).then((results) => {
    const photos = results.filter(Boolean);
    if (!photos.length) return; // no real photos yet — keep the drawn placeholder as-is
    renderGallery(container, photos, name);
  });
}

function renderGallery(container, photos, name) {
  const icon = container.querySelector('.ph-icon');
  const label = container.querySelector('.ph-label');
  if (icon) icon.style.display = 'none';
  if (label) label.style.display = 'none';

  let index = 0;

  const img = document.createElement('img');
  img.className = 'proj-photo-img js-zoomable';
  img.src = photos[0];
  img.alt = photos.length > 1 ? `${name} — photo 1 of ${photos.length}` : name;
  img.setAttribute('data-gallery', JSON.stringify(photos));
  img.setAttribute('data-gallery-name', name);
  img.setAttribute('data-index', '0');
  container.insertBefore(img, container.firstChild);

  if (photos.length < 2) return; // single photo — no nav controls needed

  const counter = document.createElement('span');
  counter.className = 'photo-counter';
  counter.textContent = `1 / ${photos.length}`;

  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'photo-nav prev';
  prevBtn.setAttribute('aria-label', 'Previous photo');
  prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg>';

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'photo-nav next';
  nextBtn.setAttribute('aria-label', 'Next photo');
  nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>';

  function update() {
    img.src = photos[index];
    img.alt = `${name} — photo ${index + 1} of ${photos.length}`;
    img.setAttribute('data-index', String(index));
    counter.textContent = `${index + 1} / ${photos.length}`;
  }

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    index = (index - 1 + photos.length) % photos.length;
    update();
  });
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    index = (index + 1) % photos.length;
    update();
  });

  container.append(counter, prevBtn, nextBtn);
}
