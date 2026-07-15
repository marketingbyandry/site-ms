# Pixel Meta + bandeau de consentement — design

Date : 2026-07-15
Projet : Site M&S Strategy (`www.byandry.com`)

## Contexte

Le site est statique pur (10 pages `.html`, pas de build, pas de composants
partagés — voir `handoff.md`). Aucun outil de tracking ni bandeau de
consentement n'existe actuellement. L'utilisateur prévoit de la publicité
sociale (Meta Ads) prochainement et veut poser le Pixel Meta en amont, avec
un mécanisme de consentement conforme RGPD/CNIL puisque le Pixel dépose un
cookie non-essentiel (marketing/tracking).

Le compte Meta Business Suite / Ads Manager et le Pixel associé **n'existent
pas encore** — c'est une étape manuelle côté utilisateur, hors périmètre de
ce travail de code.

## Objectif

Intégrer un bandeau de consentement + le Pixel Meta (chargement conditionnel
au consentement) sur les 10 pages du site, avec suivi de l'événement
standard `Lead` sur les 3 points d'entrée du formulaire Tally.

## Architecture retenue

Snippet Meta Pixel direct (pas de Google Tag Manager) : un seul pixel à
poser aujourd'hui, un intermédiaire GTM ajouterait une couche de complexité
et un compte à créer pour un besoin qui ne le justifie pas encore. Migration
vers GTM possible plus tard si d'autres tags s'ajoutent.

Un seul fichier partagé, `assets/consent-pixel.js`, chargé en `<script
defer>` depuis le `<head>` des 10 pages HTML existantes. Pas de nouvelle
dépendance externe, pas de refonte des pages.

## Comportement du bandeau de consentement

- Au premier chargement d'une page, si aucun cookie `ms_consent` n'existe,
  le script injecte dynamiquement (DOM + `<style>` en JS, pas de CSS par
  page à toucher) un bandeau bas de page avec 2 boutons : **Accepter** /
  **Refuser**.
- Pas de bouton "Personnaliser" : une seule catégorie de cookie
  non-essentiel existe aujourd'hui (Pixel Meta), un choix binaire est
  suffisant et évite une complexité inutile. À revoir si d'autres
  catégories de cookies apparaissent plus tard.
- Le choix est stocké dans un cookie `ms_consent=accepted|refused`,
  attributs `SameSite=Lax; Secure; path=/`, durée 6 mois (recommandation
  CNIL de re-solliciter le consentement périodiquement).
- Si `ms_consent=accepted` déjà présent au chargement, le bandeau ne
  s'affiche pas et le Pixel se charge immédiatement.
- Si `ms_consent=refused`, le bandeau ne s'affiche pas et le Pixel ne se
  charge jamais tant que le cookie n'expire pas ou n'est pas effacé par
  l'utilisateur.

## Chargement du Pixel Meta

- Constante `META_PIXEL_ID` en tête de `consent-pixel.js`, valeur initiale
  placeholder (`'REPLACE_WITH_PIXEL_ID'`).
- Tant que la constante n'est pas remplacée par un vrai ID, le Pixel ne se
  charge jamais (avertissement `console.warn`, pas de risque de tracker
  avec un ID invalide).
- Une fois consentement accepté (immédiatement au clic, ou au chargement de
  page si déjà accepté précédemment) : injection du snippet standard Meta
  (`fbq('init', META_PIXEL_ID)` + `fbq('track', 'PageView')`).

## Événement `Lead`

- Fonction exposée globalement, `window.msTrackLead(source)`.
- Appelée depuis les 3 points d'entrée existants du formulaire Tally
  (`Tally.openPopup(...)` sur `b2b.html`, `b2c.html`,
  `ms-strategy-landing-2.html`), juste avant l'ouverture du popup, avec la
  même valeur `source` déjà utilisée pour le champ caché Tally
  (`b2b`/`b2c`/`landing-2`).
- Déclenche `fbq('track', 'Lead', {content_name: source})` uniquement si le
  Pixel est chargé (donc consentement donné) — sinon no-op silencieux.

## Étape manuelle côté Meta (hors périmètre code)

L'utilisateur doit, sur meta.com : créer un compte Meta Business Suite →
Ads Manager → Gestionnaire d'événements → créer un Pixel → récupérer son
ID → remplacer la constante `META_PIXEL_ID` dans `assets/consent-pixel.js`
(ou transmettre l'ID pour que ce soit fait dans le code).

## Vérification

Utilisation de l'extension "Meta Pixel Helper" (Chrome) pour confirmer :
- Le Pixel ne se déclenche pas avant consentement (page fraîchement
  chargée, aucun cookie `ms_consent`).
- Le Pixel se déclenche (`PageView`) juste après clic "Accepter".
- L'événement `Lead` se déclenche à l'ouverture de chacun des 3 popups
  Tally, une fois consentement donné.
- Le bandeau ne réapparaît pas sur navigation entre pages une fois un choix
  fait, et reste absent tant que le cookie `ms_consent` est valide.

## Hors périmètre

- Création du compte/Pixel Meta côté meta.com (manuel, utilisateur).
- Google Tag Manager ou autres pixels/tags publicitaires.
- Catégorisation fine multi-cookies (analytics vs marketing séparés) —
  reviendra si un outil analytics (GA4, Clarity...) est ajouté plus tard.
- Registre des traitements / mentions légales détaillées (page confidentialité)
  — à vérifier séparément que la politique de confidentialité du site
  mentionne bien l'usage du Pixel Meta.
