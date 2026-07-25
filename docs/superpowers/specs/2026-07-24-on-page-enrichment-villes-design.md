# Enrichissement on-page des 10 pages villes — design

Date : 2026-07-24
Suite de : [`2026-07-21-footer-villes-seo-design.md`](2026-07-21-footer-villes-seo-design.md) (PR #10, footer + 10 pages villes)

## Contexte

La revue finale de PR #10 a signalé un risque doorway-pages / thin-content sur les
10 pages `courtier-energie-{ville}.html` : au-delà de la première phrase du bloc
`seo-intro` (déjà différenciée par ville) et des 3 communes voisines listées dans le
`def-box`, tout le reste du contenu textuel est identique mot pour mot d'une page à
l'autre — en particulier la deuxième phrase du `seo-intro` :

> « Que vous soyez une entreprise, une collectivité ou un particulier à **{ville}**,
> M&S Strategy négocie pour vous auprès de l'ensemble des fournisseurs de gaz et
> d'électricité actifs sur le marché français, sans se limiter à une poignée de
> partenaires commerciaux. »

Seul le nom de ville change : c'est le patron exact que Google cible avec ses
systèmes anti-spam sur le contenu à l'échelle (« scaled content abuse »), et que le
design spec de PR #9 (stratégie GEO+SEO) met en garde contre explicitement
(« Google sanctionne les pages villes vides ; les LLM les ignorent »).

Ce spec ne touche que le contenu textuel des 10 pages existantes. Décisions prises
en amont (conversation) :
- Pas de page région/hub — on reste sur les 10 pages villes pour maximiser la
  pertinence SEO par ville.
- Pas d'encart « distributeur local » (Électricité de Strasbourg, Régaz-Bordeaux) —
  écarté malgré des faits vérifiés, pour rester simple et parce que ça ne concernait
  que 2 pages sur 10.
- La FAQ est le levier à maximiser, en prolongeant le raisonnement du paragraphe
  sectoriel plutôt qu'en la traitant comme un bloc isolé.

## Scope

### Inclus — 2 changements par page, sur les 10 fichiers `courtier-energie-*.html`

**1. Remplacement de la 2ᵉ phrase du `seo-intro`**

La 1ʳᵉ phrase (déjà différenciée, cf. audit ci-dessous) est conservée telle quelle.
La 2ᵉ phrase, identique sur les 10 pages, est remplacée par une phrase qui
prolonge le fait sectoriel réel de la 1ʳᵉ phrase vers une implication concrète de
consommation énergétique puis vers la valeur du courtage — au lieu de répéter un
gabarit générique.

**2. Activation de la section FAQ (`.faq-section`, CSS déjà présente mais inutilisée)**

6 questions/réponses par page, insérées entre `seo-intro` et `cstrip`, plus un bloc
`FAQPage` JSON-LD ajouté à côté du `Service` JSON-LD déjà présent dans le `<head>`.

Les questions 1, 4, 5 et 6 suivent une trame commune aux 10 pages — légitime pour
du contenu de process/positionnement (ce n'est pas le pattern doorway : c'est la
même question de fond qu'un vrai client se pose, quelle que soit la ville). Les
questions 2 et 3 portent la différenciation réelle : elles relient le secteur
propre à chaque ville à une implication concrète, et routent vers des ressources
internes différentes selon le profil économique de la ville (industriel vs
tertiaire).

Volume volontairement plafonné à 6 questions : au-delà, le risque est de fabriquer
des questions creuses pour la forme, ce qui recrée le problème de fond plutôt que
de le résoudre.

### Explicitement hors scope

- Encart « distributeur local » (ES Strasbourg / Régaz Bordeaux) — écarté par
  décision utilisateur.
- Page(s) région/hub groupant plusieurs villes — écarté par décision utilisateur.
- Checklist et `.cstrip`/footer génériques — inchangés, pas le levier de
  différenciation, pas un signal doorway en tant que tel.
- Priorisation SEA (budget, ciblage d'annonces par ville) — hors du repo, config
  plateforme publicitaire.
- Toute nouvelle statistique chiffrée, tout nombre de clients ou témoignage
  attribué à une ville — cf. garde-fous ci-dessous, repris de PR #10.

## Garde-fous anti-fabrication (repris et étendus de PR #10)

Le contenu différenciant reste limité à des faits publics vérifiables : secteurs
économiques déjà cités en 1ʳᵉ phrase de `seo-intro`, communes limitrophes déjà
listées dans le `def-box`, et une règle réglementaire nationale (tarif réglementé)
identique pour toute la France — vérifiée dans le cadre de ce spec :

- Le tarif réglementé de vente (TRV) du **gaz** a été supprimé pour tous les
  consommateurs depuis le 1er juillet 2023 (fin du dispositif, marché 100% libre).
- Le TRV de l'**électricité** ("tarif bleu" EDF) reste réservé aux sites dont la
  puissance souscrite est ≤ 36 kVA (particuliers et très petits professionnels).

Ce sont des faits nationaux, pas des exceptions locales inventées — la variation
par ville se limite à l'exemple concret donné (un site industriel toulousain à
forte puissance vs. une petite structure tertiaire montpelliéraine), pas à la règle
elle-même.

## Audit de la 1ʳᵉ phrase existante (base de la 2ᵉ phrase à écrire)

| Ville | 1ʳᵉ phrase actuelle (conservée) | Secteur retenu |
|---|---|---|
| Bordeaux | viticulture, aéronautique, tertiaire | mixte → tertiaire |
| Lille | logistique, héritage textile, tertiaire, vente à distance | industriel |
| Lyon | santé, chimie, biotechnologies, services | industriel |
| Marseille | logistique portuaire, industrie, tertiaire dense | industriel |
| Montpellier | santé, numérique, enseignement supérieur | tertiaire |
| Nantes | navale, aéronautique, agroalimentaire, tertiaire | industriel |
| Paris | sièges sociaux, financier, tertiaire | tertiaire |
| Rennes | numérique, agroalimentaire, PME tech | tertiaire |
| Strasbourg | institutions européennes, industrie transfrontalière | tertiaire |
| Toulouse | aéronautique, spatial, PME/services | industriel |

Classement "industriel"/"tertiaire" utilisé uniquement pour router les liens
internes de la FAQ (Q2/Q3), pas affiché tel quel sur la page.

## Contenu exact — 2ᵉ phrase du `seo-intro` (remplace la phrase générique)

**Bordeaux**
> Un domaine viticole aux besoins saisonniers, un site aéronautique à forte
> puissance souscrite et un cabinet de services aux charges fixes stables n'ont
> rien à gagner à souscrire la même offre : M&S Strategy étudie chaque profil
> bordelais individuellement pour identifier le contrat réellement adapté.

**Lille**
> Entrepôts, plateformes logistiques et sites de vente à distance consomment
> différemment d'un bureau tertiaire lillois : M&S Strategy calibre son étude sur
> la puissance souscrite réelle de chaque site plutôt que sur une offre standard.

**Lyon**
> Un site chimique à consommation continue et forte puissance n'a pas le même
> profil qu'un cabinet de services lyonnais : M&S Strategy adapte la négociation à
> cette réalité industrielle plutôt que de proposer une offre uniforme.

**Marseille**
> Un entrepôt du port autonome et un établissement du secteur tertiaire marseillais
> n'ont pas la même courbe de consommation : M&S Strategy étudie chaque site selon
> son usage réel avant de mettre les fournisseurs en concurrence.

**Montpellier**
> Un établissement de santé et une start-up numérique montpelliéraine partagent un
> même impératif : ne jamais subir de coupure ni de hausse tarifaire imprévue.
> M&S Strategy sécurise ces contrats en priorité sur ce critère de continuité.

**Nantes**
> Les sites de production navale et aéronautique nantais, à consommation élevée et
> continue, ont tout intérêt à mettre leurs fournisseurs en concurrence plutôt que
> de subir une reconduction automatique : c'est exactement ce que fait M&S
> Strategy, sans frais et sans engagement.

**Paris**
> Les entreprises parisiennes multi-sites dispersent souvent leurs contrats
> d'énergie entre plusieurs fournisseurs et échéances : M&S Strategy centralise
> l'étude de l'ensemble de vos implantations pour renégocier des conditions
> cohérentes.

**Rennes**
> Une PME technologique rennaise et un site agroalimentaire n'ont pas la même
> sensibilité aux variations de prix : M&S Strategy adapte son étude à cette
> réalité plutôt que de proposer un contrat type.

**Strasbourg**
> Un bâtiment institutionnel à consommation stable et un site industriel
> strasbourgeois à forte puissance souscrite ne relèvent pas de la même
> négociation : M&S Strategy adapte son étude à chacun de ces profils.

**Toulouse**
> Un site aéronautique toulousain à très forte puissance souscrite ne peut pas se
> permettre une simple reconduction tacite de contrat sans risque de surcoût : M&S
> Strategy sécurise et négocie ces contrats à enjeux élevés pour la filière et ses
> sous-traitants.

## Contenu exact — FAQ (6 questions/réponses par page)

Gabarit commun (Q1, Q4, Q5, Q6) + questions différenciées (Q2, Q3). `{ville}` et
les communes reprennent les valeurs déjà présentes dans le `def-box` de chaque
page (cf. tableau ci-dessous). `{lien-secteur}` = `ms-blog-article-1.html` pour les
villes classées "industriel", `b2b.html` pour les villes classées "tertiaire"
(tableau d'audit ci-dessus).

**Q1 — Quelles communes autour de {ville} M&S Strategy accompagne-t-il ?**
> Au-delà de {ville} intra-muros, nous accompagnons aussi les entreprises et
> particuliers de {commune1}, {commune2} et {commune3}.

**Q2 — M&S Strategy accompagne-t-il les entreprises du secteur {secteur} à {ville} ? (industriel)**
> Oui. Les sites industriels de ce type ont un profil de consommation — puissance
> souscrite élevée, fonctionnement continu — très différent d'un site tertiaire
> classique, ce qui change directement le type de contrat à négocier. Pour aller
> plus loin sur ces enjeux, consultez notre article
> <a href="ms-blog-article-1.html">Énergie industrielle : pourquoi votre site paie
> trop</a>.

**Q2 — variante tertiaire**
> Oui. Ces structures ont généralement des charges fixes stables mais peu de marge
> de manœuvre en cas de coupure ou de hausse tarifaire imprévue, ce qui oriente
> notre étude vers la sécurisation autant que vers le prix. Découvrez notre
> accompagnement dédié sur la page
> <a href="b2b.html">Courtier en énergie pour professionnels</a>.

**Q3 — Les entreprises de {ville} peuvent-elles encore bénéficier du tarif réglementé ? (industriel)**
> Le tarif réglementé du gaz a été supprimé pour tous les consommateurs depuis
> juillet 2023, à {ville} comme partout en France. Celui de l'électricité reste
> réservé aux sites de moins de 36 kVA de puissance souscrite — un seuil que
> dépassent la plupart des sites industriels de ce type présents à {ville}. Pour
> ces profils, la mise en concurrence des fournisseurs du marché libre est la
> seule option pour maîtriser ses coûts.

**Q3 — variante tertiaire**
> Le tarif réglementé du gaz a été supprimé pour tous les consommateurs depuis
> juillet 2023, à {ville} comme partout en France. Celui de l'électricité reste
> réservé aux sites de moins de 36 kVA de puissance souscrite — un seuil que
> respectent encore une partie des petites structures tertiaires de {ville}, mais
> que dépassent les sites plus importants. M&S Strategy vérifie ce point avant de
> comparer les offres du marché libre.

**Q4 — Combien de temps prend la mise en concurrence des fournisseurs pour une entreprise à {ville} ?**
> M&S Strategy garantit une première réponse sous 48h après réception de vos
> factures. Le détail de notre méthode est expliqué sur la page
> <a href="comment-ca-marche.html">Comment ça marche</a>.

**Q5 — Quand renégocier son contrat d'énergie à {ville} ?**
> Le bon moment dépend de l'échéance de votre contrat en cours et de l'évolution
> des prix de marché, pas uniquement de sa date de fin. Notre guide
> <a href="ms-blog-article-2.html">Renouvellement contrat énergie industrie : le
> guide du bon moment</a> détaille les signaux à surveiller.

**Q6 — Pourquoi passer par un courtier plutôt que négocier directement avec un fournisseur à {ville} ?**
> Un courtier indépendant comme M&S Strategy interroge l'ensemble des fournisseurs
> actifs sur le marché français, sans se limiter à une poignée de partenaires
> commerciaux, et ne facture aucun frais au client. Nos résultats sont détaillés
> sur la page <a href="resultats.html">Résultats & économies</a>.

### Table de substitution par ville

| Ville | Communes (Q1) | Secteur (Q2) | Variante Q2/Q3 |
|---|---|---|---|
| Bordeaux | Mérignac, Pessac, Talence | viticole et tertiaire | tertiaire |
| Lille | Roubaix, Tourcoing, Villeneuve-d'Ascq | logistique | industriel |
| Lyon | Villeurbanne, Vénissieux, Bron | chimique | industriel |
| Marseille | Aix-en-Provence, Vitrolles, Aubagne | logistique portuaire | industriel |
| Montpellier | Castelnau-le-Lez, Lattes, Pérols | santé et numérique | tertiaire |
| Nantes | Saint-Herblain, Rezé, Orvault | naval et aéronautique | industriel |
| Paris | Boulogne-Billancourt, Saint-Denis, Créteil | tertiaire et financier | tertiaire |
| Rennes | Saint-Grégoire, Cesson-Sévigné, Bruz | numérique | tertiaire |
| Strasbourg | Illkirch-Graffenstaden, Schiltigheim, Ostwald | institutionnel | tertiaire |
| Toulouse | Blagnac, Colomiers, Balma | aéronautique | industriel |

## Marquage structuré — `FAQPage` JSON-LD

Ajouté en second bloc `<script type="application/ld+json">` dans le `<head>`, à
côté du `Service` JSON-LD existant (ne le remplace pas). Le texte de chaque
réponse reprend le texte visible en clair, sans le HTML des liens :

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quelles communes autour de Strasbourg M&S Strategy accompagne-t-il ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Au-delà de Strasbourg intra-muros, nous accompagnons aussi les entreprises et particuliers d'Illkirch-Graffenstaden, Schiltigheim et Ostwald."
      }
    }
  ]
}
</script>
```

(6 objets `Question` par page, un par question ci-dessus, valeurs substituées par
ville selon la table.)

## Architecture

```
/courtier-energie-{ville}.html   (×10, modifiés — 2ᵉ phrase seo-intro + section
                                   FAQ + JSON-LD FAQPage)
