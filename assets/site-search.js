// Recherche du site : bouton loupe dans la nav + fenêtre de recherche
// (Ctrl/Cmd+K ou « / »), et mode page sur recherche.html.
//
// Rien de lourd n'est chargé au démarrage : l'index Pagefind, le lexique
// et le dictionnaire métier ne sont téléchargés qu'à la première ouverture
// (ou au survol de la loupe, pour gagner quelques centaines de ms).
// Logique de correction et de regroupement : assets/search-core.js.

const POPULAR = [
  ['TURPE 2026', 'turpe'],
  ['Accise sur l’électricité', 'accise'],
  ['Prix du kWh pro', 'prix kwh'],
  ['Rôle du courtier', 'courtier'],
  ['Décret tertiaire', 'decret tertiaire'],
  ['Bornes de recharge', 'bornes recharge'],
];

const LOUPE = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

let engine = null;

function loadEngine() {
  if (!engine) {
    engine = Promise.all([
      import('./search-core.js'),
      import('/pagefind/pagefind.js').then(async (pf) => {
        await pf.options({ excerptLength: 24 });
        await pf.init();
        return pf;
      }),
      fetch('/assets/search-lexicon.json').then((r) => r.json()),
      fetch('/data/search-synonyms.json').then((r) => r.json()),
    ]).then(([core, pf, lexicon, synonyms]) => ({ core, pf, lexicon, synonyms: synonyms.entries }));
    engine.catch(() => { engine = null; });
  }
  return engine;
}

function kindOf(url) {
  if (/ms-blog-barometre|barometre-energie/.test(url)) return 'Baromètre';
  if (/-(paris|lyon|marseille|toulouse|bordeaux|lille|nantes|strasbourg|montpellier|rennes)\.html$/.test(url)) return 'Page locale';
  if (/\/(index|b2b|b2c|comment-ca-marche|resultats|blog|plan-du-site)\.html$/.test(url)) return 'Page';
  if (/\/(cgv|mentions-legales|politique-confidentialite)\.html$/.test(url)) return 'Informations légales';
  if (/calculateur/.test(url)) return 'Outil';
  return 'Guide';
}

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function hydrate(pf, search, limit) {
  const data = await Promise.all(search.results.slice(0, limit).map((r) => r.data()));
  return data.map((d) => ({
    url: d.url, title: d.meta.title || d.url, excerpt: d.excerpt,
    description: d.meta.description, category: d.meta.category, readtime: d.meta.readtime,
  }));
}

async function runSearch(raw, { typing, limit }) {
  const { core, pf, lexicon, synonyms } = await loadEngine();
  const { query: corrected, corrections } = core.correctQuery(raw, lexicon, { typing });
  const terms = core.searchTerms(corrected);
  const topics = core.matchSynonyms(corrected, synonyms);

  const direct = terms ? await hydrate(pf, await pf.search(terms), limit) : [];
  const related = [];
  for (const term of topics.flatMap((t) => t.terms)) related.push(await hydrate(pf, await pf.search(term), 3));

  const intent = core.hasIntentPhrase(corrected, synonyms);
  const first = intent ? core.mergeResults(...related) : direct;
  const second = intent ? direct : core.mergeResults(...related);
  // Regroupement des villes sur l'ensemble, pour qu'une même page locale
  // n'apparaisse pas une fois dans chaque bloc.
  const firstUrls = new Set(first.map((r) => r.url));
  const grouped = core.groupCityResults(core.mergeResults(first, second), corrected);
  const primary = grouped.filter((r) => firstUrls.has(r.url));
  const extra = grouped.filter((r) => !firstUrls.has(r.url)).slice(0, intent ? limit : 5);
  return { corrected, corrections, primary, extra, topics, intent };
}

