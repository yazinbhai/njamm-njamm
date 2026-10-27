/**
 * Njamm Njamm - Testimonial Carousel Controller
 * Handles slider transitions, swipe gestures, auto-rotation, and reactive updates.
 */
(function() {
  let testimonials = [];
  let currentIndex = 0;
  let autoPlayTimer = null;
  const AUTOPLAY_DELAY = 6000;

  async function initCarousel() {
    const textEl = document.getElementById('testimonial-text');
    const authorEl = document.getElementById('testimonial-author');
    const dotsContainer = document.getElementById('testimonial-dots');
    const prevBtn = document.getElementById('testimonial-prev');
    const nextBtn = document.getElementById('testimonial-next');
    const section = document.getElementById('testimonials');

    if (!textEl || !authorEl || !dotsContainer) return;

    async function loadData() {
      if (window.TestimonialsService) {
        testimonials = await window.TestimonialsService.getActive();
      } else if (window.DEFAULT_TESTIMONIALS) {
        testimonials = window.DEFAULT_TESTIMONIALS;
      } else {
        testimonials = [
          {
            id: "1",
            text: "Njamm Njamm products are so delicious. Banana chips are thin and crispy. The Sharkkaravaratty is sweet",
            author: "Yazin Azad"
          }
        ];
      }

      if (currentIndex >= testimonials.length) {
        currentIndex = 0;
      }
      renderDots();
      updateSlide(false);
    }

    function renderDots() {
      dotsContainer.innerHTML = '';
      if (testimonials.length <= 1) {
        // Single dot or hidden
        const dot = document.createElement('span');
        dot.className = 'w-2 h-2 rounded-full bg-white/60';
        dotsContainer.appendChild(dot);
        if (prevBtn) prevBtn.style.opacity = '0.2';
        if (nextBtn) nextBtn.style.opacity = '0.2';
        return;
      }

      if (prevBtn) prevBtn.style.opacity = '1';
      if (nextBtn) nextBtn.style.opacity = '1';

      testimonials.forEach((_, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('aria-label', `Go to testimonial ${idx + 1}`);
        btn.className = `w-2 h-2 rounded-full transition-all duration-300 ${
          idx === currentIndex 
            ? 'bg-white w-5' 
            : 'bg-white/30 hover:bg-white/60'
        }`;
        btn.addEventListener('click', () => {
          if (idx !== currentIndex) {
            currentIndex = idx;
            updateSlide(true);
            resetAutoPlay();
          }
        });
        dotsContainer.appendChild(btn);
      });
    }

    function updateSlide(animate = true) {
      if (!testimonials.length) return;
      const current = testimonials[currentIndex];

      if (animate) {
        textEl.style.opacity = '0';
        authorEl.style.opacity = '0';
        textEl.style.transform = 'translateY(8px)';
        authorEl.style.transform = 'translateY(8px)';

        setTimeout(() => {
          textEl.textContent = current.text;
          authorEl.textContent = current.author;

          textEl.style.opacity = '1';
          authorEl.style.opacity = '1';
          textEl.style.transform = 'translateY(0)';
          authorEl.style.transform = 'translateY(0)';
        }, 180);
      } else {
        textEl.textContent = current.text;
        authorEl.textContent = current.author;
        textEl.style.opacity = '1';
        authorEl.style.opacity = '1';
        textEl.style.transform = 'translateY(0)';
        authorEl.style.transform = 'translateY(0)';
      }

      // Update dots
      const dots = dotsContainer.querySelectorAll('button');
      dots.forEach((dot, idx) => {
        if (idx === currentIndex) {
          dot.className = 'w-5 h-2 rounded-full bg-white transition-all duration-300';
        } else {
          dot.className = 'w-2 h-2 rounded-full bg-white/30 hover:bg-white/60 transition-all duration-300';
        }
      });
    }

    function nextSlide() {
      if (testimonials.length <= 1) return;
      currentIndex = (currentIndex + 1) % testimonials.length;
      updateSlide(true);
      resetAutoPlay();
    }

    function prevSlide() {
      if (testimonials.length <= 1) return;
      currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
      updateSlide(true);
      resetAutoPlay();
    }

    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    // Touch Swipe gestures for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    if (section) {
      section.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      section.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }, { passive: true });

      function handleSwipe() {
        const threshold = 40;
        if (touchEndX < touchStartX - threshold) {
          nextSlide();
        } else if (touchEndX > touchStartX + threshold) {
          prevSlide();
        }
      }

      // Pause autoplay on mouse hover
      section.addEventListener('mouseenter', () => {
        clearInterval(autoPlayTimer);
      });
      section.addEventListener('mouseleave', () => {
        startAutoPlay();
      });
    }

    function startAutoPlay() {
      clearInterval(autoPlayTimer);
      if (testimonials.length > 1) {
        autoPlayTimer = setInterval(nextSlide, AUTOPLAY_DELAY);
      }
    }

    function resetAutoPlay() {
      startAutoPlay();
    }

    // Initial load
    await loadData();
    startAutoPlay();

    // Listen for updates from Admin page or cross-tab
    window.addEventListener('njamm:testimonials-updated', () => {
      loadData();
    });
    window.addEventListener('storage', (e) => {
      if (e.key === 'njamm_testimonials_v1' || e.key === 'njamm_testimonials_ping') {
        loadData();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousel);
  } else {
    initCarousel();
  }
})();
