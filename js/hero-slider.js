// js/hero-slider.js
(() => {
  window.addEventListener("DOMContentLoaded", () => {
    const hero = document.querySelector(".home-hero");
    const bgLayers = document.querySelectorAll(".hero-bg");
    const heroContent = document.querySelector(".hero-content");
    const heroTitle = document.getElementById("hero-title");
    const heroSubtext = document.getElementById("hero-subtext");

    // If hero not present or bg layers missing, do nothing safely
    if (!hero || !bgLayers.length || !heroContent || !heroTitle || !heroSubtext) return;

    // ✅ Use EXACT filenames you currently have in assets/images/hero/
    const HERO_SLIDES = [
      {
        image: "assets/images/hero/hero-01.jpg",
        title: "PRESENCE<br>WITHOUT NOISE",
        text: "QUIET CONFIDENCE.<br>DISCIPLINED FORM."
      },
      {
        image: "assets/images/hero/hero-02.jpg",
        title: "DEFINED<br>BY RESTRAINT",
        text: "ELEVATED COMFORT.<br>INTENTIONAL DETAIL."
      },
      {
        image: "assets/images/hero/hero-3.jpg",
        title: "TIMELESS<br>ENERGY",
        text: "BOLD IDENTITY.<br>CLEAR PURPOSE."
      },
      {
        image: "assets/images/hero/hero-4.jpg",
        title: "SILENT<br>AUTHORITY",
        text: "CONTROLLED FORM.<br>MODERN LUXURY."
      },
      {
        image: "assets/images/hero/hero-5.jpg",
        title: "BUILT<br>TO LAST",
        text: "ENDURING DESIGN.<br>NO EXCESS."
      },
      {
        image: "assets/images/hero/hero-6.jpg",
        title: "C-LUXURY",
        text: "FORM. CONTROL. TIMELESS."
      }
    ];

    // Preload images
    HERO_SLIDES.forEach((s) => {
      const img = new Image();
      img.src = s.image;
    });

    // Timing
    const HOLD_MS = 6000; // 6 seconds rule ✅
    const FADE_MS = 650;

    // Reduced motion support
    const prefersReducedMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let current = 0;
    let activeBg = 0;
    let timer = null;
    let isPaused = false;

    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const start = () => {
      stop();
      if (prefersReducedMotion) return; // no auto-anim if reduced motion
      timer = setInterval(() => {
        if (!isPaused) next();
      }, HOLD_MS);
    };

    const applySlide = (idx) => {
      const nextBg = activeBg === 0 ? 1 : 0;
      const slide = HERO_SLIDES[idx];

      // Reduced motion: no fades
      if (prefersReducedMotion) {
        bgLayers[activeBg].style.backgroundImage = `url(${slide.image})`;
        bgLayers[activeBg].classList.add("active");
        heroTitle.innerHTML = slide.title;
        heroSubtext.innerHTML = slide.text;
        heroContent.classList.remove("fade-out");
        heroContent.classList.add("fade-in");
        return;
      }

      // Fade text out
      heroContent.classList.remove("fade-in");
      heroContent.classList.add("fade-out");

      // Swap background layer & text
      setTimeout(() => {
        bgLayers[nextBg].style.backgroundImage = `url(${slide.image})`;
        bgLayers[nextBg].classList.add("active");
        bgLayers[activeBg].classList.remove("active");
        activeBg = nextBg;

        heroTitle.innerHTML = slide.title;
        heroSubtext.innerHTML = slide.text;

        // Fade text in
        heroContent.classList.remove("fade-out");
        heroContent.classList.add("fade-in");
      }, FADE_MS);
    };

    const goTo = (idx) => {
      current = (idx + HERO_SLIDES.length) % HERO_SLIDES.length;
      applySlide(current);
    };

    const next = () => goTo(current + 1);
    const prev = () => goTo(current - 1);

    // Init first image immediately
    bgLayers[0].style.backgroundImage = `url(${HERO_SLIDES[0].image})`;
    bgLayers[0].classList.add("active");
    applySlide(0);
    start();

    // ✅ Pause on hover (desktop)
    hero.addEventListener("mouseenter", () => { isPaused = true; });
    hero.addEventListener("mouseleave", () => { isPaused = false; });

    // ✅ Tap to pause/resume (mobile)
    hero.addEventListener("click", () => {
      isPaused = !isPaused;
    });

    // ✅ Pause when tab hidden
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });

    // Optional: expose controls if you want later
    window.__heroSlider = { next, prev, goTo, stop, start };
  });
})();
