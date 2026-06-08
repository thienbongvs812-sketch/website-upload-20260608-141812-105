(function () {
    var mobileToggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
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

        function setSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function playHero() {
            clearInterval(timer);
            timer = setInterval(function () {
                setSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                setSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                playHero();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                setSlide(current - 1);
                playHero();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                setSlide(current + 1);
                playHero();
            });
        }

        playHero();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
        var input = scope.querySelector("[data-search-input]");
        var clear = scope.querySelector("[data-search-clear]");
        var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter]"));
        var sortButtons = Array.prototype.slice.call(scope.querySelectorAll("[data-sort]"));
        var grid = document.querySelector("[data-card-grid]");
        var activeFilter = "all";

        function cards() {
            return grid ? Array.prototype.slice.call(grid.querySelectorAll("[data-card]")) : [];
        }

        function cardText(card) {
            return normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-tags")
            ].join(" "));
        }

        function applyFilter() {
            var keyword = normalize(input ? input.value : "");
            cards().forEach(function (card) {
                var text = cardText(card);
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchFilter = activeFilter === "all" || text.indexOf(normalize(activeFilter)) !== -1;
                card.classList.toggle("is-hidden", !(matchKeyword && matchFilter));
            });
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }

        if (clear && input) {
            clear.addEventListener("click", function () {
                input.value = "";
                activeFilter = "all";
                buttons.forEach(function (button) {
                    button.classList.toggle("active", button.getAttribute("data-filter") === "all");
                });
                applyFilter();
            });
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeFilter = button.getAttribute("data-filter") || "all";
                buttons.forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                applyFilter();
            });
        });

        sortButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                if (!grid) {
                    return;
                }
                var mode = button.getAttribute("data-sort");
                var sorted = cards().sort(function (a, b) {
                    if (mode === "title") {
                        return normalize(a.getAttribute("data-title")).localeCompare(normalize(b.getAttribute("data-title")), "zh-Hans-CN");
                    }
                    return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
                });
                sorted.forEach(function (card) {
                    grid.appendChild(card);
                });
                applyFilter();
            });
        });
    });

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        return new Promise(function (resolve, reject) {
            var existed = document.querySelector("script[data-hls-loader]");
            if (existed) {
                existed.addEventListener("load", function () {
                    resolve(window.Hls);
                });
                existed.addEventListener("error", reject);
                return;
            }
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
            script.async = true;
            script.setAttribute("data-hls-loader", "true");
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function bindPlayer(player) {
        var video = player.querySelector("video");
        var button = player.querySelector(".player-overlay");
        var status = player.querySelector(".player-status");
        var stream = player.getAttribute("data-stream");
        var started = false;

        function setStatus(text) {
            if (status) {
                status.textContent = text || "";
            }
        }

        function start() {
            if (!video || !stream) {
                setStatus("播放暂不可用，请稍后再试");
                return;
            }
            if (started) {
                video.play().catch(function () {});
                return;
            }
            started = true;
            setStatus("正在加载");

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                video.addEventListener("loadedmetadata", function () {
                    player.classList.add("is-playing");
                    setStatus("");
                    video.play().catch(function () {});
                }, { once: true });
                video.load();
                return;
            }

            loadHlsLibrary().then(function (Hls) {
                if (!Hls || !Hls.isSupported()) {
                    throw new Error("unavailable");
                }
                var hls = new Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    player.classList.add("is-playing");
                    setStatus("");
                    video.play().catch(function () {});
                });
                hls.on(Hls.Events.ERROR, function () {
                    setStatus("播放失败，请稍后再试");
                });
            }).catch(function () {
                started = false;
                setStatus("播放失败，请稍后再试");
            });
        }

        if (button) {
            button.addEventListener("click", start);
        }

        player.addEventListener("click", function (event) {
            if (event.target === video && !started) {
                start();
            }
        });
    }

    document.querySelectorAll(".js-player").forEach(bindPlayer);
})();
