/**
 * ============================================================
 * MUHAMMAD ANFAL — PREMIUM PORTFOLIO SCRIPT
 * Vanilla JS ES6+ | No framework dependencies
 * ============================================================
 */

'use strict';

/* ============================================================
   UTILITY HELPERS
   ============================================================ */

/** Throttle a function to fire at most once per `limit` ms */
const throttle = (fn, limit = 16) => {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
};

/** Debounce a function — fires after `delay` ms of silence */
const debounce = (fn, delay = 150) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};

/** Check if an element is in the viewport */
const isInViewport = (el, offset = 0) => {
  const rect = el.getBoundingClientRect();
  return rect.top <= (window.innerHeight || document.documentElement.clientHeight) - offset;
};

/** Prefer-reduced-motion check */
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   DOM READY
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initAOS();
  initScrollProgress();
  initNavbar();
  initMobileMenu();
  initTyped();
  initParticles();
  initVanillaTilt();
  initCursorGlow();
  initCounters();
  initActiveNavLinks();
  initContactForm();
  initSmoothScroll();
  initPageReveal();
});

/* ============================================================
   1. AOS — ANIMATE ON SCROLL
   ============================================================ */
function initAOS() {
  if (typeof AOS === 'undefined' || prefersReducedMotion()) return;

  AOS.init({
    duration: 700,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    once: true,
    offset: 80,
    delay: 0,
    anchorPlacement: 'top-bottom',
  });
}

/* ============================================================
   2. SCROLL PROGRESS BAR
   ============================================================ */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  const update = throttle(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${Math.min(progress, 100)}%`;
  }, 16);

  window.addEventListener('scroll', update, { passive: true });
}

/* ============================================================
   3. NAVBAR — SCROLL BEHAVIOUR + ACTIVE LINK HIGHLIGHT
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 20;

  const handleScroll = throttle(() => {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, 16);

  window.addEventListener('scroll', handleScroll, { passive: true });
  // Run once on load in case page is already scrolled
  handleScroll();
}

/* ============================================================
   4. ACTIVE NAV LINKS (Intersection Observer)
   ============================================================ */
function initActiveNavLinks() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    root: null,
    rootMargin: `-${getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-height')
      .trim() || '72px'} 0px -40% 0px`,
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === `#${entry.target.id}`
          );
          link.removeAttribute('aria-current');
        });
        const activeLink = document.querySelector(
          `.nav-link[href="#${entry.target.id}"]`
        );
        if (activeLink) activeLink.setAttribute('aria-current', 'page');
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));
}

/* ============================================================
   5. MOBILE MENU TOGGLE
   ============================================================ */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  if (!hamburger || !mobileNav) return;

  const mobileLinks = mobileNav.querySelectorAll('.mobile-nav-link');

  const openMenu = () => {
    hamburger.classList.add('open');
    mobileNav.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Close on link click
  mobileLinks.forEach((link) => link.addEventListener('click', closeMenu));

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hamburger.classList.contains('open')) closeMenu();
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (
      mobileNav.classList.contains('open') &&
      !mobileNav.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMenu();
    }
  });
}

/* ============================================================
   6. TYPED.JS — HERO TYPING ANIMATION
   ============================================================ */
function initTyped() {
  const el = document.getElementById('typed-text');
  if (!el || typeof Typed === 'undefined' || prefersReducedMotion()) {
    if (el) el.textContent = 'Full-Stack Software Engineer';
    return;
  }

  new Typed('#typed-text', {
    strings: [
      'Full-Stack Software Engineer',
      'Backend Systems Architect',
      'Django & FastAPI Developer',
      'Flutter App Developer',
      'Cloud & AWS Engineer',
      'REST API Specialist',
    ],
    typeSpeed: 55,
    backSpeed: 30,
    backDelay: 2200,
    startDelay: 600,
    loop: true,
    smartBackspace: true,
    cursorChar: '|',
    autoInsertCss: true,
  });
}

