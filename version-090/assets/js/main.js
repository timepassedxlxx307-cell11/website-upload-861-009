(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initGlobalSearch();
    initLocalFilter();
    initPlayers();
  });

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      toggle.textContent = menu.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });
    restart();
  }

  function initGlobalSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".global-search-input"));
    if (!inputs.length || !window.SEARCH_DATA) {
      return;
    }
    var prefix = document.body.getAttribute("data-prefix") || "";
    inputs.forEach(function (input) {
      var box = input.parentElement.querySelector(".global-search-panel");
      if (!box) {
        return;
      }
      input.addEventListener("input", function () {
        var q = input.value.trim().toLowerCase();
        if (!q) {
          box.classList.remove("is-open");
          box.innerHTML = "";
          return;
        }
        var results = window.SEARCH_DATA.filter(function (item) {
          return item.keywords.indexOf(q) !== -1;
        }).slice(0, 12);
        if (!results.length) {
          box.innerHTML = '<div class="search-result"><div><strong>没有找到匹配影片</strong><span>换一个片名、年份或标签试试</span></div></div>';
          box.classList.add("is-open");
          return;
        }
        box.innerHTML = results.map(function (item) {
          return '<a class="search-result" href="' + prefix + item.url + '">' +
            '<img src="' + prefix + item.poster + '" alt="' + escapeHtml(item.title) + '" onerror="this.style.display=\'none\'">' +
            '<div><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.meta) + '</span></div></a>';
        }).join("");
        box.classList.add("is-open");
      });
      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          var first = box.querySelector("a");
          if (first) {
            event.preventDefault();
            window.location.href = first.href;
          }
        }
      });
    });
    document.addEventListener("click", function (event) {
      if (!event.target.closest(".global-search")) {
        document.querySelectorAll(".global-search-panel").forEach(function (panel) {
          panel.classList.remove("is-open");
        });
      }
    });
  }

  function initLocalFilter() {
    var input = document.querySelector("[data-local-filter]");
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
        card.classList.toggle("is-filtered-out", q && text.indexOf(q) === -1);
      });
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      if (!video || !button) {
        return;
      }
      var m3u8 = video.getAttribute("data-m3u8");
      var loaded = false;
      function attach() {
        if (loaded || !m3u8) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = m3u8;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(m3u8);
          hls.attachMedia(video);
          video.hlsInstance = hls;
        } else {
          video.src = m3u8;
        }
        loaded = true;
      }
      function start() {
        attach();
        button.classList.add("is-hidden");
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }
      button.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          start();
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      if (char === "&") {
        return "&amp;";
      }
      if (char === "<") {
        return "&lt;";
      }
      if (char === ">") {
        return "&gt;";
      }
      return "&quot;";
    });
  }
})();
