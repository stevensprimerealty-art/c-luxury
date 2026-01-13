window.addEventListener("load", () => {
  /* HIDE LOADER */
  setTimeout(() => {
    document.querySelector(".site-loader")?.classList.add("hidden");
  }, 700);

  /* SAFE SHOPIFY CART COUNT */
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
      const c1 = await tryFetchCartCount("/cart.js", { credentials: "same-origin" });
      applyCartCount(c1);
      return;
    } catch (e) {}

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

  /* MENU TOGGLE */
  document.querySelector(".menu-toggle")?.addEventListener("click", () => {
    document.querySelector(".menu-panel")?.classList.toggle("open");
  });

  /* REVEAL ON SCROLL */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });

    revealEls.forEach(el => observer.observe(el));
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

  // ✅ Set your existing hero images here (match your repo filenames)
  // Per-image crop control:
  // - posDesktop: "center center", "center top", etc.
  // - posMobile:  "50% 30%" etc. (great for keeping faces/heads visible)
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
      image: "assets/images/hero/hero-3.jpg",
      title: "TIMELESS<br>ENERGY",
      text: "BOLD IDENTITY.<br>CLEAR PURPOSE.",
      posDesktop: "center center",
      posMobile: "50% 30%"
    },
    {
      image: "assets/images/hero/hero-4.jpg",
      title: "FORM<br>WITH CONTROL",
      text: "MINIMAL LUXURY.<br>MAXIMUM PRESENCE.",
      posDesktop: "center center",
      posMobile: "50% 25%"
    },
    {
      image: "assets/images/hero/hero-5.jpg",
      title: "SILENCE<br>AS POWER",
      text: "DETAIL IS INTENT.<br>NOT DECORATION.",
      posDesktop: "center center",
      posMobile: "50% 30%"
    },
    {
      image: "assets/images/hero/hero-6.jpg",
      title: "C-LUXURY",
      text: "RESTRAINED DESIGN.<br>TIMELESS IDENTITY.",
      posDesktop: "center center",
      posMobile: "50% 32%"
    }
  ];

  // Preload
  HERO_SLIDES.forEach(s => { const img = new Image(); img.src = s.image; });

  let heroCurrent = 0;
  let activeBg = 0;
  let heroTimer = null;

  const HOLD_MS = 6000; // 6 seconds
  const FADE_MS = 650;

  const isMobile = () => window.matchMedia("(max-width: 768px)").matches;

  function stopHeroAuto() {
    if (heroTimer) { clearInterval(heroTimer); heroTimer = null; }
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
    heroDotsWrap.innerHTML = HERO_SLIDES.map((_, i) => {
      return `<button class="hero-dot ${i === heroCurrent ? "active" : ""}" type="button" aria-label="Hero slide ${i+1}"></button>`;
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

  function applyHeroSlide(idx, userAction = false) {
    if (!bgLayers.length || !heroTitle || !heroSubtext) return;

    const slide = HERO_SLIDES[idx];
    const nextBg = activeBg === 0 ? 1 : 0;

    // Start text out (stagger handled by CSS class)
    setTextOut();

    // Swap background after a short delay so text begins fading first
    setTimeout(() => {
      bgLayers[nextBg].style.backgroundImage = `url(${slide.image})`;
      bgLayers[nextBg].style.backgroundPosition = isMobile() ? slide.posMobile : slide.posDesktop;

      bgLayers[nextBg].classList.add("active");
      bgLayers[activeBg].classList.remove("active");
      activeBg = nextBg;

      heroTitle.innerHTML = slide.title;
      heroSubtext.innerHTML = slide.text;

      // Text back in (staggered)
      requestAnimationFrame(() => setTextIn());

      // Dots
      if (userAction) updateActiveDot();
    }, 180);
  }

  function startHeroAuto() {
    stopHeroAuto();
    heroTimer = setInterval(() => {
      heroCurrent = (heroCurrent + 1) % HERO_SLIDES.length;
      applyHeroSlide(heroCurrent);
      updateActiveDot();
    }, HOLD_MS);
  }

  // Init hero
  if (bgLayers[0]) {
    bgLayers[0].style.backgroundImage = `url(${HERO_SLIDES[0].image})`;
    bgLayers[0].style.backgroundPosition = isMobile() ? HERO_SLIDES[0].posMobile : HERO_SLIDES[0].posDesktop;
  }
  if (bgLayers[1]) {
    bgLayers[1].style.backgroundImage = `url(${HERO_SLIDES[0].image})`;
    bgLayers[1].style.backgroundPosition = isMobile() ? HERO_SLIDES[0].posMobile : HERO_SLIDES[0].posDesktop;
  }
  renderHeroDots();
  setTextIn();
  startHeroAuto();

  // Pause on hover (desktop)
  if (hero) {
    hero.addEventListener("mouseenter", () => stopHeroAuto());
    hero.addEventListener("mouseleave", () => startHeroAuto());
  }

  // Swipe
  let startX = 0, startY = 0, swiping = false;

  function onTouchStart(e) {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    swiping = true;
    stopHeroAuto();
  }

  function onTouchMove(e) {
    if (!swiping) return;
    const t = e.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 18) e.preventDefault();
  }

  function onTouchEnd(e) {
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
  }

  if (hero) {
    hero.addEventListener("touchstart", onTouchStart, { passive: true });
    hero.addEventListener("touchmove", onTouchMove, { passive: false });
    hero.addEventListener("touchend", onTouchEnd, { passive: true });
  }

  // Keep crop correct on resize
  window.addEventListener("resize", () => {
    const slide = HERO_SLIDES[heroCurrent];
    bgLayers.forEach(layer => {
      layer.style.backgroundPosition = isMobile() ? slide.posMobile : slide.posDesktop;
    });
  });

  /* PRODUCTS */
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

  /* CHAT */
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

  /* CURRENCY */
  let NGN_RATE = 1500; // fallback
  let activeCurrency = "USD";
  const currencyBtns = document.querySelectorAll(".currency-btn");

  function formatMoneyUSD(v) { return `$${v.toFixed(2)}`; }
  function formatMoneyNGN(v) { return `₦${Math.round(v).toLocaleString("en-NG")}`; }

  function renderMoneyAll() {
    const moneyEls = document.querySelectorAll("[data-money][data-usd]");
    moneyEls.forEach(el => {
      const usd = Number(el.dataset.usd || "0");
      el.textContent = (activeCurrency === "USD")
        ? formatMoneyUSD(usd)
        : formatMoneyNGN(usd * NGN_RATE);
    });
  }

  fetch("https://open.er-api.com/v6/latest/USD")
    .then(r => r.json())
    .then(data => {
      if (data && data.result === "success" && data.rates && data.rates.NGN) {
        NGN_RATE = Number(data.rates.NGN) || NGN_RATE;
        renderMoneyAll();
      }
    })
    .catch(() => {});

  currencyBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      currencyBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeCurrency = btn.dataset.currency || "USD";
      renderMoneyAll();
    });
  });

  renderMoneyAll();

  /* SEARCH */
  const searchBtn = document.getElementById("searchBtn");
  const searchOverlay = document.getElementById("searchOverlay");
  const searchModal = document.getElementById("searchModal");
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");
  const searchCloseBtn = document.getElementById("searchCloseBtn");

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
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

  function renderSearchResults(query) {
    if (!searchResults) return;

    const q = (query || "").trim().toLowerCase();
    const matches = !q
      ? products.slice(0, 6)
      : products.filter(p => p.name.toLowerCase().includes(q) || (p.key && p.key.includes(q)));

    if (!matches.length) {
      searchResults.innerHTML = `<div style="padding:10px 2px; font-size:13px;">No results found.</div>`;
      return;
    }

    searchResults.innerHTML = matches.map(p => {
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

  /* OWN THE LOOK SLIDER */
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
    .filter(p => typeof p.sliderIndex === "number")
    .sort((a,b)=>a.sliderIndex-b.sliderIndex);

  sliderProducts.forEach(p => { const img = new Image(); img.src = p.img; });

  let ownCurrent = 0;
  let ownTimer = null;

  function stopOwnAuto() {
    if (ownTimer) { clearInterval(ownTimer); ownTimer = null; }
  }

  function startOwnAuto() {
    stopOwnAuto();
    ownTimer = setInterval(() => showSlide(ownCurrent + 1), 5200);
  }

  function showSlide(i) {
    if (!ownImg || !ownName || !ownPrice || !ownLink || !ownCard) return;

    ownCurrent = (i + sliderProducts.length) % sliderProducts.length;

    ownDots.forEach(d => d.classList.remove("active"));
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
  ownPrev?.addEventListener("click", () => { showSlide(ownCurrent - 1); startOwnAuto(); });
  ownNext?.addEventListener("click", () => { showSlide(ownCurrent + 1); startOwnAuto(); });

  // swipe
  let startX = 0, startY = 0, isSwiping = false;

  function onTouchStart2(e) {
    const t = e.touches[0];
    startX = t.clientX; startY = t.clientY; isSwiping = true;
  }
  function onTouchMove2(e) {
    if (!isSwiping) return;
    const t = e.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 18) e.preventDefault();
  }
  function onTouchEnd2(e) {
    if (!isSwiping) return;
    isSwiping = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) showSlide(ownCurrent + 1);
      else showSlide(ownCurrent - 1);
      startOwnAuto();
    }
  }

  if (swipeArea) {
    swipeArea.addEventListener("touchstart", onTouchStart2, { passive: true });
    swipeArea.addEventListener("touchmove", onTouchMove2, { passive: false });
    swipeArea.addEventListener("touchend", onTouchEnd2, { passive: true });
  }

  showSlide(0);
  startOwnAuto();

  /* PAUSE WHEN TAB HIDDEN */
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopOwnAuto();
      stopHeroAuto();
    } else {
      startOwnAuto();
      startHeroAuto();
    }
  });

  // expose hero stop/start to visibility handler
  function stopHeroAuto() { /* overwritten below by closure if hero exists */ }
  function startHeroAuto() { /* overwritten below by closure if hero exists */ }
});
