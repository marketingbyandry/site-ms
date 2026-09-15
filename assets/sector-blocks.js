/* ════════════════════════════════════════
   BLOCS ARGUMENTAIRES PAR SECTEUR — prospect.html

   Chaque entrée associe des mots-clés à un argumentaire court, affiché sous
   le hero de la landing de prospection quand l'URL porte ?secteur=<texte>.

   Bibliothèque volontairement ouverte : un nouveau secteur démarché = une
   entrée de plus ici, sans toucher à prospect.html. Un secteur pas encore
   couvert n'est jamais une page cassée — MSSectorBlocks.fallback() produit
   un bloc générique à partir du texte brut du paramètre.

   Les mots-clés sont écrits DÉJÀ normalisés (minuscules, sans accents) :
   c'est sous cette forme que le texte entrant leur est comparé.

   Ces fonctions sont pures et ne touchent pas au DOM — c'est ce qui permet
   de les tester dans un contexte Node (test/sector-blocks.test.mjs) et à
   prospect.html d'injecter leur sortie via textContent.
   ════════════════════════════════════════ */
(function () {
  var BLOCKS = [
    {
      keywords: ['ciment'],
      titre: 'Cimenterie',
      texte: "Les cimenteries sont éligibles aux tarifs réduits électro-intensifs (NAF 23.51Z) : nous vérifions votre éligibilité et la faisons valoir dans la négociation, en plus de la mise en concurrence des fournisseurs."
    },
    {
      keywords: ['blanchisserie', 'pressing'],
      titre: 'Blanchisserie industrielle',
      texte: "Séchage, repassage, eau chaude : les blanchisseries industrielles comptent parmi les activités les plus consommatrices d’énergie du secteur des services. Un poste sur lequel la mise en concurrence pèse lourd."
    },
    {
      keywords: ['data center', 'datacenter', 'cloud', 'hpc'],
      titre: 'Data center',
      texte: "Les data centers sont éligibles au tarif réduit électro-intensif dédié (NAF 63.11Z) : nous nous assurons qu’il est bien appliqué, en plus de la mise en concurrence de l’ensemble des fournisseurs du marché."
    },
    {
      keywords: ['frigorifique', 'froid'],
      titre: 'Logistique frigorifique',
      texte: "Le froid industriel tourne 24h/24 : la facture d’électricité est un poste fixe et lourd, sur lequel une renégociation bien menée produit un effet immédiat et durable."
    },
    {
      keywords: ['papeterie', 'pate a papier', 'papetier'],
      titre: 'Papeterie',
      texte: "Séchage du papier, production de pâte : la papeterie est l’un des secteurs industriels les plus intensifs en énergie, potentiellement éligible aux tarifs réduits électro-intensifs."
    },
    {
      keywords: ['verrerie', 'flaconnage', 'verrier'],
      titre: 'Verrerie industrielle',
      texte: "Fours à haute température, fusion continue : la verrerie industrielle a un profil de consommation qui justifie une étude tarifaire dédiée, au-delà de la simple mise en concurrence."
    }
  ];

  var FALLBACK_TITRE = 'Votre secteur';

  // Minuscules + suppression des accents, pour que « Pâte à papier »,
  // « PATE A PAPIER » et « pate a papier » tombent tous sur la même entrée.
  // \u0300-\u036f = diacritiques combinants isolés par la décomposition NFD.
  function normalize(value) {
    if (typeof value !== 'string') return '';
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function match(secteurRaw) {
    var needle = normalize(secteurRaw);
    if (!needle) return null;
    for (var i = 0; i < BLOCKS.length; i++) {
      var block = BLOCKS[i];
      for (var j = 0; j < block.keywords.length; j++) {
        if (needle.indexOf(block.keywords[j]) !== -1) {
          return { titre: block.titre, texte: block.texte };
        }
      }
    }
    return null;
  }

  // Repli pour tout secteur pas encore couvert par BLOCKS : on cite le texte
  // brut du paramètre (injecté ensuite via textContent, donc jamais
  // interprété comme du HTML).
  function fallback(secteurRaw) {
    if (typeof secteurRaw !== 'string' || !secteurRaw.trim()) return null;
    var secteur = secteurRaw.trim();
    return {
      titre: FALLBACK_TITRE,
      texte: 'Votre activité (' + secteur + ') implique une consommation d\u2019énergie qui pèse sur vos charges. Nous la mettons en concurrence entre tous les fournisseurs du marché pour la réduire, gratuitement et sans engagement.'
    };
  }

  window.MSSectorBlocks = { match: match, fallback: fallback };
})();