function itemHtml(r, index) {
  const cities = r.cities && r.cities.length > 1
    ? `<span class="ss-cities">Aussi pour : ${r.cities.slice(1).map((c) => `<a href="${escapeHtml(c.url)}">${escapeHtml(c.label)}</a>`).join(' · ')}</span>`
    : '';
  const cityLabel = r.cities ? ` · ${escapeHtml(r.cities[0].label)}` : '';
  // L'extrait vient de notre propre index Pagefind (texte échappé + <mark>).
  return `<li role="presentation"><a class="ss-item" id="ss-opt-${index}" role="option" href="${escapeHtml(r.url)}" data-pos="${index}">`
    + `<span class="ss-kind">${kindOf(r.url)}${cityLabel}</span>`
    + `<span class="ss-title">${escapeHtml(r.title)}</span>`
    + `<span class="ss-excerpt">${r.excerpt}</span></a>${cities}</li>`;
}

// Carte d'aperçu des 3 meilleurs résultats : catégorie, titre, description
// de l'article (plus lisible que l'extrait) et temps de lecture.
const PREVIEW_COUNT = 3;

function cardHtml(r, index) {
  const kind = (r.category ? escapeHtml(r.category) : kindOf(r.url)) + (r.cities ? ` · ${escapeHtml(r.cities[0].label)}` : '');
  const text = r.description ? escapeHtml(r.description) : r.excerpt;
  return `<li role="presentation"><a class="ss-item ss-card" id="ss-opt-${index}" role="option" href="${escapeHtml(r.url)}" data-pos="${index}">`
    + `<span class="ss-kind">${kind}</span>`
    + `<span class="ss-title">${escapeHtml(r.title)}</span>`
    + `<span class="ss-excerpt">${text}</span>`
    + `<span class="ss-card-foot">${r.readtime ? escapeHtml(r.readtime) : ''}<span class="ss-card-go" aria-hidden="true">Lire →</span></span></a></li>`;
}

function popularHtml(title) {
  return `<p class="ss-label">${title}</p><div class="ss-chips">`
    + POPULAR.map(([label, q]) => `<button type="button" class="ss-chip" data-q="${escapeHtml(q)}">${escapeHtml(label)}</button>`).join('')
    + '</div>';
}

function resultsHtml(raw, res) {
  let html = '';
  if (res.corrections.length) {
    const typed = res.corrections.map((c) => c.from).join(' ');
    html += `<p class="ss-note">Résultats pour <strong>${escapeHtml(res.corrected)}</strong> <span>(vous avez tapé « ${escapeHtml(typed)} »)</span></p>`;
  }
  let pos = 0;
  const labels = res.topics.map((t) => t.label).join(' · ');
  const topicTitle = (prefix) => `${prefix}${labels ? ' : ' + escapeHtml(labels) : ''}`;
  if (res.primary.length) {
    const top = res.primary.slice(0, PREVIEW_COUNT);
    const rest = res.primary.slice(PREVIEW_COUNT);
    html += `<p class="ss-label">${res.intent ? topicTitle('Meilleures réponses') : 'Les plus pertinents'}</p>`;
    html += '<ul class="ss-cards" role="listbox" aria-label="Meilleurs résultats">' + top.map((r) => cardHtml(r, pos++)).join('') + '</ul>';
    if (rest.length) {
      html += '<p class="ss-label">Autres pages</p>'
        + '<ul class="ss-list" role="listbox" aria-label="Résultats">' + rest.map((r) => itemHtml(r, pos++)).join('') + '</ul>';
    }
  }
  if (res.extra.length) {
    html += `<p class="ss-label">${res.intent ? 'Autres résultats' : topicTitle('Sujets liés')}</p>`
      + '<ul class="ss-list" role="listbox" aria-label="Autres résultats">' + res.extra.map((r) => itemHtml(r, pos++)).join('') + '</ul>';
  }
  if (!pos) {
    html += `<p class="ss-empty">Aucun résultat pour « ${escapeHtml(raw)} ».</p>` + popularHtml('Essayez plutôt');
  }
  return { html, count: pos };
}

function track(event, props) {
  try { if (window.posthog && typeof window.posthog.capture === 'function') window.posthog.capture(event, props); } catch (e) { /* analytics optionnel */ }
}

