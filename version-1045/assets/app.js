(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuButton.textContent = open ? '×' : '☰';
    });
  }

  document.querySelectorAll('[data-back-top]').forEach(function (button) {
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  document.querySelectorAll('[data-filter-form]').forEach(function (form) {
    var scope = form.parentElement;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var keyword = form.querySelector('[data-filter-keyword]');
    var year = form.querySelector('[data-filter-year]');
    var region = form.querySelector('[data-filter-region]');
    var reset = form.querySelector('[data-filter-reset]');

    function apply() {
      var q = keyword ? keyword.value.trim().toLowerCase() : '';
      var y = year ? year.value : '';
      var r = region ? region.value : '';

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        var matched = true;
        if (q && haystack.indexOf(q) === -1) matched = false;
        if (y && (card.getAttribute('data-year') || '').indexOf(y) === -1) matched = false;
        if (r && (card.getAttribute('data-region') || '') !== r) matched = false;
        card.classList.toggle('is-hidden', !matched);
      });
    }

    [keyword, year, region].forEach(function (input) {
      if (input) {
        input.addEventListener('input', apply);
        input.addEventListener('change', apply);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (keyword) keyword.value = '';
        if (year) year.value = '';
        if (region) region.value = '';
        apply();
      });
    }
  });

  document.querySelectorAll('.player-shell').forEach(function (shell) {
    var video = shell.querySelector('.js-video-player');
    var cover = shell.querySelector('.player-cover');
    if (!video || !cover) return;
    var stream = video.getAttribute('data-stream');
    var hls = null;

    function load() {
      if (video.getAttribute('data-ready') === '1') return;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
      video.setAttribute('data-ready', '1');
    }

    function play() {
      load();
      shell.classList.add('is-playing');
      var action = video.play();
      if (action && action.catch) {
        action.catch(function () {});
      }
    }

    cover.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    video.addEventListener('ended', function () {
      shell.classList.remove('is-playing');
    });
  });
})();
