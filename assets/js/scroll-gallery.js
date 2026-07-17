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

  projScroll.addEventListener('mousedown', (e) => {
    isDown = true;
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
    projScroll.scrollLeft = scrollStart - (e.pageX - startX);
  });

  // convert vertical wheel intent into horizontal scroll
  projScroll.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      projScroll.scrollLeft += e.deltaY;
    }
  }, { passive: false });
});
