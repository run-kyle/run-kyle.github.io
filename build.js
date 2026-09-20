#!/usr/bin/env node
/**
 * Static site generator for the personal profile site.
 *
 * Single source of truth: data/profile.json
 * Run `node build.js` and index.html / publications.html are regenerated.
 * No dependencies — plain Node.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'profile.json'), 'utf8'));

/* ---------------- helpers ---------------- */

// Escape for text that must never be read as markup.
const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Fields documented as rich text (bio, news) may carry inline tags; pass through.
const rich = (s) => String(s == null ? '' : s);

const isEmpty = (v) => v == null || (Array.isArray(v) && v.length === 0) || v === '';

// Bold the site owner's name inside an author string.
function markAuthors(authors, name) {
  const surname = name.split(' ').slice(-1)[0];
  const variants = [name, `${surname}, ${name.split(' ').slice(0, -1).join(' ')}`];
  let out = esc(authors);
  for (const v of variants) {
    out = out.split(esc(v)).join(`<span class="me">${esc(v)}</span>`);
  }
  return out;
}

const ICONS = {
  mail: '<path d="M2 4h12v8H2z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="m2.5 4.5 5.5 4 5.5-4" fill="none" stroke="currentColor" stroke-width="1.4"/>',
  github: '<path d="M8 .5a7.5 7.5 0 0 0-2.37 14.62c.37.07.51-.16.51-.36v-1.3c-2.09.45-2.53-1-2.53-1-.34-.87-.83-1.1-.83-1.1-.68-.47.05-.46.05-.46.75.05 1.15.77 1.15.77.67 1.15 1.76.82 2.19.63.07-.49.26-.82.48-1.01-1.67-.19-3.42-.84-3.42-3.72 0-.82.29-1.5.77-2.02-.08-.19-.34-.96.07-2 0 0 .63-.2 2.06.77a7.1 7.1 0 0 1 3.75 0c1.43-.97 2.06-.77 2.06-.77.41 1.04.15 1.81.07 2 .48.52.77 1.2.77 2.02 0 2.89-1.76 3.53-3.43 3.71.27.23.51.69.51 1.39v2.06c0 .2.13.44.51.36A7.5 7.5 0 0 0 8 .5Z" fill="currentColor"/>',
  linkedin: '<path d="M3.2 5.6h2.1V13H3.2V5.6Zm1.05-3.4a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM6.9 5.6H9v1h.03c.29-.53 1-1.1 2.06-1.1 2.2 0 2.61 1.4 2.61 3.23V13h-2.1V9.15c0-.92-.02-2.1-1.3-2.1-1.3 0-1.5.98-1.5 1.99V13H6.9V5.6Z" fill="currentColor"/>',
  scholar: '<path d="M8 1 0 5.5 8 10l6.2-3.49V11H16V5.5L8 1Z" fill="currentColor"/><path d="M3.5 8v2.6C3.5 12.5 5.5 14 8 14s4.5-1.5 4.5-3.4V8L8 10.6 3.5 8Z" fill="currentColor"/>',
  file: '<path d="M4 1.5h5L12.5 5v9.5h-9v-13Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M9 1.5V5h3.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
  link: '<path d="M6.5 9.5a2.5 2.5 0 0 0 3.54 0l2-2a2.5 2.5 0 0 0-3.54-3.54l-.8.8M9.5 6.5a2.5 2.5 0 0 0-3.54 0l-2 2A2.5 2.5 0 0 0 7.5 12.04l.8-.8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>'
};

const icon = (name) =>
  `<svg viewBox="0 0 16 16" aria-hidden="true">${ICONS[name] || ICONS.link}</svg>`;

/* ---------------- shared chrome ---------------- */

function head(title, description, extraMeta = '') {
  return `<!doctype html>
<html lang="${esc(data.site.lang || 'en')}" >
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="${esc(data.profile.name)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(data.site.url)}">
<meta name="twitter:card" content="summary">
${extraMeta}
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚗</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
<script>
  // Set the theme before first paint to avoid a flash.
  (function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();
</script>
</head>
<body>`;
}

