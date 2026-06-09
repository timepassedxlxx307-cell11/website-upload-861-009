(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains('is-active');
    }));
    var timer = null;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    var startTimer = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
        startTimer();
      });
    });

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

    showSlide(current);
    startTimer();
  }

  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var search = filterPanel.querySelector('[data-filter-search]');
    var type = filterPanel.querySelector('[data-filter-type]');
    var region = filterPanel.querySelector('[data-filter-region]');
    var reset = filterPanel.querySelector('[data-filter-reset]');
    var status = document.querySelector('[data-filter-status]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    var normalize = function (value) {
      return String(value || '').toLowerCase().trim();
    };

    var applyFilter = function () {
      var query = normalize(search && search.value);
      var selectedType = normalize(type && type.value);
      var selectedRegion = normalize(region && region.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchType = !selectedType || cardType.indexOf(selectedType) !== -1;
        var matchRegion = !selectedRegion || cardRegion.indexOf(selectedRegion) !== -1;
        var match = matchQuery && matchType && matchRegion;

        card.classList.toggle('is-hidden', !match);
        if (match) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = visible > 0 ? '影片列表' : '没有找到符合条件的影片';
      }
    };

    [search, type, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (search) {
          search.value = '';
        }
        if (type) {
          type.value = '';
        }
        if (region) {
          region.value = '';
        }
        applyFilter();
      });
    }
  }

  var resultsRoot = document.querySelector('[data-search-results]');
  var searchInput = document.querySelector('[data-search-input]');

  if (resultsRoot && searchInput && Array.isArray(window.SITE_MOVIES)) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;

    var makeResult = function (movie) {
      var article = document.createElement('article');
      article.className = 'movie-card';

      var link = document.createElement('a');
      link.className = 'poster-link';
      link.href = './' + movie.file;
      link.setAttribute('aria-label', movie.title + ' 在线观看');

      var image = document.createElement('img');
      image.src = movie.cover;
      image.alt = movie.title + ' 在线观看';
      image.loading = 'lazy';
      image.decoding = 'async';
      link.appendChild(image);

      var year = document.createElement('span');
      year.className = 'poster-year';
      year.textContent = movie.year || '';
      link.appendChild(year);

      var region = document.createElement('span');
      region.className = 'poster-region';
      region.textContent = movie.region || '';
      link.appendChild(region);

      var body = document.createElement('div');
      body.className = 'movie-card-body';

      var title = document.createElement('h2');
      var titleLink = document.createElement('a');
      titleLink.href = './' + movie.file;
      titleLink.textContent = movie.title;
      title.appendChild(titleLink);
      body.appendChild(title);

      var intro = document.createElement('p');
      intro.textContent = movie.oneLine || '';
      body.appendChild(intro);

      var meta = document.createElement('div');
      meta.className = 'card-meta';
      [movie.type, movie.genre, movie.category].forEach(function (item) {
        if (item) {
          var span = document.createElement('span');
          span.textContent = item;
          meta.appendChild(span);
        }
      });
      body.appendChild(meta);

      article.appendChild(link);
      article.appendChild(body);

      return article;
    };

    var runSearch = function () {
      var query = String(searchInput.value || '').toLowerCase().trim();
      var matched = window.SITE_MOVIES.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.oneLine,
          movie.category
        ].join(' ').toLowerCase();
        return !query || haystack.indexOf(query) !== -1;
      }).slice(0, 80);

      resultsRoot.textContent = '';

      if (!matched.length) {
        var empty = document.createElement('div');
        empty.className = 'empty-search';
        empty.textContent = '没有找到符合条件的影片';
        resultsRoot.appendChild(empty);
        return;
      }

      matched.forEach(function (movie) {
        resultsRoot.appendChild(makeResult(movie));
      });
    };

    searchInput.addEventListener('input', runSearch);
    runSearch();
  }
})();
