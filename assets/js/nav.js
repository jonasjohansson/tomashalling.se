/* Creature-based navigation */
(function () {
  document.querySelectorAll('.nav-creature').forEach(function (link) {
    link.addEventListener('pointerdown', function (e) {
      e.stopPropagation();
    });

    link.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      var nav = link.dataset.nav;
      var href = link.getAttribute('href');

      if (link.dataset.sound) playCreatureSound(link.dataset.sound);

      if (nav === 'galleri') {
        window.openGallery();
      } else if (href.startsWith('mailto:')) {
        window.location.href = href;
      } else {
        window.open(href, '_blank');
      }
    });
  });
})();
