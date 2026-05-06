/* ============================================
   UMBRI — Main JavaScript
   ============================================ */

(function () {
  'use strict';

  // ---------- Film scratches ----------
  var canvas = document.getElementById('dust-canvas');
  var ctx = canvas.getContext('2d');
  var scratches = [];
  var scratchCount = 12;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function createScratch() {
    var isVertical = Math.random() > 0.15; // mostly vertical like old film
    return {
      x: Math.random() * canvas.width,
      y: -canvas.height * Math.random(),
      length: Math.random() * 250 + 80,
      width: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.4 + 0.15,
      opacity: 0,
      maxOpacity: Math.random() * 0.18 + 0.04,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: Math.random() * 0.008 + 0.003,
      drift: (Math.random() - 0.5) * 0.15,
      angle: isVertical ? (Math.random() - 0.5) * 0.06 : (Math.random() - 0.5) * 0.3,
      life: 0,
      maxLife: Math.random() * 600 + 200
    };
  }

  for (var i = 0; i < scratchCount; i++) {
    var s = createScratch();
    s.life = Math.random() * s.maxLife; // stagger starts
    scratches.push(s);
  }

  function animateScratches() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < scratches.length; i++) {
      var s = scratches[i];

      s.life++;
      s.x += s.drift;
      s.y += s.speed;
      s.phase += s.phaseSpeed;

      // Fade in and out over life
      var lifePct = s.life / s.maxLife;
      if (lifePct < 0.15) {
        s.opacity = s.maxOpacity * (lifePct / 0.15);
      } else if (lifePct > 0.8) {
        s.opacity = s.maxOpacity * ((1 - lifePct) / 0.2);
      } else {
        s.opacity = s.maxOpacity;
      }

      // Flicker
      var flicker = 0.7 + 0.3 * Math.sin(s.phase);
      var alpha = s.opacity * flicker;

      // Reset when done
      if (s.life >= s.maxLife) {
        scratches[i] = createScratch();
        continue;
      }

      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, s.length);
      ctx.strokeStyle = 'rgba(30, 30, 30, ' + alpha + ')';
      ctx.lineWidth = s.width;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    }

    requestAnimationFrame(animateScratches);
  }

  animateScratches();

  // ---------- Navbar scroll effect ----------
  const navbar = document.getElementById('navbar');
  const heroSection = document.getElementById('hero');
  var lastScrollY = window.scrollY;

  function onScroll() {
    var currentY = window.scrollY;
    if (currentY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    // Hide on scroll down, show on scroll up
    if (currentY > lastScrollY && currentY > 80) {
      navbar.classList.add('hidden');
    } else {
      navbar.classList.remove('hidden');
    }
    lastScrollY = currentY;
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Show navbar when mouse moves near top of viewport
  document.addEventListener('mousemove', function (e) {
    if (e.clientY < 60) {
      navbar.classList.remove('hidden');
    }
  });

  // ---------- Mobile nav toggle ----------
  const navToggle = document.querySelector('.nav-toggle');
  const allNavLinks = document.querySelectorAll('.nav-links');

  navToggle.addEventListener('click', function () {
    navToggle.classList.toggle('open');
    allNavLinks.forEach(function (ul) { ul.classList.toggle('open'); });
  });

  // Close mobile nav on link click
  allNavLinks.forEach(function (ul) {
    ul.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.classList.remove('open');
        allNavLinks.forEach(function (u) { u.classList.remove('open'); });
      });
    });
  });

  // ---------- Active nav link on scroll ----------
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a');

  function highlightNav() {
    var scrollPos = window.scrollY + 120;

    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navItems.forEach(function (item) {
          item.classList.remove('active');
          if (item.getAttribute('href') === '#' + id) {
            item.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNav, { passive: true });

  // ---------- Scroll-reveal animations ----------
  var fadeTargets = document.querySelectorAll(
    '.news-card, .video-card, .yt-actions, .gallery-carousel, .ig-cta, .show-item, .contact-wrapper, .music-card, .spotify-actions, .spotify-cta'
  );

  fadeTargets.forEach(function (el) {
    el.classList.add('fade-in');
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  fadeTargets.forEach(function (el) {
    observer.observe(el);
  });

  // ---------- Gallery carousel ----------
  var track = document.getElementById('carousel-track');
  var prevBtn = document.querySelector('.carousel-btn--prev');
  var nextBtn = document.querySelector('.carousel-btn--next');
  var carouselPos = 0;

  // Handle missing images — show placeholder, hide broken img
  var allSlides = document.querySelectorAll('.carousel-slide');
  allSlides.forEach(function (slide) {
    var img = slide.querySelector('img');
    img.addEventListener('load', function () {
      slide.classList.add('has-image');
    });
    img.addEventListener('error', function () {
      img.style.display = 'none';
    });
  });

  var slides = allSlides;

  function getSlidesPerView() {
    var wrapper = document.querySelector('.carousel-track-wrapper');
    var slideW = slides.length ? slides[0].offsetWidth + 16 : 236;
    return Math.max(1, Math.floor(wrapper.offsetWidth / slideW));
  }

  function getSlideWidth() {
    if (slides.length === 0) return 0;
    return slides[0].offsetWidth + 16; // slide width + gap
  }

  function updateCarousel() {
    var perView = getSlidesPerView();
    var maxPos = Math.max(0, slides.length - perView);
    if (carouselPos > maxPos) carouselPos = maxPos;
    if (carouselPos < 0) carouselPos = 0;

    if (slides.length === 0) {
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }

    var offset = carouselPos * getSlideWidth();
    track.style.transform = 'translateX(-' + offset + 'px)';
    prevBtn.disabled = carouselPos <= 0;
    nextBtn.disabled = carouselPos >= maxPos;
  }

  prevBtn.addEventListener('click', function () {
    carouselPos--;
    updateCarousel();
  });

  nextBtn.addEventListener('click', function () {
    carouselPos++;
    updateCarousel();
  });

  window.addEventListener('resize', function () {
    updateCarousel();
  });

  // Delay initial update so broken images get hidden first
  updateCarousel();
  setTimeout(updateCarousel, 500);

  // ---------- Gallery lightbox ----------
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    var img = slides[index].querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    var img = slides[currentIndex].querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % slides.length;
    var img = slides[currentIndex].querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
  }

  slides.forEach(function (slide) {
    slide.addEventListener('click', function () {
      var index = parseInt(slide.getAttribute('data-index'), 10);
      openLightbox(index);
    });
  });

  document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  document.querySelector('.lightbox-prev').addEventListener('click', prevImage);
  document.querySelector('.lightbox-next').addEventListener('click', nextImage);

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });

  // ---------- Video carousel ----------
  var videoTrack   = document.getElementById('video-track');
  var videoPrevBtn = document.getElementById('video-prev');
  var videoNextBtn = document.getElementById('video-next');
  var videoCards   = document.querySelectorAll('.video-card');
  var videoPos     = 0;

  function getVideoCardWidth() {
    return videoCards.length ? videoCards[0].offsetWidth + 20 : 480;
  }

  function getVideoPerView() {
    var wrapper = document.querySelector('.video-track-wrapper');
    return Math.max(1, Math.floor(wrapper.offsetWidth / getVideoCardWidth()));
  }

  function updateVideoCarousel() {
    var perView = getVideoPerView();
    var maxPos  = Math.max(0, videoCards.length - perView);
    if (videoPos > maxPos) videoPos = maxPos;
    if (videoPos < 0)      videoPos = 0;
    videoTrack.style.transform = 'translateX(-' + (videoPos * getVideoCardWidth()) + 'px)';
    videoPrevBtn.disabled = videoPos <= 0;
    videoNextBtn.disabled = videoPos >= maxPos;
  }

  videoPrevBtn.addEventListener('click', function () { videoPos--; updateVideoCarousel(); });
  videoNextBtn.addEventListener('click', function () { videoPos++; updateVideoCarousel(); });
  window.addEventListener('resize', updateVideoCarousel);
  updateVideoCarousel();

  // ---------- Video facades (click-to-embed) ----------
  document.querySelectorAll('.video-facade').forEach(function (facade) {
    facade.addEventListener('click', function () {
      var src = facade.getAttribute('data-src');
      var iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.frameBorder = '0';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:0;';
      facade.innerHTML = '';
      facade.appendChild(iframe);
      facade.classList.remove('video-facade');
    });
  });

  // ---------- Contact form ----------
  var form = document.getElementById('contact-form');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = form.querySelector('.btn-submit');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    fetch('https://formsubmit.co/ajax/bmenteshashvili@gmail.com', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    })
      .then(function (res) { return res.json(); })
      .then(function () {
        btn.textContent = 'Message Sent!';
        btn.style.background = 'var(--accent)';
        btn.style.color = 'var(--bg-darkest)';
        form.reset();
        setTimeout(function () {
          btn.textContent = 'Send Message';
          btn.disabled = false;
          btn.style.background = '';
          btn.style.color = '';
        }, 3500);
      })
      .catch(function () {
        btn.textContent = 'Send Message';
        btn.disabled = false;
        alert('Something went wrong — please try again.');
      });
  });
})();
