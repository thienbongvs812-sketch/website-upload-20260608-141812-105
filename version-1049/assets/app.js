(function () {
  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      const open = mobileNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
  }

  const backTop = document.querySelector(".back-top");
  if (backTop) {
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  let activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  const filterInput = document.querySelector(".card-filter-input");
  const cards = Array.from(document.querySelectorAll(".movie-card"));
  const empty = document.querySelector(".filter-empty");

  function matchCard(card, keyword) {
    const haystack = [
      card.dataset.title,
      card.dataset.region,
      card.dataset.type,
      card.dataset.year,
      card.dataset.genre,
      card.dataset.tags
    ].join(" ").toLowerCase();
    return haystack.includes(keyword.toLowerCase());
  }

  function applyFilter(value) {
    const keyword = String(value || "").trim();
    let visible = 0;

    cards.forEach(function (card) {
      const ok = !keyword || matchCard(card, keyword);
      card.style.display = ok ? "" : "none";
      if (ok) {
        visible += 1;
      }
    });

    if (empty) {
      empty.style.display = visible ? "none" : "block";
    }
  }

  if (filterInput && cards.length) {
    filterInput.addEventListener("input", function () {
      applyFilter(filterInput.value);
    });
  }

  document.querySelectorAll("[data-filter-value]").forEach(function (button) {
    button.addEventListener("click", function () {
      const value = button.getAttribute("data-filter-value") || "";
      if (filterInput) {
        filterInput.value = value;
      }
      applyFilter(value);
    });
  });
})();
