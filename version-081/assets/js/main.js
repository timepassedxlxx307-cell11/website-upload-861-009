(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileNav() {
        var button = document.querySelector("[data-mobile-toggle]");
        var menu = document.querySelector("[data-mobile-nav]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var thumbs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-thumb]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function apply(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
            thumbs.forEach(function (thumb, i) {
                thumb.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                apply(index + 1);
            }, 6000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                apply(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                apply(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                apply(index + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        apply(0);
        start();
    }

    function setupGlobalSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".global-search"));
        var panel = document.getElementById("siteSearchPanel");
        if (!inputs.length || !Array.isArray(window.SITE_MOVIES)) {
            return;
        }

        function render(query) {
            if (!panel) {
                return;
            }
            var normalized = query.trim().toLowerCase();
            if (!normalized) {
                panel.classList.remove("is-open");
                panel.innerHTML = "";
                return;
            }
            var matches = window.SITE_MOVIES.filter(function (movie) {
                return movie.searchText.indexOf(normalized) !== -1;
            }).slice(0, 12);
            panel.innerHTML = matches.map(function (movie) {
                return '<a class="search-result" href="' + movie.url + '">' +
                    '<img src="' + movie.cover + '" alt="' + movie.title + '">' +
                    '<span><strong>' + movie.title + '</strong><span>' + movie.meta + '</span></span>' +
                    '</a>';
            }).join("");
            panel.classList.toggle("is-open", matches.length > 0);
        }

        inputs.forEach(function (input) {
            input.addEventListener("input", function () {
                render(input.value);
            });
            input.addEventListener("focus", function () {
                render(input.value);
            });
        });

        document.addEventListener("click", function (event) {
            if (!panel) {
                return;
            }
            if (!event.target.closest(".header-search")) {
                panel.classList.remove("is-open");
            }
        });
    }

    function setupPageFilters() {
        var bars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]"));
        bars.forEach(function (bar) {
            var section = bar.closest("section") || document;
            var cards = Array.prototype.slice.call(section.querySelectorAll("[data-movie-card]"));
            if (!cards.length) {
                cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
            }
            var search = bar.querySelector(".js-page-search");
            var selects = Array.prototype.slice.call(bar.querySelectorAll(".js-filter-select"));
            var empty = section.querySelector("[data-empty-state]") || document.querySelector("[data-empty-state]");

            function matches(card, key, value) {
                if (!value) {
                    return true;
                }
                var target = (card.getAttribute("data-" + key) || "").toLowerCase();
                return target.indexOf(value.toLowerCase()) !== -1;
            }

            function apply() {
                var query = search ? search.value.trim().toLowerCase() : "";
                var active = 0;
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags")
                    ].join(" ").toLowerCase();
                    var ok = !query || text.indexOf(query) !== -1;
                    selects.forEach(function (select) {
                        ok = ok && matches(card, select.getAttribute("data-filter-key"), select.value);
                    });
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        active += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", active === 0);
                }
            }

            if (search) {
                search.addEventListener("input", apply);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
            apply();
        });
    }

    ready(function () {
        setupMobileNav();
        setupHero();
        setupGlobalSearch();
        setupPageFilters();
    });
})();
