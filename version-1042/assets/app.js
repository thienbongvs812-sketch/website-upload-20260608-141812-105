(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var mobileNav = document.getElementById("mobileNav");
    if (!toggle || !mobileNav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function setupHero() {
    var root = document.getElementById("heroCarousel");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("active", position === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, position) {
      dot.addEventListener("click", function () {
        show(position);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function (panel) {
      var input = panel.querySelector(".movie-search");
      var chips = Array.prototype.slice.call(panel.querySelectorAll(".filter-chip"));
      var section = panel.closest("section") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll(".searchable-grid .movie-card, .searchable-grid .rank-item"));
      var activeFilter = "all";

      function textOf(card) {
        return [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.textContent
        ].join(" ").toLowerCase();
      }

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var filter = activeFilter.toLowerCase();
        cards.forEach(function (card) {
          var haystack = textOf(card);
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchFilter = filter === "all" || haystack.indexOf(filter) !== -1;
          card.classList.toggle("is-filtered-out", !(matchQuery && matchFilter));
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (item) {
            item.classList.remove("active");
          });
          chip.classList.add("active");
          activeFilter = chip.getAttribute("data-filter") || "all";
          apply();
        });
      });
    });
  }

  function attachStream(video, streamUrl) {
    if (!video || !streamUrl) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (!video.getAttribute("src")) {
        video.setAttribute("src", streamUrl);
      }
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!video.__movieHls) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        video.__movieHls = hls;
      }
      return;
    }

    if (!video.getAttribute("src")) {
      video.setAttribute("src", streamUrl);
    }
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".watch-shell"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".player-overlay");
      var streamUrl = player.getAttribute("data-stream");
      var started = false;

      function play() {
        attachStream(video, streamUrl);
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        if (video) {
          var promise = video.play();
          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
          }
        }
        started = true;
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (!started) {
            play();
          }
        });
        video.addEventListener("play", function () {
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
        });
      }
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