function nav(page) {
  const links =
    page === 'home'
      ? `<a href="#about">About</a><a href="#projects">Projects</a><a href="publications.html">Publications</a><a href="${esc(data.profile.cv)}">CV</a>`
      : `<a href="index.html">Home</a><a href="#publications">Papers</a><a href="#patents">Patents</a><a href="${esc(data.profile.cv)}">CV</a>`;
  return `
<nav class="nav">
  <div class="nav-inner">
    <a class="nav-brand" href="index.html">${esc(data.profile.name)}</a>
    <div class="nav-links">${links}</div>
    <button class="theme-toggle" type="button" aria-label="Toggle color theme">
      <svg class="icon-sun" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 .8v2M8 13.2v2M.8 8h2M13.2 8h2M2.9 2.9l1.4 1.4M11.7 11.7l1.4 1.4M13.1 2.9l-1.4 1.4M4.3 11.7l-1.4 1.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
      <svg class="icon-moon" viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 9.6A5.8 5.8 0 0 1 6.4 2.5a5.8 5.8 0 1 0 7.1 7.1Z" fill="currentColor"/></svg>
    </button>
  </div>
</nav>`;
}

function footer() {
  const year = new Date().getFullYear();
  return `
<footer class="footer wrap">
  <div>© ${year} ${esc(data.profile.name)} · ${esc(data.profile.location)}</div>
  <div><a href="mailto:${esc(data.profile.email)}">${esc(data.profile.email)}</a></div>
</footer>
<script src="assets/js/main.js"></script>
</body>
</html>`;
}

const section = (id, title, body) =>
  body ? `<section class="section" id="${id}"><h2 class="section-title">${esc(title)}</h2>${body}</section>` : '';

/* ---------------- home page ---------------- */

function heroPhoto() {
  const p = data.profile.photo;
  const initials = data.profile.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  if (p && fs.existsSync(path.join(ROOT, p))) {
    return `<img class="hero-photo" src="${esc(p)}" alt="${esc(data.profile.name)}">`;
  }
  // No photo file yet — render initials so the layout still reads correctly.
  return `<div class="hero-photo hero-photo--placeholder" aria-hidden="true">${esc(initials)}</div>`;
}

