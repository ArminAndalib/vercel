(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  // Footer year
  var yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  // Scroll progress + navbar state
  var progress = $('#progress');
  var navbar = $('#navbar');
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    if (progress) progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    if (navbar) navbar.classList.toggle('scrolled', h.scrollTop > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // Mobile menu
  var menuBtn = $('#menuBtn');
  var mobileMenu = $('#mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      var open = menuBtn.classList.toggle('open');
      mobileMenu.classList.toggle('open', open);
    });
    $$('.mobile-link').forEach(function (a) {
      a.addEventListener('click', function () {
        menuBtn.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }

  // Active nav link
  var links = $$('.nav-link');
  if (hasIO && links.length) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (l) { l.classList.toggle('active', l.dataset.section === e.target.id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (l) {
      var s = document.getElementById(l.dataset.section);
      if (s) navObs.observe(s);
    });
  }

  // Reveal on scroll
  var reveals = $$('.reveal');
  if (hasIO) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (r) { revObs.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add('in'); });
  }

  // Count-up stats
  function countUp(el) {
    var target = parseInt(el.dataset.target, 10) || 0;
    var suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    var start = null, dur = 1100;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (hasIO) {
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); cObs.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    $$('.stat-num').forEach(function (n) { cObs.observe(n); });
  } else {
    $$('.stat-num').forEach(function (n) { n.textContent = n.dataset.target + (n.dataset.suffix || ''); });
  }

  // Name scramble on load
  var nameEl = $('[data-scramble-load]');
  if (nameEl && !reduceMotion) {
    var finalText = nameEl.textContent;
    var chars = '!<>-_\\/[]{}=+*^?#01';
    var frame = 0, total = 28;
    nameEl.setAttribute('aria-label', finalText);
    var timer = setInterval(function () {
      var out = '';
      for (var i = 0; i < finalText.length; i++) {
        var ch = finalText.charAt(i);
        out += (ch === ' ' || i < (frame / total) * finalText.length) ? ch : chars.charAt(Math.floor(Math.random() * chars.length));
      }
      nameEl.textContent = out;
      if (++frame > total) { clearInterval(timer); nameEl.textContent = finalText; }
    }, 40);
  }

  // Collapsibles (skill branches + project items)
  function setOpen(item, open) {
    clearTimeout(item._t);
    item.classList.toggle('open', open);
    if (open) {
      // let tooltips escape the box once the open animation has finished
      item._t = setTimeout(function () { item.classList.add('settled'); }, reduceMotion ? 0 : 380);
    } else {
      item.classList.remove('settled');
    }
    var trigger = $('.branch-root, .project-meta', item);
    if (trigger) trigger.setAttribute('aria-expanded', String(open));
  }
  $$('.branch-root, .project-meta').forEach(function (trigger) {
    var item = trigger.closest('.skill-branch, .project-item');
    function toggle() { setOpen(item, !item.classList.contains('open')); }
    trigger.addEventListener('click', toggle);
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
    setOpen(item, item.classList.contains('open'));
  });

  // Skill counts
  $$('.skill-branch').forEach(function (b) {
    var n = $$('.skill-node', b).length;
    var c = $('.count', b);
    if (c) c.textContent = n + (n === 1 ? ' item' : ' items');
  });

  // Expand / collapse all
  $$('.expand-all').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var items = $$(btn.dataset.target);
      var anyClosed = items.some(function (i) { return !i.classList.contains('open'); });
      items.forEach(function (i) { setOpen(i, anyClosed); });
      btn.textContent = anyClosed ? 'collapse all' : 'expand all';
    });
  });

  // Matrix rain in the hero (paused when off-screen or tab hidden)
  var cv = $('#matrix');
  if (cv && cv.getContext && !reduceMotion) {
    var ctx = cv.getContext('2d');
    var fs = 16, w = 0, h = 0, drops = [], running = false, last = 0;
    var glyphs = '01ABCDEF{}[]<>/\\=+*#$%&;:'.split('');
    var size = function () {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = Math.max(1, Math.floor(w * dpr));
      cv.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var cols = Math.ceil(w / fs);
      drops = [];
      for (var i = 0; i < cols; i++) drops.push(Math.floor(Math.random() * -40));
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
    };
    var draw = function (ts) {
      if (!running) return;
      requestAnimationFrame(draw);
      if (ts - last < 60) return;
      last = ts;
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#00ff5e';
      ctx.font = fs + 'px "JetBrains Mono", monospace';
      for (var i = 0; i < drops.length; i++) {
        ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * fs, drops[i] * fs);
        if (drops[i] * fs > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    var visible = true;
    var update = function () {
      var should = visible && !document.hidden;
      if (should && !running) { running = true; requestAnimationFrame(draw); }
      else if (!should) { running = false; }
    };
    size();
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 200); });
    document.addEventListener('visibilitychange', update);
    if (hasIO) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; update(); }).observe(cv);
    }
    update();
  }
})();
