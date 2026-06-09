(function () {
    var activeFilters = new WeakMap();

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function text(value) {
        return String(value || "").toLowerCase();
    }

    function setupNav() {
        var nav = document.querySelector("[data-site-nav]");
        var toggle = document.querySelector("[data-nav-toggle]");
        var searchToggle = document.querySelector("[data-search-toggle]");
        var search = document.querySelector("[data-header-search]");

        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        if (searchToggle && search) {
            searchToggle.addEventListener("click", function () {
                search.classList.toggle("is-open");
                var input = search.querySelector("input");
                if (search.classList.contains("is-open") && input) {
                    input.focus();
                }
            });
        }
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var thumbs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-thumb]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            thumbs.forEach(function (thumb, i) {
                thumb.classList.toggle("active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        thumbs.forEach(function (thumb, i) {
            thumb.addEventListener("click", function () {
                show(i);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function getCards(area) {
        return Array.prototype.slice.call(area.querySelectorAll("[data-movie-card]"));
    }

    function cardMatches(card, query, filters) {
        var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-region"),
            card.textContent
        ].map(text).join(" ");

        if (query && haystack.indexOf(query) === -1) {
            return false;
        }

        if (filters.type && text(card.getAttribute("data-type")).indexOf(text(filters.type)) === -1) {
            return false;
        }

        if (filters.year && text(card.getAttribute("data-year")) !== text(filters.year)) {
            return false;
        }

        return true;
    }

    function refreshArea(area) {
        var input = area.querySelector("[data-search-input]") || document.querySelector("[data-header-search] [data-search-input]");
        var query = text(input ? input.value.trim() : "");
        var filters = activeFilters.get(area) || {};
        getCards(area).forEach(function (card) {
            card.classList.toggle("hidden-card", !cardMatches(card, query, filters));
        });
    }

    function setupSearchAndFilters() {
        var areas = Array.prototype.slice.call(document.querySelectorAll("[data-page-search-area]"));
        if (!areas.length) {
            areas = [document];
        }

        areas.forEach(function (area) {
            activeFilters.set(area, {});
            var inputs = Array.prototype.slice.call(area.querySelectorAll("[data-search-input]"));
            inputs.forEach(function (input) {
                input.addEventListener("input", function () {
                    refreshArea(area);
                });
            });

            var buttons = Array.prototype.slice.call(area.querySelectorAll("[data-filter-button]"));
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    var key = button.getAttribute("data-filter-key");
                    var value = button.getAttribute("data-filter-value");
                    var filters = activeFilters.get(area) || {};

                    if (key === "all") {
                        filters = {};
                    } else {
                        filters = {};
                        filters[key] = value;
                    }

                    activeFilters.set(area, filters);
                    buttons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    refreshArea(area);
                });
            });
        });

        var headerInput = document.querySelector("[data-header-search] [data-search-input]");
        if (headerInput) {
            headerInput.addEventListener("input", function () {
                areas.forEach(refreshArea);
            });
        }
    }

    function setupPlayer() {
        var video = document.querySelector("[data-player-video]");
        if (!video) {
            return;
        }

        var shade = document.querySelector("[data-player-shade]");
        var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-player-trigger]"));
        var streamUrl = document.body.getAttribute("data-stream-url");
        var attached = false;
        var hls = null;

        function attach() {
            if (attached || !streamUrl) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }

            attached = true;
        }

        function play() {
            attach();
            video.controls = true;
            if (shade) {
                shade.classList.add("is-hidden");
            }
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    if (shade) {
                        shade.classList.remove("is-hidden");
                    }
                });
            }
        }

        triggers.forEach(function (trigger) {
            trigger.addEventListener("click", function (event) {
                event.preventDefault();
                play();
            });
        });

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    ready(function () {
        setupNav();
        setupHero();
        setupSearchAndFilters();
        setupPlayer();
    });
})();
