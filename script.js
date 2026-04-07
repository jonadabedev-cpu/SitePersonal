/* =============================================
   TIAGO PERSONAL TRAINER — script.js
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- 1. LOADER ---- */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      // Trigger first-visible reveals after loader
      triggerReveal();
    }, 1500);
  });


  /* ---- 2. HEADER: scroll class + active nav ---- */
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function onScroll() {
    // Scrolled class
    header.classList.toggle('scrolled', window.scrollY > 60);

    // Back-to-top visibility
    backTop.classList.toggle('visible', window.scrollY > 400);

    // Active nav link based on scroll position
    let currentId = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) currentId = sec.id;
    });

    navLinks.forEach(link => {
      link.classList.toggle(
        'active',
        link.getAttribute('href') === `#${currentId}`
      );
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });


  /* ---- 3. MOBILE MENU ---- */
  const menuToggle = document.getElementById('menuToggle');
  const navbar = document.getElementById('navbar');
  const navOverlay = document.getElementById('navOverlay');

  function openMenu() {
    navbar.classList.add('open');
    navOverlay.classList.add('active');
    menuToggle.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navbar.classList.remove('open');
    navOverlay.classList.remove('active');
    menuToggle.classList.remove('open');
    document.body.style.overflow = '';
  }

  menuToggle.addEventListener('click', () => {
    navbar.classList.contains('open') ? closeMenu() : openMenu();
  });

  navOverlay.addEventListener('click', closeMenu);

  // Close on nav link click
  navbar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });


  /* ---- 4. SMOOTH SCROLL for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const headerH = header.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ---- 5. REVEAL ON SCROLL (Intersection Observer) ---- */
  const revealEls = document.querySelectorAll('[data-reveal]');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // stagger siblings
        const siblings = [...entry.target.closest('section')?.querySelectorAll('[data-reveal]') || []];
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${idx * 0.12}s`;
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  function triggerReveal() {
    revealEls.forEach(el => revealObserver.observe(el));
  }

  triggerReveal();


  /* ---- 6. COUNTER ANIMATION ---- */
  const stats = document.querySelectorAll('.stat[data-count]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.count;
      const numEl = el.querySelector('.stat-num');
      let start = 0;
      const duration = 1800;
      const startTime = performance.now();

      function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out
        const eased = 1 - Math.pow(1 - progress, 3);
        numEl.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(update);
        else numEl.textContent = target;
      }

      requestAnimationFrame(update);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  stats.forEach(s => counterObserver.observe(s));


  /* ---- 7. REVIEWS CAROUSEL ---- */
  const track = document.getElementById('reviewsTrack');
  const cards = track ? [...track.querySelectorAll('.review-card')] : [];
  const dotsContainer = document.getElementById('revDots');
  const prevBtn = document.getElementById('revPrev');
  const nextBtn = document.getElementById('revNext');

  let currentSlide = 0;
  let slidesPerView = getSlidesPerView();
  let totalSlides = Math.ceil(cards.length / slidesPerView);
  let autoSlideTimer;

  function getSlidesPerView() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function buildDots() {
    dotsContainer.innerHTML = '';
    totalSlides = Math.ceil(cards.length / slidesPerView);
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('button');
      dot.classList.add('rev-dot');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      if (i === currentSlide) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function goTo(idx) {
    currentSlide = (idx + totalSlides) % totalSlides;
    const cardWidth = cards[0]?.offsetWidth + 25 || 0; // gap: 2.5rem = 25px
    track.style.transform = `translateX(-${currentSlide * cardWidth * slidesPerView}px)`;
    document.querySelectorAll('.rev-dot').forEach((d, i) => {
      d.classList.toggle('active', i === currentSlide);
    });
  }

  function autoSlide() {
    autoSlideTimer = setInterval(() => goTo(currentSlide + 1), 4500);
  }

  function resetAuto() {
    clearInterval(autoSlideTimer);
    autoSlide();
  }

  if (track && cards.length) {
    buildDots();
    autoSlide();

    prevBtn?.addEventListener('click', () => { goTo(currentSlide - 1); resetAuto(); });
    nextBtn?.addEventListener('click', () => { goTo(currentSlide + 1); resetAuto(); });

    // Touch swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        goTo(currentSlide + (diff > 0 ? 1 : -1));
        resetAuto();
      }
    });

    // Keyboard
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { goTo(currentSlide - 1); resetAuto(); }
      if (e.key === 'ArrowRight') { goTo(currentSlide + 1); resetAuto(); }
    });

    // Recalculate on resize
    window.addEventListener('resize', () => {
      const newSpv = getSlidesPerView();
      if (newSpv !== slidesPerView) {
        slidesPerView = newSpv;
        currentSlide = 0;
        buildDots();
        goTo(0);
      }
    });
  }


  /* ---- 8. BACK TO TOP ---- */
  const backTop = document.getElementById('backTop');
  backTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  /* ---- 9. PARALLAX on home bg text ---- */
  const bgText = document.querySelector('.home-bg-text');
  if (bgText) {
    window.addEventListener('scroll', () => {
      bgText.style.transform = `translateY(${window.scrollY * 0.2}px)`;
    }, { passive: true });
  }


  /* ---- 10. PLAN CARD tilt effect (desktop) ---- */
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.plan-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
        card.style.transform = `translateY(-6px) rotateX(${y}deg) rotateY(${x}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

}); // end DOMContentLoaded