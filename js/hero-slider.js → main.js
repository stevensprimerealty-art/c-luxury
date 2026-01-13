/* =========================================
   C-LUXURY Main JS (GitHub Pages Safe)
   - Loader hide (with safety)
   - Cart count (safe fallback)
   - Menu toggle
   - Reveal on scroll
   - Hero slider (crossfade + stagger text + dots + swipe + per-image crop)
   - Own the look slider (dots + arrows + swipe)
   - Currency switcher (USD/NGN)
   - Search modal
   - Chat panel
========================================= */

window.addEventListener("load", () => {
  /* -----------------------------
     LOADER
  ------------------------------ */
  const loader = document.querySelector(".site-loader");
  // hide loader shortly after load
  setTimeout(() => {
    if (loader) loader.classList.add("hidden");
  }, 700);

  /* -----------------------------
     SAFE SHOPIFY CART COUNT
  ------------------------------ */
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
    try {
      // Works only if site is hosted on Shopify domain (won't on GitHub pages)
      const c1 = await tryFetchCartCount("/cart.js", { credentials: "same-origin" });
      applyCartCount(c1);
      return;
    } catch (e) {}

    try {
      // Cross-domain usually blocked; if blocked -> fallback to 0
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

  /* -----------------------------
     MENU TOGGLE
  ------------------------------ */
  const menuToggle = document.querySelector(".menu-toggle");
  const menuPanel = document.querySelector(".menu-panel");
  menuToggle?.addEventListener("click", () => {
    menuPanel?.classList.toggle("open");
  });

  /* -----------------------------
     REVEAL ON SCROLL
  ------------------------------ */
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
     HERO SLIDER
     - 2-layer crossfade backgrounds (.hero-bg)
     - stagger text via .hero-content is-in/is-out
     - dots + swipe indicators
     - per-image mobile crop control
  ========================================================== */
  const hero = document.getElementById("homeHero");
  const bgLayers = document.querySelectorAll(".hero-bg");
  const heroContent = document.getElementById("heroContent");
  const heroTitle = document.getElementById("heroTitle");
  const heroSubtext = document.getElementById("heroSubtext");
  const heroDotsWrap = document.getElementById("heroDots");

  // ✅ Make sure these file names match EXACTLY what is in your repo
  const HERO_SLIDES = [
    {
      image: "assets/images/hero/hero-01.jpg",
      title: "PRESENCE<br>WITHOUT NOISE",
      text: "QUIET CONFIDENCE.<br>DISCIPLINED FORM.",
      posDesktop: "center center",
      posMobile: "50% 35%"
    },
    {
      image: "assets/images/hero/hero-02.jpg",
      title: "DEFINED<br>BY RESTRAINT",
      text: "ELEVATED COMFORT.<br>INTENTIONAL DETAIL.",
      posDesktop: "center center",
      posMobile: "50% 28%"
    },
    {
      image: "assets/images/hero/hero-03.jpg",
      title: "TIMELESS<br>ENERGY",
      text: "BOLD IDENTITY.<br>CLEAR PURPOSE.",
      posDesktop: "center center",
      posMobile: "50% 30%"
    },
    {
      image: "assets/images/hero/hero-04.jpg",
      title: "FORM<br>WITH CONTROL",
      text: "MINIMAL LUXURY.<br>MAXIMUM PRESENCE.",
      posDesktop: "center center",
      posMobile: "50% 25%"
    },
    {
      image: "assets/images/hero/hero-05.jpg",
      title: "SILENCE<br>AS POWER",
      text: "DETAIL IS INTENT.<br>NOT DECORATION.",
      posDesktop: "center center",
      posMobile: "50% 30%"
    },
    {
      image: "assets/images/hero/hero-06.jpg",
      title: "C-LUXURY",
      text: "RESTRAINED DESIGN.<br>TIMELESS IDENTITY.",
      posDesktop: "center center",
      posMobile: "50% 32%"
    }
  ];

  // Preload (never throws)
  HERO_SLIDES.forEach((s) => {
    const img = new Image();
    img.src = s.image;
  });

  let heroCurrent = 0;
  let activeBg = 0;
  let heroTimer = null;

  const HOLD_MS = 6000;

  const isMobile = () => window.matchMedia("(max-width: 768px)").matches;

  function heroTextOut() {
    if (!heroContent) return;
    heroContent.classList.remove("is-in");
    heroContent.classList.add("is-out");
  }

  function heroTextIn() {
    if (!heroContent) return;
    heroContent.classList.remove("is-out");
    heroContent.classList.add("is-in");
  }

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

  function renderHeroDots() {
    if (!heroDotsWrap) return;
    heroDotsWrap.innerHTML = HERO_SLIDES.map((_, i) => {
      return `<button class="hero-dot ${i === heroCurrent ? "active" : ""}" type="button" aria-label="Hero slide ${i + 1}"></button>`;
    }).join("");

    const dots = heroDotsWrap.querySelectorAll(".hero-dot");
    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        heroCurrent = i;
        applyHeroSlide(heroCurrent, true);
        startHeroAuto();
      });
    });
  }

  function updateActiveDot() {
    if (!heroDotsWrap) return;
    const dots = heroDotsWrap.querySelectorAll(".hero-dot");
    dots.forEach((d, i) => d.classList.toggle("active", i === heroCurrent));
  }

  function setLayerBg(layer, slide) {
    if (!layer) return;
    layer.style.backgroundImage = `url(${slide.image})`;
    layer.style.backgroundPosition = isMobile() ? slide.posMobile : slide.posDesktop;
  }

  function applyHeroSlide(idx, userAction = false) {
    if (!bgLayers.length || !heroTitle || !heroSubtext) return;

    const slide = HERO_SLIDES[idx];
    const nextBg = activeBg === 0 ? 1 : 0;

    // fade text out first
    heroTextOut();

    setTimeout(() => {
      // crossfade bg
      setLayerBg(bgLayers[nextBg], slide);
      bgLayers[nextBg].classList.add("active");
      bgLayers[activeBg].classList.remove("active");
      activeBg = nextBg;

      // update text
      heroTitle.innerHTML = slide.title;
      heroSubtext.innerHTML = slide.text;

      // fade text back in
      requestAnimationFrame(heroTextIn);

      if (userAction) updateActiveDot();
    }, 180);
  }

  // Init hero safely
  if (bgLayers[0]) setLayerBg(bgLayers[0], HERO_SLIDES[0]);
  if (bgLayers[1]) setLayerBg(bgLayers[1], HERO_SLIDES[0]);

  renderHeroDots();
  heroTextIn();
  startHeroAuto();

  // Pause on hover desktop
  if (hero) {
    hero.addEventListener("mouseenter", stopHeroAuto);
    hero.addEventListener("mouseleave", startHeroAuto);
  }

  // Swipe support
  let hx = 0, hy = 0, hSwiping = false;

  function heroTouchStart(e) {
    const t = e.touches[0];
    hx = t.clientX;
    hy = t.clientY;
    hSwiping = true;
    stopHeroAuto();
  }
  function heroTouchMove(e) {
    if (!hSwiping) return;
    const t = e.touches[0];
    const dx = t.clientX - hx;
    const dy = t.clientY - hy;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 18) e.preventDefault();
  }
  function heroTouchEnd(e) {
    if (!hSwiping) return;
    hSwiping = false;

    const t = e.changedTouches[0];
    const dx = t.clientX - hx;
    const dy = t.clientY - hy;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) heroCurrent = (heroCurrent + 1) % HERO_SLIDES.length;
      else heroCurrent = (heroCurrent - 1 + HERO_SLIDES.length) % HERO_SLIDES.length;

      applyHeroSlide(heroCurrent, true);
      updateActiveDot();
    }

    startHeroAuto();
  }

  if (hero) {
    hero.addEventListener("touchstart", heroTouchStart, { passive: true });
    hero.addEventListener("touchmove", heroTouchMove, { passive: false });
    hero.addEventListener("touchend", heroTouchEnd, { passive: true });
  }

  // Keep crop correct on resize
  window.addEventListener("resize", () => {
    const slide = HERO_SLIDES[heroCurrent];
    bgLayers.forEach((layer) => {
      layer.style.backgroundPosition = isMobile() ? slide.posMobile : slide.posDesktop;
    });
  });

  /* -----------------------------
     PRODUCTS (search + own-look)
  ------------------------------ */
  const products = [
    {
      key: "punk-rock-tee",
      name: "Punk Rock Lip Graphic Tee — Skeleton Band Back Print",
      priceUSD: 22.26,
      img: "assets/images/punk-rock-tee.jpg",
      link: "https://mrcharliestxs.myshopify.com/products/punk-rock-lip-graphic-tee-2025-skeleton-band-back-print?variant=43781844467763",
      onPageId: "product-newin-1"
    },
    {
      key: "blue-neon-wolf-slides",
      name: "Slide Sandals — Blue Neon Wolf Graphic Removable-Strap Slides",
      priceUSD: 51.76,
      img: "assets/images/blue-neon-wolf-slides.jpg",
      link: "https://mrcharliestxs.myshopify.com/products/slide-sandals-blue-neon-wolf-graphic-removable-strap-slides?variant=43781873827891",
      onPageId: "product-newin-2"
    },
    {
      key: "wolf-teal-floral",
      name: "WOLF TEA FLORAL T-SHIRT",
      priceUSD: 38.99,
      img: "assets/images/products/wolf-teal-floral.jpg",
      link: "https://mrcharliestxs.myshopify.com/products/wolf-wave-graphic-t-shirt-teal-floral-wolf-design?variant=43781864914995",
      sliderIndex: 0
    },
    {
      key: "samurai-moon",
      name: "SAMURAI MOON T-SHIRT",
      priceUSD: 25.73,
      img: "assets/images/products/samurai-moon.jpg",
      link: "https://mrcharliestxs.myshopify.com/products/samurai-moon-graphic-t-shirt-shine-back-print?variant=43781765464115",
      sliderIndex: 1
    },
    {
      key: "samurai-kanji-hoodie",
      name: "SAMURAI KANJI HOODIE",
      priceUSD: 30.83,
      img: "assets/images/products/samurai-kanji-hoodie.jpg",
      link: "https://mrcharliestxs.myshopify.com/products/samurai-warrior-hoodie-vintage-japanese-kanji-design?variant=43772207988787",
      sliderIndex: 2
    },
    {
      key: "gingerbread-sweatshirt",
      name: "CHRISTMAS GINGERBREAD SWEATSHIRT",
      priceUSD: 62.59,
      img: "assets/images/products/gingerbread-sweatshirt.jpg",
      link: "https://mrcharliestxs.myshopify.com/products/christmas-gingerbread-crewneck-sweatshirt-its-the-sweetest-time-of-the-year?variant=43781849382963",
      sliderIndex: 3
    }
  ];

  /* -----------------------------
     CHAT
  ------------------------------ */
  const chatPanel = document.getElementById("chatPanel");
  const chatOpenBtn = document.getElementById("chatOpenBtn");
  const chatCloseBtn = document.getElementById("chatCloseBtn");

  function openChat() {
    if (!chatPanel) return;
    chatPanel.classList.add("open");
    chatPanel.setAttribute("aria-hidden", "false");
  }
  function closeChat() {
    if (!chatPanel) return;
    chatPanel.classList.remove("open");
    chatPanel.setAttribute("aria-hidden", "true");
  }

  chatOpenBtn?.addEventListener("click", openChat);
  chatCloseBtn?.addEventListener("click", closeChat);

  /* -----------------------------
     CURRENCY (USD / NGN)
  ------------------------------ */
  let NGN_RATE = 1500; // fallback
  let activeCurrency = "USD";
  const currencyBtns = document.querySelectorAll(".currency-btn");

  function formatMoneyUSD(v) { return `$${v.toFixed(2)}`; }
  function formatMoneyNGN(v) { return `₦${Math.round(v).toLocaleString("en-NG")}`; }

  function renderMoneyAll() {
    const moneyEls = document.querySelectorAll("[data-money][data-usd]");
    moneyEls.forEach((el) => {
      const usd = Number(el.dataset.usd || "0");
      el.textContent = (activeCurrency === "USD")
        ? formatMoneyUSD(usd)
        : formatMoneyNGN(usd * NGN_RATE);
    });
  }

  // Try live FX rate (never breaks page if it fails)
  fetch("https://open.er-api.com/v6/latest/USD")
    .then((r) => r.json())
    .then((data) => {
      if (data && data.result === "success" && data.rates && data.rates.NGN) {
        NGN_RATE = Number(data.rates.NGN) || NGN_RATE;
        renderMoneyAll();
      }
    })
    .catch(() => {});

  currencyBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      currencyBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeCurrency = btn.dataset.currency || "USD";
      renderMoneyAll();
    });
  });

  renderMoneyAll();

  /* -----------------------------
     SEARCH
  ------------------------------ */
  const searchBtn = document.getElementById("searchBtn");
  const searchOverlay = document.getElementById("searchOverlay");
  const searchModal = document.getElementById("searchModal");
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");
  const searchCloseBtn = document.getElementById("searchCloseBtn");

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderSearchResults(query) {
    if (!searchResults) return;

    const q = (query || "").trim().toLowerCase();
    const matches = !q
      ? products.slice(0, 6)
      : products.filter((p) => p.name.toLowerCase().includes(q) || (p.key && p.key.includes(q)));

    if (!matches.length) {
      searchResults.innerHTML = `<div style="padding:10px 2px; font-size:13px;">No results found.</div>`;
      return;
    }

    searchResults.innerHTML = matches.map((p) => {
      const priceText = (activeCurrency === "USD")
        ? `$${p.priceUSD.toFixed(2)}`
        : `₦${Math.round(p.priceUSD * NGN_RATE).toLocaleString("en-NG")}`;

      return `
        <div class="search-result" role="group" aria-label="${escapeHtml(p.name)}">
          <div class="search-thumb">
            <img src="${escapeHtml(p.img)}" alt="${escapeHtml(p.name)}" loading="lazy">
          </div>
          <div class="search-meta" style="flex:1;">
            <div class="search-name">${escapeHtml(p.name)}</div>
            <div class="search-price">${escapeHtml(priceText)}</div>
            <div style="display:flex; gap:10px; margin-top:8px; flex-wrap:wrap;">
              <a
                class="icon-btn"
                style="border:1px solid #111; padding:8px 10px; border-radius:12px; font-size:12px; letter-spacing:1px;"
                href="${escapeHtml(p.link)}"
                target="_blank"
                rel="noopener"
              >Open on Shopify</a>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  function openSearch() {
    if (!searchOverlay || !searchModal || !searchInput) return;
    searchOverlay.hidden = false;
    searchModal.hidden = false;
    searchOverlay.classList.add("open");
    searchModal.classList.add("open");
    searchOverlay.setAttribute("aria-hidden", "false");
    searchModal.setAttribute("aria-hidden", "false");
    searchInput.value = "";
    renderSearchResults("");
    setTimeout(() => searchInput.focus(), 30);
  }

  function closeSearch() {
    if (!searchOverlay || !searchModal) return;
    searchOverlay.classList.remove("open");
    searchModal.classList.remove("open");
    searchOverlay.setAttribute("aria-hidden", "true");
    searchModal.setAttribute("aria-hidden", "true");
    searchOverlay.hidden = true;
    searchModal.hidden = true;
  }

  searchBtn?.addEventListener("click", openSearch);
  searchOverlay?.addEventListener("click", closeSearch);
  searchCloseBtn?.addEventListener("click", closeSearch);

  searchInput?.addEventListener("input", (e) => renderSearchResults(e.target.value));
  searchInput?.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSearch(); });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeSearch();
      closeChat();
    }
  });

  /* -----------------------------
     OWN THE LOOK SLIDER
  ------------------------------ */
  const ownDots = document.querySelectorAll(".own-dot");
  const ownImg = document.getElementById("own-img");
  const ownName = document.getElementById("own-name");
  const ownPrice = document.getElementById("own-price");
  const ownLink = document.getElementById("own-link");
  const ownCard = document.querySelector(".own-look-card");
  const ownPrev = document.getElementById("own-prev");
  const ownNext = document.getElementById("own-next");
  const swipeArea = document.getElementById("own-swipe");

  const sliderProducts = products
    .filter((p) => typeof p.sliderIndex === "number")
    .sort((a, b) => a.sliderIndex - b.sliderIndex);

  sliderProducts.forEach((p) => { const img = new Image(); img.src = p.img; });

  let ownCurrent = 0;
  let ownTimer = null;

  function stopOwnAuto() {
    if (ownTimer) {
      clearInterval(ownTimer);
      ownTimer = null;
    }
  }

  function startOwnAuto() {
    stopOwnAuto();
    ownTimer = setInterval(() => showSlide(ownCurrent + 1), 5200);
  }

  function showSlide(i) {
    if (!ownImg || !ownName || !ownPrice || !ownLink || !ownCard) return;
    if (!sliderProducts.length) return;

    ownCurrent = (i + sliderProducts.length) % sliderProducts.length;

    ownDots.forEach((d) => d.classList.remove("active"));
    ownDots[ownCurrent]?.classList.add("active");

    ownCard.classList.add("own-fade");
    setTimeout(() => {
      const p = sliderProducts[ownCurrent];
      ownImg.src = p.img;
      ownImg.alt = p.name;
      ownName.textContent = p.name;
      ownLink.href = p.link;

      ownPrice.dataset.usd = String(p.priceUSD);
      renderMoneyAll();

      ownCard.classList.remove("own-fade");
    }, 250);
  }

  ownDots.forEach((dot, i) => dot.addEventListener("click", () => { showSlide(i); startOwnAuto(); }));
  ownPrev?.add
