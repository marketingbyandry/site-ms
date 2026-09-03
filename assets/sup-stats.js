/* Fait varier légèrement les chiffres "aperçu" de la section fournisseurs
   partenaires (index/b2b/barometre-energie) une fois par jour. Le seed est
   dérivé de la date UTC + une clé stable par carte, pour que tous les
   visiteurs voient le même chiffre le même jour et sur toutes les pages,
   sans backend ni build. */
(() => {
  function hash(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 4294967296; // -> [0, 1)
  }

  const today = new Date().toISOString().slice(0, 10);

  document.querySelectorAll('.sup-val').forEach(el => {
    const base = parseInt(el.dataset.base, 10);
    const key = el.dataset.key;
    if (!base || !key) return;
    const r = hash(today + '|' + key);
    let offset = Math.round(base * ((r * 2 - 1) * 0.03)); // ±3%
    if (offset === 0) offset = r < 0.5 ? -1 : 1;
    el.textContent = Math.max(1, base + offset);
  });
})();
