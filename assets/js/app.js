/* ============================================================
   app.js — vanilla router + renderer. No framework, no build.
   - Pages: home, studio, services, blog, blog post, contact
   - KO/EN + dark/light toggles (saved in localStorage)
   - Blog posts loaded from /posts/*.md and rendered with marked.js
   ============================================================ */
(function () {
  'use strict';

  var state = {
    lang: localStorage.getItem('lrs_lang') || 'ko',
    theme: localStorage.getItem('lrs_theme') || 'light',
    font: sessionStorage.getItem('lrs_font') || 'pixel',
    menuOpen: false,
    lightboxSrc: null
  };

  var FONTS = [
    { id: 'pixel', label: 'PIXEL' },
    { id: 'mono', label: 'MONO' },
    { id: 'sans', label: 'SANS' }
  ];
  function fontLabel() { var f = FONTS.filter(function (x) { return x.id === state.font; })[0]; return (f || FONTS[0]).label; }

  var postsIndex = [];      // filled from posts/posts.json
  var projectsIndex = [];   // filled from projects/projects.json
  var mdCache = {};         // slug+lang -> html (blog)
  var projCache = {};       // slug+lang -> html (projects)
  var BLOG_PAGE_SIZE = 8;

  function L() { return state.lang; }
  function t(k) { return (window.I18N[state.lang] && window.I18N[state.lang][k]) || k; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  }); }
  function stripFrontmatter(md) { return md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, ''); }

  /* ---------- routing ---------- */
  function route() {
    var h = location.hash.replace(/^#\/?/, '');   // "", "studio", "blog", "blog/slug"
    var parts = h.split('/').filter(Boolean);
    if (parts.length === 0) return { page: 'home' };
    if (parts[0] === 'blog' && parts[1] === 'page' && parts[2]) return { page: 'blog', pageNum: parseInt(parts[2], 10) || 1 };
    if (parts[0] === 'blog' && parts[1]) return { page: 'post', slug: parts[1] };
    if (parts[0] === 'work' && parts[1]) return { page: 'project', slug: parts[1] };
    return { page: parts[0] };
  }
  function go(hash) { location.hash = hash; }

  /* ---------- reusable bits ---------- */
  function navLink(page, key, current) {
    var active = (page === current) || (page === 'blog' && current === 'post');
    return '<span class="nav-link' + (active ? ' active' : '') + '" data-action="nav" data-page="' + page + '">' + esc(t(key)) + '</span>';
  }

  function navItems(current) {
    return navLink('studio', 'nav_studio', current) +
      navLink('services', 'nav_services', current) +
      navLink('blog', 'nav_blog', current) +
      navLink('contact', 'nav_contact', current) +
      '<div class="seg">' +
        '<span class="' + (L() === 'ko' ? 'on' : '') + '" data-action="lang" data-lang="ko">KO</span>' +
        '<span class="' + (L() === 'en' ? 'on' : '') + '" data-action="lang" data-lang="en">EN</span>' +
      '</div>' +
      '<button class="theme-btn" style="width:auto;padding:0 9px;font-size:11px;letter-spacing:1px;color:var(--muted)" data-action="font" title="font">' + fontLabel() + '</button>' +
      '<button class="theme-btn" data-action="theme" title="theme">' + (state.theme === 'dark' ? '☾' : '☀') + '</button>';
  }

  /* nav-scrim/nav-drawer are rendered as siblings of .nav (not nested inside it) so
     .nav's backdrop-filter can't hijack their fixed-position containing block. */
  function nav(current) {
    var items = navItems(current);
    return '' +
      '<div class="nav"><div class="nav-inner">' +
        '<div class="brand" data-action="nav" data-page="home">' +
          '<img class="pixel" src="assets/img/logo-raccoon-bust.png" alt="Lazy Raccoon">' +
          '<span>lazy_raccoon<span class="accent">_studio</span></span>' +
        '</div>' +
        '<div class="nav-links">' + items + '</div>' +
        '<button class="nav-burger' + (state.menuOpen ? ' on' : '') + '" data-action="menu" aria-label="menu" aria-expanded="' + (state.menuOpen ? 'true' : 'false') + '"><span></span><span></span><span></span></button>' +
      '</div></div>' +
      '<div class="nav-scrim' + (state.menuOpen ? ' open' : '') + '" data-action="menu"></div>' +
      '<div class="nav-drawer' + (state.menuOpen ? ' open' : '') + '" role="dialog" aria-modal="true" aria-label="menu">' +
        '<button class="nav-drawer-close" data-action="menu" aria-label="close">✕</button>' +
        items +
      '</div>';
  }

  function promptLine(text) {
    return '<span class="p">➜</span> <span class="path">~</span> ' + esc(text);
  }

  function mascotBand(page) {
    return '' +
      '<div class="container"><div class="mascot-band">' +
        '<div class="mascot-frame"><img src="assets/img/raccoon-sleep.gif" alt="Lazy Raccoon mascot"></div>' +
        '<div class="mascot-copy">' +
          '<div class="section-label">' + esc(t('foot_label')) + '</div>' +
          '<h2>' + esc(t('foot_cta_h')) + '</h2>' +
          '<p>' + esc(t('foot_cta_p')) + '</p>' +
          '<div class="mascot-links">' +
            '<div class="row"><span class="k">email</span><a href="mailto:' + esc(window.CONTACT.email) + '">' + esc(window.CONTACT.email) + '</a></div>' +
            '<div class="row"><span class="k">github</span><a href="https://' + esc(window.CONTACT.github) + '">' + esc(window.CONTACT.github) + '</a></div>' +
          '</div>' +
          (page === 'contact' ? '' : '<a class="btn" data-action="nav" data-page="contact">' + esc(t('cta_btn')) + '</a>') +
        '</div>' +
      '</div></div>';
  }

  function footer() {
    return '' +
      '<div class="footer"><div class="footer-inner">' +
        '<div class="footer-brand"><span>' + esc(t('rights')) + '</span></div>' +
        '<div class="footer-built">' +
          '<div class="foot-mascot" title="typing raccoon">' +
            '<div class="rc-glyphs"><span>{ }</span><span>&lt;/&gt;</span><span>~$</span></div>' +
            '<img class="rc pixel" src="assets/img/raccoon-typing.png" alt="Lazy Raccoon coding">' +
          '</div>' +
        '</div>' +
      '</div></div>';
  }

  /* ---------- pages ---------- */
  function pageHome() {
    var build = window.SERVICES.map(function (s) {
      return '<div class="build-cell"><div class="id">' + esc(s.id[L()]) + '</div><h3>' + esc(s.title) + '</h3><p>' + esc(s.d[L()]) + '</p></div>';
    }).join('');

    var work = projectsIndex.map(function (p) {
      var meta = p.type[L()] + ' · ' + p.year + ' · ' + p.status[L()];
      return '<div class="work-card" data-action="project" data-slug="' + esc(p.slug) + '" style="cursor:pointer">' +
        '<div class="work-cover"><img class="pixel" src="assets/img/logo-raccoon-bust.png" alt=""></div>' +
        '<div class="work-body"><div class="work-name">' + esc(p.name) + '</div><div class="work-meta">' + esc(meta) + '</div><p>' + esc(p.blurb[L()]) + '</p></div>' +
      '</div>';
    }).join('');

    var devlog = postsIndex.slice(0, 3).map(function (p) {
      return '<div class="devlog-row" data-action="post" data-slug="' + esc(p.slug) + '">' +
        '<span class="date">' + esc(p.date) + '</span><span class="title">' + esc(p.title[L()]) + '</span><span class="read">' + esc(t('read')) + '</span>' +
      '</div>';
    }).join('');

    return '<div class="page">' +
      '<div class="container">' +
        '<div class="hero"><div class="terminal">' +
          '<div class="term-bar"><span class="dot" style="background:#ff5f56"></span><span class="dot" style="background:#ffbd2e"></span><span class="dot" style="background:#27c93f"></span><span class="term-title">~/lazy-raccoon-studio — zsh</span></div>' +
          '<div class="term-body">' +
            '<div>' + promptLine('whoami') + '</div>' +
            '<div class="hero-name">' + esc(t('hero_name')) + '</div>' +
            '<div class="hero-subline">' + esc(t('hero_sub')) + '</div>' +
            '<div>' + promptLine('cat manifesto.txt') + '</div>' +
            '<div class="manifesto">' + esc(t('hero_manifesto')) + '</div>' +
            '<div class="hero-actions">' +
              '<span>' + promptLine('./explore') + '</span>' +
              '<a class="btn" data-action="nav" data-page="services">./services</a>' +
              '<a class="btn-ghost" data-action="nav" data-page="contact">./contact</a>' +
              '<span class="cursor"></span>' +
            '</div>' +
          '</div>' +
        '</div></div>' +

        '<div class="block"><div class="section-label">' + esc(t('build_label')) + '</div><div class="build-grid">' + build + '</div></div>' +

        '<div class="block"><div class="head-row"><span class="section-label" style="margin:0">' + esc(t('work_label')) + '</span><span class="more" data-action="nav" data-page="services">' + esc(t('work_all')) + '</span></div>' +
          '<div class="work-grid">' + work + '</div><div class="note">' + esc(t('work_note')) + '</div></div>' +

        '<div class="block"><div class="head-row"><span class="section-label" style="margin:0">' + esc(t('devlog_label')) + '</span><span class="more" data-action="nav" data-page="blog">' + esc(t('devlog_all')) + '</span></div>' +
          '<div class="devlog">' + devlog + '</div></div>' +
      '</div>' +
    '</div>';
  }

  function pageStudio() {
    var values = window.VALUES.map(function (v) {
      return '<div class="value"><h3><span class="accent">#</span> ' + esc(v.h[L()]) + '</h3><p>' + esc(v.d[L()]) + '</p></div>';
    }).join('');
    return '<div class="page"><div class="container" style="padding-top:56px">' +
      '<div class="cmd">' + promptLine(t('studio_cmd')) + '</div>' +
      '<h1 class="page-h1" style="max-width:760px">' + esc(t('studio_h')) + '</h1>' +
      '<p class="lead">' + esc(t('studio_p1')) + '</p>' +
      '<p class="lead">' + esc(t('studio_p2')) + '</p>' +
      '<div class="mission"><div class="section-label" style="margin-bottom:12px">' + esc(t('mission_label')) + '</div><p>' + esc(t('mission')) + '</p></div>' +
      '<div class="block"><div class="section-label">' + esc(t('values_label')) + '</div><div class="values-grid">' + values + '</div></div>' +
    '</div></div>';
  }

  function pageServices() {
    var list = window.SERVICES.map(function (s) {
      var items = s.items[L()].map(function (line) { return '<div class="svc-item"><span class="b">▸</span> ' + esc(line) + '</div>'; }).join('');
      return '<div class="svc"><div><div class="id">' + esc(s.id[L()]) + '</div><h3>' + esc(s.title) + '</h3><p>' + esc(s.d[L()]) + '</p></div><div class="svc-items">' + items + '</div></div>';
    }).join('');
    var steps = window.STEPS.map(function (s) {
      return '<div class="step"><div class="n">' + esc(s.n) + '</div><h4>' + esc(s.h[L()]) + '</h4><p>' + esc(s.d[L()]) + '</p></div>';
    }).join('');
    var chips = window.STACK.map(function (x) { return '<span class="chip">' + esc(x) + '</span>'; }).join('');
    return '<div class="page"><div class="container" style="padding-top:56px">' +
      '<div class="cmd">' + promptLine(t('services_cmd')) + '</div>' +
      '<h1 class="page-h1">' + esc(t('services_h')) + '</h1>' +
      '<p class="page-sub">' + esc(t('services_sub')) + '</p>' +
      '<div class="svc-list">' + list + '</div>' +
      '<div class="block"><div class="section-label">' + esc(t('process_label')) + '</div><div class="process-grid">' + steps + '</div></div>' +
      '<div class="block"><div class="section-label">' + esc(t('stack_label')) + '</div><div class="stack">' + chips + '</div></div>' +
    '</div></div>';
  }

  function pageBlog(pageNum) {
    var totalPages = Math.max(1, Math.ceil(postsIndex.length / BLOG_PAGE_SIZE));
    var page = Math.min(Math.max(pageNum || 1, 1), totalPages);
    var start = (page - 1) * BLOG_PAGE_SIZE;
    var pageItems = postsIndex.slice(start, start + BLOG_PAGE_SIZE);

    var rows = pageItems.map(function (p) {
      return '<div class="blog-row" data-action="post" data-slug="' + esc(p.slug) + '">' +
        '<span class="date">' + esc(p.date) + '</span>' +
        '<div class="mid"><div class="blog-meta"><span class="tag">' + esc(p.tag) + '</span><span class="readtime">' + esc(p.read) + ' ' + esc(t('min_read')) + '</span></div>' +
        '<h3>' + esc(p.title[L()]) + '</h3><p>' + esc(p.excerpt[L()]) + '</p></div>' +
        '<span class="readtime">' + esc(t('read')) + '</span>' +
      '</div>';
    }).join('');
    return '<div class="page"><div class="container" style="padding-top:56px">' +
      '<div class="cmd">' + promptLine(t('blog_cmd')) + '</div>' +
      '<h1 class="page-h1">' + esc(t('blog_h')) + '</h1>' +
      '<p class="page-sub" style="max-width:640px">' + esc(t('blog_sub')) + '</p>' +
      rows +
      pagination(page, totalPages) +
    '</div></div>';
  }

  function pagination(page, totalPages) {
    if (totalPages <= 1) return '';
    var nums = '';
    for (var i = 1; i <= totalPages; i++) {
      nums += '<span class="page-num' + (i === page ? ' on' : '') + '" data-action="nav-hash" data-hash="#/blog/page/' + i + '">' + i + '</span>';
    }
    var prevOn = page > 1;
    var nextOn = page < totalPages;
    return '<div class="pagination">' +
      '<span class="page-arrow' + (prevOn ? '' : ' disabled') + '" data-action="nav-hash" data-hash="#/blog/page/' + (page - 1) + '">‹ ' + esc(t('page_prev')) + '</span>' +
      '<span class="page-nums">' + nums + '</span>' +
      '<span class="page-arrow' + (nextOn ? '' : ' disabled') + '" data-action="nav-hash" data-hash="#/blog/page/' + (page + 1) + '">' + esc(t('page_next')) + ' ›</span>' +
    '</div>';
  }

  function pagePost(slug) {
    var meta = postsIndex.filter(function (p) { return p.slug === slug; })[0];
    if (!meta) { go('#/blog'); return ''; }
    var body = '<p style="color:var(--muted)">' + esc(t('loading')) + '</p>';
    var key = slug + '.' + L();
    if (mdCache[key]) body = mdCache[key];
    return '<div class="page"><div class="post">' +
      '<span class="back" data-action="nav" data-page="blog">' + esc(t('back')) + '</span>' +
      '<div class="meta"><span class="tag">' + esc(meta.tag) + '</span><span class="readtime">' + esc(meta.date) + ' · ' + esc(meta.read) + ' ' + esc(t('min_read')) + '</span></div>' +
      '<div class="post-body" id="post-body">' + body + '</div>' +
      '<div class="post-foot"><span class="back" data-action="nav" data-page="blog">' + esc(t('back')) + '</span></div>' +
    '</div></div>';
  }

  function loadPost(slug) {
    var key = slug + '.' + L();
    if (mdCache[key]) { injectPost(mdCache[key]); return; }
    fetch('posts/' + slug + '.' + L() + '.md')
      .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
      .then(function (md) {
        md = stripFrontmatter(md);
        var html = window.marked ? window.marked.parse(md) : md;
        mdCache[key] = html;
        injectPost(html);
      })
      .catch(function () { injectPost('<p style="color:var(--muted)">Post not found.</p>'); });
  }
  function injectPost(html) {
    var el = document.getElementById('post-body');
    if (el) el.innerHTML = html;
  }

  /* ---------- project detail ---------- */
  function pageProject(slug) {
    var meta = projectsIndex.filter(function (p) { return p.slug === slug; })[0];
    if (!meta) { go('#/'); return ''; }
    var metaLine = meta.type[L()] + ' · ' + meta.year + ' · ' + meta.status[L()];
    var body = projCache[slug + '.' + L()] || '<p style="color:var(--muted)">' + esc(t('loading')) + '</p>';
    return '<div class="page"><div class="post">' +
      '<span class="back" data-action="nav" data-page="home">' + esc(t('proj_back')) + '</span>' +
      '<div class="meta"><span class="tag">' + esc(meta.tag) + '</span><span class="readtime">' + esc(metaLine) + '</span></div>' +
      '<div class="work-cover" style="height:200px;border:1px solid var(--border2);border-radius:12px;margin:8px 0 24px"><img class="pixel" src="assets/img/logo-raccoon-bust.png" alt=""></div>' +
      '<div class="post-body" id="post-body">' + body + '</div>' +
      '<div class="post-foot"><span class="back" data-action="nav" data-page="home">' + esc(t('proj_back')) + '</span></div>' +
    '</div></div>';
  }
  function loadProject(slug) {
    var key = slug + '.' + L();
    if (projCache[key]) { injectPost(projCache[key]); return; }
    fetch('projects/' + slug + '.' + L() + '.md')
      .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
      .then(function (md) { md = stripFrontmatter(md); var html = window.marked ? window.marked.parse(md) : md; projCache[key] = html; injectPost(html); })
      .catch(function () { injectPost('<p style="color:var(--muted)">Project not found.</p>'); });
  }

  /* ---------- render ---------- */
  function render() {
    var r = route();
    var body;
    switch (r.page) {
      case 'studio': body = pageStudio(); break;
      case 'services': body = pageServices(); break;
      case 'blog': body = pageBlog(r.pageNum); break;
      case 'post': body = pagePost(r.slug); break;
      case 'project': body = pageProject(r.slug); break;
      case 'contact': body = pageContact(); break;
      default: body = pageHome();
    }
    document.getElementById('app-root').innerHTML =
      nav(r.page) + '<main>' + body + '</main>' + mascotBand(r.page) + footer() + lightbox();
    if (r.page === 'post') loadPost(r.slug);
    if (r.page === 'project') loadProject(r.slug);
    setScrollLock(state.menuOpen || !!state.lightboxSrc);
  }

  function lightbox() {
    if (!state.lightboxSrc) return '';
    return '<div class="lightbox open" data-action="lightbox-close">' +
      '<button class="lightbox-close" data-action="lightbox-close" aria-label="close">✕</button>' +
      '<img src="' + esc(state.lightboxSrc) + '" alt="">' +
    '</div>';
  }

  /* Locks background scroll while the mobile drawer or image lightbox is
     open. Uses position:fixed on body (not overflow:hidden) because
     overflow:hidden on html/body breaks position:sticky for .nav in some
     browsers. */
  var lockScrollY = 0;
  function setScrollLock(on) {
    var locked = document.body.classList.contains('scroll-lock');
    if (on && !locked) {
      lockScrollY = window.scrollY;
      document.body.style.top = '-' + lockScrollY + 'px';
      document.body.classList.add('scroll-lock');
    } else if (!on && locked) {
      document.body.classList.remove('scroll-lock');
      document.body.style.top = '';
      window.scrollTo(0, lockScrollY);
    }
  }

  function pageContact() {
    return '<div class="page"><div class="container" style="padding-top:56px">' +
      '<div class="cmd">' + promptLine(t('contact_cmd')) + '</div>' +
      '<h1 class="page-h1">' + esc(t('contact_h')) + '</h1>' +
      '<p class="page-sub" style="max-width:640px">' + esc(t('contact_sub')) + '</p>' +
      '<div class="contact-grid">' +
        '<div class="card"><form class="form" data-action="noop" onsubmit="return false">' +
          '<div><label>' + esc(t('form_name')) + '</label><input type="text"></div>' +
          '<div><label>' + esc(t('form_email')) + '</label><input type="email"></div>' +
          '<div><label>' + esc(t('form_msg')) + '</label><textarea rows="5"></textarea></div>' +
          '<div class="form-foot">' +
            '<div class="captcha-col"><label>' + esc(t('form_captcha')) + '</label><div class="captcha-slot" data-captcha>' + esc(t('captcha_hint')) + '</div></div>' +
            '<button class="btn" type="submit">' + esc(t('form_send')) + '</button>' +
          '</div>' +
        '</form></div>' +
        '<div class="info-col">' +
          '<div class="info-card biz">' +
            '<div class="section-label" style="margin-bottom:18px">' + esc(t('biz_label')) + '</div>' +
            '<div class="info-row"><div class="k">' + esc(t('biz_company')) + '</div><div class="v">' + esc(t('biz_company_v')) + '</div></div>' +
            '<div class="info-row"><div class="k">' + esc(t('biz_no')) + '</div><div class="v">' + esc(window.CONTACT.bizNo) + '</div></div>' +
            '<div class="info-row"><div class="k">' + esc(t('biz_addr')) + '</div><div class="v">' + esc(t('addr_v')) + '</div></div>' +
            '<div class="biz-art"><img class="pixel" src="assets/img/raccoon-sleep.png" alt=""></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div></div>';
  }

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    if (e.target.closest('.lightbox img')) return; // clicking the image itself shouldn't close it
    var postImg = e.target.closest('#post-body img');
    if (postImg) { state.lightboxSrc = postImg.getAttribute('src'); render(); return; }
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var a = el.getAttribute('data-action');
    if (a === 'nav') { state.menuOpen = false; go('#/' + (el.getAttribute('data-page') === 'home' ? '' : el.getAttribute('data-page'))); window.scrollTo(0, 0); }
    else if (a === 'nav-hash') { if (el.classList.contains('disabled')) return; go(el.getAttribute('data-hash')); window.scrollTo(0, 0); }
    else if (a === 'menu') { state.menuOpen = !state.menuOpen; render(); }
    else if (a === 'lightbox-close') { state.lightboxSrc = null; render(); }
    else if (a === 'post') { go('#/blog/' + el.getAttribute('data-slug')); window.scrollTo(0, 0); }
    else if (a === 'project') { go('#/work/' + el.getAttribute('data-slug')); window.scrollTo(0, 0); }
    else if (a === 'lang') { state.lang = el.getAttribute('data-lang'); localStorage.setItem('lrs_lang', state.lang); document.documentElement.setAttribute('data-lang', state.lang); render(); }
    else if (a === 'theme') { state.theme = state.theme === 'dark' ? 'light' : 'dark'; localStorage.setItem('lrs_theme', state.theme); document.documentElement.setAttribute('data-theme', state.theme); render(); }
    else if (a === 'font') { var i = FONTS.map(function (x) { return x.id; }).indexOf(state.font); state.font = FONTS[(i + 1) % FONTS.length].id; sessionStorage.setItem('lrs_font', state.font); document.documentElement.setAttribute('data-font', state.font); render(); }
  });

  window.addEventListener('hashchange', render);

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (state.lightboxSrc) { state.lightboxSrc = null; render(); }
    else if (state.menuOpen) { state.menuOpen = false; render(); }
  });

  /* ---------- boot ---------- */
  document.documentElement.setAttribute('data-theme', state.theme);
  document.documentElement.setAttribute('data-lang', state.lang);
  document.documentElement.setAttribute('data-font', state.font);

  Promise.all([
    fetch('posts/posts.json').then(function (r) { return r.json(); }).then(function (j) { postsIndex = j.posts || []; }).catch(function () { postsIndex = []; }),
    fetch('projects/projects.json').then(function (r) { return r.json(); }).then(function (j) { projectsIndex = j.projects || []; }).catch(function () { projectsIndex = []; })
  ]).then(function () { render(); });
})();
