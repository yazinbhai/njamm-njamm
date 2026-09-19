// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Custom Cursor Follower Logic
function initCustomCursor() {
  const cursor = document.querySelector('.custom-cursor');
  const ring = document.querySelector('.custom-cursor-ring');
  
  if (!cursor || !ring) return;

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let ringX = 0, ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (!document.body.classList.contains('custom-cursor-active')) {
      document.body.classList.add('custom-cursor-active');
    }
  });

  gsap.ticker.add(() => {
    // Quick dot follow
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;
    gsap.set(cursor, { x: cursorX, y: cursorY });

    // Slower lag-ring follow
    ringX += (mouseX - ringX) * 0.1;
    ringY += (mouseY - ringY) * 0.1;
    gsap.set(ring, { x: ringX, y: ringY });
  });

  // Cursor Hover Scale States
  const hoverTargets = document.querySelectorAll('a, button, input, textarea, .magnetic-btn');
  hoverTargets.forEach(target => {
    target.addEventListener('mouseenter', () => {
      cursor.classList.add('hovered');
      ring.classList.add('hovered');
    });
    target.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovered');
      ring.classList.remove('hovered');
    });
  });
}

// 1. Hero Reveal Section: Pinned showcase animation
function initHeroReveal() {
  // Initial entrance animation
  const entranceTl = gsap.timeline();
  entranceTl.to('.hero-reveal-element', {
    opacity: 1,
    y: 0,
    duration: 1.0,
    stagger: 0.2,
    ease: 'power1.out'
  })
  .to('.hero-reveal-scale', {
    opacity: 1,
    scale: 1,
    duration: 1.2,
    ease: 'power1.out'
  }, '-=0.8');

  // Pinned scroll behavior as Section 2 enters
  const scrollTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      pin: true,
      scrub: true
    }
  });

  scrollTl.fromTo('.hero-reveal-scale img', 
    { scale: 1, y: 0 },
    { scale: 0.82, y: 100, ease: 'power1.out' }
  )
  .fromTo('.hero-reveal-element', 
    { opacity: 1, y: 0 },
    { opacity: 0, y: -80, stagger: 0.1, ease: 'power1.out' }, 
    0
  )
  .fromTo('#hero video', 
    { opacity: 0.7 },
    { opacity: 0.14, ease: 'power1.out' }, 
    0
  );
}

// Staggered Typography Reveals for Chapters
function initTypographyReveals() {
  const sections = ['#ingredients', '#thickness', '#medium', '#seasoning', '#cta'];
  
  sections.forEach(section => {
    let selectClass = '';
    if (section === '#ingredients') selectClass = '.ingredients-element';
    else if (section === '#thickness') selectClass = '.thickness-element';
    else if (section === '#medium') selectClass = '.medium-element';
    else if (section === '#seasoning') selectClass = '.seasoning-element';
    else if (section === '#cta') selectClass = '.cta-element';

    gsap.to(selectClass, {
      opacity: 1,
      y: 0,
      duration: 1.0,
      stagger: 0.15,
      ease: 'power1.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 60%', // Trigger when section hits 60% viewport visibility
        toggleActions: 'play none none reverse'
      }
    });

    // Scale animations triggered at same visibility
    let scaleClass = '';
    if (section === '#ingredients') scaleClass = '.ingredients-scale';
    else if (section === '#thickness') scaleClass = '.thickness-scale';
    else if (section === '#seasoning') scaleClass = '.seasoning-scale';
    else if (section === '#cta') scaleClass = '.cta-scale';

    if (scaleClass) {
      gsap.to(scaleClass, {
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 60%',
          toggleActions: 'play none none reverse'
        }
      });
    }
  });
}

// 2. Section 3 (Thickness Cut): Multi-layered Parallax
function initThicknessParallax() {
  // Background layer: moves slow (scrub: 0.4 weight equivalent)
  gsap.to('.thickness-bg-layer', {
    y: -30,
    ease: 'none',
    scrollTrigger: {
      trigger: '#thickness',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.4
    }
  });

  // Midground layer: standard speed
  gsap.to('.thickness-mid-layer', {
    y: -70,
    ease: 'none',
    scrollTrigger: {
      trigger: '#thickness',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.8
    }
  });

  // Foreground layer: moves fast (scrub: 1.5 weight equivalent)
  gsap.to('.thickness-fg-layer', {
    y: -140,
    ease: 'none',
    scrollTrigger: {
      trigger: '#thickness',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.5
    }
  });
}

// 3. Sections 4 & 5 (Oil & Salt): Continuous vertical parallax scroll
function initContinuousParallax() {
  // Section 4: Medium
  gsap.to('.medium-bg', {
    y: '-20%',
    ease: 'none',
    scrollTrigger: {
      trigger: '#medium',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });

  // Text layer floats faster
  gsap.to('#medium .relative.z-10', {
    y: -100,
    ease: 'none',
    scrollTrigger: {
      trigger: '#medium',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });

  // Section 5: Seasoning
  // Image card floats slower
  gsap.to('.seasoning-scale', {
    y: -50,
    ease: 'none',
    scrollTrigger: {
      trigger: '#seasoning',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });

  // Text details float faster
  gsap.to('#seasoning .lg\\:col-span-5', {
    y: -120,
    ease: 'none',
    scrollTrigger: {
      trigger: '#seasoning',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });
}

// Magnetic Button Interaction
function initMagneticButtons() {
  const buttons = document.querySelectorAll('.magnetic-btn');
  
  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      gsap.to(btn, {
        x: x * 0.25,
        y: y * 0.25,
        duration: 0.3,
        ease: 'power1.out'
      });
    });
    
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'power1.out'
      });
    });
  });
}

// Smooth Anchor Navigation Handling with GSAP ScrollTo
function initSmoothNavigation() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        gsap.to(window, {
          duration: 1.2,
          scrollTo: {
            y: targetElement,
            offsetY: 60
          },
          ease: 'power2.inOut'
        });
      }
    });
  });
}

// Initialize on Load
window.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initHeroReveal();
  initTypographyReveals();
  initThicknessParallax();
  initContinuousParallax();
  initMagneticButtons();
  initSmoothNavigation();
});
