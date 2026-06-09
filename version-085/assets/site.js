(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function getSiteRoot() {
        var script = qs('script[src$="site.js"]');
        if (!script) {
            return new URL('./', window.location.href);
        }
        return new URL('../', script.src);
    }

    var siteRoot = getSiteRoot();

    function makeUrl(path) {
        return new URL(path, siteRoot.href).href;
    }

    function initMobileMenu() {
        var button = qs('[data-menu-button]');
        var nav = qs('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
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
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initCardFilters() {
        var panels = qsa('[data-filter-panel]');
        panels.forEach(function (panel) {
            var scope = panel.parentElement ? qs('[data-filter-scope]', panel.parentElement) : null;
            if (!scope) {
                return;
            }
            var cards = qsa('.movie-card, .ranking-item', scope);
            var searchInput = qs('[data-card-search]', panel);
            var typeSelect = qs('[data-filter-type]', panel);
            var yearSelect = qs('[data-filter-year]', panel);
            var categorySelect = qs('[data-filter-category]', panel);
            var clearButton = qs('[data-clear-filter]', panel);
            var result = qs('[data-filter-result]', panel);
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q') || '';
            if (searchInput && initialQuery) {
                searchInput.value = initialQuery;
            }

            function apply() {
                var query = normalize(searchInput && searchInput.value);
                var type = normalize(typeSelect && typeSelect.value);
                var year = normalize(yearSelect && yearSelect.value);
                var category = normalize(categorySelect && categorySelect.value);
                var shown = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var cardCategory = normalize(card.getAttribute('data-category'));
                    var matched = true;
                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (type && cardType !== type) {
                        matched = false;
                    }
                    if (year && cardYear !== year) {
                        matched = false;
                    }
                    if (category && cardCategory !== category) {
                        matched = false;
                    }
                    card.classList.toggle('is-hidden', !matched);
                    if (matched) {
                        shown += 1;
                    }
                });
                if (result) {
                    result.textContent = '当前显示 ' + shown + ' / ' + cards.length + ' 条影片';
                }
            }

            [searchInput, typeSelect, yearSelect, categorySelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            if (clearButton) {
                clearButton.addEventListener('click', function () {
                    if (searchInput) {
                        searchInput.value = '';
                    }
                    if (typeSelect) {
                        typeSelect.value = '';
                    }
                    if (yearSelect) {
                        yearSelect.value = '';
                    }
                    if (categorySelect) {
                        categorySelect.value = '';
                    }
                    apply();
                });
            }
            apply();
        });
    }

    function initGlobalSearchSuggestions() {
        var forms = qsa('[data-search-form]');
        var index = window.MOVIE_SEARCH_INDEX || [];
        if (!forms.length || !index.length) {
            return;
        }
        forms.forEach(function (form) {
            var input = qs('[data-global-search]', form);
            var box = qs('[data-search-suggestions]', form);
            if (!input || !box) {
                return;
            }

            function close() {
                box.classList.remove('is-open');
                box.innerHTML = '';
            }

            function render() {
                var query = normalize(input.value);
                if (!query) {
                    close();
                    return;
                }
                var matches = index.filter(function (item) {
                    return normalize(item.title + ' ' + item.year + ' ' + item.genre + ' ' + item.region + ' ' + item.summary).indexOf(query) !== -1;
                }).slice(0, 8);
                if (!matches.length) {
                    close();
                    return;
                }
                box.innerHTML = matches.map(function (item) {
                    var href = makeUrl(item.url);
                    var cover = makeUrl(item.cover);
                    return '<a href="' + href + '">' +
                        '<img src="' + cover + '" alt="' + escapeHtml(item.title) + '">' +
                        '<span><strong>' + escapeHtml(item.title) + '</strong>' +
                        '<span>' + escapeHtml(item.year + ' · ' + item.genre) + '</span></span>' +
                        '</a>';
                }).join('');
                box.classList.add('is-open');
            }

            input.addEventListener('input', render);
            input.addEventListener('focus', render);
            document.addEventListener('click', function (event) {
                if (!form.contains(event.target)) {
                    close();
                }
            });
        });
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initPlayerScroll() {
        qsa('[data-scroll-player]').forEach(function (button) {
            button.addEventListener('click', function (event) {
                var player = qs('[data-player]');
                if (player) {
                    event.preventDefault();
                    player.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    var playButton = qs('[data-player-button]', player);
                    if (playButton) {
                        playButton.focus();
                    }
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initCardFilters();
        initGlobalSearchSuggestions();
        initPlayerScroll();
    });
})();
