(function () {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');
    if (toggle && links) {
        toggle.addEventListener('click', function () {
            var open = links.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var previous = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
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

    function startCarousel() {
        if (slides.length < 2) {
            return;
        }
        clearInterval(timer);
        timer = setInterval(function () {
            showSlide(current + 1);
        }, 5600);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            startCarousel();
        });
    });

    if (previous) {
        previous.addEventListener('click', function () {
            showSlide(current - 1);
            startCarousel();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(current + 1);
            startCarousel();
        });
    }

    showSlide(0);
    startCarousel();

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var searchInput = document.querySelector('.js-search-input');
    if (searchInput) {
        searchInput.value = query;
    }

    var activeFilter = 'all';
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));

    function cardText(card) {
        return [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-region') || '',
            card.textContent || ''
        ].join(' ').toLowerCase();
    }

    function applyFilters() {
        var value = searchInput ? searchInput.value.trim().toLowerCase() : query.trim().toLowerCase();
        cards.forEach(function (card) {
            var text = cardText(card);
            var matchQuery = !value || text.indexOf(value) !== -1;
            var matchFilter = activeFilter === 'all' || text.indexOf(activeFilter.toLowerCase()) !== -1;
            card.classList.toggle('is-hidden', !(matchQuery && matchFilter));
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            activeFilter = chip.getAttribute('data-filter') || 'all';
            chips.forEach(function (item) {
                item.classList.toggle('active', item === chip);
            });
            applyFilters();
        });
    });

    applyFilters();
})();
