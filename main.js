/* =========================================================
   湖畔聖誕 · Lakeside Christmas
   Interactions: snow, countdown, reveal, tilt, lightbox
   ========================================================= */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  /* ---------------- 飄雪 ---------------- */
  const canvas = document.getElementById('snow');
  const ctx = canvas.getContext('2d');
  let flakes = [];
  let rafId = null;
  let running = true;
  let width = 0;
  let height = 0;
  let dpr = 1;

  function makeFlake(randomY) {
    const depth = Math.random();
    return {
      x: Math.random() * width,
      y: randomY ? Math.random() * height : -20 - Math.random() * height * 0.4,
      r: 0.7 + depth * 2.1,
      speed: 0.25 + depth * 1.15,
      drift: (Math.random() - 0.5) * 0.7,
      swing: Math.random() * Math.PI * 2,
      swingSpeed: 0.004 + Math.random() * 0.012,
      alpha: 0.25 + depth * 0.55
    };
  }

  function buildFlakes() {
    const base = Math.round((width * height) / 16000);
    const count = Math.max(40, Math.min(reduceMotion ? 40 : 190, base));
    flakes = Array.from({ length: count }, () => makeFlake(true));
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildFlakes();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (const f of flakes) {
      f.swing += f.swingSpeed;
      f.x += f.drift + Math.sin(f.swing) * 0.45;
      f.y += f.speed;

      if (f.y - f.r > height + 10) {
        Object.assign(f, makeFlake(false));
        f.x = Math.random() * width;
      }
      if (f.x < -20) f.x = width + 20;
      if (f.x > width + 20) f.x = -20;

      const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 3);
      glow.addColorStop(0, 'rgba(255,255,255,' + f.alpha + ')');
      glow.addColorStop(0.5, 'rgba(226,244,255,' + f.alpha * 0.45 + ')');
      glow.addColorStop(1, 'rgba(226,244,255,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    if (running) rafId = requestAnimationFrame(draw);
  }

  function startSnow() {
    if (rafId === null) {
      running = true;
      rafId = requestAnimationFrame(draw);
    }
  }
  function stopSnow() {
    running = false;
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    ctx.clearRect(0, 0, width, height);
  }

  resize();
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 180);
  });
  if (!reduceMotion) startSnow();

  const snowToggle = document.getElementById('snowToggle');
  snowToggle.addEventListener('click', function () {
    const on = snowToggle.getAttribute('aria-pressed') === 'true';
    snowToggle.setAttribute('aria-pressed', String(!on));
    snowToggle.querySelector('.label').textContent = on ? '雪停了' : '下雪中';
    canvas.style.opacity = on ? '0' : '1';
    if (on) {
      setTimeout(stopSnow, 600);
    } else {
      startSnow();
    }
  });

  /* ---------------- 聖誕倒數 ---------------- */
  const cd = document.getElementById('countdown');
  const label = document.getElementById('countdownLabel');
  const out = {
    days: cd.querySelector('[data-days]'),
    hours: cd.querySelector('[data-hours]'),
    minutes: cd.querySelector('[data-minutes]'),
    seconds: cd.querySelector('[data-seconds]')
  };

  function christmasTarget() {
    const now = new Date();
    const y = now.getFullYear();
    let target = new Date(y, 11, 25, 0, 0, 0);
    // 聖誕節當天整天都算「就是今天」，跨過 26 日後改倒數明年
    if (now > new Date(y, 11, 26, 0, 0, 0)) {
      target = new Date(y + 1, 11, 25, 0, 0, 0);
    }
    return target;
  }

  const pad = function (n) { return String(n).padStart(2, '0'); };

  function tick() {
    const now = new Date();
    const target = christmasTarget();
    const isChristmasDay = now.getMonth() === 11 && now.getDate() === 25;

    if (isChristmasDay) {
      label.textContent = '今天是聖誕節，聖誕快樂！';
      if (!cd.dataset.done) {
        cd.dataset.done = '1';
        Object.keys(out).forEach(function (k) { out[k].textContent = '00'; });
      }
      return;
    }

    const diff = Math.max(0, target - now);
    const s = Math.floor(diff / 1000);
    out.days.textContent = pad(Math.floor(s / 86400));
    out.hours.textContent = pad(Math.floor((s % 86400) / 3600));
    out.minutes.textContent = pad(Math.floor((s % 3600) / 60));
    out.seconds.textContent = pad(s % 60);
  }
  tick();
  setInterval(tick, 1000);

  /* ---------------- 導覽列狀態 ---------------- */
  const nav = document.querySelector('.nav');
  const onScroll = function () {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------- 進場動畫 ---------------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------------- 卡片 3D 傾斜 ---------------- */
  if (!isTouch && !reduceMotion) {
    document.querySelectorAll('.card').forEach(function (card) {
      let frame = null;
      card.addEventListener('pointermove', function (e) {
        if (frame) return;
        frame = requestAnimationFrame(function () {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform =
            'rotateY(' + (px * 7).toFixed(2) + 'deg) rotateX(' +
            (-py * 7).toFixed(2) + 'deg) translateY(-6px)';
          frame = null;
        });
      });
      card.addEventListener('pointerleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ---------------- 燈箱 ---------------- */
  const lightbox = document.getElementById('lightbox');
  const lbImage = document.getElementById('lbImage');
  const lbClose = document.getElementById('lbClose');
  let lastFocus = null;

  function openLightbox(src, alt) {
    lastFocus = document.activeElement;
    lbImage.src = src;
    lbImage.alt = alt || '';
    lightbox.hidden = false;
    requestAnimationFrame(function () { lightbox.classList.add('open'); });
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(function () {
      lightbox.hidden = true;
      lbImage.src = '';
    }, 320);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.querySelectorAll('[data-lightbox]').forEach(function (el) {
    el.addEventListener('click', function () {
      const img = el.querySelector('img');
      openLightbox(el.dataset.full, img ? img.alt : '');
    });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const img = el.querySelector('img');
        openLightbox(el.dataset.full, img ? img.alt : '');
      }
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });

  /* ---------------- 隨機祝福語 ---------------- */
  const greetings = [
    '願你的聖誕夜，有著湖水一樣清澈的好夢。',
    '願你今年的願望，都被溫柔地實現。',
    '願你身邊有爐火、有熱可可，還有一個願意聽你說話的人。',
    '願所有走過的路，最後都通回溫暖的地方。',
    '願湖面的光，替你把新的一年照亮。',
    '聖誕快樂——願你被這個世界，輕輕地喜歡著。'
  ];
  const greetBtn = document.getElementById('greetBtn');
  const greeting = document.getElementById('greeting');
  let gi = 0;
  let swapping = false;

  greetBtn.addEventListener('click', function () {
    if (swapping) return;
    swapping = true;
    greeting.classList.add('swap');
    setTimeout(function () {
      gi = (gi + 1) % greetings.length;
      greeting.textContent = greetings[gi];
      greeting.classList.remove('swap');
      swapping = false;
    }, 320);
  });

  /* ---------------- 年份 ---------------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