// Un panneau de recherche : champ + résultats, utilisé dans la fenêtre et sur recherche.html.
function createPanel(root, { limit, onOpen }) {
  root.innerHTML = '<form class="ss-bar" role="search" action="/recherche.html">'
    + LOUPE
    + '<input class="ss-input" type="search" name="q" autocomplete="off" spellcheck="false" enterkeyhint="search"'
    + ' placeholder="TURPE, accise, prix du kWh, décret tertiaire…" aria-label="Rechercher sur le site" role="combobox" aria-expanded="true" aria-autocomplete="list">'
    + '</form><div class="ss-body" aria-live="polite"></div>';
  const form = root.querySelector('form');
  const input = root.querySelector('.ss-input');
  const body = root.querySelector('.ss-body');
  let seq = 0;
  let active = -1;
  let last = { raw: '', corrected: '' };
  let trackTimer = null;

  const items = () => Array.from(body.querySelectorAll('.ss-item'));

  function setActive(i) {
    const list = items();
    list.forEach((el) => el.classList.remove('is-active'));
    active = list.length ? (i + list.length) % list.length : -1;
    if (active >= 0) {
      list[active].classList.add('is-active');
      list[active].scrollIntoView({ block: 'nearest' });
      input.setAttribute('aria-activedescendant', list[active].id);
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  }

  async function update(typing) {
    const raw = input.value.trim();
    const mine = ++seq;
    if (!raw) {
      body.innerHTML = popularHtml('Recherches fréquentes');
      active = -1;
      return;
    }
    root.classList.add('is-loading');
    try {
      const res = await runSearch(raw, { typing, limit });
      if (mine !== seq) return;
      const { html, count } = resultsHtml(raw, res);
      body.innerHTML = html;
      last = { raw, corrected: res.corrected };
      setActive(count ? 0 : -1);
      clearTimeout(trackTimer);
      trackTimer = setTimeout(() => track('site_search', { query: raw, corrected: res.corrected, results: count }), 1200);
    } catch (e) {
      if (mine === seq) body.innerHTML = '<p class="ss-empty">La recherche est momentanément indisponible.</p>';
    } finally {
      if (mine === seq) root.classList.remove('is-loading');
    }
  }

  input.addEventListener('input', () => update(true));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const target = items()[active] || items()[0];
    if (target) target.click();
  });
  body.addEventListener('click', (e) => {
    const chip = e.target.closest('.ss-chip');
    if (chip) { input.value = chip.dataset.q; input.focus(); update(false); return; }
    const link = e.target.closest('a');
    if (link) {
      track('site_search_click', { query: last.raw, corrected: last.corrected, url: link.getAttribute('href'), position: Number(link.dataset.pos || -1) });
      if (onOpen) onOpen();
    }
  });

  return {
    input,
    search(q) { input.value = q; return update(false); },
    reset() { if (!input.value) update(false); },
  };
}

function mountDialog() {
  const overlay = document.createElement('div');
  overlay.className = 'ss-overlay';
  overlay.hidden = true;
  overlay.innerHTML = '<div class="ss-dialog" role="dialog" aria-modal="true" aria-label="Rechercher sur le site">'
    + '<div class="ss-panel"></div>'
    + '<div class="ss-foot"><span><kbd>↑</kbd><kbd>↓</kbd> naviguer · <kbd>↵</kbd> ouvrir · <kbd>Échap</kbd> fermer</span>'
    + '<a class="ss-all" href="/recherche.html">Voir tous les résultats →</a></div></div>';
  document.body.appendChild(overlay);
  const dialog = overlay.querySelector('.ss-dialog');
  const allLink = overlay.querySelector('.ss-all');
  let opener = null;

  const panel = createPanel(overlay.querySelector('.ss-panel'), { limit: 8, onOpen: () => close() });
  panel.input.addEventListener('input', () => {
    allLink.href = '/recherche.html' + (panel.input.value.trim() ? '?q=' + encodeURIComponent(panel.input.value.trim()) : '');
  });

  function open() {
    if (!overlay.hidden) return;
    opener = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add('ss-open');
    requestAnimationFrame(() => overlay.classList.add('is-visible'));
    panel.input.focus();
    panel.input.select();
    panel.reset();
    loadEngine();
  }

  function close() {
    if (overlay.hidden) return;
    overlay.classList.remove('is-visible');
    overlay.hidden = true;
    document.body.classList.remove('ss-open');
    if (opener && opener.focus) opener.focus();
  }

  overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) close(); });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key === 'Tab') {
      const focusables = Array.from(dialog.querySelectorAll('input, button, a[href]:not([tabindex="-1"])')).filter((el) => el.offsetParent !== null);
      const first = focusables[0];
      const lastEl = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
    }
  });

  return { open, close };
}

