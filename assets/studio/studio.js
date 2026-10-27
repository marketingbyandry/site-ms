/* ════════════════════════════════════════
   STUDIO J1–J20 (rendu partagé)

   Inliné par scripts/build-studio.mjs dans approbation.html et dans
   l'artefact « Campagne Pas de -50 % ». Les deux affichent donc exactement
   le même onglet, à partir des mêmes données
   (content/campagne-q4-2026-commercants/studio/).

   Studio.mount(host, data, options)
     data    : { jours: [...] } tel que produit par le build (chaque jour
               porte son post Markdown dans `post`)
     options : mediaBase   préfixe des photos et vidéos ('approbation-media/'
                           sur le site, '' dans l'artefact)
               storageKey  clé localStorage du jour affiché
               intro       texte d'introduction
               decorate    (article, { id, plat, jour }) => void, pour
                           ajouter un bloc sous chaque réseau (ex. le vote)
               dayBadge    (jour) => texte court affiché sur le bouton du jour
   ════════════════════════════════════════ */
(function () {
  const PLATS = ['LinkedIn', 'Facebook', 'Instagram', 'X'];
  const CODE = { LinkedIn: 'LI', Facebook: 'FB', Instagram: 'IG', X: 'X' };
  const CAMP = { LinkedIn: 'li', Facebook: 'fb', Instagram: 'ig', X: 'x' };
  const COLOR = { LinkedIn: '--st-li', Facebook: '--st-fb', Instagram: '--st-ig', X: '--st-x' };
  const RATIO = { p45: '4:5 · 1080 × 1350 px', sq: '1:1 · 1080 × 1080 px', v916: '9:16 · 1080 × 1920 px', h169: '16:9 · 1600 × 900 px' };
  const ASPECT = { p45: 4 / 5, sq: 1, v916: 9 / 16, h169: 16 / 9 };
  const BILL = ['Identification', 'Abonnement', 'Consommation', 'Acheminement', 'Taxes'];
  const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const BRAND = 'M&amp;S Strategy';

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const dshort = (iso) => { const [, m, d] = iso.split('-'); return `${+d} ${MOIS[m - 1]}`; };
  const hs = (s) => { const n = s.length; return n < 24 ? 's1' : n < 50 ? 's2' : n < 90 ? 's3' : 's4'; };
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* stockage indisponible */ } }
  };

  // Markdown minimal des posts : paragraphes, listes, gras, code, liens.
  // Les liens relatifs (fichiers du dépôt) restent du texte.
  function inline(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, h) => /^https?:/.test(h) ? `<a href="${h}" target="_blank" rel="noopener">${t}</a>` : t)
      .replace(/(^|[\s(>])(https?:\/\/[^\s<)]+)/g, (m, pre, u) => `${pre}<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
  }
  function md(src) {
    return src.trim().split(/\n{2,}/).map((block) => {
      const lines = block.split('\n');
      if (lines.every((l) => /^\s*[-*] /.test(l))) return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-*] /, ''))}</li>`).join('')}</ul>`;
      if (lines.every((l) => /^\s*\d+[.)] /.test(l))) return `<ol>${lines.map((l) => `<li>${inline(l.replace(/^\s*\d+[.)] /, ''))}</li>`).join('')}</ol>`;
      if (lines.every((l) => /^>/.test(l))) return `<blockquote><p>${lines.map((l) => inline(l.replace(/^>\s?/, ''))).join('<br>')}</p></blockquote>`;
      return `<p>${lines.map(inline).join('<br>')}</p>`;
    }).join('');
  }

  // Un post = un titre, des métadonnées, puis une section ## par réseau.
  function parsePost(src) {
    const parts = src.split(/^## /m);
    const head = parts[0].split('\n');
    const secs = parts.slice(1).map((p) => {
      const nl = p.indexOf('\n');
      const h = p.slice(0, nl).trim();
      const body = p.slice(nl + 1).trim();
      const plat = PLATS.find((k) => h.startsWith(k + ' ('));
      const kind = plat ? 'plat' : (/^(Tournage|Montage voix off)/.test(h) ? 'shoot' : 'other');
      const fm = h.includes('·') ? h.split('·').slice(1).join('·').trim() : '';
      return { h, body, plat, kind, fm };
    });
    return { title: head[0].replace(/^#\s*/, ''), secs };
  }

  // Texte à publier : on retire les consignes de visuel et les intitulés.
  function caption(body) {
    return body.split(/\n{2,}/)
      .filter((p) => !/^\*\*(Visuel|Slides|Montage)/.test(p.trim()))
      .map((p) => p.replace(/^\*\*(Texte|Légende) :\*\*\n?/, '').replace(/`(https?:[^`]+)`/g, '$1'))
      .join('\n\n').trim();
  }

  function slide(s, r, i, n, plat, base) {
    const url = (p) => `cabinetms.fr/${p}.html?camp=soc-${CAMP[plat]}`;
    const top = `<div class="pv-top"><span>${BRAND}</span><span>${n > 1 ? `${i + 1}/${n}` : 'Pas de -50 %'}</span></div>`;
    const bot = `<div class="pv-bot"><span>cabinetms.fr</span><span>${n > 1 && i < n - 1 ? '→' : ''}</span></div>`;
    let tone = '';
    let inner = '';
    switch (s.k) {
      case 'num': inner = `<div class="pv-big${s.big.length > 5 ? ' long' : ''}">${esc(s.big)}</div><p class="pv-p">${esc(s.p)}</p>${s.src ? `<p class="pv-src">${esc(s.src)}</p>` : ''}`; break;
      case 'txt': tone = s.tone || ''; inner = `<p class="pv-h ${hs(s.h)}">${esc(s.h)}</p>`; break;
      case 'strike': inner = `<div class="pv-strike">-50 %</div><p class="pv-h ${hs(s.p)}">${esc(s.p)}</p>${s.path ? `<p class="pv-url">${esc(url(s.path))}</p>` : ''}`; break;
      case 'list': inner = `<p class="pv-h s3">${esc(s.h)}</p><ol class="pv-ol">${s.items.map((t, j) => `<li><i>0${j + 1}</i>${esc(t)}</li>`).join('')}</ol>${s.p ? `<p class="pv-p">${esc(s.p)}</p>` : ''}`; break;
      case 'bill': inner = `<p class="pv-h s4">${s.hl ? `<span style="color:var(--pv-teal)">${s.hl}.</span> ` : ''}${esc(s.h)}</p><div class="pv-bill${s.hl ? '' : ' all'}">${BILL.map((b, j) => `<div class="z${s.hl === j + 1 ? ' on' : ''}"><i>${j + 1}</i><span>${b}</span></div>`).join('')}</div>${s.p ? `<p class="pv-p">${esc(s.p)}</p>` : ''}`; break;
      case 'split': tone = 'deep'; inner = '<p class="pv-h s3">Sur votre facture :</p><div class="pv-split"><div class="go"><b>Se négocie</b>Prix du kWh<br>Abonnement</div><div class="st"><b>Ne bouge pas</b>TURPE<br>Accise<br>TVA 20 %</div></div>'; break;
      case 'photo': tone = s.src ? 'photo has-img' : 'photo'; inner = `${s.src ? '' : `<div class="pv-ph"><b>Photo à placer</b>${esc(s.desc)}</div>`}${s.h ? `<p class="pv-h ${hs(s.h)}">${esc(s.h)}</p>` : ''}`; break;
      case 'end': tone = 'deep'; inner = `<p class="pv-h ${hs(s.h)}">${esc(s.h)}</p><span class="pv-cta">${plat === 'Instagram' ? 'Lien en bio' : 'En savoir plus'}</span><p class="pv-url">${esc(url(s.path))}</p>`; break;
      case 'clip': tone = 'photo'; inner = `<div class="pv-ph"><b>Clip 6 s à tourner</b>${esc(s.desc)}</div>`; break;
    }
    const bg = s.k === 'photo' && s.src ? ` style="background-image:linear-gradient(180deg,rgba(0,0,0,.25),rgba(0,0,0,0) 30%,rgba(0,0,0,0) 55%,rgba(0,0,0,.55)),url('${base}${s.src}')"` : '';
    return `<div class="pv r-${r}${tone ? ' t-' + tone.split(' ').join(' t-') : ''}"${bg}>${top}<div class="pv-in">${inner}</div>${bot}</div>`;
  }

  /* ---------- Visionneuse plein écran ---------- */
  let lb = null;
  const view = { items: [], i: 0, title: '', back: null };

  function lightbox() {
    if (lb) return lb;
    lb = document.createElement('div');
    lb.className = 'lb studio';
    lb.hidden = true;
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Visuel en grand');
    lb.innerHTML = `<div class="lb-bar"><span class="lb-title"></span><span class="lb-count"></span>
      <button type="button" class="lb-b lb-fs">Plein écran</button><button type="button" class="lb-b lb-close" aria-label="Fermer">Fermer ✕</button></div>
      <div class="lb-stage"><button type="button" class="lb-nav lb-prev" aria-label="Précédent">‹</button><div class="lb-frame"></div><button type="button" class="lb-nav lb-next" aria-label="Suivant">›</button></div>
      <div class="lb-dots" aria-hidden="true"></div>`;
    document.body.append(lb);
    const fs = lb.querySelector('.lb-fs');
    if (!document.fullscreenEnabled) fs.hidden = true;
    fs.addEventListener('click', () => {
      try {
        if (document.fullscreenElement) document.exitFullscreen();
        else lb.requestFullscreen().catch(() => { fs.hidden = true; });
      } catch (e) { fs.hidden = true; }
    });
    document.addEventListener('fullscreenchange', () => { fs.textContent = document.fullscreenElement ? 'Quitter le plein écran' : 'Plein écran'; });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', () => go(-1));
    lb.querySelector('.lb-next').addEventListener('click', () => go(1));
    lb.querySelector('.lb-stage').addEventListener('click', (e) => { if (e.target.classList.contains('lb-stage')) close(); });
    let x0 = null;
    lb.addEventListener('pointerdown', (e) => { x0 = e.target.closest('video') ? null : e.clientX; });
    lb.addEventListener('pointerup', (e) => { if (x0 !== null && Math.abs(e.clientX - x0) > 50) go(e.clientX < x0 ? 1 : -1); x0 = null; });
    document.addEventListener('keydown', (e) => {
      if (lb.hidden) return;
      if (e.key === 'Escape' && !document.fullscreenElement) close();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'Tab') { // garde le focus dans la visionneuse
        const f = [...lb.querySelectorAll('button:not([hidden]):not(:disabled), video')];
        const k = f.indexOf(document.activeElement);
        if (e.shiftKey && k <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && k === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    window.addEventListener('resize', () => { if (!lb.hidden) size(); });
    return lb;
  }

  function size() {
    const it = view.items[view.i];
    const frame = lb.querySelector('.lb-frame');
    const stage = lb.querySelector('.lb-stage');
    const narrow = window.innerWidth <= 600;
    const w = stage.clientWidth - (narrow ? 24 : 140);
    const h = stage.clientHeight - (narrow ? 72 : 24);
    frame.style.width = `${Math.max(160, Math.floor(Math.min(w, h * ASPECT[it.r])))}px`;
  }

  function draw() {
    const it = view.items[view.i];
    const frame = lb.querySelector('.lb-frame');
    frame.innerHTML = it.video
      ? `<video src="${it.video}" controls autoplay playsinline style="aspect-ratio:${ASPECT[it.r]}"></video>`
      : it.html;
    lb.querySelector('.lb-title').innerHTML = `<b>${esc(view.title)}</b> · ${esc(it.label)}`;
    lb.querySelector('.lb-count').textContent = view.items.length > 1 ? `${view.i + 1} / ${view.items.length}` : '';
    lb.querySelector('.lb-prev').disabled = view.i === 0;
    lb.querySelector('.lb-next').disabled = view.i === view.items.length - 1;
    lb.querySelectorAll('.lb-nav').forEach((b) => { b.hidden = view.items.length < 2; });
    lb.querySelector('.lb-dots').innerHTML = view.items.length > 1 ? view.items.map((_, j) => `<i class="${j === view.i ? 'on' : ''}"></i>`).join('') : '';
    size();
  }

  function go(step) {
    const j = view.i + step;
    if (j < 0 || j >= view.items.length) return;
    view.i = j;
    draw();
  }

  function open(items, i, title) {
    lightbox();
    document.querySelectorAll('.st-video').forEach((v) => v.pause());
    Object.assign(view, { items, i, title, back: document.activeElement });
    lb.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    draw();
    lb.querySelector('.lb-close').focus();
  }

  function close() {
    if (document.fullscreenElement) document.exitFullscreen();
    lb.querySelector('.lb-frame').innerHTML = ''; // coupe la vidéo
    lb.hidden = true;
    document.documentElement.style.overflow = '';
    if (view.back) view.back.focus();
  }

  /* ---------- Onglet ---------- */
  function mount(host, data, options) {
    const opt = Object.assign({ mediaBase: '', storageKey: 'studio-day', intro: '' }, options);
    const JOURS = data.jours;
    let day = store.get(opt.storageKey);
    if (!JOURS.some((j) => j.date === day)) day = JOURS[0].date;
    let galleries = {};

    function render() {
      const it = JOURS.find((j) => j.date === day);
      const post = parsePost(it.post);
      const shoot = post.secs.find((s) => s.kind === 'shoot');
      galleries = {};
      const days = JOURS.map((j) => {
        const badge = opt.dayBadge ? opt.dayBadge(j) : '';
        return `<button type="button" data-st-day="${j.date}" aria-pressed="${j.date === day}"><b>J${j.jour} · ${dshort(j.date)}</b><span>${esc(j.angle)}</span>${badge ? `<em>${esc(badge)}</em>` : ''}</button>`;
      }).join('');

      const nets = post.secs.filter((s) => s.plat).map((s) => {
        const v = it.visuels[s.plat] || { type: 'text' };
        const id = `J${it.jour}-${CODE[s.plat]}`;
        let vis;
        if (v.type === 'text') {
          vis = `<div class="st-textonly">Post texte, pas de visuel à produire. ${s.plat === 'X' && /^1\//m.test(s.body) ? 'Publier en thread, un message par numéro.' : 'Publier le texte tel quel.'}</div>`;
        } else {
          const n = v.slides.length;
          const lab = (j) => v.type === 'video' ? (j === 0 ? 'Couverture / 1re image' : 'Carton final') : v.type === 'carousel' ? `Slide ${j + 1}` : 'Visuel';
          const items = [];
          if (v.file) items.push({ video: opt.mediaBase + v.file, r: v.r, label: 'Vidéo finale' });
          v.slides.forEach((sl, j) => items.push({ html: slide(sl, v.r, j, v.type === 'carousel' ? n : 1, s.plat, opt.mediaBase), r: v.r, label: lab(j) }));
          galleries[id] = { items, title: `J${it.jour} · ${s.plat}` };
          const zoom = (k) => `<button type="button" class="st-zoom" data-lb="${id}" data-lb-i="${k}" aria-label="Voir en grand : ${esc(items[k].label)}">⤢</button>`;
          const player = v.file ? `<figure class="st-frame r-${v.r}">${zoom(0)}<video class="st-video r-${v.r}" src="${opt.mediaBase + v.file}" controls playsinline preload="metadata"></video><figcaption>Vidéo finale · ${esc(v.file.split('/').pop())}</figcaption></figure>` : '';
          const off = v.file ? 1 : 0;
          vis = `<div class="st-strip">${player}${items.slice(off).map((x, j) => `<figure class="st-frame r-${v.r}"><button type="button" class="st-slide-btn" data-lb="${id}" data-lb-i="${j + off}" aria-label="Voir en grand : ${esc(x.label)}">${x.html}</button><figcaption>${esc(x.label)} · ⤢ agrandir</figcaption></figure>`).join('')}</div>
            <p class="st-spec">${RATIO[v.r]}${v.type === 'video' ? ` · vidéo ${esc(v.cut)}` : v.type === 'carousel' ? ` · ${n} slides` : ''}</p>
            ${v.type === 'video' ? `<p class="st-note">${v.file ? 'Vidéo produite : voix off, images fixes et rushes, sous-titres incrustés. À droite, la couverture et le carton final.' : 'Format voix off, sans personne à l’écran : images fixes et rushes courts. Plan de montage ci-dessus.'}</p>` : ''}
            ${v.note ? `<p class="st-note">${esc(v.note)}</p>` : ''}
            ${[...new Set(v.slides.filter((x) => x.credit).map((x) => x.credit))].map((c) => `<p class="st-credit">${esc(c)}</p>`).join('')}`;
        }
        const cap = caption(s.body);
        const big = galleries[id] ? `<button type="button" class="st-btn" data-lb="${id}" data-lb-i="0">Voir en grand</button>` : '';
        return `<article class="st-net" id="post-${id}" data-id="${id}" data-plat="${s.plat}"><header><span class="st-dot" style="background:var(${COLOR[s.plat]})"></span><span class="st-nm">${s.plat}</span><span class="st-fm">${esc(s.fm)}</span>${big}</header>
          <div class="st-body"><div class="st-vis">${vis}</div>
          <div class="st-cap"><div class="st-row"><span class="st-lbl">Texte à publier</span><button type="button" class="st-btn" data-st-copy="${encodeURIComponent(cap)}">Copier</button></div><div class="st-md">${md(cap)}</div></div></div></article>`;
      }).join('');

      host.innerHTML = `<div class="studio">
        ${opt.intro ? `<p class="st-intro">${esc(opt.intro)}</p>` : ''}
        <div class="st-days" role="group" aria-label="Jour">${days}</div>
        <div class="st-head">
          <div class="st-eyebrow">${esc(it.phase)} · ${esc(it.jour_semaine)} ${dshort(it.date)} · ${esc(it.destination)}</div>
          <h2>${esc(post.title)}</h2>
          <div class="st-chips"><span class="st-chip">${esc(it.etape)}</span><span class="st-chip">${esc(it.matrice)}</span>${it.candidat_pub ? '<span class="st-chip pub">Candidat pub</span>' : ''}</div>
          ${it.warn ? `<p class="st-warn">${esc(it.warn)}</p>` : ''}
        </div>
        ${shoot ? `<details class="st-shoot"><summary>${esc(shoot.h)}</summary><div class="st-md">${md(shoot.body)}</div></details>` : ''}
        <div class="st-nets">${nets}</div></div>`;

      if (opt.decorate) {
        host.querySelectorAll('.st-net').forEach((a) => opt.decorate(a, { id: a.dataset.id, plat: a.dataset.plat, jour: it }));
      }
      const cur = host.querySelector('.st-days [aria-pressed="true"]');
      if (cur) cur.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }

    host.onclick = (e) => {
      const t = e.target.closest('button');
      if (!t || !host.contains(t)) return;
      if (t.dataset.stDay) {
        day = t.dataset.stDay;
        store.set(opt.storageKey, day);
        render();
      } else if (t.dataset.lb) {
        const g = galleries[t.dataset.lb];
        open(g.items, +t.dataset.lbI, g.title);
      } else if (t.dataset.stCopy !== undefined) {
        const text = decodeURIComponent(t.dataset.stCopy);
        const done = (ok) => { t.textContent = ok ? 'Copié' : 'Sélectionnez le texte'; setTimeout(() => { t.textContent = 'Copier'; }, 1600); };
        const select = () => {
          const r = document.createRange();
          r.selectNodeContents(t.closest('.st-cap').querySelector('.st-md'));
          const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
        };
        try { navigator.clipboard.writeText(text).then(() => done(true), () => { select(); done(false); }); } catch (err) { select(); done(false); }
      }
    };

    render();
    return { render };
  }

  window.Studio = { mount, ids: (data) => data.jours.flatMap((j) => PLATS.map((p) => `J${j.jour}-${CODE[p]}`)) };
})();
