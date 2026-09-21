// Theme: persisted choice wins, otherwise follow the OS.
(function () {
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);
  } catch (e) {}

  function current() {
    var attr = root.getAttribute('data-theme');
    if (attr) return attr;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('.theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var next = current() === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) {}
      });
    }

    // Highlight the section currently in view in the nav.
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = map[en.target.id];
        if (a && en.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('active'); });
          a.classList.add('active');
        }
      });
    }, { rootMargin: '-60px 0px -70% 0px' });
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) obs.observe(el);
    });
  });
})();

// Click any figure or clip to see it at full size.
(function () {
  var SELECTOR = '.demo-frame img, .demo-frame video, .pub-thumb, .news-thumb';

  document.addEventListener('DOMContentLoaded', function () {
    var targets = document.querySelectorAll(SELECTOR);
    if (!targets.length) return;

    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.hidden = true;

    var closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = '&times;';
    box.appendChild(closeBtn);
    document.body.appendChild(box);

    var shown = null;
    var opener = null;

    function open(el) {
      var node;
      if (el.tagName === 'VIDEO') {
        node = document.createElement('video');
        node.src = el.currentSrc || el.src;
        node.autoplay = true;
        node.loop = true;
        node.muted = true;
        node.playsInline = true;
        node.controls = true;
      } else {
        node = document.createElement('img');
        node.src = el.currentSrc || el.src;
        node.alt = el.alt || '';
      }
      if (shown) box.removeChild(shown);
      shown = node;
      box.appendChild(node);
      box.hidden = false;
      document.body.classList.add('lightbox-open');
      opener = el;
      closeBtn.focus();
    }

    function close() {
      box.hidden = true;
      document.body.classList.remove('lightbox-open');
      if (shown) { box.removeChild(shown); shown = null; }
      if (opener && opener.focus) { opener.focus(); }
      opener = null;
    }

    Array.prototype.forEach.call(targets, function (el) {
      el.classList.add('zoomable');
      el.tabIndex = 0;
      el.addEventListener('click', function () { open(el); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(el); }
      });
    });

    closeBtn.addEventListener('click', close);
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !box.hidden) close();
    });
  });
})();
