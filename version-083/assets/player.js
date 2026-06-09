(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('[data-player-cover]');
    var buttons = Array.prototype.slice.call(player.querySelectorAll('[data-play-button]'));
    var stream = video ? video.getAttribute('data-stream') : '';
    var hls = null;
    var prepared = false;

    var prepare = function () {
      if (!video || !stream || prepared) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        prepared = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        prepared = true;
        return;
      }

      video.src = stream;
      prepared = true;
    };

    var start = function () {
      prepare();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    };

    buttons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    });

    if (cover) {
      cover.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
    }

    player.__startPlayback = start;
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-player-trigger]')).forEach(function (trigger) {
    trigger.addEventListener('click', function (event) {
      var selector = trigger.getAttribute('data-player-trigger');
      var target = selector ? document.querySelector(selector) : null;
      if (target && typeof target.__startPlayback === 'function') {
        event.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        target.__startPlayback();
      }
    });
  });
})();
