(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
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

    function startTimer() {
        if (slides.length < 2) {
            return;
        }
        window.clearInterval(timer);
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            startTimer();
        });
    });

    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(current - 1);
            startTimer();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(current + 1);
            startTimer();
        });
    }

    startTimer();

    var queryInput = document.querySelector('#site-search') || document.querySelector('.movie-filter-input');
    var kindFilter = document.querySelector('#kind-filter') || document.querySelector('.movie-kind-filter');
    var regionFilter = document.querySelector('#region-filter');
    var yearFilter = document.querySelector('#year-filter');
    var filterCards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function updateFilters() {
        if (!filterCards.length) {
            return;
        }

        var query = normalize(queryInput ? queryInput.value : '');
        var kind = normalize(kindFilter ? kindFilter.value : '');
        var region = normalize(regionFilter ? regionFilter.value : '');
        var year = normalize(yearFilter ? yearFilter.value : '');

        filterCards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search'));
            var cardKind = normalize(card.getAttribute('data-kind'));
            var cardRegion = normalize(card.getAttribute('data-region'));
            var cardYear = normalize(card.getAttribute('data-year'));
            var visible = true;

            if (query && text.indexOf(query) === -1) {
                visible = false;
            }
            if (kind && cardKind !== kind) {
                visible = false;
            }
            if (region && cardRegion !== region) {
                visible = false;
            }
            if (year && cardYear !== year) {
                visible = false;
            }

            card.classList.toggle('is-hidden', !visible);
        });
    }

    [queryInput, kindFilter, regionFilter, yearFilter].forEach(function (item) {
        if (item) {
            item.addEventListener('input', updateFilters);
            item.addEventListener('change', updateFilters);
        }
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && queryInput) {
        queryInput.value = q;
        updateFilters();
    }
})();