/* ============================================================
   7. CANVAS PARTICLES — FLOATING RED DOTS
   ============================================================ */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas || prefersReducedMotion()) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;
  let width, height;

  // Config
  const CONFIG = {
    count: window.innerWidth < 768 ? 35 : 70,
    colors: [
      'rgba(225,29,72,0.6)',
      'rgba(255,59,59,0.4)',
      'rgba(225,29,72,0.3)',
      'rgba(255,255,255,0.15)',
    ],
    minSize: 1,
    maxSize: 3,
    minSpeed: 0.15,
    maxSpeed: 0.5,
    connectionDistance: 120,
    connectionOpacity: 0.06,
  };

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.size = CONFIG.minSize + Math.random() * (CONFIG.maxSize - CONFIG.minSize);
      this.speedX = (Math.random() - 0.5) * CONFIG.maxSpeed;
      this.speedY = -(CONFIG.minSpeed + Math.random() * (CONFIG.maxSpeed - CONFIG.minSpeed));
      this.opacity = 0.2 + Math.random() * 0.6;
      this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
      this.pulse = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.02 + Math.random() * 0.02;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.pulse += this.pulseSpeed;
      // Wrap horizontal
      if (this.x < -10) this.x = width + 10;
      if (this.x > width + 10) this.x = -10;
      // Reset when above canvas
      if (this.y < -10) this.reset(false);
    }

    draw() {
      const pulseFactor = 1 + Math.sin(this.pulse) * 0.3;
      ctx.save();
      ctx.globalAlpha = this.opacity * pulseFactor;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = 'rgba(225,29,72,0.5)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.connectionDistance) {
          const opacity = (1 - dist / CONFIG.connectionDistance) * CONFIG.connectionOpacity;
          ctx.save();
          ctx.globalAlpha = opacity;
          ctx.strokeStyle = 'rgba(225,29,72,1)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => { p.update(); p.draw(); });
    drawConnections();
    animationId = requestAnimationFrame(animate);
  }

  function init() {
    resize();
    particles = Array.from({ length: CONFIG.count }, () => new Particle());
    if (animationId) cancelAnimationFrame(animationId);
    animate();
  }

  init();

  // Pause when tab is hidden for performance
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      animate();
    }
  });

  window.addEventListener('resize', debounce(() => {
    resize();
    particles = Array.from({ length: CONFIG.count }, () => new Particle());
  }, 300));
}

/* ============================================================
   8. VANILLA TILT — 3D HOVER ON CARDS
   ============================================================ */
function initVanillaTilt() {
  if (typeof VanillaTilt === 'undefined' || prefersReducedMotion()) return;

  // Skill cards
  VanillaTilt.init(document.querySelectorAll('.skill-card[data-tilt]'), {
    max: 12,
    speed: 400,
    glare: true,
    'max-glare': 0.08,
    scale: 1.04,
    perspective: 800,
  });

  // Project cards
  VanillaTilt.init(document.querySelectorAll('.project-card[data-tilt]'), {
    max: 6,
    speed: 500,
    glare: true,
    'max-glare': 0.05,
    scale: 1.02,
    perspective: 1000,
  });
}

/* ============================================================
   9. CURSOR GLOW — MOUSE TRACKING
   ============================================================ */
function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!glow || prefersReducedMotion()) return;

  // Only on desktop
  if (window.matchMedia('(pointer: coarse)').matches) {
    glow.style.display = 'none';
    return;
  }

  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;
  let raf;

  document.addEventListener('mousemove', throttle((e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, 16), { passive: true });

  // Smooth follow via lerp
  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    glowX = lerp(glowX, mouseX, 0.08);
    glowY = lerp(glowY, mouseY, 0.08);
    glow.style.left = `${glowX}px`;
    glow.style.top  = `${glowY}px`;
    raf = requestAnimationFrame(tick);
  }
  tick();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else tick();
  });
}

/* ============================================================
   10. ANIMATED COUNTERS — ABOUT STATS
   ============================================================ */
function initCounters() {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (!statNumbers.length) return;

  const DURATION = 1800; // ms

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;

    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      const easedProgress = easeOutExpo(progress);
      el.textContent = Math.floor(easedProgress * target);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(update);
  }

  // Use IntersectionObserver — fire once when visible
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach((el) => {
    if (prefersReducedMotion()) {
      el.textContent = el.dataset.target;
    } else {
      observer.observe(el);
    }
  });
}

