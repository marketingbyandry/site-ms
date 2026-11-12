# Reddit + backlinks gratuits — complément budget minimal au Pilier D

Complète le Pilier D (autorité externe) de la stratégie du 2026-07-22 et les
cibles déjà vérifiées de la PR #21 (2026-08-18), sans rouvrir leurs
arbitrages. Contrainte de ce document : **budget €0**, aucun outil payant,
aucune RP payante, aucun temps de rédaction externalisé.

## Reddit — verdict après vérification réelle des communautés

Recherche faite communauté par communauté (pas de supposition) :

| Subreddit | Membres | Langue/cible | Pertinence pour M&S Strategy |
|---|---|---|---|
| r/france | 2,6M | FR, généraliste | Trafic massif mais dilué, aucune verticale énergie B2B, règles anti-promo strictes |
| r/vosfinances | 431k | FR, finance perso | Actif sur "réduire ses factures" mais cible **particuliers**, pas dirigeants/acheteurs PME-ETI |
| r/Entrepreneur | 5,3M | EN, généraliste | Hors cible (langue + géographie) |
| r/energy | 287k | EN, généraliste | Hors cible (langue + géographie) |

**Aucun subreddit français dédié PME/entrepreneuriat/énergie B2B de taille
significative n'existe** (vérifié : "EntrepreneurFR", "entrepreneuriat",
"smallbusinessfrance" ne remontent aucune communauté active comparable).

**Conclusion : Reddit n'est pas un canal à opérationnaliser en routine pour
cette cible.** Deux raisons cumulatives : (1) les liens Reddit sont
`nofollow` — valeur SEO directe nulle, seul l'effet de visibilité dans les
SERP compte ; (2) aucune communauté française où se trouve réellement
l'acheteur B2B PME/ETI. Le canal organique déjà choisi pour ce public est
LinkedIn (décision du 2026-07-20), qui reste le bon choix.

**Seule pratique à garder, opportuniste et non planifiée** : si un fil r/france
ou r/vosfinances pose une vraie question sur les prix pro de l'énergie,
réponse experte signée M&S Strategy, sans lien promotionnel — la marque
elle-même devient citable par les LLM qui indexent Reddit, ce qui sert
indirectement le Pilier D sans configurer de canal dédié.

## Backlinks gratuits — ce qui reste à activer à coût nul

La PR #21 couvre déjà les annuaires et l'outreach presse (FFCE, Kompass,
Infogreffe, annuaire-entreprises.data.gouv.fr, Societe.com, PagesJaunes,
Qwoted/Featured/Connectively). Ce qui manque encore, gratuit et non fait à
ce jour d'après l'historique du projet :

1. **Fiche Google Business Profile** — catégorie "Courtier en énergie",
   zone de service, photos, Q&A. Identifié comme pilier dès le 22/07,
   jamais opérationnalisé depuis. Gratuit, ~30 min, signal d'entité fort
   pour Google *et* les LLM.
2. **Bing Places** — équivalent Microsoft/Copilot du point 1, même
   contenu, ~10 min une fois la fiche Google prête.
3. **Wikidata** — créer l'entité M&S Strategy si elle n'existe pas, avec
   `sameAs` vers le site et LinkedIn. Bloqué depuis le 22/07 par
   l'absence d'URL LinkedIn confirmée (même blocage que le JSON-LD
   `sameAs` signalé en PR #9) — à lever en premier.
4. **Échange de liens avec partenaires non-concurrents** — comptables,
   avocats d'affaires, associations professionnelles sectorielles
   (agriculture/industrie/logistique, déjà les 3 verticales du site).
   Gratuit par nature (réciprocité), mais nécessite des contacts réels :
   **aucun contact nominatif n'est proposé ici**, à identifier par
   l'utilisateur avant toute prise de contact.
5. **Avis Google + réponses** — déjà identifié en Pilier D, gratuit,
   effet cumulatif lent mais réel sur la confiance E-E-A-T.

## Action immédiate, budget €0

- [ ] Confirmer l'URL LinkedIn entreprise (débloque Wikidata + `sameAs`)
- [ ] Créer/optimiser la fiche Google Business Profile
- [ ] Dupliquer la fiche sur Bing Places
- [ ] Lancer une première vague de demandes d'avis Google auprès de
      clients existants
- [ ] Reddit : aucune action de canal — repli sur veille ponctuelle
      manuelle si un fil pertinent apparaît, pas de temps dédié