function buildHome() {
  const p = data.profile;

  const hero = `
<header class="hero wrap">
  ${heroPhoto()}
  <div>
    <h1 class="hero-name">${esc(p.name)}${p.name_local ? `<span class="local">${esc(p.name_local)}</span>` : ''}</h1>
    <div class="hero-role">${esc(p.role)}</div>
    <div class="hero-meta">${esc(p.affiliation)}</div>
    <div class="hero-meta">${esc(p.location)}</div>
    <div class="links">
      ${(p.links || [])
        .filter((l) => l.url && !/REPLACE_ME/.test(l.url))
        .map((l) => `<a class="link-chip" href="${esc(l.url)}"${/^https?:/.test(l.url) ? ' target="_blank" rel="noopener"' : ''}>${icon(l.icon)}${esc(l.label)}</a>`)
        .join('\n      ')}
    </div>
  </div>
</header>`;

  const about = section(
    'about',
    'About',
    `<div class="bio">${(p.bio || []).map((b) => `<p>${rich(b)}</p>`).join('\n')}</div>
     ${isEmpty(p.interests) ? '' : `<div class="tags" style="margin-top:6px">${p.interests.map((i) => `<span class="tag">${esc(i)}</span>`).join('')}</div>`}`
  );

  const news = isEmpty(data.news)
    ? ''
    : section(
        'news',
        'News',
        `<ul class="news">${data.news
          .map((n) => `<li><span class="date">${esc(n.date)}</span><span class="text">${rich(n.text)}</span></li>`)
          .join('\n')}</ul>`
      );

  const experience = isEmpty(data.experience)
    ? ''
    : section(
        'experience',
        'Experience',
        data.experience
          .map(
            (e) => `<div class="entry">
    <div class="entry-head"><span class="entry-title">${esc(e.org)}</span><span class="entry-period">${esc(e.location)}</span></div>
    <ul class="entry-roles">${(e.roles || [])
      .map((r) => `<li><span>${esc(r.title)}</span><span class="entry-period">${esc(r.period)}</span></li>`)
      .join('')}</ul>
  </div>`
          )
          .join('\n')
      );

  const education = isEmpty(data.education)
    ? ''
    : section(
        'education',
        'Education',
        data.education
          .map(
            (e) => `<div class="entry">
    <div class="entry-head"><span class="entry-title">${esc(e.degree)}</span><span class="entry-period">${esc(e.period)}</span></div>
    <div class="entry-sub">${esc(e.school)}, ${esc(e.location)}</div>
    ${isEmpty(e.notes) ? '' : `<ul class="entry-notes">${e.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>`}
  </div>`
          )
          .join('\n')
      );

  // `image` may point at a still or at a short clip (.mp4/.webm); clips play
  // as a muted, looping poster-backed video.
  const projectMedia = (pr) => {
    if (!pr.image) return '';
    const isClip = /\.(mp4|webm)$/i.test(pr.image);
    const media = isClip
      ? `<video class="project-thumb" src="${esc(pr.image)}"${pr.poster ? ` poster="${esc(pr.poster)}"` : ''} autoplay loop muted playsinline preload="metadata" aria-label="${esc(pr.title)}"></video>`
      : `<img class="project-thumb" src="${esc(pr.image)}" alt="${esc(pr.title)}" loading="lazy">`;
    return media + (pr.caption ? `<div class="project-caption">${rich(pr.caption)}</div>` : '');
  };

  const projectCard = (pr) => `<article class="project">
    <div class="project-head"><h3 class="project-title">${esc(pr.title)}</h3><span class="entry-period">${esc(pr.period)}</span></div>
    <div class="project-org">${esc(pr.org)}</div>
    ${projectMedia(pr)}
    <ul>${(pr.highlights || []).map((h) => `<li>${rich(h)}</li>`).join('')}</ul>
    ${isEmpty(pr.tags) ? '' : `<div class="tags">${pr.tags.map((t) => `<span class="tag tag--plain">${esc(t)}</span>`).join('')}</div>`}
  </article>`;

  const projects = isEmpty(data.projects)
    ? ''
    : section('projects', 'Selected Projects', (data.projects || []).map(projectCard).join('\n'));

  const skills = isEmpty(data.skills)
    ? ''
    : section(
        'skills',
        'Skills',
        data.skills
          .map(
            (s) => `<div class="skill-row"><div class="skill-group">${esc(s.group)}</div>
    <div class="tags">${s.items.map((i) => `<span class="tag tag--plain">${esc(i)}</span>`).join('')}</div></div>`
          )
          .join('\n')
      );

  const press = isEmpty(data.press)
    ? ''
    : section(
        'press',
        'In the News',
        data.press
          .map(
            (n) => `<div class="row">
    <div class="row-title"><a href="${esc(n.url)}" target="_blank" rel="noopener">${esc(n.title)}</a></div>
    <div class="row-meta">${esc(n.outlet)}</div>
  </div>`
          )
          .join('\n')
      );

  const more = section(
    'more',
    'More',
    `<div class="row"><div class="row-title"><a href="publications.html">Publications, patents &amp; software copyrights →</a></div>
     <div class="row-meta">${(data.publications || []).reduce((a, g) => a + g.items.length, 0)} papers · ${(data.patents || []).length} patents · ${(data.software_copyrights || []).length} software copyrights</div></div>
     <div class="row"><div class="row-title"><a href="${esc(p.cv)}">Full CV (PDF) →</a></div><div class="row-meta">Complete record of projects, publications, and activities</div></div>`
  );

  return [
    head(`${data.profile.name} — ${data.profile.role}`, data.site.description),
    nav('home'),
    hero,
    '<main class="wrap">',
    about,
    news,
    experience,
    education,
    projects,
    skills,
    press,
    more,
    '</main>',
    footer()
  ].join('\n');
}

/* ---------------- publications page ---------------- */

function buildPublications() {
  const name = data.profile.name;

  const pubs = isEmpty(data.publications)
    ? ''
    : section(
        'publications',
        'Publications',
        data.publications
          .map(
            (g) => `<div class="pub-group"><h3>${esc(g.group)}</h3>${g.items
              .map(
                (it) => `<div class="pub">
      <div class="pub-year">${esc(it.year)}</div>
      <div>
        <div class="pub-title">${it.url ? `<a href="${esc(it.url)}" target="_blank" rel="noopener">${esc(it.title)}</a>` : esc(it.title)}</div>
        <div class="pub-authors">${markAuthors(it.authors, name)}</div>
        <div class="pub-venue">${esc(it.venue)}</div>
      </div>
    </div>`
              )
              .join('\n')}</div>`
          )
          .join('\n')
      );

  const patents = isEmpty(data.patents)
    ? ''
    : section(
        'patents',
        'Patents',
        data.patents
          .map(
            (p) => `<div class="row">
    <div class="row-title">${esc(p.title)}<span class="badge${p.status === 'Registered' ? ' badge--granted' : ''}">${esc(p.status)}</span></div>
    <div class="row-meta">${esc(p.id)} · ${esc(p.date)}${p.also ? ` · Also filed: ${esc(p.also)}` : ''}</div>
  </div>`
          )
          .join('\n')
      );

  const sw = isEmpty(data.software_copyrights)
    ? ''
    : section(
        'software',
        'Software Copyrights',
        data.software_copyrights
          .map(
            (s) => `<div class="row">
    <div class="row-title">${esc(s.title)}</div>
    <div class="row-meta">${markAuthors(s.authors, name)} · ${esc(s.id)} · ${esc(s.date)}</div>
  </div>`
          )
          .join('\n')
      );

  const svc = data.service || {};
  const rowList = (arr, title, meta) =>
    arr.map((x) => `<div class="row"><div class="row-title">${esc(title(x))}</div><div class="row-meta">${esc(meta(x))}</div></div>`).join('\n');

  const service = section(
    'service',
    'Service & Recognition',
    [
      isEmpty(svc.reviewer)
        ? ''
        : `<h3 class="entry-title" style="margin-bottom:6px">Peer Review</h3>${rowList(
            svc.reviewer,
            (x) => x.venue,
            (x) => [x.note, x.date].filter(Boolean).join(' · ')
          )}`,
      isEmpty(svc.awards)
        ? ''
        : `<h3 class="entry-title" style="margin:22px 0 6px">Honors & Awards</h3>${rowList(
            svc.awards,
            (x) => x.title,
            (x) => [x.org, x.date].filter(Boolean).join(' · ')
          )}`,
      isEmpty(svc.teaching)
        ? ''
        : `<h3 class="entry-title" style="margin:22px 0 6px">Teaching</h3>${rowList(
            svc.teaching,
            (x) => x.title,
            (x) => [x.org, x.period].filter(Boolean).join(' · ')
          )}`,
      isEmpty(svc.certificates)
        ? ''
        : `<h3 class="entry-title" style="margin:22px 0 6px">Certificates</h3>${rowList(
            svc.certificates,
            (x) => x.title,
            (x) => [x.org, x.date].filter(Boolean).join(' · ')
          )}`,
      isEmpty(svc.other)
        ? ''
        : `<h3 class="entry-title" style="margin:22px 0 6px">Service</h3>${rowList(
            svc.other,
            (x) => x.title,
            (x) => [x.org, x.date].filter(Boolean).join(' · ')
          )}`
    ]
      .filter(Boolean)
      .join('\n')
  );

  const confs = isEmpty(data.conferences_attended)
    ? ''
    : section(
        'conferences',
        'Conferences Attended',
        data.conferences_attended
          .map(
            (c) => `<div class="row"><div class="row-title">${esc(c.name)}</div><div class="row-meta">${esc(c.place)} · ${esc(c.date)}</div></div>`
          )
          .join('\n')
      );

  return [
    head(`Publications — ${data.profile.name}`, `Publications, patents, and software copyrights by ${data.profile.name}.`),
    nav('publications'),
    `<header class="hero wrap" style="display:block;padding-bottom:0">
      <h1 class="hero-name">Publications &amp; Patents</h1>
      <div class="hero-meta">Full record also available in the <a href="${esc(data.profile.cv)}">CV (PDF)</a>.</div>
    </header>`,
    '<main class="wrap">',
    pubs,
    patents,
    sw,
    service,
    confs,
    '</main>',
    footer()
  ].join('\n');
}

/* ---------------- write ---------------- */

const outputs = {
  'index.html': buildHome(),
  'publications.html': buildPublications()
};

for (const [file, html] of Object.entries(outputs)) {
  fs.writeFileSync(path.join(ROOT, file), html, 'utf8');
  console.log(`built ${file}  (${(html.length / 1024).toFixed(1)} KB)`);
}
