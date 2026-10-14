(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Footer year
  var yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  // Scroll progress + navbar state
  var progress = $('#progress');
  var navbar = $('#navbar');
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    navbar.classList.toggle('scrolled', h.scrollTop > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var menuBtn = $('#menuBtn');
  var mobileMenu = $('#mobileMenu');
  menuBtn.addEventListener('click', function () {
    menuBtn.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
  $$('.mobile-link').forEach(function (a) {
    a.addEventListener('click', function () {
      menuBtn.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });

  // Active nav link
  var links = $$('.nav-link');
  var sections = links.map(function (l) { return document.getElementById(l.dataset.section); });
  if ('IntersectionObserver' in window) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (l) {
            l.classList.toggle('active', l.dataset.section === e.target.id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { if (s) navObs.observe(s); });
  }

  // Reveal on scroll
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
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
    var start = null, dur = 1100;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
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
  if (nameEl && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var finalText = nameEl.textContent;
    var chars = '!<>-_\\/[]{}=+*^?#01';
    var frame = 0, total = 28;
    var timer = setInterval(function () {
      var out = '';
      for (var i = 0; i < finalText.length; i++) {
        var ch = finalText[i];
        if (ch === ' ') { out += ' '; continue; }
        out += (i < (frame / total) * finalText.length) ? ch : chars[Math.floor(Math.random() * chars.length)];
      }
      nameEl.textContent = out;
      if (++frame > total) { clearInterval(timer); nameEl.textContent = finalText; }
    }, 40);
  }

  // Collapsibles (skill branches + project items)
  function setOpen(item, open) {
    item.classList.toggle('open', open);
    var trigger = $('.branch-root, .project-meta', item);
    if (trigger) trigger.setAttribute('aria-expanded', String(open));
  }
  function bindToggle(trigger) {
    var item = trigger.closest('.skill-branch, .project-item');
    function toggle() { setOpen(item, !item.classList.contains('open')); }
    trigger.addEventListener('click', toggle);
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
    setOpen(item, item.classList.contains('open'));
  }
  $$('.branch-root, .project-meta').forEach(bindToggle);

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
})();
