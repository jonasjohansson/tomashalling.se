/* Circle nav click handling */
(function () {
  document.querySelectorAll('.circle-nav-link').forEach(function (link) {
    link.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    link.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      playSound('click');
      var href = link.getAttribute('href');
      if (!href || href === '#') return;
      if (href.startsWith('mailto:')) {
        window.location.href = href;
      } else {
        window.open(href, '_blank');
      }
    });
  });
})();
