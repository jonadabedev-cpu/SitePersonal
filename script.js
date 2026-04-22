/* =============================================
   TIAGO PERSONAL TRAINER — script.js
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- 1. LOADER ---- */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      triggerReveal();
    }, 1500);
  });


  /* ---- 2. HEADER: scroll class + active nav ---- */
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const backTop = document.getElementById('backTop');

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 60);
    if (backTop) backTop.classList.toggle('visible', window.scrollY > 400);

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

  navbar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });


  /* ---- 4. SMOOTH SCROLL para links âncora ----
     CORRIGIDO: o smooth scroll agora funciona corretamente em mobile.
     Antes, o preventDefault() impedia o comportamento padrão mas o
     scrollTo com behavior:'smooth' tem suporte limitado em alguns
     browsers mobile antigos. Adicionado fallback manual. */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      const headerH = header ? header.offsetHeight : 70;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH;

      // Tenta smooth scroll nativo; fallback para scrollTo simples
      try {
        window.scrollTo({ top, behavior: 'smooth' });
      } catch (err) {
        window.scrollTo(0, top);
      }
    });
  });


  /* ---- 5. REVEAL ON SCROLL (Intersection Observer) ---- */
  const revealEls = document.querySelectorAll('[data-reveal]');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const siblings = [
          ...(entry.target.closest('section')?.querySelectorAll('[data-reveal]') || [])
        ];
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
      const duration = 1800;
      const startTime = performance.now();

      function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
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
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    totalSlides = Math.ceil(cards.length / slidesPerView);
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('button');
      dot.classList.add('rev-dot');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      if (i === currentSlide) dot.classList.add('active');
      dot.addEventListener('click', () => { goTo(i); resetAuto(); });
      dotsContainer.appendChild(dot);
    }
  }

  function goTo(idx) {
    currentSlide = ((idx % totalSlides) + totalSlides) % totalSlides;
    if (!cards[0]) return;
    // Calcula largura real do card incluindo gap
    const cardStyle = window.getComputedStyle(cards[0]);
    const gap = parseFloat(window.getComputedStyle(track).gap) || 25;
    const cardWidth = cards[0].offsetWidth + gap;
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
    let touchStartY = 0;

    track.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    track.addEventListener('touchend', e => {
      const diffX = touchStartX - e.changedTouches[0].clientX;
      const diffY = touchStartY - e.changedTouches[0].clientY;
      // Só troca slide se o gesto foi predominantemente horizontal
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        goTo(currentSlide + (diffX > 0 ? 1 : -1));
        resetAuto();
      }
    }, { passive: true });

    // Keyboard
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { goTo(currentSlide - 1); resetAuto(); }
      if (e.key === 'ArrowRight') { goTo(currentSlide + 1); resetAuto(); }
    });

    // Recalculate on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const newSpv = getSlidesPerView();
        if (newSpv !== slidesPerView) {
          slidesPerView = newSpv;
          currentSlide = 0;
          buildDots();
          goTo(0);
        }
      }, 150);
    });
  }


  /* ---- 8. BACK TO TOP ---- */
  backTop?.addEventListener('click', () => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      window.scrollTo(0, 0);
    }
  });


  /* ---- 9. PARALLAX no texto de fundo do hero ---- */
  const bgText = document.querySelector('.home-bg-text');
  if (bgText) {
    window.addEventListener('scroll', () => {
      bgText.style.transform = `translateY(${window.scrollY * 0.2}px)`;
    }, { passive: true });
  }


  /* ---- 10. TILT effect nos cards de plano (apenas desktop) ---- */
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