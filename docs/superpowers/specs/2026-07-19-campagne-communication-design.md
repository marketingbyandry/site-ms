# Campagne de communication — architecture des branches

Date : 2026-07-19
Périmètre : document de stratégie (aucun code livré ici). Couvre l'architecture
globale des canaux de communication de M&S Strategy (byandry.com), un design
détaillé du canal **social payant** (Meta Ads B2B), et le design du
**parcours post-facture**. Les canaux social organique, SEO et mailing (hors
séquence post-facture) restent au niveau stratégique — à approfondir dans des
cadrages dédiés une fois le tunnel validé sur le premier canal.

## Contexte

M&S Strategy est un courtier en énergie B2B/B2C (`~/SITE MS`, site
byandry.com). Le point de conversion existe déjà techniquement : le bouton
"Transmettre ma facture en toute sécurité" (formulaire Tally `kd15W1`) sur
`b2b.html`/`b2c.html`, avec repli par email à `msstrategy@yahoo.com`. Aucune
automatisation n'existe aujourd'hui après cet envoi (pas de CRM, pas de
séquence email détectée dans le code).

Un Pixel Meta + bandeau de consentement RGPD est déjà codé (branche
`worktree-meta-pixel-consent`, non fusionnée) : événement `Lead` déclenché à
l'**ouverture** du formulaire Tally, pas à sa soumission réelle — Tally étant
un widget externe sans webhook vers le Pixel. C'est une limite de mesure
connue, pas un bug à corriger dans ce document.

## But

Définir l'architecture des branches de communication (quels canaux, quel
message, comment ils convergent) et concevoir en détail le premier canal à
lancer — le social payant à petit budget — ainsi que la continuité du
parcours client une fois la facture envoyée, pour que le processus donne une
impression de suivi aussi rigoureux qu'un grand cabinet.

## Principe d'architecture retenu : hub-and-spoke séquencé

Tous les canaux alimentent le **même point de conversion unique** (envoi de
facture) et tous les leads, quelle que soit leur origine, tombent dans le
**même pipeline post-facture** (HubSpot). Un seul mécanisme de conversion, un
seul pipeline CRM, pas de logique dupliquée par canal.

Les canaux sont déployés **dans le temps, pas en parallèle** : le social
payant B2B est conçu en détail et lancé en premier (phase de test 2-4
semaines). Les autres canaux restent au niveau stratégique et seront
approfondis une fois le tunnel prouvé.

Alternatives écartées :
- *Funnels dédiés par canal* (landing page/pipeline propre à chaque canal) —
  injustifié tant que le volume de leads est faible ; multiplie le travail de
  construction sans données pour l'optimiser.
- *Lancement simultané de tous les canaux* — dilue l'attention et le budget
  (5-10€/jour) sans apprentissage clair sur ce qui fonctionne.

## A. Vue d'ensemble des branches

```
Social payant (Meta Ads B2B) ──┐
Social organique (LinkedIn/FB) ─┤
SEO / contenu (blog existant)  ─┼──→ Envoi de la facture ──→ Parcours post-facture
Mailing (HubSpot)              ─┘     (Tally sur b2b.html/       (pipeline HubSpot,
                                        b2c.html, ou email)        section C)
```

## B. Canal approfondi — Social payant, Meta Ads B2B