/* ============================================================
   11. SMOOTH SCROLL — ANCHOR LINKS
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-height') || '72',
        10
      );

      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;

      window.scrollTo({
        top,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });

      // Update URL without triggering scroll
      history.pushState(null, '', targetId);
    });
  });
}

/* ============================================================
   12. CONTACT FORM — CLIENT-SIDE HANDLING
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');
  const submitBtn = document.getElementById('form-submit-btn');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic validation
    const fields = form.querySelectorAll('input[required], textarea[required]');
    let valid = true;

    fields.forEach((field) => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#FF3B3B';
        valid = false;
      }
    });

    // Email format check
    const emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
      emailField.style.borderColor = '#FF3B3B';
      valid = false;
    }

    if (!valid) {
      showStatus('Please fill in all required fields correctly.', 'error');
      return;
    }

    // Loading state
    const btnSpan = submitBtn.querySelector('span');
    const btnIcon = submitBtn.querySelector('i');
    submitBtn.disabled = true;
    if (btnSpan) btnSpan.textContent = 'Sending…';
    if (btnIcon) {
      btnIcon.className = '';
      btnIcon.classList.add('fa-solid', 'fa-spinner', 'fa-spin');
    }

    // Simulate async send (replace with real endpoint / Formspree / EmailJS)
    await new Promise((resolve) => setTimeout(resolve, 1400));

    // Reset
    submitBtn.disabled = false;
    if (btnSpan) btnSpan.textContent = 'Send Message';
    if (btnIcon) {
      btnIcon.className = '';
      btnIcon.classList.add('fa-solid', 'fa-paper-plane');
    }

    form.reset();
    showStatus(
      '✓ Message sent! I\'ll get back to you soon.',
      'success'
    );

    setTimeout(() => showStatus('', ''), 6000);
  });

  // Clear field error on input
  form.querySelectorAll('input, textarea').forEach((field) => {
    field.addEventListener('input', () => {
      field.style.borderColor = '';
    });
  });

  function showStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = 'form-status';
    if (type) statusEl.classList.add(type);
  }
}

/* ============================================================
   13. PAGE REVEAL — INITIAL LOAD ANIMATION
   ============================================================ */
function initPageReveal() {
  if (prefersReducedMotion()) return;

  // Fade body in gracefully on first load
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });
  });

  // Remove transition after it completes so it doesn't interfere
  document.body.addEventListener('transitionend', () => {
    document.body.style.transition = '';
  }, { once: true });
}

/* ============================================================
   14. SECTION REVEAL — STAGGERED CHILDREN
   ============================================================ */
(function initSectionReveal() {
  if (prefersReducedMotion()) return;

  // Add staggered delay to skill cards within each category
  document.querySelectorAll('.skills-category').forEach((category) => {
    const cards = category.querySelectorAll('.skill-card');
    cards.forEach((card, i) => {
      card.style.transitionDelay = `${i * 30}ms`;
    });
  });

  // Stagger project cards
  document.querySelectorAll('.project-card').forEach((card, i) => {
    // AOS handles these; add extra delay reinforcement
    card.setAttribute('data-aos-delay', String(100 + i * 100));
  });
})();

/* ============================================================
   15. BUTTON RIPPLE EFFECT
   ============================================================ */
(function initRipple() {
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height) * 2;

      Object.assign(ripple.style, {
        position: 'absolute',
        borderRadius: '50%',
        width: `${size}px`,
        height: `${size}px`,
        left: `${x - size / 2}px`,
        top: `${y - size / 2}px`,
        background: 'rgba(255,255,255,0.12)',
        transform: 'scale(0)',
        pointerEvents: 'none',
        animation: 'ripple-expand 0.55s cubic-bezier(0.4,0,0.2,1) forwards',
      });

      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  // Inject ripple keyframe once
  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
      @keyframes ripple-expand {
        to { transform: scale(1); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
})();

/* ============================================================
   16. ANIMATED UNDERLINE ON NAV HOVER
   (CSS handles the pseudo-element; JS adds keyboard support)
   ============================================================ */
(function initNavKeyboard() {
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('focus', () => link.classList.add('focus-visible'));
    link.addEventListener('blur',  () => link.classList.remove('focus-visible'));
  });
})();

/* ============================================================
   17. LAZY IMAGE REVEAL
   ============================================================ */
(function initLazyReveal() {
  if (!('IntersectionObserver' in window)) return;

  const images = document.querySelectorAll('img[loading="lazy"]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          img.style.opacity = '1';
          img.style.transform = 'scale(1)';
          observer.unobserve(img);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
  );

  images.forEach((img) => {
    if (!prefersReducedMotion()) {
      img.style.opacity = '0';
      img.style.transform = 'scale(0.97)';
    }
    observer.observe(img);
  });
})();

