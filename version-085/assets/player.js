import { H as Hls } from './hls.js';

function setStatus(player, message) {
    var status = player.querySelector('[data-player-status]');
    if (status) {
        status.textContent = message;
    }
}

function setupPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-player-button]');
    if (!video || !button) {
        return;
    }

    var source = video.getAttribute('data-src');
    var hlsInstance = null;
    var isLoaded = false;

    function loadAndPlay() {
        if (!source) {
            setStatus(player, '未找到播放源。');
            return;
        }

        if (!isLoaded) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                isLoaded = true;
            } else if (Hls && Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                    setStatus(player, '播放源已加载。');
                });
                hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus(player, '播放加载失败，请稍后重试。');
                    }
                });
                isLoaded = true;
            } else {
                setStatus(player, '当前浏览器不支持 HLS 播放。');
                return;
            }
        }

        player.classList.add('is-playing');
        setStatus(player, '正在播放。');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                setStatus(player, '浏览器阻止自动播放，请再次点击播放按钮。');
                player.classList.remove('is-playing');
            });
        }
    }

    button.addEventListener('click', loadAndPlay);
    player.addEventListener('click', function (event) {
        if (event.target === player) {
            loadAndPlay();
        }
    });
    video.addEventListener('play', function () {
        player.classList.add('is-playing');
        setStatus(player, '正在播放。');
    });
    video.addEventListener('pause', function () {
        setStatus(player, '已暂停。');
    });
    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

document.querySelectorAll('[data-player]').forEach(setupPlayer);
