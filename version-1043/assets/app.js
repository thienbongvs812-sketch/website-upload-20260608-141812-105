(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");
        if (menuButton && mobileMenu) {
            menuButton.addEventListener("click", function () {
                mobileMenu.classList.toggle("open");
            });
        }

        var backTop = document.querySelector("[data-back-top]");
        if (backTop) {
            backTop.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === current);
                });
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    restart();
                });
            });
            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    restart();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    restart();
                });
            }
            restart();
        }

        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-title]"));
        var filterSearch = document.querySelector("[data-filter-search]");
        var filterType = document.querySelector("[data-filter-type]");
        var filterYear = document.querySelector("[data-filter-year]");
        if (cards.length && (filterSearch || filterType || filterYear)) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q && filterSearch) {
                filterSearch.value = q;
            }

            function applyFilters() {
                var keyword = filterSearch ? filterSearch.value.trim().toLowerCase() : "";
                var type = filterType ? filterType.value : "";
                var year = filterYear ? filterYear.value : "";
                cards.forEach(function (card) {
                    var text = [
                        card.dataset.title,
                        card.dataset.tags,
                        card.dataset.year,
                        card.dataset.type,
                        card.dataset.region
                    ].join(" ").toLowerCase();
                    var typeOk = !type || card.dataset.type === type;
                    var yearOk = !year || card.dataset.year === year;
                    var keywordOk = !keyword || text.indexOf(keyword) !== -1;
                    card.hidden = !(typeOk && yearOk && keywordOk);
                });
            }

            [filterSearch, filterType, filterYear].forEach(function (item) {
                if (item) {
                    item.addEventListener("input", applyFilters);
                    item.addEventListener("change", applyFilters);
                }
            });
            applyFilters();
        }
    });
})();

function sitePlayer(src) {
    var video = document.querySelector("[data-player]");
    var cover = document.querySelector("[data-player-cover]");
    var hls = null;
    var loaded = false;

    function loadAndPlay() {
        if (!video) {
            return;
        }
        if (!loaded) {
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls();
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
        }
        if (cover) {
            cover.classList.add("is-hidden");
        }
        var play = video.play();
        if (play && play.catch) {
            play.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener("click", loadAndPlay);
    }
    if (video) {
        video.addEventListener("click", function () {
            if (!loaded) {
                loadAndPlay();
            }
        });
        video.addEventListener("emptied", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
            loaded = false;
        });
    }
}
