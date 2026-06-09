document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".main-nav");
  var searchButton = document.querySelector(".search-toggle");
  var headerSearch = document.querySelector(".header-search");

  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  if (searchButton && headerSearch) {
    searchButton.addEventListener("click", function () {
      headerSearch.classList.toggle("open");
      var input = headerSearch.querySelector("input");
      if (headerSearch.classList.contains("open") && input) {
        input.focus();
      }
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === activeIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === activeIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showSlide(Number(dot.getAttribute("data-slide") || 0));
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
  searchInputs.forEach(function (input) {
    var selector = input.getAttribute("data-search-target") || "[data-filter-card]";
    var cards = Array.prototype.slice.call(document.querySelectorAll(selector));

    function filterCards() {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = card.getAttribute("data-search") || card.textContent || "";
        card.hidden = query.length > 0 && text.toLowerCase().indexOf(query) === -1;
      });
    }

    input.addEventListener("input", filterCards);

    var params = new URLSearchParams(window.location.search);
    var q = params.get("search");
    if (q) {
      input.value = q;
      filterCards();
    }
  });
});
