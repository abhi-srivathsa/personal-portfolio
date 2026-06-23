document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initReveal();
  initCounters();
  initTilt();
  initInternalLinks();
  initPortraitMorph();
  initProjectRows();
});

function initNavigation() {
  const header = document.getElementById('site-header');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const sections = Array.from(document.querySelectorAll('main section[id]'));

  if (!header || !navToggle || !navMenu) return;

  let lastScrollY = window.scrollY;

  const closeMenu = () => {
    navMenu.classList.remove('is-active');
    navToggle.classList.remove('is-active');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation menu');
    document.body.classList.remove('nav-open');
  };

  const openMenu = () => {
    navMenu.classList.add('is-active');
    navToggle.classList.add('is-active');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close navigation menu');
    document.body.classList.add('nav-open');
  };

  navToggle.addEventListener('click', () => {
    if (navMenu.classList.contains('is-active')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', (event) => {
    if (!navMenu.classList.contains('is-active')) return;
    if (navMenu.contains(event.target) || navToggle.contains(event.target)) return;
    closeMenu();
  });

  const updateHeader = () => {
    const currentScrollY = window.scrollY;
    const scrollingDown = currentScrollY > lastScrollY;
    const canHide = window.innerWidth > 900 && !navMenu.classList.contains('is-active');

    header.classList.toggle('is-hidden', canHide && scrollingDown && currentScrollY > 220);
    lastScrollY = currentScrollY;
  };

  window.addEventListener('scroll', throttle(updateHeader, 120), { passive: true });

  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const activeId = entry.target.getAttribute('id');

        navLinks.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${activeId}`);
        });
      });
    }, {
      rootMargin: '-40% 0px -50% 0px',
      threshold: 0
    });

    sections.forEach((section) => sectionObserver.observe(section));
  }
}

function initInternalLinks() {
  const internalLinks = document.querySelectorAll('a[href^="#"]');

  internalLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;

      const target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });

      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }

      window.setTimeout(() => target.focus({ preventScroll: true }), prefersReducedMotion() ? 0 : 450);
    });
  });
}

function initReveal() {
  const revealItems = Array.from(document.querySelectorAll('.reveal'));

  if (!revealItems.length) return;

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    rootMargin: '0px 0px -12% 0px',
    threshold: 0.12
  });

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 38, 220)}ms`;
    observer.observe(item);
  });
}

function initCounters() {
  const counters = Array.from(document.querySelectorAll('.stat-number[data-count]'));

  if (!counters.length || prefersReducedMotion()) return;

  const animateCounter = (counter) => {
    const end = Number(counter.dataset.count);
    const suffix = counter.dataset.suffix || '';
    const duration = 1100;
    const startTime = window.performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = `${Math.round(end * eased)}${suffix}`;

      if (progress < 1) {
        window.requestAnimationFrame(tick);
      }
    };

    window.requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: 0.7 });

  counters.forEach((counter) => counterObserver.observe(counter));
}

function initTilt() {
  if (prefersReducedMotion()) return;

  const tiltItems = Array.from(document.querySelectorAll('[data-tilt]'));

  tiltItems.forEach((item) => {
    item.addEventListener('pointermove', (event) => {
      const rect = item.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      item.style.setProperty('--tilt-y', `${x * 4}deg`);
      item.style.setProperty('--tilt-x', `${y * -4}deg`);
    });

    item.addEventListener('pointerleave', () => {
      item.style.setProperty('--tilt-y', '0deg');
      item.style.setProperty('--tilt-x', '0deg');
    });
  });
}

function initPortraitMorph() {
  const portrait = document.querySelector('.hero__portrait');
  const title = document.getElementById('hero-title');
  const about = document.getElementById('about');
  const target = document.querySelector('.about__portrait-slot');
  const root = document.documentElement;

  if (!portrait || !title || !about || !target) return;

  const aspectRatio = 1273 / 1800;
  const reducedMotion = prefersReducedMotion();

  let ticking = false;

  const update = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;
    const titleRect = title.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const aboutTop = scrollY + about.getBoundingClientRect().top;
    const aboutBottom = aboutTop + about.offsetHeight;
    const isCompact = viewportWidth < 760;

    const baseHeight = clamp(viewportHeight * (isCompact ? 0.24 : 0.28), isCompact ? 150 : 170, isCompact ? 188 : 230);
    const gap = isCompact ? 14 : 22;
    const heroTop = titleRect.bottom + gap;
    const availableHeroHeight = viewportHeight - heroTop - (isCompact ? 18 : 28);
    const heroHeight = clamp(availableHeroHeight - (isCompact ? 0 : 42), isCompact ? 132 : 150, baseHeight);
    const heroWidth = heroHeight * aspectRatio;
    const heroLeft = (viewportWidth - heroWidth) / 2;

    const targetWidth = targetRect.width || heroWidth;
    const targetHeight = targetRect.height || heroHeight;
    const start = Math.max(64, viewportHeight * 0.12);
    const end = Math.max(start + 1, aboutTop - viewportHeight * 0.22);
    const rawProgress = clamp((scrollY - start) / (end - start), 0, 1);
    const progress = reducedMotion ? rawProgress : easeInOut(rawProgress);
    const travelProgress = reducedMotion ? rawProgress : easeOut(rawProgress);
    const left = lerp(heroLeft, targetRect.left, travelProgress);
    const top = lerp(heroTop, targetRect.top, travelProgress);
    const width = lerp(heroWidth, targetWidth, progress);
    const height = lerp(heroHeight, targetHeight, progress);
    const rotate = reducedMotion ? 0 : Math.sin(progress * Math.PI) * -22;
    const aboutFade = progress > 0.98 && scrollY > aboutBottom - viewportHeight * 0.18
      ? clamp((targetRect.bottom + 120) / 220, 0, 1)
      : 1;

    root.style.setProperty('--portrait-left', `${left.toFixed(2)}px`);
    root.style.setProperty('--portrait-top', `${top.toFixed(2)}px`);
    root.style.setProperty('--portrait-width', `${width.toFixed(2)}px`);
    root.style.setProperty('--portrait-height', `${height.toFixed(2)}px`);
    root.style.setProperty('--portrait-progress', progress.toFixed(3));
    root.style.setProperty('--portrait-rotate', `${rotate.toFixed(2)}deg`);
    root.style.setProperty('--portrait-opacity', aboutFade.toFixed(3));

    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  window.addEventListener('load', requestUpdate);
}

function initProjectRows() {
  const rows = Array.from(document.querySelectorAll('.project-row'));

  if (!rows.length) return;

  const clearRows = () => {
    rows.forEach((row) => row.classList.remove('is-active'));
  };

  rows.forEach((row) => {
    row.addEventListener('pointerenter', () => {
      clearRows();
      row.classList.add('is-active');
    });

    row.addEventListener('pointerleave', () => {
      if (!row.contains(document.activeElement)) {
        row.classList.remove('is-active');
      }
    });

    row.addEventListener('focusin', () => {
      clearRows();
      row.classList.add('is-active');
    });

    row.addEventListener('focusout', () => {
      window.setTimeout(() => {
        if (!row.contains(document.activeElement)) {
          row.classList.remove('is-active');
        }
      }, 0);
    });
  });
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function easeInOut(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function easeOut(value) {
  return 1 - Math.pow(1 - value, 3);
}

function throttle(callback, wait) {
  let waiting = false;

  return (...args) => {
    if (waiting) return;

    callback(...args);
    waiting = true;
    window.setTimeout(() => {
      waiting = false;
    }, wait);
  };
}
