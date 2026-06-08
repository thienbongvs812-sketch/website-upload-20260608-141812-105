(function () {
  function setupPlayer(root) {
    var video = root.querySelector('video');
    var trigger = root.querySelector('.player-poster');
    var stream = root.getAttribute('data-stream');
    var ready = false;
    var hls = null;

    if (!video || !trigger || !stream) {
      return;
    }

    function prepare() {
      if (ready) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      ready = true;
    }

    function play() {
      prepare();
      root.classList.add('is-playing');
      video.controls = true;
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    trigger.addEventListener('click', play);

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('.video-player')).forEach(setupPlayer);
  });
})();
