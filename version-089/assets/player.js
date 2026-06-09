(function () {
    var configNode = document.getElementById('video-config');
    var video = document.getElementById('movie-player');
    var overlay = document.getElementById('play-overlay');

    if (!configNode || !video || !overlay) {
        return;
    }

    var config = {};
    try {
        config = JSON.parse(configNode.textContent || '{}');
    } catch (error) {
        config = {};
    }

    var source = config.src || '';
    var hls = null;
    var ready = false;

    function loadSource() {
        if (ready || !source) {
            return;
        }

        ready = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }

        video.src = source;
    }

    function startVideo() {
        loadSource();
        overlay.classList.add('is-hidden');
        video.controls = true;
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(function () {});
        }
    }

    overlay.addEventListener('click', startVideo);
    video.addEventListener('click', function () {
        if (video.paused) {
            startVideo();
        }
    });
    video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
    });
    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
})();
