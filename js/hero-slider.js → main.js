/* =============================
   C-LUXURY — main.js (FULL FIX)
   - Loader hide (with safety)
   - Menu toggle
   - Reveal on scroll
   - Hero slider: crossfade + stagger text + per-image mobile crop + dots + swipe
   - Own the look slider + dots + swipe
   - Currency switch (USD/NGN)
   - Search modal
   - Chat panel
   - Cart count (safe)
============================= */

window.addEventListener("load", () => {
  /* =============================
     LOADER (hide)
  ============================= */
  setTimeout(() => {
    const loader = document.querySelector(".site-loader");
    if (loader) loader.classList.add("hidden");
  }, 700);

  /* =============================
     SAFE SHOPIFY CART COUNT
  ============================= */
  const SHOPIFY_DOMAIN = "https://mrcharliestxs.myshopify.com";

  function applyCartCount(count) {
    const el = document.getElementById("cartCount");
    if (!el) return;
    const n = Math.max(0, Number(count || 0));
    el.textContent = String(n);
    if (n > 0) el.classList.remove("is-empty");
    else el.classList.add("is-empty");
  }

  async function tryFetchCartCount(url, opts) {
    const r = await fetch(url, opts);
    if (!r.ok) throw new Error("Failed cart fetch");
    const cart = await r.json();
    return Number(cart.item_count || 0);
  }

  async function updateCartCount() {
    // Attempt same-origin first
    try {
      const c1 = await tryFetchCartCount("/cart.js", { credentials: "same-origin" });
      applyCartCount(c1);
      return;
    } catch (e) {}

    // Fallback (may be blocked by CORS on github pages)
    try {
      const c2 = await tryFetchCartCount(SHOPIFY_DOMAIN + "/cart.js", { credentials: "omit" });
      applyCartCount(c2);
      return;
    } catch (e) {
      applyCartCount(0);
    }
  }

  updateCartCount();
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) updateCartCount();
  });

  /* =============================
     MENU TOGGLE
  ============================= */
  const menuBtn = document.querySelector(".menu-toggle");
  const menuPanel = document.querySelector(".menu-panel");

  menuBtn?.addEventListener("click", () => {
    menuPanel?.classList.toggle("open");
  });

  // close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!menuPanel || !menuBtn) return;
    const target = e.target;
    if (!(target instanceof Element)) return;
    const clickedInsideMenu = menuPanel.contains(target);
    const clickedMenuBtn = menuBtn.contains(target);
    if (!clickedInsideMenu && !clickedMenuBtn) menuPanel.classList.remove("open");
  });

  /* =============================
     REVEAL ON SCROLL
  ============================= */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    revealEls.forEach((el) => observer.observe(el));
  }

  /* =========================================================
     HERO SLIDER (stagger text + per-image crop + dots + swipe)
     ========================================================= */
  const hero = document.getElementById("homeHero");
  const bgLayers = document.querySelectorAll(".hero-bg");
  const heroContent = document.getElementById("heroContent");
  const heroTitle = document.getElementById("heroTitle");
  const heroSubtext = document.getElementById("heroSubtext");
  const heroDotsWrap = document.getElementById("heroDots");

  // ✅ Update these image paths to match your repo EXACTLY
  const HERO_SLIDES = [
    {
      image: "assets/images/hero/hero-01.jpg",
      title: "PRESENCE<br>WITHOUT NOISE",
      text: "QUIET CONFIDENCE.<br>DISCIPLINED FORM.",
      posDesktop: "center center",
      posMobile: "50% 35%",
    },
    {
      image: "assets/images/hero/hero-02.jpg",
      title: "DEFINED<br>BY RESTRAINT",
      text: "ELEVATED COMFORT.<br>INTENTIONAL DETAIL.",
      posDesktop: "center center",
      posMobile: "50% 28%",
    },
    {
      image: "assets/images/hero/hero-03.jpg",
      title: "TIMELESS<br>ENERGY",
      text: "BOLD IDENTITY.<br>CLEAR PURPOSE.",
      posDesktop: "center center",
      posMobile: "50% 30%",
    },
    {
      image: "assets/images/hero/hero-04.jpg",
      title: "FORM<br>WITH CONTROL",
      text: "MINIMAL LUXURY.<br>MAXIMUM PRESENCE.",
      posDesktop: "center center",
      posMobile: "50% 25%",
    },
    {
      image: "assets/images/hero/hero-05.jpg",
      title: "SILENCE<br>AS POWER",
      text: "DETAIL IS INTENT.<br>NOT DECORATION.",
      posDesktop: "center center",
      posMobile: "50% 30%",
    },
    {
      image: "assets/images/hero/hero-06.jpg",
      title: "C-LUXURY",
      text: "RESTRAINED DESIGN.<br>TIMELESS IDENTITY.",
      posDesktop: "center center",
      posMobile: "50% 32%",
    },
  ];

  // Preload hero images
  HERO_SLIDES.forEach((s) => {
    const img = new Image();
    img.src = s.image;
  });

  const isMobile = () => window.matchMedia("(max-width: 768px)").matches;

  let heroCurrent = 0;
  let activeBg = 0;
  let heroTimer = null;

  const HOLD_MS = 6000; // time between slide changes

  function stopHeroAuto() {
    if (heroTimer) {
      clearInterval(heroTimer);
      heroTimer = null;
    }
  }

  function startHeroAuto() {
    stopHeroAuto();
    heroTimer = setInterval(() => {
      heroCurrent = (heroCurrent + 1) % HERO_SLIDES.length;
      applyHeroSlide(heroCurrent);
      updateActiveDot();
    }, HOLD_MS);
  }

  function setTextOut() {
    if (!heroContent) return;
    heroContent.classList.remove("is-in");
    heroContent.classList.add("is-out");
  }

  function setTextIn() {
    if (!heroContent) return;
    heroContent.classList.remove("is-out");
    heroContent.classList.add("is-in");
  }

  function renderHeroDots() {
    if (!heroDotsWrap) return;
    heroDotsWrap.innerHTML = HERO_SLIDES.map(
      (_, i) =>
        `<button class="hero-dot ${i === heroCurrent ? "active" : ""}" type="button" aria-label="Hero slide ${
          i + 1
        }"></button>`
    ).join("");

    const dots = heroDotsWrap.querySelectorAll(".hero-dot");
    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        heroCurrent = i;
        applyHeroSlide(heroCurrent, true);
        updateActiveDot();
        startHeroAuto();
      });
    });
  }

  function updateActiveDot() {
    if (!heroDotsWrap) return;
    const dots = heroDotsWrap.querySelectorAll(".hero-dot");
    dots.forEach((d, i) => d.classList.toggle("active", i === heroCurrent));
  }

  function applyHeroSlide(idx, userAction = false) {
    if (!bgLayers.length || !heroTitle || !heroSubtext) return;

    const slide = HERO_SLIDES[idx];
    const nextBg = activeBg === 0 ? 1 : 0;

    // text out first
    setTextOut();

    // swap bg + text after a short delay
    setTimeout(() => {
      bgLayers[nextBg].style.backgroundImage = `url(${slide.image})`;
      bgLayers[nextBg].style.backgroundPosition = isMobile() ? slide.posMobile : slide.posDesktop;

      bgLayers[nextBg].classList.add("active");
      bgLayers[activeBg].classList.remove("active");
      activeBg = nextBg;

      heroTitle.innerHTML = slide.title;
      heroSubtext.innerHTML = slide.text;

      requestAnimationFrame(() => setTextIn());
      if (userAction) updateActiveDot();
    }, 180);
  }

  function initHero() {
    if (!hero || !bgLayers.length) return;

    // init both layers to first slide so no flash
    const s0 = HERO_SLIDES[0];

    bgLayers.forEach((layer) => {
      layer.style.backgroundImage = `url(${s0.image})`;
      layer.style.backgroundPosition = isMobile() ? s0.posMobile : s0.posDesktop;
    });

    bgLayers[0].classList.add("active");

    renderHeroDots();
    setTextIn();
    startHeroAuto();

    // Pause on hover (desktop)
    hero.addEventListener("mouseenter", stopHeroAuto);
    hero.addEventListener("mouseleave", startHeroAuto);

    // Swipe (mobile)
    let startX = 0,
      startY = 0,
      swiping = false;

    hero.addEventListener(
      "touchstart",
      (e) => {
        const t = e.touches[0];
        startX = t.clientX;
        startY = t.clientY;
        swiping = true;
        stopHeroAuto();
      },
      { passive: true }
    );

    hero.addEventListener(
      "touchmove",
      (e) => {
        if (!swiping) return;
        const t = e.touches[0];
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 18) e.preventDefault();
      },
      { passive: false }
    );

    hero.addEventListener(
      "touchend",
      (e) => {
        if (!swiping) return;
        swiping = false;

        const t = e.changedTouches[0];
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;

        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
          if (dx < 0) heroCurrent = (heroCurrent + 1) % HERO_SLIDES.length;
          else heroCurrent = (heroCurrent - 1 + HERO_SLIDES.length) % HERO_SLIDES.length;

          applyHeroSlide(heroCurrent, true);
          updateActiveDot();
        }

        startHeroAuto();
      },
      { passive: true }
    );

    // Keep crop correct on resize
    window.addEventListener("resize", () => {
      const slide = HERO_SLIDES[heroCurrent];
      bgLayers.forEach((layer) => {
        layer.style.backgroundPosition = isMobile() ? slide.posMobile : slide.posDesktop;
      });
    });
  }

  initHero();

  /* =============================
     PRODUCTS
