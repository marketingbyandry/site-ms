# Deck de présentation — angle de campagne unifié pour la direction — design

## Contexte

Plusieurs chantiers indépendants ont été cadrés, conçus et en grande partie livrés sur `byandry.com` (M&S Strategy, courtier/cabinet d'expertise énergie B2B/B2C) : un positionnement de marque, un actif de preuve data (Baromètre), une stratégie de visibilité (GEO+SEO), une architecture de campagne d'acquisition (social payant + cold outbound + parcours post-facture) et un calendrier de contenu organique. Chacun a sa propre spec, son propre plan, sa propre PR. Aucun document ne les relie en un récit unique.

Ce document cadre un **deck de présentation** qui unifie ces chantiers en un seul angle de campagne, destiné à la direction de M&S Strategy.

## Objectif

Convaincre la direction d'**actionner maintenant** : sortir les PR en attente du statut brouillon, autoriser le budget nécessaire (publicité payante + infrastructure cold outbound), et lancer la campagne d'acquisition sans délai supplémentaire. Ce n'est pas un document informatif ou un compte-rendu d'avancement : c'est un dossier de décision. Chaque section doit servir cet objectif — y compris les sections "état des lieux", qui doivent être lues comme "voici ce qui est prêt à partir dès votre accord", pas comme un journal de bord.

## Décisions actées

- **Format** : un unique Artifact HTML (deck de slides navigables), identité visuelle bleu/noir cohérente avec le site.
- **Périmètre** : tout l'existant, unifié — positionnement (PR #16), Baromètre (PR #13/#15, mergées), GEO+SEO (PR #9, mergée) + pages villes (PR #10), campagne Meta Ads + parcours post-facture (PR #4) + pont Tally→HubSpot (PR #12), calendrier social organique (PR #5).
- **Structure narrative** : "spine" — une thèse de positionnement unique portée par 4 piliers, plutôt qu'un recensement chronologique par chantier ou un découpage par étape de parcours client. Cf. section "Structure du deck" ci-dessous.
- **Les mécaniques Tealer/TealerLab ne sont jamais nommées dans le deck.** La traduction B2B de ces mécaniques (preuve vérifiable plutôt qu'affirmation, urgence factuelle liée au marché, posture de challenger, exclusivité informationnelle) apparaît comme principe de conviction générique (slide 8), sans référence à leur origine.
- **Ton** : ferme et porteur de convictions, jamais virulent (cohérent avec la décision du 2026-08-03) ; pour le volet budgétaire, ton factuel et chiffré plutôt qu'incitatif — la direction doit pouvoir vérifier chaque chiffre avancé.

## Structure du deck (11 slides)

### Slide 1 — Accroche : le coût de l'inaction

Ouvre sur un chiffre vérifié plutôt qu'une affirmation générale : le prix du gaz de gros reste **quasiment deux fois le niveau moyen d'avant-crise** (34 €/MWh en 2024 selon le rapport de surveillance CRE, contre une moyenne 2014-2019 à 18 €/MWh — soit -15% vs 2023, mais toujours très loin du niveau pré-crise). En parallèle, l'électricité de gros est suivie en continu par le Baromètre M&S Strategy (73,66 €/MWh en juin 2026, méthodologie validée à ~1 €/MWh près contre 4 références publiques CRE/RTE indépendantes). Message : la plupart des entreprises françaises paient ce prix sans jamais savoir qu'un autre était possible — chaque mois sans action a un coût réel et mesurable, pas un coût hypothétique.

### Slide 2 — Notre thèse : positionnement "rébellion tarifaire"

Reprend le manifeste du positionnement (spec du 2026-08-03) : *"Les fournisseurs d'énergie ont un objectif : leur rentabilité. [...] Nous ne sommes pas neutres. Nous sommes du côté de l'entreprise qui paie la facture, pas de celui qui l'envoie."* Formule courte : *"Votre fournisseur regarde sa rentabilité. Nous regardons la vôtre."* Positionnement général : *"M&S Strategy — cabinet d'expertise énergie pour les entreprises."* Vocabulaire "cabinet" mis en avant, "courtier/courtage" gardé en retrait (crédibilité réglementaire, SEO).

### Slide 3 — La preuve : le Baromètre des prix de l'énergie

Le pivot qui transforme la thèse en fait vérifiable. 7 rétrospectives publiées (4 annuelles 2022-2025 + 3 trimestrielles 2026), pipeline électricité automatisé (API ENTSO-E, mise à jour mensuelle via GitHub Actions — PR #15 mergée), toutes les citations sourcées et vérifiées (une attribution erronée trouvée et corrigée en relecture avant publication). C'est un actif gratuit, sans engagement, qui permet au discours de "rendre visible ce qui reste sciemment illisible" sans jamais nommer un fournisseur ou un concurrent.

### Slide 4 — Être trouvé : visibilité GEO+SEO

Stratégie 6 piliers mergée (PR #9) : JSON-LD structuré, `llms.txt`, `robots.txt` ouvert aux crawlers IA (citabilité par les moteurs génératifs, pas seulement Google). Pages villes en préparation (PR #10, 10 métropoles, contenu sectoriel réel par ville — anti-doorway). Message : c'est un actif à rendement composé — chaque semaine de retard sur la sortie de brouillon de la PR #10 est une semaine de moins d'indexation cumulée.

### Slide 5 — Convertir : la campagne d'acquisition

Architecture hub-and-spoke (spec du 2026-07-19) : tous les canaux convergent vers un point de conversion unique (envoi de facture, `b2b.html#upload`), tous les leads tombent dans le même pipeline HubSpot "Dossier facture" (6 étapes, un conseiller nommé — Antoine Gaussin — à chaque email, zéro silence radio). Canal de lancement : Meta Ads B2B, budget **5-10 €/jour, test 2-4 semaines**, angle "gratuité et simplicité" (*"Envoyez votre facture, on s'occupe du reste"*), destination `b2b.html`, France entière. Le pont technique Tally→HubSpot (attribution UTM/gclid + webhook signé) est déjà construit (PR #12, brouillon) — la brique de mesure n'est plus un chantier à lancer, juste une PR à fusionner.

### Slide 6 — Rester présent : le calendrier social organique

LinkedIn (page entreprise), 8 semaines / 16 posts, alternance post officiel (pédagogie/FAQ) / post UGC-avatar — toujours signé M&S Strategy, jamais présenté comme un tiers indépendant. Angle directeur : *"vous auriez aimé payer votre carburant au prix d'il y a 3 ans ; c'est pareil pour l'énergie, sauf que vous pouvez changer votre donne"* (semaine 1, revient semaine 7). Coût : temps de production uniquement, pas de budget média (LinkedIn Ads explicitement écarté du périmètre).

### Slide 7 — Le parcours unifié

Schéma bout-en-bout (à représenter visuellement dans l'Artifact, en SVG inline) : Meta Ads / social organique / SEO → `b2b.html` (positionnement + preuve Baromètre + CTA) → envoi facture → pipeline post-facture HubSpot 6 étapes → client activé → avis/parrainage. Un seul entonnoir, un seul pipeline, quel que soit le canal d'entrée.

### Slide 8 — Pourquoi ça marche : les principes de conviction

Quatre principes, chacun illustré par un actif déjà construit (sans jamais nommer de marque tierce) :
- **Preuve vérifiable plutôt qu'affirmation** — le Baromètre, sourcé et contre-vérifié, pas un argumentaire commercial.
- **Urgence factuelle plutôt qu'artificielle** — le coût de l'inaction se mesure en euros de marché réels (slide 1), pas en compte à rebours fabriqué.
- **Posture de challenger plutôt que neutre** — le positionnement prend un camp (celui du payeur de facture), sans jamais attaquer nommément un acteur du marché.
- **Exclusivité informationnelle plutôt que promotionnelle** — le Baromètre et ses mises à jour trimestrielles créent une raison de revenir qui n'est pas une offre commerciale.

### Slide 9 — Ce qui est prêt aujourd'hui

Tableau statut réel, formulé en "prêt à activer" plutôt qu'en jargon PR :
- **Déjà en ligne** : Baromètre (7 rétrospectives, mise à jour mensuelle automatique), stratégie GEO+SEO technique (JSON-LD, `llms.txt`, sitemap).
- **Prêt, attend un accord de fusion** : positionnement "rébellion tarifaire" + CTA/maillage (0 point bloquant en relecture finale), pont Tally→HubSpot avec attribution, pages villes (10 métropoles).
- **Prêt, attend un budget** : campagne Meta Ads B2B (5-10 €/jour), infrastructure cold outbound.
- **Prêt, attend une décision de contenu** : calendrier social organique 8 semaines (production vidéo Higgsfield et dates exactes restent à faire une fois le feu vert donné).

### Slide 10 — La demande précise

Décomposer la demande en items actionnables et chiffrés, pas une demande vague :
1. **Accord de fusion** des PR prêtes (positionnement, pont Tally→HubSpot, pages villes) — coût : nul, effort de relecture déjà fait.
2. **Budget test Meta Ads** : 5-10 €/jour sur 2-4 semaines, soit **~70-280 € au total** pour la phase de test (5€×14j à 10€×28j).
3. **Budget infrastructure cold outbound** (si ce canal est retenu maintenant) : domaine dédié ~15 €/an + 6-8 boîtes mail ~50-70 €/mois + plateforme d'envoi (Instantly.ai/Smartlead) ~40-100 €/mois, soit **~90-170 €/mois récurrents**, démarrage à prévoir 1-2 semaines avant le plein volume (warmup obligatoire, non compressible).
4. **Prérequis techniques restants avant lancement Ads** : fusionner le Pixel Meta + consentement RGPD (PR #8), créer/activer une Page Facebook, activer le pipeline HubSpot "Dossier facture".
Chaque item doit rester vérifiable indépendamment — pas de chiffre arrondi qui ne provient pas d'une spec déjà écrite.

### Slide 11 — Prochaine étape immédiate

Ce qui peut démarrer dans la semaine suivant l'accord : fusion des PR prêtes (jour 1), activation Page Facebook + configuration Pixel (jour 1-2), lancement du test Meta Ads (dès Pixel actif), démarrage du warmup cold outbound si retenu (le poste au délai le plus long — à démarrer en premier s'il est retenu). Premier point de décision basé sur données réelles : fin de la phase de test Ads (2-4 semaines), pas avant.

## Charte graphique

Palette bleu/noir du site (tokens déjà normalisés sur la homepage), typographie cohérente avec `byandry.com`. Ton visuel sobre, pas de gimmick décoratif — le sérieux de la présentation doit lui-même porter le positionnement "cabinet d'expertise".

## Hors périmètre

- Production réelle des vidéos Higgsfield du calendrier social.
- Fixation d'un seuil de coût-par-lead (déjà explicitement différé à la donnée réelle dans la spec campagne).
- Constitution de la liste de prospects froids (hors périmètre, solution propre à l'utilisateur).
- Toute modification du code ou du contenu déjà livré/en brouillon — ce deck ne fait que synthétiser et présenter, il ne rouvre aucun chantier.

## Étape suivante

`superpowers:writing-plans` pour découper l'exécution (probablement une tâche unique : rédaction du contenu détaillé de chaque slide + construction de l'Artifact HTML), puis exécution par `content-builder`, puis relecture `quality-reviewer` avant livraison à l'utilisateur.
