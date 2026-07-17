/* ==========================================================================
   navbar.js
   Mobile menu toggle + closes the menu after a link is tapped.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const burger = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (!burger || !mobileMenu) return;

  burger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
});
