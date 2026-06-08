(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  selectAll('[data-hero]').forEach(function (hero) {
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    if (slides.length > 1) {
      if (prev) {
        prev.addEventListener('click', function () {
          show(active - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(active + 1);
          start();
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          start();
        });
      });
      start();
    }
  });

  selectAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var year = scope.querySelector('[data-year-filter]');
    var region = scope.querySelector('[data-region-filter]');
    var empty = scope.querySelector('[data-empty-state]');
    var cards = selectAll('.movie-card', scope);

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var q = normalize(input && input.value);
      var y = normalize(year && year.value);
      var r = normalize(region && region.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year')
        ].join(' '));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var ok = true;

        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (y && cardYear !== y) {
          ok = false;
        }
        if (r && cardRegion.indexOf(r) === -1) {
          ok = false;
        }

        card.classList.toggle('is-hidden-by-filter', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  });

  window.setupMoviePlayer = function (streamUrl) {
    var video = document.getElementById('movie-video');
    var layer = document.getElementById('play-layer');
    var hls = null;
    var attached = false;

    if (!video || !streamUrl) {
      return;
    }

    function hideLayer() {
      if (layer) {
        layer.classList.add('is-hidden');
      }
    }

    function startVideo() {
      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {});
      }
    }

    function attachMedia() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        startVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          startVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
        return;
      }

      video.src = streamUrl;
      startVideo();
    }

    function play() {
      hideLayer();
      attachMedia();
      if (attached && video.src) {
        startVideo();
      }
    }

    if (layer) {
      layer.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', hideLayer);
    video.addEventListener('ended', function () {
      if (layer) {
        layer.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
