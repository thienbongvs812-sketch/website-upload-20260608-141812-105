(function () {
    var navToggle = document.querySelector(".nav-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (navToggle && mobileNav) {
        navToggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function startTimer() {
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                showSlide(Number(dot.getAttribute("data-slide") || 0));
                startTimer();
            });
        });

        startTimer();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]")).forEach(function (root) {
        var scope = root.parentElement || document;
        var input = root.querySelector(".js-card-search");
        var typeSelect = root.querySelector(".js-filter-type");
        var regionSelect = root.querySelector(".js-filter-region");
        var yearSelect = root.querySelector(".js-filter-year");
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

        function applyFilters() {
            var keyword = normalize(input ? input.value : "");
            var typeValue = normalize(typeSelect ? typeSelect.value : "");
            var regionValue = normalize(regionSelect ? regionSelect.value : "");
            var yearValue = normalize(yearSelect ? yearSelect.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search"));
                var typeText = normalize(card.getAttribute("data-type"));
                var regionText = normalize(card.getAttribute("data-region"));
                var yearText = normalize(card.getAttribute("data-year"));
                var matched = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (typeValue && typeText.indexOf(typeValue) === -1) {
                    matched = false;
                }

                if (regionValue && regionText.indexOf(regionValue) === -1) {
                    matched = false;
                }

                if (yearValue && yearText !== yearValue) {
                    matched = false;
                }

                card.classList.toggle("is-hidden", !matched);

                if (matched) {
                    visible += 1;
                }
            });

            root.classList.toggle("has-empty", visible === 0);
        }

        [input, typeSelect, regionSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
    });
}());
