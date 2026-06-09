function startMoviePlayer(video, overlay, source) {
    if (!video || !overlay || !source) {
        return;
    }

    var prepared = false;
    var hls = null;

    function prepare() {
        if (prepared) {
            return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.load();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }
        video.src = source;
        video.load();
    }

    function play() {
        prepare();
        overlay.classList.add("is-hidden");
        video.controls = true;
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {
                overlay.classList.remove("is-hidden");
            });
        }
    }

    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
        if (!video.currentTime) {
            overlay.classList.remove("is-hidden");
        }
    });
    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
