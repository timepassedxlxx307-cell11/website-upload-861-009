(function () {
    var configElement = document.getElementById('play-config');
    var video = document.querySelector('.js-player');
    var button = document.querySelector('.js-play-button');
    var shell = document.querySelector('.player-shell');
    var config = {};
    var started = false;

    try {
        config = configElement ? JSON.parse(configElement.textContent || '{}') : {};
    } catch (error) {
        config = {};
    }

    function beginPlay() {
        if (!video || !config.src) {
            return;
        }
        if (shell) {
            shell.classList.add('is-playing');
        }
        if (started) {
            video.play().catch(function () {});
            return;
        }
        started = true;
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(config.src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
        } else {
            video.src = config.src;
            video.play().catch(function () {});
        }
    }

    if (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            beginPlay();
        });
    }

    if (shell) {
        shell.addEventListener('click', function () {
            beginPlay();
        });
    }
})();