```

Aucun autre fichier touché : pas de changement au footer, à `plan-du-site.html`,
à `sitemap.xml`, ni aux pages déjà livrées en PR #10.

## Vérification avant livraison

- Chaque page : la 1ʳᵉ phrase du `seo-intro` reste inchangée, la 2ᵉ phrase
  correspond exactement au texte ci-dessus (pas de dérive lors de l'implémentation).
- Section FAQ visible entre `seo-intro` et `cstrip`, stylée par `.faq-section`
  (déjà présente en CSS — vérifier qu'aucun ajustement de style n'est nécessaire
  une fois le HTML en place).
- JSON-LD `FAQPage` valide (syntaxe JSON correcte, un objet `Question` par
  question affichée, `text` sans balise HTML) sur les 10 pages, et ne remplace pas
  le JSON-LD `Service` existant.
- Les 4 liens internes (`ms-blog-article-1.html`, `ms-blog-article-2.html`,
  `comment-ca-marche.html`, `resultats.html`, `b2b.html`) résolvent correctement
  depuis chaque page ville.
- Aucun chiffre inventé, aucune exception réglementaire locale fabriquée : les
  seuls faits utilisés sont ceux déjà présents sur le site (secteurs, communes) ou
  vérifiés dans ce spec (TRV national).
- Lecture croisée des 10 pages : confirmer qu'aucune phrase (hors gabarit Q1/Q4/Q5/Q6
  assumé commun) n'est dupliquée mot pour mot d'une ville à l'autre.
