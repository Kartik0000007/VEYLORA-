/* ==========================================================================
   VEYLORA — interaction & motion controller
   Shared by every page. No dependencies.
   ========================================================================== */
(() => {
  'use strict';

  const doc = document;
  const body = doc.body;
  const root = doc.documentElement;
  const $ = (selector, context = doc) => context.querySelector(selector);
  const $$ = (selector, context = doc) => Array.from(context.querySelectorAll(selector));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const pageName = body.dataset.page || location.pathname.split('/').pop().replace('.html', '') || 'home';

  const storage = {
    get(key, fallback = null) {
      try {
        const value = window.localStorage.getItem(key);
        return value === null ? fallback : value;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        /* storage unavailable */
      }
    },
    sessionGet(key, fallback = null) {
      try {
        const value = window.sessionStorage.getItem(key);
        return value === null ? fallback : value;
      } catch {
        return fallback;
      }
    },
    sessionSet(key, value) {
      try {
        window.sessionStorage.setItem(key, value);
      } catch {
        /* storage unavailable */
      }
    },
    sessionRemove(key) {
      try {
        window.sessionStorage.removeItem(key);
      } catch {
        /* storage unavailable */
      }
    }
  };

  /* ------------------------------------------------------------------------
     Toasts
     ------------------------------------------------------------------------ */
  function showToast(title, message, icon = 'auto_awesome') {
    const stack = $('#toast-stack');
    if (!stack) return;

    while (stack.children.length >= 3) stack.firstElementChild.remove();

    const toast = doc.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');

    const glyph = doc.createElement('span');
    glyph.className = 'material-symbols-outlined';
    glyph.setAttribute('aria-hidden', 'true');
    glyph.textContent = icon;

    const copy = doc.createElement('div');
    copy.className = 'min-w-0';

    const heading = doc.createElement('div');
    heading.className = 'toast-title';
    heading.textContent = title;

    const text = doc.createElement('div');
    text.className = 'toast-message';
    text.textContent = message;

    copy.append(heading, text);
    toast.append(glyph, copy);
    stack.append(toast);

    let timer = window.setTimeout(dismiss, 4600);

    function dismiss() {
      if (!toast.isConnected) return;
      window.clearTimeout(timer);
      toast.classList.add('is-leaving');
      window.setTimeout(() => toast.remove(), 380);
    }

    toast.addEventListener('click', dismiss);
  }

  /* ------------------------------------------------------------------------
     Page ready / preloader
     ------------------------------------------------------------------------ */
  const preloader = $('#preloader');
  const skipPreloader = storage.sessionGet('veylora:skip-preloader') === '1';
  storage.sessionRemove('veylora:skip-preloader');

  const firstVisit = storage.sessionGet('veylora:seen') !== '1';
  let motionStarted = false;
  let preloaderDismissed = false;

  function startMotion() {
    if (motionStarted) return;
    motionStarted = true;
    splitHeadline($('main h1'));
    initReveal();
  }

  function hidePreloader(instant = false) {
    if (preloaderDismissed) return;
    preloaderDismissed = true;

    if (preloader) {
      preloader.classList.add('is-done');
      window.setTimeout(() => preloader.setAttribute('aria-hidden', 'true'), 850);
    }

    storage.sessionSet('veylora:seen', '1');
    window.setTimeout(startMotion, instant || reduceMotion ? 40 : 140);
  }

  function schedulePreloader() {
    if (!preloader || skipPreloader) {
      hidePreloader(true);
      return;
    }

    const delay = reduceMotion ? 30 : firstVisit ? 760 : 430;
    window.setTimeout(() => hidePreloader(), delay);
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', schedulePreloader, { once: true });
  } else {
    schedulePreloader();
  }

  // Absolutely never leave a visitor behind the curtain.
  window.setTimeout(() => hidePreloader(true), 2800);

  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    preloader?.classList.add('is-done');
    preloaderDismissed = true;
    $('#page-transition')?.classList.remove('is-active');
    startMotion();
  });

  /* ------------------------------------------------------------------------
     Header, reading progress, back-to-top
     ------------------------------------------------------------------------ */
  const header = $('#site-header');
  const progressBar = $('#scroll-progress span');
  const toTop = $('#to-top');
  let lastScrollY = window.scrollY;
  let scrollQueued = false;
  let menuOpen = false;
  let searchOpen = false;

  function onScroll() {
    scrollQueued = false;
    const y = Math.max(0, window.scrollY);
    const docHeight = root.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? Math.min(100, (y / docHeight) * 100) : 0;

    if (progressBar) progressBar.style.width = `${percent}%`;

    if (toTop) {
      toTop.classList.toggle('show', y > 520);
      toTop.style.setProperty('--progress', percent.toFixed(2));
    }

    if (header) {
      header.classList.toggle('is-scrolled', y > 24);
      // The masthead stays anchored: sticky editorial rails and sticky
      // filters are calibrated against a permanently visible header.
      header.classList.remove('is-hidden');
    }

    lastScrollY = y;
  }

  function requestScrollFrame() {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(onScroll);
  }

  window.addEventListener('scroll', requestScrollFrame, { passive: true });
  window.addEventListener('resize', requestScrollFrame, { passive: true });
  onScroll();

  header?.addEventListener('focusin', () => header.classList.remove('is-hidden'));

  toTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  // The footer already owns the bottom of the page; yield the corner to it.
  const pageFooter = $('footer');
  if (pageFooter && toTop && 'IntersectionObserver' in window) {
    const footerWatcher = new IntersectionObserver(
      (entries) => {
        toTop.classList.toggle('at-footer', entries[0].isIntersecting);
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );
    footerWatcher.observe(pageFooter);
  }

  /* ------------------------------------------------------------------------
     Scroll lock helper
     ------------------------------------------------------------------------ */
  let scrollLocks = 0;

  function lockScroll(lock) {
    if (lock) {
      scrollLocks += 1;
      if (scrollLocks === 1) body.style.overflow = 'hidden';
    } else {
      scrollLocks = Math.max(0, scrollLocks - 1);
      if (scrollLocks === 0) body.style.overflow = '';
    }
  }

  /* ------------------------------------------------------------------------
     Mobile drawer
     ------------------------------------------------------------------------ */
  const mobileMenu = $('#mobile-menu');
  const menuToggle = $('#menu-toggle');
  const menuIcon = menuToggle ? $('[data-menu-icon]', menuToggle) : null;
  let menuReturnFocus = null;

  function setMenu(open) {
    if (!mobileMenu || !menuToggle) return;
    if (menuOpen === open) return;
    if (open && searchOpen) setSearch(false, true);

    menuOpen = open;
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    if (menuIcon) menuIcon.textContent = open ? 'close' : 'menu';
    body.classList.toggle('menu-open', open);
    lockScroll(open);
    if (header) header.classList.remove('is-hidden');

    if (open) {
      menuReturnFocus = doc.activeElement;
      window.setTimeout(() => {
        $('.mobile-menu-panel', mobileMenu)?.focus({ preventScroll: true });
      }, reduceMotion ? 20 : 320);
    } else if (menuReturnFocus instanceof HTMLElement) {
      menuReturnFocus.focus({ preventScroll: true });
      menuReturnFocus = null;
    }
  }

  menuToggle?.addEventListener('click', () => setMenu(!menuOpen));
  $$('[data-menu-close]').forEach((el) => el.addEventListener('click', () => setMenu(false)));
  $$('#mobile-menu a[href]').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  window.matchMedia('(min-width: 1024px)').addEventListener?.('change', (event) => {
    if (event.matches && menuOpen) setMenu(false);
  });

  /* ------------------------------------------------------------------------
     Search overlay
     ------------------------------------------------------------------------ */
  const searchOverlay = $('#search-overlay');
  const searchInput = $('#global-search-input');
  let searchReturnFocus = null;

  function setSearch(open, silent = false) {
    if (!searchOverlay) return;
    if (searchOpen === open) return;
    if (open && menuOpen) setMenu(false);

    searchOpen = open;
    searchOverlay.classList.toggle('is-open', open);
    searchOverlay.setAttribute('aria-hidden', String(!open));
    body.classList.toggle('search-open', open);
    lockScroll(open);
    if (header) header.classList.remove('is-hidden');

    if (open) {
      searchReturnFocus = doc.activeElement;
      window.setTimeout(() => searchInput?.focus({ preventScroll: true }), reduceMotion ? 20 : 280);
    } else if (!silent && searchReturnFocus instanceof HTMLElement) {
      searchReturnFocus.focus({ preventScroll: true });
      searchReturnFocus = null;
    }
  }

  $$('[data-search-open]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      setSearch(true);
    });
  });

  $$('[data-search-close]').forEach((el) => el.addEventListener('click', () => setSearch(false)));

  $('[data-search-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = (searchInput?.value || '').trim();
    if (!query) {
      showToast('A blank page', 'Begin with a fibre, a mood, or a silhouette.', 'search');
      searchInput?.focus();
      return;
    }
    navigateTo(`search.html?q=${encodeURIComponent(query)}`);
  });

  $$('#search-overlay a[href]').forEach((link) => {
    link.addEventListener('click', () => setSearch(false, true));
  });

  /* Keyboard shortcuts: "/" or Cmd/Ctrl+K opens search, Escape closes. */
  doc.addEventListener('keydown', (event) => {
    const target = event.target;
    const typing =
      target instanceof HTMLElement &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable);

    if (event.key === 'Escape') {
      if (searchOpen) {
        setSearch(false);
        return;
      }
      if (menuOpen) setMenu(false);
      return;
    }

    if ((event.key === '/' && !typing) || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')) {
      event.preventDefault();
      setSearch(true);
    }
  });

  /* Simple focus trap for the two overlays. */
  doc.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const container = searchOpen ? searchOverlay : menuOpen ? mobileMenu : null;
    if (!container) return;

    const focusables = $$(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      container
    ).filter((el) => el.offsetParent !== null);

    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && doc.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && doc.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* ------------------------------------------------------------------------
     Navigation: active state, hash scrolls, curtain transitions
     ------------------------------------------------------------------------ */
  const navLinks = $$('.nav-link[data-path], .drawer-link[data-path]');
  navLinks.forEach((link) => {
    if (link.dataset.path !== pageName) return;
    link.classList.add('is-active');
    link.setAttribute('aria-current', 'page');
  });

  $$('.bottom-nav-item[data-bottom-path]').forEach((link) => {
    if (link.dataset.bottomPath !== pageName) return;
    link.classList.add('is-active');
    link.setAttribute('aria-current', 'page');
  });

  const curtain = $('#page-transition');

  function navigateTo(url) {
    if (reduceMotion || !curtain) {
      location.href = url;
      return;
    }
    storage.sessionSet('veylora:skip-preloader', '1');
    curtain.classList.add('is-active');
    curtain.setAttribute('aria-hidden', 'false');
    window.setTimeout(() => {
      location.href = url;
    }, 380);
  }

  function scrollToTarget(target) {
    if (!(target instanceof HTMLElement)) return;
    const offset = (header?.offsetHeight || 88) + 18;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  doc.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    if (link.hasAttribute('data-soon') || link.hasAttribute('data-no-transition')) return;
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target && link.target !== '_self') return;
    if (link.hasAttribute('download')) return;

    const rawHref = link.getAttribute('href');
    if (!rawHref || rawHref === '#' || rawHref.startsWith('javascript:') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
      return;
    }

    if (rawHref.startsWith('#')) {
      const target = doc.getElementById(rawHref.slice(1));
      if (target) {
        event.preventDefault();
        scrollToTarget(target);
      }
      return;
    }

    let url;
    try {
      url = new URL(link.href, location.href);
    } catch {
      return;
    }

    if (url.origin !== location.origin) return;

    if (url.pathname === location.pathname && url.hash) {
      const target = doc.getElementById(url.hash.slice(1));
      if (target) {
        event.preventDefault();
        scrollToTarget(target);
      }
      return;
    }

    if (!/\.html?$/i.test(url.pathname)) return;

    // Don't animate a reload of the page we're already on.
    if (url.pathname === location.pathname && !url.search && !url.hash) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      return;
    }

    event.preventDefault();
    setMenu(false);
    setSearch(false, true);
    navigateTo(url.href);
  });

  /* Placeholder pages announced with data-soon. */
  doc.addEventListener('click', (event) => {
    const item = event.target.closest('[data-soon]');
    if (!item) return;
    event.preventDefault();
    event.stopPropagation();
    const label = item.getAttribute('data-soon') || item.textContent.trim() || 'This page';
    showToast('Atelier in progress', `${label} is being prepared for the next edition.`, 'auto_awesome');
  });

  /* Restore history / bfcache gracefully. */
  window.addEventListener('pageshow', () => {
    curtain?.classList.remove('is-active');
    curtain?.setAttribute('aria-hidden', 'true');
  });

  /* ------------------------------------------------------------------------
     Account + wishlist
     ------------------------------------------------------------------------ */
  const WISHLIST_KEY = 'veylora:wishlist-items';
  let savedItems = {};

  try {
    savedItems = JSON.parse(storage.get(WISHLIST_KEY, '{}')) || {};
  } catch {
    savedItems = {};
  }

  const wishlistCounts = $$('[data-wishlist-count]');
  const BASE_WISHLIST = 4;

  function persistWishlist() {
    storage.set(WISHLIST_KEY, JSON.stringify(savedItems));
  }

  function updateWishlistCount() {
    if (!wishlistCounts.length) return;
    const total = String(BASE_WISHLIST + Object.keys(savedItems).length);
    wishlistCounts.forEach((counter) => {
      counter.textContent = total;
    });
  }

  function productTitle(button, index) {
    const article = button.closest('article');
    const heading = article?.querySelector('h2, h3, h4');
    if (heading?.textContent) return heading.textContent.replace(/\s+/g, ' ').trim();
    const label = button.getAttribute('aria-label');
    if (label && !/wishlist/i.test(label)) return label;
    return `Archive piece ${index + 1}`;
  }

  function paintSaved(button, saved) {
    button.classList.toggle('is-saved', saved);
    button.setAttribute('aria-pressed', String(saved));
    const icon = button.querySelector('.material-symbols-outlined');
    if (icon) {
      icon.style.fontVariationSettings = saved
        ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
        : '';
    }
  }

  updateWishlistCount();

  $$('button[aria-label*="wishlist" i], button[aria-label*="wish list" i]')
    .filter((button) => !button.hasAttribute('data-wishlist') && !button.closest('#site-header'))
    .forEach((button, index) => {
      const title = productTitle(button, index);
      const key = `${pageName}::${title}`;
      paintSaved(button, Boolean(savedItems[key]));
      button.dataset.wishlistKey = key;

      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const next = !savedItems[key];
        if (next) savedItems[key] = true;
        else delete savedItems[key];
        persistWishlist();
        paintSaved(button, next);
        updateWishlistCount();
        showToast(
          next ? 'Saved to the archive' : 'Removed from the archive',
          title,
          next ? 'favorite' : 'heart_minus'
        );
      });
    });

  $$('[data-wishlist]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const total = BASE_WISHLIST + Object.keys(savedItems).length;
      showToast('Wishlist archive', `${total} pieces curated. The full wishlist opens with the next edition.`, 'favorite');
    });
  });

  $$('[data-account]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      showToast('Curator access', 'Private accounts are being prepared for the next edition.', 'person');
    });
  });

  /* ------------------------------------------------------------------------
     Scroll reveal
     ------------------------------------------------------------------------ */
  function initReveal() {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      $$('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
      return;
    }

    // Cards in grids that weren't tagged during the build.
    $$('main [class~="group"]').forEach((el) => {
      const parent = el.parentElement;
      if (!parent || !/(^|\s)grid($|\s)/.test(parent.className || '')) return;
      if (el.closest('[data-reveal]') || el.tagName === 'ARTICLE') return;
      el.setAttribute('data-reveal', 'fade');
    });

    const revealables = $$('[data-reveal]');

    revealables.forEach((el) => {
      const parent = el.parentElement;
      if (!parent) return;
      const siblings = Array.from(parent.children).filter((child) => child.hasAttribute('data-reveal'));
      const position = siblings.indexOf(el);
      if (position > 0) {
        el.style.setProperty('--reveal-delay', `${Math.min(position * 0.085, 0.5).toFixed(2)}s`);
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -2% 0px', threshold: 0.03 }
    );

    revealables.forEach((el) => observer.observe(el));
  }

  function splitHeadline(headline) {
    if (!headline || reduceMotion || headline.dataset.split === 'on') return;

    const walker = doc.createTreeWalker(headline, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.nodeValue && node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });

    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    if (!textNodes.length) return;

    let wordIndex = 0;

    textNodes.forEach((node) => {
      const parts = node.nodeValue.split(/(\s+)/);
      const fragment = doc.createDocumentFragment();

      parts.forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          fragment.appendChild(doc.createTextNode(part));
          return;
        }

        const outer = doc.createElement('span');
        outer.className = 'split-word';

        const inner = doc.createElement('span');
        inner.className = 'split-word-inner';
        inner.textContent = part;
        inner.style.setProperty('--word-delay', `${(0.1 + Math.min(wordIndex * 0.05, 0.9)).toFixed(2)}s`);

        outer.appendChild(inner);
        fragment.appendChild(outer);
        wordIndex += 1;
      });

      node.parentNode.replaceChild(fragment, node);
    });

    headline.dataset.split = 'on';
  }

  /* ------------------------------------------------------------------------
     Imagery, sheen, magnetic CTAs
     ------------------------------------------------------------------------ */
  function attachShimmer(image) {
    if (reduceMotion) return null;

    const parent = image.parentElement;
    if (!parent || window.getComputedStyle(parent).position === 'static') return null;

    const shimmer = doc.createElement('span');
    shimmer.className = 'img-shimmer';
    shimmer.setAttribute('aria-hidden', 'true');
    parent.appendChild(shimmer);
    return shimmer;
  }

  function initImages() {
    $$('main img').forEach((image) => {
      if (image.dataset.noFade === 'true') return;
      image.classList.add('img-fade');

      const loaded = image.complete && image.naturalWidth > 0;
      let shimmer = loaded ? null : attachShimmer(image);

      const done = () => {
        image.classList.add('is-loaded');
        if (!shimmer) return;
        shimmer.classList.add('is-done');
        window.setTimeout(() => shimmer.remove(), 500);
        shimmer = null;
      };

      if (loaded) {
        done();
      } else {
        image.addEventListener('load', done, { once: true });
        image.addEventListener('error', done, { once: true });
      }
    });
  }

  /* ------------------------------------------------------------------------
     Editorial counters & card labelling
     ------------------------------------------------------------------------ */
  function initCounters() {
    const counters = $$('.vey-count[data-count-to]');
    if (!counters.length) return;

    const formatter = new Intl.NumberFormat('en-IN');
    const paint = (el, value) => {
      el.textContent = `${formatter.format(value)}${el.dataset.suffix || ''}`;
    };

    const animate = (el) => {
      const target = Number.parseInt(el.dataset.countTo, 10);
      if (!Number.isFinite(target)) return;

      if (reduceMotion) {
        paint(el, target);
        return;
      }

      const duration = 1500;
      const started = performance.now();
      const step = (now) => {
        const progress = Math.min(1, (now - started) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        paint(el, Math.round(target * eased));
        if (progress < 1) window.requestAnimationFrame(step);
        else paint(el, target);
      };
      window.requestAnimationFrame(step);
    };

    if (!('IntersectionObserver' in window)) {
      counters.forEach(animate);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animate(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.45 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  function initCardLabels() {
    $$('main .group').forEach((card) => {
      const title = card.querySelector('h3')?.textContent?.replace(/\s+/g, ' ').trim();
      if (!title) return;

      if (card.tagName === 'DIV' && !card.hasAttribute('role')) {
        card.setAttribute('role', 'group');
        card.setAttribute('aria-label', title);
      }

      $$('button', card).forEach((button) => {
        if (button.hasAttribute('aria-label')) return;
        const clone = button.cloneNode(true);
        clone.querySelectorAll('.material-symbols-outlined').forEach((icon) => icon.remove());
        const label = clone.textContent.replace(/\s+/g, ' ').trim();
        if (label) button.setAttribute('aria-label', `${label} — ${title}`);
      });
    });
  }

  function initPointerDetails() {
    if (!finePointer || reduceMotion) return;

    $$('main a[class*="bg-primary"], main button[class*="bg-primary"]').forEach((el) => {
      el.classList.add('btn-sheen');
    });

    $$('main article, main [class~="group"]').forEach((card) => {
      if (card.closest('#mobile-menu, #search-overlay')) return;
      card.classList.add('shine');
      card.addEventListener(
        'pointermove',
        (event) => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
          card.style.setProperty('--my', `${event.clientY - rect.top}px`);
        },
        { passive: true }
      );
    });

    // A restrained magnetic pull for primary calls to action in the hero.
    const hero = $('main > section:first-of-type, main > div:first-child');
    if (hero) {
      $$('a[class*="bg-primary"], button[class*="bg-primary"]', hero).forEach((el) => {
        el.addEventListener(
          'pointermove',
          (event) => {
            const rect = el.getBoundingClientRect();
            const dx = (event.clientX - rect.left - rect.width / 2) / rect.width;
            const dy = (event.clientY - rect.top - rect.height / 2) / rect.height;
            el.style.transform = `translate(${(dx * 4).toFixed(2)}px, ${(dy * 3).toFixed(2)}px)`;
          },
          { passive: true }
        );
        el.addEventListener('pointerleave', () => {
          el.style.transform = '';
        });
      });
    }

    // Ambient cursor light.
    const glow = $('#cursor-glow');
    if (glow) {
      let pointerX = window.innerWidth / 2;
      let pointerY = window.innerHeight / 2;
      let currentX = pointerX;
      let currentY = pointerY;
      let frame = null;

      body.classList.add('cursor-ready');

      const tick = () => {
        currentX += (pointerX - currentX) * 0.11;
        currentY += (pointerY - currentY) * 0.11;
        glow.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
        if (Math.abs(pointerX - currentX) > 0.4 || Math.abs(pointerY - currentY) > 0.4) {
          frame = window.requestAnimationFrame(tick);
        } else {
          frame = null;
        }
      };

      window.addEventListener(
        'pointermove',
        (event) => {
          pointerX = event.clientX;
          pointerY = event.clientY;
          if (!frame) frame = window.requestAnimationFrame(tick);
        },
        { passive: true }
      );
    }
  }

  /* ------------------------------------------------------------------------
     Mobile refinement panel (catalog pages)
     ------------------------------------------------------------------------ */
  function initFilterPanels() {
    if (window.matchMedia('(min-width: 1024px)').matches) return;

    $$('aside').forEach((aside) => {
      if (aside.dataset.filterLite === 'true') return;
      const preview = (aside.textContent || '').slice(0, 900).toLowerCase();
      if (!/(filter|refine|sort)/.test(preview)) return;

      aside.dataset.filterLite = 'true';

      const button = doc.createElement('button');
      button.type = 'button';
      button.className = 'filter-toggle';
      button.setAttribute('aria-expanded', 'false');
      button.innerHTML =
        '<span class="material-symbols-outlined" aria-hidden="true">tune</span>' +
        '<span>Filters &amp; refinement</span>' +
        '<span class="material-symbols-outlined filter-caret" aria-hidden="true">expand_more</span>';

      const wrapper = doc.createElement('div');
      wrapper.className = 'filter-body';
      while (aside.firstChild) wrapper.appendChild(aside.firstChild);

      aside.append(button, wrapper);
      aside.classList.add('filter-collapsed');

      button.addEventListener('click', () => {
        const open = aside.classList.toggle('is-open');
        button.setAttribute('aria-expanded', String(open));
      });
    });
  }

  /* ------------------------------------------------------------------------
     Sidebar filter accordions. The catalog templates ship two header
     styles (mono −/+ buttons and icon headers); both become clickable,
     focusable and screen-reader-friendly here, and the initial glyph
     decides whether the panel starts open or collapsed.
     ------------------------------------------------------------------------ */
  function initFilterAccordions() {
    const PAIRS = [
      ['−', '+'],
      ['remove', 'add'],
      ['expand_less', 'expand_more'],
    ];
    let uid = 0;

    $$('aside[aria-label*="filter" i]').forEach((aside) => {
      const candidates = [
        ...$$('button', aside).map((button) => ({
          el: button,
          glyph: [...button.children].find(
            (span) =>
              span.classList.contains('font-mono') &&
              PAIRS.some(([open]) => (span.textContent || '').trim() === open)
          ),
        })),
        ...$$('div.flex', aside).map((header) => ({
          el: header,
          glyph: [...header.children].find(
            (span) =>
              span.classList.contains('material-symbols-outlined') &&
              PAIRS.some(([open]) => (span.textContent || '').trim() === open)
          ),
        })),
      ];

      candidates.forEach(({ el, glyph }) => {
        if (!glyph) return;
        const panel = el.nextElementSibling;
        if (!panel || panel.tagName !== 'DIV') return;
        if (!panel.querySelector('label, input[type="checkbox"]')) return;
        if (el.dataset.veyAccordion) return;
        el.dataset.veyAccordion = 'true';

        const [openGlyph, closedGlyph] = PAIRS.find(
          ([open]) => (glyph.textContent || '').trim() === open
        );
        const wireOpen = (glyph.textContent || '').trim() === openGlyph;
        const panelId = panel.id || `vey-filter-panel-${++uid}`;
        panel.id = panelId;
        if (el.tagName === 'BUTTON') el.type = 'button';
        el.tabIndex = 0;
        el.classList.add('cursor-pointer');
        el.setAttribute('aria-controls', panelId);

        const sync = (open) => {
          glyph.textContent = open ? openGlyph : closedGlyph;
          el.setAttribute('aria-expanded', String(open));
          panel.style.display = open ? '' : 'none';
        };
        sync(wireOpen);
        el.addEventListener('click', () => sync(el.getAttribute('aria-expanded') !== 'true'));
        if (el.tagName !== 'BUTTON') {
          el.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            el.click();
          });
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     Price range sliders. The decorative thumbs look draggable but are
     inert divs, so each track receives a real dual-range overlay: two
     native inputs (touchable, focusable, keyboard-operable) that drive
     the existing fill bar and the ₹ readouts, whatever markup variant
     a catalog page uses.
     ------------------------------------------------------------------------ */
  function initPriceSliders() {
    $$('aside[aria-label*="filter" i]').forEach((aside) => {
      const fill = [...aside.querySelectorAll('div')].find((div) =>
        div.classList.contains('absolute') &&
        div.classList.contains('bg-primary') &&
        [...div.classList].some((cls) => /^h-(full|1|1\.5)$/.test(cls))
      );
      if (!fill) return;

      const track = fill.parentElement;
      if (!track || track.dataset.veyRange) return;
      const thumbs = [...track.children].filter(
        (child) =>
          child !== fill &&
          child.classList.contains('absolute') &&
          child.classList.contains('rounded-full') &&
          [...child.classList].some((cls) => /^w-(4|3\.5)$/.test(cls))
      );
      if (thumbs.length !== 2) return;

      const isINR = (el) =>
        el.tagName === 'SPAN'
          ? /^₹\s?[\d,]+\s?k?$/i.test((el.textContent || '').trim())
          : /^[\d,]+$/.test((el.value || '').trim());
      const parseINR = (el) => {
        const text = el.tagName === 'SPAN' ? el.textContent : el.value;
        const match = (text || '').match(/([\d,]+)\s?(k)?/i);
        const value = parseFloat((match ? match[1] : '').replace(/,/g, ''));
        return value > 0 ? Math.round(match && match[2] ? value * 1000 : value) : 0;
      };
      const valueEls = [...aside.querySelectorAll('span, input[type="text"]')].filter(isINR);
      if (valueEls.length < 2) return;
      valueEls.sort((a, b) => parseINR(a) - parseINR(b));
      const bound = Math.max(parseINR(valueEls[0]), parseINR(valueEls[1]));
      if (!bound) return;
      const [minEl, maxEl] = valueEls;

      let lo = parseINR(minEl) || Math.round(bound * 0.05);
      let hi = Math.max(parseINR(maxEl), lo);
      const step = Math.max(50, Math.round(bound / 300));
      const fmt = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`;
      const writeCell = (el, value) => {
        if (el.tagName === 'SPAN') {
          const spacer = /^₹\s/.test((el.textContent || '').trim()) ? ' ' : '';
          el.textContent = `₹${spacer}${Math.round(value).toLocaleString('en-IN')}`;
        } else {
          el.value = Math.round(value).toLocaleString('en-IN');
        }
      };

      const makeRange = (label) => {
        const input = doc.createElement('input');
        input.type = 'range';
        input.min = '0';
        input.max = String(bound);
        input.step = String(step);
        input.setAttribute('aria-label', label);
        input.classList.add('vey-range-input');
        track.appendChild(input);
        return input;
      };
      const minInput = makeRange('Minimum price in rupees');
      const maxInput = makeRange('Maximum price in rupees');
      track.classList.add('vey-range-track');
      track.dataset.veyRange = 'true';
      fill.classList.add('vey-range-fill');
      thumbs.forEach((thumb) => { thumb.style.display = 'none'; });

      // The price text fields share the slider's range; label them honestly.
      [
        ['Minimum price in rupees', minEl],
        ['Maximum price in rupees', maxEl],
      ].forEach(([label, el]) => {
        if (el.tagName === 'INPUT' && el.getAttribute('aria-label') !== label) {
          el.setAttribute('aria-label', label);
        }
      });

      const rangeSpans = [...aside.querySelectorAll('span')].filter((span) =>
        /^₹?\s?[\d,]+\s?k?\s?[–—−-]\s?₹?\s?[\d,]+\s?k?$/i.test((span.textContent || '').trim())
      );

      const render = () => {
        fill.style.left = `${(lo / bound) * 100}%`;
        fill.style.right = `${100 - (hi / bound) * 100}%`;
        writeCell(minEl, lo);
        writeCell(maxEl, hi);
        rangeSpans.forEach((span) => {
          span.textContent = `${fmt(lo)} — ${fmt(hi)}`;
        });
      };
      minInput.value = String(lo);
      maxInput.value = String(hi);
      render();

      const clamp = () => {
        lo = Math.min(Number(minInput.value), hi);
        hi = Math.max(Number(maxInput.value), lo);
        minInput.value = String(lo);
        maxInput.value = String(hi);
      };
      minInput.addEventListener('input', () => { clamp(); render(); });
      maxInput.addEventListener('input', () => { clamp(); render(); });

      // Tap anywhere on the rail to send the nearest thumb there.
      track.addEventListener('pointerdown', (event) => {
        if (event.target === minInput || event.target === maxInput) return;
        const rect = track.getBoundingClientRect();
        const value = Math.round((((event.clientX - rect.left) / rect.width) * bound) / step) * step;
        const nearer = Math.abs(value - lo) <= Math.abs(value - hi) ? minInput : maxInput;
        nearer.value = String(Math.max(0, Math.min(value, bound)));
        clamp();
        render();
        nearer.focus();
      });
    });
  }

  /* ------------------------------------------------------------------------
     Search page query state
     ------------------------------------------------------------------------ */
  function initSearchQuery() {
    if (pageName !== 'search' && !doc.getElementById('page-search-input') && !doc.getElementById('searchInputField')) {
      return;
    }

    const query = new URLSearchParams(location.search).get('q');
    if (!query) {
      // No ?q= in the URL: neutralise the staged placeholder instead of showing a rogue product name.
      const breadcrumb = $('#breadcrumb-query');
      if (breadcrumb) breadcrumb.textContent = 'NO RESULTS FOUND';
      return;
    }

    const pageInput = $('#page-search-input') || $('#searchInputField');
    if (pageInput) pageInput.value = query;

    const chip = $('[data-query-chip]');
    if (chip) chip.textContent = `QUERY: “${query.toUpperCase()}”`;

    const breadcrumb = $('#breadcrumb-query');
    if (breadcrumb) breadcrumb.textContent = `QUERY: “${query.toUpperCase()}”`;

    $$('[data-query-quote]').forEach((quote) => {
      quote.textContent = `“${query}”`;
    });
  }

  function initSearchEmptyControls() {
    const input = $('#searchInputField');
    if (!input) return;

    // Re-scan the archive with the query currently in the diagnostic pod.
    $('[data-rescan]')?.addEventListener('click', () => {
      const query = input.value.trim();
      if (!query) {
        showToast('A blank page', 'Begin with a fibre, a mood, or a silhouette.', 'search');
        input.focus();
        return;
      }
      navigateTo(`search.html?q=${encodeURIComponent(query)}`);
    });

    // The reset control promises a real archive view, not just a filled field.
    $('#resetAllFiltersBtn')?.addEventListener('click', (event) => {
      event.preventDefault();
      navigateTo(`search.html?q=${encodeURIComponent('Winter Outerwear & Heavy Knitwear')}`);
    });

    // Relaxation chips are toggles; visually and programmatically mark them.
    $$('#relaxationChips .relax-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const pressed = chip.getAttribute('aria-pressed') === 'true';
        const next = !pressed;
        chip.setAttribute('aria-pressed', String(next));
        chip.classList.toggle('is-active', next);

        if (!next) return;
        const label = chip.textContent.replace(/\s+/g, ' ').toLowerCase();
        if (label.includes('750 gsm')) input.value = 'Vicuña & Cashmere Heavy Parka';
        else if (label.includes('cashmere')) input.value = 'Double-Faced Cashmere Outerwear';
      });
    });
  }

  function initPageSearchFields() {
    $$('#page-search-input, #searchInputField').forEach((field) => {
      field.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        const query = field.value.trim();
        if (!query) return;
        event.preventDefault();
        navigateTo(`search.html?q=${encodeURIComponent(query)}`);
      });
    });
  }

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  initImages();
  initPointerDetails();
  initCardLabels();
  initCounters();
  initFilterPanels();
  initFilterAccordions();
  initPriceSliders();
  initSearchQuery();
  initSearchEmptyControls();
  initPageSearchFields();

  document.addEventListener('click', (event) => {
    const clear = event.target.closest('[aria-label*="clear" i]');
    if (!clear || pageName !== 'search') return;
    const field = clear.closest('.relative')?.querySelector('input');
    if (!field) return;
    event.preventDefault();
    field.value = '';
    field.focus();
  });
})();
