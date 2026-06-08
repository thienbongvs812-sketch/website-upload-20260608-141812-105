(function () {
  var nav = document.querySelector('.site-nav');
  var menu = document.querySelector('.menu-toggle');

  if (menu && nav) {
    menu.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var index = 0;
  var timer = null;

  function showSlide(nextIndex) {
    if (!slides.length) {
      return;
    }

    index = (nextIndex + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === index);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(index + 1);
    }, 6200);
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
      startHero();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(index - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(index + 1);
      startHero();
    });
  }

  startHero();

  var list = document.querySelector('.js-movie-list');
  var input = document.querySelector('.js-search-input');
  var noResults = document.querySelector('.no-results');
  var genreButtons = Array.prototype.slice.call(document.querySelectorAll('.genre-chip'));
  var viewButtons = Array.prototype.slice.call(document.querySelectorAll('.js-view-toggle'));
  var activeGenre = '';

  if (input) {
    var query = new URLSearchParams(window.location.search).get('q');
    if (query) {
      input.value = query;
    }
  }

  function applySearch() {
    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var text = input ? input.value.trim().toLowerCase() : '';
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = card.getAttribute('data-search') || '';
      var matchText = !text || haystack.indexOf(text) !== -1;
      var matchGenre = !activeGenre || haystack.indexOf(activeGenre) !== -1;
      var show = matchText && matchGenre;
      card.hidden = !show;
      if (show) {
        visible += 1;
      }
    });

    if (noResults) {
      noResults.hidden = visible !== 0;
    }
  }

  if (input) {
    input.addEventListener('input', applySearch);
    applySearch();
  }

  genreButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeGenre = button.getAttribute('data-query') || '';
      genreButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      applySearch();
    });
  });

  viewButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var view = button.getAttribute('data-view');
      viewButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      if (list) {
        list.classList.toggle('list-view', view === 'list');
      }
    });
  });

  var watchButton = document.querySelector('.detail-watch');
  var player = document.querySelector('.video-player');

  if (watchButton && player) {
    watchButton.addEventListener('click', function () {
      var trigger = player.querySelector('.player-poster');
      if (trigger) {
        window.setTimeout(function () {
          trigger.click();
        }, 220);
      }
    });
  }
})();
