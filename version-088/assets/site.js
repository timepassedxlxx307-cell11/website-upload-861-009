(function () {
  function each(selector, callback, root) {
    Array.prototype.forEach.call((root || document).querySelectorAll(selector), callback);
  }

  function text(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", nav.classList.contains("is-open"));
    });
  }

  function initSearchForms() {
    each("[data-search-form]", function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          return;
        }
        event.preventDefault();
        window.location.href = "./search.html?q=" + encodeURIComponent(input.value.trim());
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initFilters() {
    each("[data-filter-panel]", function (panel) {
      var input = panel.querySelector("[data-filter-text]");
      var typeSelect = panel.querySelector("[data-filter-type]");
      var sortSelect = panel.querySelector("[data-sort-cards]");
      var container = panel.parentElement.querySelector("[data-card-list]");
      var empty = panel.querySelector("[data-empty-state]");
      if (!container) {
        return;
      }
      var cards = Array.prototype.slice.call(container.querySelectorAll(".movie-card"));

      function apply() {
        var query = text(input && input.value);
        var type = text(typeSelect && typeSelect.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = text(card.getAttribute("data-search"));
          var cardType = text(card.getAttribute("data-type"));
          var okText = !query || haystack.indexOf(query) !== -1;
          var okType = !type || cardType.indexOf(type) !== -1;
          var ok = okText && okType;
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      function sortCards() {
        var value = sortSelect ? sortSelect.value : "default";
        if (value === "default") {
          cards.sort(function (a, b) {
            return cards.indexOf(a) - cards.indexOf(b);
          });
        } else if (value === "rating") {
          cards.sort(function (a, b) {
            return parseFloat(b.getAttribute("data-rating") || "0") - parseFloat(a.getAttribute("data-rating") || "0");
          });
        } else if (value === "year") {
          cards.sort(function (a, b) {
            return parseInt(b.getAttribute("data-year") || "0", 10) - parseInt(a.getAttribute("data-year") || "0", 10);
          });
        } else if (value === "title") {
          cards.sort(function (a, b) {
            return text(a.getAttribute("data-search")).localeCompare(text(b.getAttribute("data-search")), "zh-CN");
          });
        }
        cards.forEach(function (card) {
          container.appendChild(card);
        });
        apply();
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (typeSelect) {
        typeSelect.addEventListener("change", apply);
      }
      if (sortSelect) {
        sortSelect.addEventListener("change", sortCards);
      }

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && input) {
        input.value = query;
      }
      apply();
    });
  }

  function preparePlayer(video, stream) {
    if (!video || !stream || video.getAttribute("data-ready") === "1") {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video.hlsObject = hls;
      video.setAttribute("data-ready", "1");
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      video.setAttribute("data-ready", "1");
      return;
    }
    video.src = stream;
    video.setAttribute("data-ready", "1");
  }

  function startPlayer(stream) {
    var video = document.getElementById("movie-player");
    var button = document.querySelector("[data-play-button]");
    var scrollPlay = document.querySelector("[data-scroll-play]");
    if (!video) {
      return;
    }

    function begin() {
      preparePlayer(video, stream);
      if (button) {
        button.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", begin);
    }
    if (scrollPlay) {
      scrollPlay.addEventListener("click", function () {
        window.setTimeout(begin, 100);
      });
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      }
    });
    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });
  }

  function init() {
    initMenu();
    initSearchForms();
    initHero();
    initFilters();
  }

  window.MovieSite = {
    startPlayer: startPlayer
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
