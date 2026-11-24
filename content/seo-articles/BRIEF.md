# Brief de rédaction — articles cabinetms.fr (novembre 2026)

Deux fichiers par article dans `content/seo-articles/` : `<slug>.md` et `<slug>.json`. Les slugs, catégories et mots-clés sont dans `manifest.json`. Écris chaque article sur disque avant de commencer le suivant.

## `<slug>.md`
- `# H1` (contient le mot-clé principal, naturel), puis UN paragraphe d'introduction qui répond directement à la question (2-3 phrases).
- 5 à 7 chapitres `## `, chacun avec un titre précis et 2 blocs au moins ; chaque chapitre s'ouvre sur sa réponse. Le sommaire cliquable est construit sur ces chapitres.
- Puis `## Questions fréquentes` : 3 ou 4 `### Question ?`, chacune suivie d'un paragraphe de réponse autonome, sans répéter le corps.
- Puis une dernière section `## ` (titre lié au sujet) contenant UN SEUL paragraphe, 2-3 phrases : invitation à envoyer sa facture pour une étude gratuite. C'est le texte du CTA.
- Au moins un tableau Markdown par article (`| a | b |`, 2 à 4 colonnes, pas de `|` dans les cellules).
- Listes : `- **Titre court** : explication.` (deviennent des cartes) ou `1. **Étape** : explication.` (deviennent une frise). Soit tous les items d'une liste commencent par du gras, soit aucun. Une ligne par item.
- Syntaxe permise : `##`, `###`, paragraphes d'une seule ligne, listes, tableaux, `**gras**`, liens. Pas d'italique, pas de `<html>`, pas de `>`.
- 3 à 5 liens internes `[texte](slug.md)` (slug d'une page existante ou du manifeste, jamais soi-même). Sources externes : `[texte](https://…)`.
- 950 à 1 300 mots. Vouvoiement. Ton de conseiller : direct, concret, zéro remplissage. Pas de tirets cadratins, pas de « ce n'est pas X, c'est Y », pas de triades creuses, pas de « Dans un monde où ». Varie les ouvertures et la structure d'un article à l'autre : ces textes ne doivent pas se ressembler.
- Chaque article doit apporter quelque chose d'utilisable : exemple chiffré avec calcul juste, modèle de vérification, questions à poser, seuils, calendrier.

## `<slug>.json`
```json
{
 "status": "done",
 "seoTitle": "50 caractères max, mot-clé en tête",
 "description": "phrase(s) complète(s), 120 à 155 caractères",
 "excerpt": "une phrase de 90 à 115 caractères pour la carte du blog",
 "datePublished": "2026-11-24",
 "energie": "d'électricité | de gaz | d'énergie (une des trois)",
 "toc": ["libellé court par chapitre, FAQ comprise, dans l'ordre", "…", "Votre étude gratuite"],
 "tldr": [{"k": "Le principe", "text": "…"}, {"k": "…", "text": "…"}, {"k": "…", "text": "…"}],
 "notes": [{"section": 0, "quote": true, "text": "extrait copié mot pour mot du .md"}],
 "related": ["slug1", "slug2", "slug3"]
}
```
`toc` compte un libellé par `## ` (chapitres + FAQ + section finale). `notes` : 1 ou 2, texte présent mot pour mot dans la section d'indice donné (0 = premier `## `), sans `**` ni lien dedans. `tldr` : 3 items, aucun fait absent de l'article. `related` : 3 slugs, jamais soi-même.

## Chiffres : règle absolue
N'utilise que la feuille de faits ci-dessous, ou une donnée que tu viens de vérifier par WebSearch/WebFetch sur une source officielle (cre.fr, legifrance, service-public, economie.gouv, enedis, grdf, ademe, energie-mediateur), liée dans le texte. Sinon : reste qualitatif, ou présente un exemple clairement hypothétique (« prenons », « exemple ») avec un calcul juste. Aucune statistique d'économies M&S, aucun client inventé, aucun témoignage. Ne nomme aucun fournisseur ni comparateur concurrent. Ne promets aucun résultat. Pour le droit : décris la règle générale et renvoie aux conditions du contrat.

### Feuille de faits (vérifiée le 24/11/2026)
- TURPE 7 HTA-BT : +3,04 % en moyenne au 1er août 2026 (CRE, délibération 2026-105 du 21/05/2026, https://www.cre.fr/fileadmin/Documents/Deliberations/2026/260521_2026-105_Evolution_TURPE_7_HTA-BT.pdf). HTB : +3,34 %.
- Accise gaz combustible : 16,39 €/MWh au 1er février 2026, 16,66 €/MWh depuis le 1er août 2026 (https://www.edf.fr/entreprises/faq-entreprises/facture/les-taxes-evolutions-tarifaires-en-gaz/qu-est-ce-que-l-accise-sur-les-gaz-naturels-ex-ticgn).
- Accise électricité jusqu'à 36 kVA : 30,62 €/MWh depuis le 1er août 2026 (avant : 30,85).
- Tarif réglementé du gaz supprimé pour tous le 1er juillet 2023. Le prix repère CRE est un indicateur résidentiel : +6,6 % TTC en moyenne au 1er novembre 2026, seule la part approvisionnement évolue (https://www.connaissancedesenergies.org/afp/france-le-prix-de-reference-du-gaz-augmentera-de-66-au-1er-novembre-261012).
- PEG : contrat novembre à 85,98 €/MWh le 21 octobre 2026 et 94,40 €/MWh le 27 octobre (https://selectra.info/energie/actualites/prix-gaz/2026-10-28) ; 63,90 €/MWh le 24 juillet (PEG août). Toujours daté. Formulation de la source : « cotations relevées », sans nommer le comparateur dans le texte.
- Électricité spot France : moyenne 149,75 €/MWh en septembre 2026 (ENTSO-E), voir [baromètre](barometre-energie.md).
- Décret BACS : neuf > 70 kW depuis le 8 avril 2024 ; existant > 290 kW depuis le 1er janvier 2025 ; existant > 70 kW au 1er janvier 2030 (report par décret 2025-1343 du 26/12/2025). Guide officiel v2 : https://rt-re-batiment.developpement-durable.gouv.fr/IMG/pdf/guide_bacs_janvier_2026.pdf. Exemption si temps de retour > 10 ans (à vérifier dans le guide si c'est ton sujet). Aide CEE : fiche BAT-TH-116, classes A ou B.
- Heures creuses : réforme en cours, deuxième phase au 1er décembre 2026 (saisonnalisation), calendrier des professionnels à vérifier auprès d'Enedis ; horaires fixés localement.
- TRVE : ouvert aux entreprises de moins de 10 personnes et jusqu'à 2 M€ (CA, recettes ou bilan), sans plafond de 36 kVA depuis le 1er février 2025 (loi 2024-330) ; Bleu ≤ 36 kVA, Jaune au-delà en BT, Vert > 1 kV (service-public F38006).
- M&S Strategy : courtier en énergie depuis 2012 à Lattes (34), étude gratuite, réponse sous 24h, rémunéré par les fournisseurs.
