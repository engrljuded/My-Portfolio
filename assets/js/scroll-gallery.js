/* ==========================================================================
   scroll-gallery.js
   Horizontal drag-to-scroll + mouse-wheel support for the #work project
   gallery (assets: assets/images/projects/*).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const projScroll = document.getElementById('projScroll');
  if (!projScroll) return;

  let isDown = false;
  let startX = 0;
  let scrollStart = 0;
  let dragMoved = false;

  projScroll.addEventListener('mousedown', (e) => {
    isDown = true;
    dragMoved = false;
    projScroll.classList.add('dragging');
    startX = e.pageX;
    scrollStart = projScroll.scrollLeft;
  });

  window.addEventListener('mouseup', () => {
    isDown = false;
    projScroll.classList.remove('dragging');
  });

  window.addEventListener('mouseleave', () => {
    isDown = false;
    projScroll.classList.remove('dragging');
  });

  projScroll.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const delta = e.pageX - startX;
    if (Math.abs(delta) > 6) dragMoved = true;
    projScroll.scrollLeft = scrollStart - delta;
  });

  // if the pointer moved enough to count as a drag, swallow the resulting
  // click so it doesn't also trigger the photo lightbox underneath it
  projScroll.addEventListener('click', (e) => {
    if (dragMoved) {
      e.stopPropagation();
      e.preventDefault();
      dragMoved = false;
    }
  }, true);

  // convert vertical wheel intent into horizontal scroll
  projScroll.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      projScroll.scrollLeft += e.deltaY;
    }
  }, { passive: false });
});