| Paramètre | Décision |
|---|---|
| Plateforme | Meta Ads (Facebook + Instagram), seul canal payant |
| Audience | B2B uniquement — dirigeants de TPE/PME/ETI, France entière |
| Destination | `b2b.html`, CTA existant "Transmettre ma facture en toute sécurité" |
| Angle créatif | Gratuité et simplicité du service : *"Envoyez votre facture, on s'occupe du reste"* |
| Budget | 5-10€/jour, **phase de test 2-4 semaines** |
| Format | Image fixe simple, 1-2 variantes maximum — pas de carousel ni vidéo. À ce niveau de budget, moins de variété de créa accélère l'apprentissage de l'algorithme Meta et évite de disperser le budget entre variantes |
| Objectif de campagne | **Trafic** vers `b2b.html`, pas "Génération de leads" natif Meta. Le vrai formulaire est Tally sur site ; dupliquer une saisie native ferait perdre des leads en re-saisie |
| Mesure | Coût par clic, coût par événement Pixel `Lead` (proxy = ouverture Tally), taux clic → ouverture Tally |
| Décision fin de test | Pas de seuil de coût-par-lead fixé a priori (aucune base fiable pour l'inventer). Seuils de décision (continuer / ajuster / arrêter) à fixer avec le premier lot de données réelles |

Raisons des choix écartés :
- **B2C écarté** — à budget égal, le B2B a une valeur par dossier plus élevée ; le ciblage Meta est moins précis pour du firmographique mais reste exploitable en géo + centres d'intérêt professionnels.
- **Google Ads / LinkedIn Ads écartés pour ce budget** — CPC énergie/B2B trop élevé sur ces deux plateformes pour générer un volume exploitable à 5-10€/jour.
- **`ms-strategy-landing-2.html` écarté comme destination** — porte un angle différent (mutualisation de volume / prix grand compte) non aligné avec l'angle créatif retenu (gratuité/simplicité) ; `b2b.html` est déjà le CTA principal du site et porte le bon message.

## C. Parcours post-facture

Pipeline HubSpot **"Dossier facture"**, 6 étapes, un email déclenché à chaque
transition :

| Étape | Déclencheur | Email | Automatisation |
|---|---|---|---|
| 1. Facture reçue | Soumission Tally (ou email manuel) | Accusé de réception : ce qui va se passer, sous quel délai, quel conseiller s'en occupe | Automatique une fois le webhook Tally→HubSpot en place ; création manuelle du contact acceptable en phase de test (faible volume) |
| 2. Analyse en cours | L'équipe démarre l'analyse (J0-J+2) | Résultat de l'analyse : leviers identifiés, fenêtre de négociation | Template automatisé, envoi déclenché par l'équipe (l'analyse elle-même n'est pas automatisable) |
| 3. Proposition envoyée | Tableau comparatif prêt | Inclus dans l'email de l'étape 2, ou en pièce jointe PDF | — |
| 4. En attente de décision | Silence après la proposition | Relance à J+3 sans réponse | Automatique (workflow HubSpot) |
| 5. Contrat signé | Client valide | Confirmation de signature + prochaines étapes d'activation | Déclenché à la signature |
| 6. Activé / Client | Nouveau contrat actif | Bienvenue ; puis, différé de quelques semaines, demande d'avis + parrainage | Déclenché à l'activation, puis planifié |

Principes de mise en œuvre ("grand cabinet") :
- Un **conseiller nommé** dans chaque email, pas une signature générique "MS Strategy".
- **Zéro silence radio** entre les étapes — transparence sur les délais à chaque contact, y compris quand il n'y a rien de nouveau à annoncer.
- Templates HTML alignés sur la charte graphique du site (tokens déjà normalisés sur la homepage).
- Coordonnées directes en signature (téléphone et email déjà utilisés sur le site : `09 52 92 64 98`, `msstrategy@yahoo.com`).

Les 6 templates HTML seront conçus en phase d'exécution, une fois l'outil
(HubSpot) accessible.

## D. Canaux au niveau stratégique (à approfondir plus tard)

- **Social organique** — LinkedIn en priorité (audience naturelle : dirigeants de TPE/PME), présence Facebook légère en soutien (une Page active renforce la crédibilité des pubs Meta, cf. section E). Contenu : mécanique du marché de l'énergie, FAQ vulgarisée dans le même esprit que `comment-ca-marche.html`. Aucune statistique non sourcée (cohérent avec la décision déjà actée sur la homepage lors de l'audit design).
- **SEO** — le blog existe déjà (`blog.html` + 2 articles) et les mots-clés cibles sont déjà présents dans les meta tags du site. Piste : transformer chaque question de la FAQ B2B/B2C en article de blog dédié (contenu bottom-of-funnel, capte une intention de recherche proche de la conversion).
- **Mailing (hors séquence post-facture)** — porté par le même HubSpot. Usage : relance des leads dormants qui n'ont pas converti après la fenêtre d'analyse (étape 4 du pipeline, au-delà de la relance automatique J+3).

## E. Dépendances techniques (prérequis avant lancement, hors périmètre d'exécution de ce document)

1. Fusionner `worktree-meta-pixel-consent` dans `main` et configurer le vrai Pixel ID Meta.
2. Corriger le bug de révocation du consentement mi-session (déjà documenté dans `docs/superpowers/plans/2026-07-15-meta-pixel-consent.md`).
3. Créer le compte HubSpot, configurer le pipeline "Dossier facture" (6 étapes) et le webhook Tally→HubSpot.
4. Créer/activer une Page Facebook (prérequis technique pour diffuser des pubs Meta).

## F. KPIs de la phase de test (2-4 semaines, canal payant)

- Coût par clic.
- Coût par ouverture Tally (proxy Pixel `Lead`).
- Taux ouverture → facture réellement envoyée (mesuré côté HubSpot une fois le pipeline en place, pas côté Pixel — cf. limite de mesure en contexte).
- Volume de dossiers entrés dans le pipeline HubSpot sur la période.
- Respect du délai de 48h à l'étape 2 du parcours post-facture.

## Décisions explicites de périmètre

- Le seuil de coût-par-lead déclenchant l'arrêt/l'ajustement de la campagne n'est **pas fixé dans ce document** — il sera défini avec le premier lot de données réelles plutôt qu'estimé sans base.
- Les 4 canaux stratégiques (section D) ne sont pas détaillés au niveau exécutable dans ce document — chacun fera l'objet d'un cadrage dédié.
- La correction des limites du Pixel (Lead sur ouverture et non soumission, bug de révocation mi-session) n'est pas traitée ici — c'est un prérequis technique listé en section E, à planifier séparément.