/* ============================================================
   18. TIMELINE CONNECTOR ANIMATION
   ============================================================ */
(function initTimelineAnimation() {
  const timelineItems = document.querySelectorAll('.timeline-item');
  if (!timelineItems.length || prefersReducedMotion()) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('timeline-visible');
        }
      });
    },
    { threshold: 0.2 }
  );

  timelineItems.forEach((item) => observer.observe(item));
})();

/* ============================================================
   19. SKILLS CATEGORY TITLE REVEAL
   ============================================================ */
(function initSkillsReveal() {
  const cats = document.querySelectorAll('.skills-category');
  if (!cats.length || prefersReducedMotion()) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const cards = entry.target.querySelectorAll('.skill-card');
          cards.forEach((card, i) => {
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, i * 40);
          });
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  cats.forEach((cat) => {
    if (!prefersReducedMotion()) {
      cat.querySelectorAll('.skill-card').forEach((card) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      });
    }
    observer.observe(cat);
  });
})();

/* ============================================================
   20. MARQUEE PAUSE ON FOCUS (ACCESSIBILITY)
   ============================================================ */
(function initMarqueePause() {
  const inner = document.getElementById('marquee-inner');
  if (!inner) return;

  inner.addEventListener('focusin',  () => inner.style.animationPlayState = 'paused');
  inner.addEventListener('focusout', () => inner.style.animationPlayState = 'running');
})();

/* ============================================================
   21. GITHUB STAT IMAGE ERROR FALLBACK
   ============================================================ */
(function initGithubFallback() {
  document.querySelectorAll('.github-stat-img').forEach((img) => {
    img.addEventListener('error', () => {
      const card = img.closest('.github-stat-card');
      if (card) {
        card.innerHTML = `
          <div style="text-align:center;padding:2rem;color:var(--text-muted);">
            <i class="fa-brands fa-github" style="font-size:2rem;margin-bottom:0.75rem;display:block;"></i>
            <p style="font-size:0.8125rem;">Stats unavailable — visit
              <a href="https://github.com/muhammadanfal" target="_blank" rel="noopener noreferrer"
                 style="color:var(--accent);">github.com/muhammadanfal</a>
            </p>
          </div>`;
      }
    });
  });
})();

/* ============================================================
   22. TILT CLEANUP ON MOBILE (performance)
   ============================================================ */
(function handleTiltOnMobile() {
  const MQL = window.matchMedia('(max-width: 768px)');

  function handleMQLChange(e) {
    if (e.matches) {
      // Destroy tilt instances on mobile
      document.querySelectorAll('[data-tilt]').forEach((el) => {
        if (el.vanillaTilt) el.vanillaTilt.destroy();
      });
    }
  }

  MQL.addEventListener('change', handleMQLChange);
  handleMQLChange(MQL);
})();

/* ============================================================
   23. HERO IMAGE — PARALLAX SUBTLE EFFECT ON SCROLL
   ============================================================ */
(function initHeroParallax() {
  const heroOuter = document.querySelector('.hero-image-outer');
  if (!heroOuter || prefersReducedMotion()) return;

  window.addEventListener('scroll', throttle(() => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      const shift = scrollY * 0.08;
      heroOuter.style.transform = `translateY(${shift}px)`;
    }
  }, 16), { passive: true });
})();

/* ============================================================
   24. KEYBOARD NAVIGATION TRAP FOR MOBILE MENU
   ============================================================ */
(function initFocusTrap() {
  const mobileNav = document.getElementById('mobile-nav');
  if (!mobileNav) return;

  mobileNav.addEventListener('keydown', (e) => {
    if (!mobileNav.classList.contains('open')) return;

    const focusable = mobileNav.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  });
})();

/* ============================================================
   25. CONTACT CARD HOVER SOUND (subtle visual feedback boost)
   ============================================================ */
(function initContactCardFeedback() {
  document.querySelectorAll('.contact-card').forEach((card) => {
    card.addEventListener('mouseenter', () => {
      card.style.setProperty('--card-x', '0');
    });
  });
})();

/* ============================================================
   END OF SCRIPT
   ============================================================ */
