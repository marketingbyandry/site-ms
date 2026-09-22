# Prompts Pomelli / Photoshoot — campagne social payant Meta Ads B2B

Date : 2026-09-22
Périmètre : prompts prêts à l'emploi pour générer les visuels publicitaires
de la section B (social payant, Meta Ads B2B) de
`docs/superpowers/specs/2026-07-19-campagne-communication-design.md`.
Aucun code applicatif — document de référence opérationnel, à utiliser
directement dans les interfaces Pomelli / Photoshoot (Google Labs).

## 1. Prompt Pomelli — génération de la campagne

Source de marque à donner à Pomelli : `https://cabinetms.fr`

**Contexte de marque** : M&S Strategy (cabinetms.fr) est un cabinet de
courtage en énergie B2B/B2C en France. Le point de conversion est le CTA
"Transmettre ma facture en toute sécurité" sur la page b2b.html — le
prospect envoie sa facture d'énergie actuelle et le cabinet négocie un
meilleur contrat pour lui, gratuitement (rémunération par commission
fournisseur, jamais par le client).

**Objectif de la campagne** : générer des visuels publicitaires Meta Ads
(Facebook + Instagram) pour une campagne B2B en phase de test, budget
5-10€/jour sur 2-4 semaines. L'objectif est le trafic vers b2b.html, pas la
génération de leads native Meta (le vrai formulaire est hébergé sur le
site, pas sur Meta).

**Audience cible** : dirigeants de TPE/PME/ETI en France, tous secteurs,
sensibles à la simplicité et au gain de temps plutôt qu'à l'argumentaire
technique énergie.

**Angle créatif imposé** : gratuité et simplicité radicale du service.
Message central : *"Envoyez votre facture, on s'occupe du reste."* Ne pas
utiliser d'argumentaire chiffré non sourcé (pas de "économisez X%"
inventé), ne pas mentionner de statistique non vérifiable. Le ton doit
rassurer un dirigeant occupé qui n'a pas le temps de comparer les
fournisseurs lui-même — pas vendre un service technique complexe.

**Contraintes de format (non négociables)** :
- Génère seulement 1 à 2 variantes maximum, pas plus — pas de carrousel,
  pas de vidéo, pas de série de déclinaisons.
- Format : image fixe simple, lisible en mobile (feed Facebook/Instagram).
- Reste strictement dans l'identité visuelle extraite de cabinetms.fr
  (couleurs, typographie, ton) — pas de template générique "pub B2B" hors
  charte.

**Sorties attendues** :
1. 1-2 visuels publicitaires (image + texte overlay court, type "hook"
   visuel)
2. Pour chaque visuel : une légende/accroche courte (1-2 phrases)
   réutilisable en copy d'annonce Meta, reprenant l'angle "Envoyez votre
   facture, on s'occupe du reste"
3. Aucun CTA générique type "Contactez-nous" — le CTA doit refléter
   l'action réelle : envoyer sa facture.

## 2. Prompt Photoshoot (fonctionnalité de Pomelli) — retouche d'une photo existante

Photoshoot prend en entrée une vraie photo à uploader (pas un prompt texte
seul) et propose 4 templates : Studio, Floating, Ingredient, In use — les 3
derniers sont pensés pour de la photo produit e-commerce et ne s'appliquent
pas à une photo de bureaux/intérieur. Seul **Studio** est transposable.

**Étape 1 — Upload** : `assets/bureaux-photo.webp` (photo de bureaux déjà
utilisée sur le site, généraliste — cohérente avec l'audience "tous
secteurs" de la campagne, contrairement aux photos sectorielles
industrie/terrain).

**Étape 2 — Template** : Studio.

**Étape 3 — Prompt de raffinement** (édition en langage naturel après le
rendu Studio) :

> Rends cette photo de bureaux plus professionnelle et chaleureuse, dans un
> style éditorial sobre — lumière naturelle douce, pas de flash dur,
> ambiance rassurante et accessible plutôt que corporate froide. Garde une
> teinte qui s'accorde avec une palette de marque vert sarcelle/vert foncé
> et crème (pas de dominante bleue ou orange). Format carré ou 4:5, lisible
> en petite taille sur un feed mobile Facebook/Instagram. Pas de texte
> incrusté sur l'image — le texte sera ajouté séparément dans Pomelli.

**Étape 4** : réinjecter ce visuel retouché comme base dans le prompt
Pomelli ci-dessus (section 1), à la place ou en complément du visuel généré
directement depuis le Business DNA, pour la même campagne "Envoyez votre
facture, on s'occupe du reste".

**Limite connue** : les outils de retouche photo IA sont moins fiables sur
l'architecture/les intérieurs que sur des objets isolés — si le rendu
Studio produit des artefacts visuels (lignes déformées, matériaux
incohérents), revenir à la photo brute et laisser Pomelli générer un
visuel entièrement nouveau depuis le Business DNA plutôt que de forcer la
retouche.