function mountTrigger(onActivate) {
  const nav = document.querySelector('nav.nav') || document.querySelector('nav');
  if (!nav || nav.querySelector('.ss-trigger')) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'ss-trigger' + (nav.querySelector('.nlinks') ? '' : ' ss-trigger--solo');
  btn.setAttribute('aria-label', 'Rechercher sur le site');
  btn.setAttribute('aria-haspopup', 'dialog');
  btn.title = 'Rechercher (Ctrl+K)';
  btn.innerHTML = LOUPE;
  const anchor = nav.querySelector('.nphone') || nav.querySelector('.ncta') || nav.querySelector('.nav-cta');
  if (anchor && anchor.parentNode === nav && nav.querySelector('.nlinks')) {
    // La loupe est groupée avec l'élément qu'elle précède (téléphone ou CTA) :
    // la nav garde le même nombre d'éléments, donc la répartition
    // space-between d'origine (liens, téléphone, « Étude gratuite ») ne bouge pas.
    const group = document.createElement('div');
    group.className = 'ss-nav-group';
    nav.insertBefore(group, anchor);
    group.append(btn, anchor);
  } else if (anchor && anchor.parentNode === nav) nav.insertBefore(btn, anchor);
  else nav.appendChild(btn);
  btn.addEventListener('click', onActivate);
  btn.addEventListener('pointerenter', () => loadEngine(), { once: true });
  btn.addEventListener('focus', () => loadEngine(), { once: true });

  // Sur mobile, la place manque à côté de « Étude gratuite » : la loupe est
  // masquée et la recherche devient la première entrée du menu burger.
  const links = nav.querySelector('.nlinks');
  if (links) {
    const li = document.createElement('li');
    li.className = 'ss-menu-item';
    li.innerHTML = `<button type="button" class="ss-menu-btn">${LOUPE}<span>Rechercher</span></button>`;
    links.insertBefore(li, links.firstChild);
    li.querySelector('button').addEventListener('click', () => {
      const burger = nav.querySelector('.nav-burger');
      if (burger && nav.classList.contains('is-open')) burger.click();
      onActivate();
    });
  }
}

function bindShortcuts(onActivate) {
  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName) || (document.activeElement && document.activeElement.isContentEditable);
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); onActivate(); }
    else if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); onActivate(); }
  });
}

// La loupe n'est insérée qu'une fois la feuille de style chargée :
// pas de bouton brut qui s'afficherait une fraction de seconde dans la nav.
function loadStyles() {
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/assets/site-search.css';
    link.onload = resolve;
    link.onerror = resolve;
    document.head.appendChild(link);
  });
}

async function init() {
  await loadStyles();

  const pageRoot = document.getElementById('site-search-page');
  if (pageRoot) {
    const panel = createPanel(pageRoot, { limit: 30 });
    const q = new URLSearchParams(location.search).get('q') || '';
    panel.input.addEventListener('input', () => {
      const v = panel.input.value.trim();
      history.replaceState(null, '', v ? '?q=' + encodeURIComponent(v) : location.pathname);
    });
    const focusPage = () => { panel.input.focus(); panel.input.select(); };
    mountTrigger(focusPage);
    bindShortcuts(focusPage);
    if (q) panel.search(q); else panel.reset();
    panel.input.focus();
    return;
  }

  const dialog = mountDialog();
  mountTrigger(dialog.open);
  bindShortcuts(dialog.open);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
