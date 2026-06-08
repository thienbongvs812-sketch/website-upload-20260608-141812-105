(function () {
    var panel = document.querySelector('[data-mobile-panel]');
    var toggle = document.querySelector('[data-menu-toggle]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startHero() {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
                startHero();
            });
        });

        showSlide(0);
        startHero();
    }

    function runFilter(form) {
        var input = form.querySelector('[data-filter-input]');
        var root = document.querySelector('[data-card-list]');
        var empty = document.querySelector('[data-empty-state]');

        if (!input || !root) {
            return;
        }

        function apply(value) {
            var query = String(value || '').trim().toLowerCase();
            var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
            var shown = 0;

            cards.forEach(function (card) {
                var text = card.getAttribute('data-search-text') || card.textContent || '';
                var ok = !query || text.toLowerCase().indexOf(query) !== -1;
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    shown += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', shown === 0);
            }
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            apply(input.value);
        });

        input.addEventListener('input', function () {
            apply(input.value);
        });

        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q');

        if (initial) {
            input.value = initial;
            apply(initial);
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]')).forEach(runFilter);

    var hlsLoader = null;

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (hlsLoader) {
            return hlsLoader;
        }

        hlsLoader = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });

        return hlsLoader;
    }

    function attachStream(player) {
        var video = player.querySelector('video');
        var streamUrl = player.getAttribute('data-stream');

        if (!video || !streamUrl) {
            return Promise.reject(new Error('stream'));
        }

        if (video.getAttribute('data-ready') === '1') {
            return Promise.resolve(video);
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            video.setAttribute('data-ready', '1');
            return Promise.resolve(video);
        }

        return loadHlsLibrary().then(function (Hls) {
            if (Hls && Hls.isSupported()) {
                var hls = new Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                video.setAttribute('data-ready', '1');
                return video;
            }

            video.src = streamUrl;
            video.setAttribute('data-ready', '1');
            return video;
        });
    }

    function playVideo(player) {
        attachStream(player).then(function (video) {
            player.classList.add('is-playing');
            var result = video.play();

            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    player.classList.remove('is-playing');
                });
            }
        }).catch(function () {
            player.classList.remove('is-playing');
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
        var button = player.querySelector('[data-play]');
        var video = player.querySelector('video');

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                playVideo(player);
            });
        }

        player.addEventListener('click', function (event) {
            if (event.target === video || event.target.closest('[data-play]')) {
                return;
            }

            playVideo(player);
        });

        if (video) {
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });

            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    player.classList.remove('is-playing');
                }
            });
        }
    });
})();
