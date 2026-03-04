/* Gallery: inline section, grid population, lightbox */
(function () {
  var PAINTINGS = [
    'tomas-halling-2025-vandrande-ballongtapet-akryl-41x33-upscale.jpeg',
    'tomas-halling-2025-trandansband-akryl-80x60-upscale.jpeg',
    'tomas-halling-2025-skrattande-piano-akryl-46x30-upscale.jpeg',
    'tomas-halling-2025-hjärnan-behöver-rolig-jazz-akryl-80x60-upscale.jpeg',
    'tomas-halling-2025-eranimus-glödkropp-akryl-46x33-upscale.jpeg',
    'tomas-halling-2025-benjari-akryl-49.5x39.5-upscale.jpeg',
    'tomas-halling-2024-zpirr-akryl-30x22.5-upscale.jpeg',
    'tomas-halling-2024-tubeling-akryl-40x29cm-upscale.jpeg',
    'tomas-halling-2024-titelracer-sprudel-trombomanick-akryl-41x31-upscale.jpeg',
    'tomas-halling-2024-solvandrarna-färgblyertspennor-a4-upscale.jpeg',
    'tomas-halling-2024-orangeien-akryl-100x150-upscale.jpeg',
    'tomas-halling-2024-bubbelälg-akryl-41x33-upscale.jpeg',
    'tomas-halling-2024-benjari-akryl-50x40-upscale.jpeg',
    'tomas-halling-2023-teaterkostym-akryl-41x29cm-upscale.jpeg',
    'tomas-halling-2023-stjärnkryssaren-kataklyzmozz-akryl-på-tapet-71x53-upscale.jpeg',
    'tomas-halling-2023-space-swallows-akryl-81x60-upscale.jpeg',
    'tomas-halling-2023-soulpower-akryl-68x51-upscale.jpeg',
    'tomas-halling-2023-invisible-forest-akryl-119x80-upscale.jpeg',
    'tomas-halling-2023-ingen-titel-akryl-40x29.5-upscale.jpeg',
    'tomas-halling-2023-gungusnäbbad-bubbelstrålfink-akryl-70.5x50-upscale.jpeg',
    'tomas-halling-2019-the-first-morning-sun-akryl-50x40-upscale.jpeg',
    'tomas-halling-2018-vrålgås-akryl-40x29.5-upscale.jpeg',
    'tomas-halling-2018-two-cosmic-souls-akryl-106x69-upscale.jpeg',
    'tomas-halling-2017-mingua-akryl-70x69-upscale.jpeg',
    'tomas-halling-2015-eranimus-glödkropp-akryl-46x37-upscale.jpeg',
    'tomas-halling-2015-boken-akryl-50x40-upscale.jpeg'
  ];

  var FORESTALLNINGAR = [
    {
      title: '2000 Mingua',
      images: [
        'tomas-halling-2000-mingua-02-upscale.jpeg',
        'tomas-halling-2000-mingua-03-upscale.jpeg',
        'tomas-halling-2000-mingua-04-upscale.jpeg',
        'tomas-halling-2000-mingua-05-upscale.jpeg',
        'tomas-halling-2000-mingua-05b-upscale.jpeg',
        'tomas-halling-2000-mingua-06-upscale.jpeg',
        'tomas-halling-2000-mingua-07-upscale.jpeg',
        'tomas-halling-2000-mingua-08-upscale.jpeg',
        'tomas-halling-2000-mingua-10-upscale.jpeg',
        'tomas-halling-2000-mingua-11-upscale.jpeg',
        'tomas-halling-2000-mingua-12-upscale.jpeg',
        'tomas-halling-2000-mingua-13-upscale.jpeg'
      ]
    },
    {
      title: '2010 Gula Tuppen',
      images: [
        'tomas-halling-2010-gula-tuppen-biltvätten-upscale.jpeg',
        'tomas-halling-2010-gula-tuppen-rymdälg-elker-melling-upscale.jpeg',
        'tomas-halling-2010-gula-tuppen-sten-blåsäck-upscale.jpeg',
        'tomas-halling-2010-gula-tuppen-tomas-fisk-upscale.jpeg'
      ]
    },
    {
      title: '2011 Extension4',
      images: [
        'tomas-halling-2011-extension4-arubo-upscale.jpeg',
        'tomas-halling-2011-extension4-broschyr2sv-upscale.jpeg',
        'tomas-halling-2011-extension4-gasbrain-upscale.jpeg',
        'tomas-halling-2011-extension4-gloj-1-upscale.jpeg',
        'tomas-halling-2011-extension4-gloj-2-upscale.jpeg',
        'tomas-halling-2011-extension4-gloj-3-upscale.jpeg',
        'tomas-halling-2011-extension4-img_20250127_151234_367-upscale.jpeg',
        'tomas-halling-2011-extension4-jazzmumie-upscale.jpeg',
        'tomas-halling-2011-extension4-jazzmumien-upscale.jpeg',
        'tomas-halling-2011-extension4-lejonhunden-karakadoschi-upscale.jpeg',
        'tomas-halling-2011-extension4-mahatma-robot-upscale.jpeg',
        'tomas-halling-2011-extension4-p10306791-upscale.jpeg',
        'tomas-halling-2011-extension4-p1030685-upscale.jpeg',
        'tomas-halling-2011-extension4-p1030693-upscale.jpeg',
        'tomas-halling-2011-extension4-p1030719-upscale.jpeg',
        'tomas-halling-2011-extension4-p1030720-upscale.jpeg',
        'tomas-halling-2011-extension4-p1030723-upscale.jpeg',
        'tomas-halling-2011-extension4-p1030726-upscale.jpeg',
        'tomas-halling-2011-extension4-p1030729-upscale.jpeg',
        'tomas-halling-2011-extension4-tomuraz-hokkorajju-upscale.jpeg'
      ]
    },
    {
      title: '2012 Kosmisk allsång',
      images: [
        'tomas-halling-2012-kosmisk-allsång-atomic-mellowman-upscale.jpeg',
        'tomas-halling-2012-kosmisk-allsång-spå-i-ägg-upscale.jpeg'
      ]
    },
    {
      title: '2014 Blurrfish',
      images: [
        'tomas-halling-2014-blurrfish-clango-spirojo-sprinklerbasunist-upscale.jpeg',
        'tomas-halling-2014-blurrfish-clango-spirojo-upscale.jpeg',
        'tomas-halling-2014-blurrfish-DSC08222-upscale.jpeg',
        'tomas-halling-2014-blurrfish-DSC08229-upscale.jpeg',
        'tomas-halling-2014-blurrfish-DSC08232-upscale.jpeg',
        'tomas-halling-2014-blurrfish-DSC08240-upscale.jpeg',
        'tomas-halling-2014-blurrfish-DSC08244-upscale.jpeg',
        'tomas-halling-2014-blurrfish-DSC08246-upscale.jpeg',
        'tomas-halling-2014-blurrfish-DSC08247-upscale.jpeg',
        'tomas-halling-2014-blurrfish-DSC08248-upscale.jpeg',
        'tomas-halling-2014-blurrfish-DSC08250-upscale.jpeg',
        'tomas-halling-2014-blurrfish-gungus-upscale.jpeg',
        'tomas-halling-2014-blurrfish-trattkungen-upscale.jpeg',
        'tomas-halling-2014-blurrfish-trumset-upscale.jpeg',
        'tomas-halling-2014-blurrfish-upscale.jpeg'
      ]
    },
    {
      title: '2017 Brainforest',
      images: [
        'tomas-halling-2017-brainforest-20171231_201107-upscale.jpeg',
        'tomas-halling-2017-brainforest-5809-upscale.jpeg',
        'tomas-halling-2017-brainforest-5811-upscale.jpeg',
        'tomas-halling-2017-brainforest-5814-upscale.jpeg',
        'tomas-halling-2017-brainforest-5839-upscale.jpeg',
        'tomas-halling-2017-brainforest-5850-upscale.jpeg',
        'tomas-halling-2017-brainforest-5854-upscale.jpeg',
        'tomas-halling-2017-brainforest-5886-upscale.jpeg',
        'tomas-halling-2017-brainforest-5909-upscale.jpeg'
      ]
    },
    {
      title: 'XgLosChO',
      images: [
        'tomas-halling-brainforest-upscale.jpeg',
        'tomas-halling-cosmic-flowflower-upscale.jpeg',
        'tomas-halling-dojxudong-jazzmunk-upscale.jpeg',
        'tomas-halling-nebrusaläpp-upscale.jpeg',
        'tomas-halling-oj-upscale.jpeg',
        'tomas-halling-xgloscho-upscale.jpeg'
      ]
    }
  ];

  var overlay = document.getElementById('gallery-overlay');
  var grid = document.getElementById('gallery-grid');
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxCaption = document.getElementById('lightbox-caption');
  var lightboxClose = lightbox.querySelector('.lightbox-close');

  var activeSection = 'malningar';

  /* Extract human-readable title from filename */
  function parseTitle(filename) {
    var parts = filename.replace('-upscale.jpeg', '').split('-');
    var year = parts[2];
    var techKeywords = ['akryl', 'färgblyertspennor', 'olja', 'blyerts', 'pastell'];
    var techIdx = -1;
    for (var i = 3; i < parts.length; i++) {
      for (var k = 0; k < techKeywords.length; k++) {
        if (parts[i] === techKeywords[k]) { techIdx = i; break; }
      }
      if (techIdx !== -1) break;
    }
    var nameParts = techIdx !== -1 ? parts.slice(3, techIdx) : parts.slice(3);
    var name = nameParts.join(' ');
    name = name.charAt(0).toUpperCase() + name.slice(1);
    return name + ', ' + year;
  }

  /* Build tabs */
  function buildTabs() {
    var existing = overlay.querySelector('.gallery-tabs');
    if (existing) existing.remove();

    var tabs = document.createElement('div');
    tabs.className = 'gallery-tabs';

    var tabMalningar = document.createElement('button');
    tabMalningar.className = 'gallery-tab' + (activeSection === 'malningar' ? ' active' : '');
    tabMalningar.textContent = 'Målningar';
    tabMalningar.addEventListener('click', function () {
      activeSection = 'malningar';
      buildTabs();
      buildGrid();
    });

    var tabForest = document.createElement('button');
    tabForest.className = 'gallery-tab' + (activeSection === 'forestallningar' ? ' active' : '');
    tabForest.textContent = 'Föreställningar';
    tabForest.addEventListener('click', function () {
      activeSection = 'forestallningar';
      buildTabs();
      buildGrid();
    });

    tabs.appendChild(tabMalningar);
    tabs.appendChild(tabForest);
    overlay.insertBefore(tabs, grid);
  }

  /* Build grid cards */
  function buildGrid() {
    grid.innerHTML = '';

    if (activeSection === 'malningar') {
      buildPaintingsGrid();
    } else {
      buildForestallningarGrid();
    }
  }

  function buildPaintingsGrid() {
    grid.className = 'gallery-grid';
    PAINTINGS.forEach(function (file) {
      var card = document.createElement('div');
      card.className = 'gallery-card';
      var title = parseTitle(file);
      card.innerHTML =
        '<img src="assets/img/galleri/' + encodeURI(file) + '" alt="' + title + '" loading="lazy" />' +
        '<div class="gallery-card-title">' + title + '</div>';
      card.addEventListener('click', function () {
        openLightbox('assets/img/galleri/' + encodeURI(file), title);
      });
      grid.appendChild(card);
    });
  }

  function buildForestallningarGrid() {
    grid.className = 'gallery-grid gallery-grid--exhibitions';
    FORESTALLNINGAR.forEach(function (exhibition) {
      var section = document.createElement('div');
      section.className = 'exhibition-section';

      var heading = document.createElement('h3');
      heading.className = 'exhibition-heading';
      heading.textContent = exhibition.title;
      section.appendChild(heading);

      var imageGrid = document.createElement('div');
      imageGrid.className = 'exhibition-grid';

      exhibition.images.forEach(function (file) {
        var card = document.createElement('div');
        card.className = 'gallery-card';
        var title = exhibition.title;
        card.innerHTML =
          '<img src="assets/img/forestallningar/' + encodeURI(file) + '" alt="' + title + '" loading="lazy" />';
        card.addEventListener('click', function () {
          openLightbox('assets/img/forestallningar/' + encodeURI(file), title);
        });
        imageGrid.appendChild(card);
      });

      section.appendChild(imageGrid);
      grid.appendChild(section);
    });
  }

  /* Build gallery content on page load */
  buildTabs();
  buildGrid();

  /* openGallery: smooth-scroll to the gallery section */
  window.openGallery = function () {
    overlay.scrollIntoView({ behavior: 'smooth' });
  };

  /* Lightbox */
  function openLightbox(src, title) {
    lightboxImg.src = src;
    lightboxImg.alt = title;
    lightboxCaption.textContent = title;
    lightbox.classList.add('active');
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightboxImg.src = '';
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  /* Escape key for lightbox only */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
})();
