/* ════════════════════════════════════════
   BLOCS ARGUMENTAIRES PAR SECTEUR — prospect.html

   Chaque entree associe des mots-cles a un argumentaire court, affiche sous
   le hero de la landing de prospection quand l_URL porte ?secteur=<texte>.

   Bibliotheque volontairement ouverte : un nouveau secteur demarche = une
   entree de plus ici, sans toucher a prospect.html. Un secteur pas encore
   couvert n_est jamais une page cassee — MSSectorBlocks.fallback() produit
   un bloc generique a partir du texte brut du parametre.

   Les mots-cles sont ecrits DEJA normalises (minuscules, sans accents) :
   c_est sous cette forme que le texte entrant leur est compare.

   Ces fonctions sont pures et ne touchent pas au DOM — c_est ce qui permet
   de les tester dans un contexte Node (test/sector-blocks.test.mjs) et a
   prospect.html d_injecter leur sortie via textContent.
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
  // « PATE A PAPIER » et « pate a papier » tombent tous sur la meme entree.
  // \u0300-\u036f = diacritiques combinants isoles par la decomposition NFD.
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
  // brut du parametre (injecte ensuite via textContent, donc jamais
  // interprete comme du HTML).
  function fallback(secteurRaw) {
    if (typeof secteurRaw !== 'string' || !secteurRaw.trim()) return null;
    var secteur = secteurRaw.trim();
    return {
      titre: FALLBACK_TITRE,
      texte: 'Votre activite (' + secteur + ') implique une consommation d_energie qui pese sur vos charges. Nous la mettons en concurrence entre tous les fournisseurs du marche pour la reduire, gratuitement et sans engagement.'
    };
  }

  window.MSSectorBlocks = { match: match, fallback: fallback };
})();
