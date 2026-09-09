# Mailing froid B2B (PME/ETI) — design

## Contexte

Le canal "mailing" avait été explicitement laissé de côté lors du cadrage de
la campagne de communication du 2026-07-19 ("les canaux social organique,
SEO et mailing hors séquence post-facture restent au niveau stratégique pour
de futurs cadrages"). Ce document opérationnalise ce canal : un cycle de
prospection email à froid vers des PME/ETI, en complément du canal LinkedIn
(Waalaxy) déjà en production.

Point de départ écarté explicitement pendant le cadrage : scraper les
emails nominatifs affichés sur les profils LinkedIn entreprise. Cette piste
viole les CGU LinkedIn (clause anti-scraping) et expose à un traitement de
données personnelles illicite au sens RGPD (collecte déloyale, absence
d'information des personnes) — la CNIL a déjà sanctionné ce type de
pratique pour de la prospection B2B. Le design ci-dessous s'appuie
uniquement sur des sources publiques légales et une conformité codée en dur,
pas seulement documentée.

## Objectif

Faire remonter des PME/ETI des secteurs déjà ciblés par le site
(agriculture, industrie, logistique) vers le formulaire Tally existant
« Transmettre ma facture » (b2b.html), qui alimente le pipeline HubSpot
« Dossier facture » déjà en place. Aucun nouveau funnel de conversion à
construire — seule la partie acquisition (sourcing → envoi) est nouvelle.

## Architecture

Cycle quotidien orchestré par Composio, déclenché par une session planifiée
Claude Code (`/schedule` — pas de nouvelle infra Vercel Cron/GitHub Action) :

```
Pappers/Infogreffe (recherche NAF)
        │
        ▼
Enrichissement (dirigeant + email cascade)
        │
        ▼
Dédoublonnage (Google Sheet : déjà contacté / statut)
        │
        ▼
Lot du jour (30-50 contacts, nominatif/générique + confiance)
        │
        ▼
   Validation manuelle (moi, un clic)
        │
        ▼
Envoi Brevo API (htmlContent, throttlé)
        │
        ├──► Clic lien attribué (camp=cold-mail) → b2b.html → Tally →
        │    HubSpot "Dossier facture"
        │
        └──► Webhooks Brevo (unsubscribed / hard_bounce / spam /
             invalid_email) → mise à jour Google Sheet + garde-fou
             pause automatique
```

## Composants

### 1. Sourcing & enrichissement (Composio + Pappers/Infogreffe)

- Recherche d'entreprises par code NAF correspondant aux 3 secteurs déjà
  ciblés par le site (agriculture, industrie, logistique — mêmes secteurs
  que le calendrier éditorial social B2B et les pages villes), filtrée sur
  la taille PME/ETI (effectif).
- Pour chaque entreprise : raison sociale, SIREN, nom du dirigeant, site web
  si disponible (données publiques légales, aucune collecte via LinkedIn).
- Email en cascade, jamais de pure supposition :
  1. **Nominatif** — uniquement si un pattern d'email est confirmé par un
     exemple déjà visible publiquement sur le site de l'entreprise (page
     équipe/mentions légales/contact nommé). Le nom du dirigeant (Pappers)
     est alors combiné à ce pattern confirmé.
  2. **Générique** (repli) — adresse de rôle (contact@/direction@) trouvée
     sur la page contact publique du site.
  3. Si ni l'un ni l'autre n'est trouvable avec confiance raisonnable,
     l'entreprise est exclue du lot (pas de fabrication d'adresse).

### 2. Dédoublonnage & suivi (Google Sheet via Composio)

Un seul Google Sheet sert de file d'attente + journal :
- Colonnes : entreprise, SIREN, secteur, email, type (nominatif/générique),
  confiance, statut (à valider / validé / envoyé / rejeté), date d'envoi.
- Avant d'ajouter une entreprise au lot du jour : vérification qu'elle n'a
  pas déjà été contactée sur un cycle précédent (toutes campagnes
  confondues — évite qu'un même contact reparte via une autre recherche
  sectorielle).
- Ce sheet ne porte **pas** la conformité désinscription/bounce — c'est le
  rôle de Brevo (section suivante). Il porte uniquement le dédoublonnage
  "déjà contacté" et le statut opérationnel du lot.

### 3. Envoi (Brevo API)

- `POST /v3/smtp/email` avec `htmlContent` (template HTML conservé, cf.
  contrainte explicite de l'utilisateur).
- Envoi depuis un sous-domaine dédié (`mail.cabinetms.fr`) plutôt que le
  domaine principal, pour ne jamais exposer la réputation du site public à
  un incident d'envoi. Authentification SPF/DKIM de ce sous-domaine à
  configurer côté DNS (action utilisateur, cf. section dédiée).
- Avant chaque envoi individuel : vérification contre
  `GET /v3/smtp/blockedContacts` (liste de suppression Brevo — désinscrits,
  hard bounce, plaintes spam), pas seulement au moment de la constitution
  du lot.
- Plafond strict de 50 envois/jour appliqué dans le code d'orchestration,
  même si le lot validé est plus grand (le surplus attend le lendemain).
- Espacement entre les envois (pas d'envoi en rafale) pour rester dans un
  profil d'envoi raisonnable.

### 4. Contenu de l'email

- Pied de page CNIL obligatoire sur chaque template : identité de
  l'émetteur (M&S Strategy, SIREN, adresse), motif de pertinence
  professionnelle (lien avec la gestion de l'énergie de l'entreprise
  destinataire), lien de désinscription en un clic (mécanisme Brevo natif).
- Corps HTML : angle "transmettez votre facture, on regarde s'il y a des
  économies" — cohérent avec le funnel Tally existant.
- Ton et structure alignés sur les 9 templates HubSpot déjà écrits pour la
  séquence post-facture (cohérence de marque).

### 5. Attribution (réutilisation du système existant)

- Nouveau code `camp` ajouté à la whitelist `CAMPAIGNS` de `middleware.js` :
  `cold-mail` (même pattern que `soc-li`/`soc-fb`/`soc-ig`/`soc-x` ajoutés
  pour le levier social B2B — cf.
  `docs/superpowers/specs/2026-09-07-leviers-social-b2b-design.md`).
- Chaque lien dans l'email pointe vers `b2b.html?camp=cold-mail` →
  `middleware.js` pose le cookie `ms_camp`, PostHog le reçoit en
  super-property, redirection propre sans trace dans l'URL affichée (même
  comportement que les autres codes `camp`).
- Aucune modification du funnel Tally → HubSpot "Dossier facture" —
  seul le point d'entrée change.

## Garde-fous de conformité (codés, pas seulement documentés)

- Plafond d'envoi quotidien strict (50), y compris si le lot du jour est
  plus grand.
- Vérification de la liste de suppression Brevo à l'envoi, pas seulement à
  la constitution du lot.
- Arrêt automatique du pipeline si le taux de bounce d'une journée dépasse
  5 % (webhook `hard_bounce`/`invalid_email` compté vs volume envoyé ce
  jour-là) — reprise seulement après revue manuelle.
- Aucune adresse nominative fabriquée par pure supposition — cascade
  nominatif→générique→exclusion, jamais de pattern non confirmé.
- Validation manuelle obligatoire du lot avant tout envoi (pas
  d'automatisation bout-en-bout au premier cycle).

## Ce qui ne change pas

- Le formulaire Tally « Transmettre ma facture » (b2b.html/b2c.html).
- Le pipeline HubSpot « Dossier facture ».
- Le canal Waalaxy/LinkedIn déjà en prod — le mailing s'ajoute, ne le
  remplace pas.
- Les codes `camp` existants (`chr-e*`, `ind-e*`, `tert-e*`, `soc-*`).

## Hors périmètre (ce cycle)

- Outil de données payant (Kaspr/Cognism/Dropcontact) — pourra être
  reconsidéré si le taux de conversion du cycle gratuit le justifie.
- Automatisation bout-en-bout sans validation manuelle (approche A discutée
  en cadrage) — à envisager pour un cycle suivant si le taux de bounce/
  plainte reste bas sur celui-ci.
- Ciblage géographique par ville (pages villes) — ciblage sectoriel retenu
  pour ce premier cycle.
- Montée en volume au-delà de 50/jour.

## Répartition du travail (exécution)

- **Code** (`dev-builder`, repo SITE MS) : ajout du code `cold-mail` à
  `CAMPAIGNS` dans `middleware.js` + test dédié (même pattern que les codes
  `soc-*`) ; intégration Brevo API pour l'envoi (clé API en variable
  d'environnement, jamais commitée) ; logique de plafond/vérification
  suppression/arrêt automatique bounce.
- **Contenu** (`content-builder`) : template HTML de l'email (corps + pied
  de page CNIL), aligné sur le ton des 9 templates HubSpot existants.
- **Configuration/orchestration** (Composio, ce chantier) : requêtes
  Pappers/Infogreffe, écriture/lecture du Google Sheet, appels Brevo API,
  planification `/schedule`.

## Action utilisateur restante (hors périmètre code)

- Création du compte Brevo + clé API (variable d'environnement, jamais
  commitée).
- Configuration DNS du sous-domaine d'envoi `mail.cabinetms.fr` (SPF/
  DKIM) chez le registrar/hébergeur DNS de cabinetms.fr.
- Accès Pappers/Infogreffe (API publique — vérifier si une clé
  d'inscription gratuite est requise selon le volume de requêtes).
- Partage du Google Sheet de suivi avec le compte Composio.

## Test / vérification avant mise en production

- Test automatisé du nouveau code `camp` dans `middleware.js` (cookie,
  redirection propre, whitelist), même suite que les codes `soc-*`
  existants.
- Vérification manuelle du template email (rendu HTML, lien de
  désinscription fonctionnel, pied de page CNIL complet).
- Essai à blanc du pipeline complet sur un petit échantillon (5-10
  entreprises réelles, lot validé manuellement, envoi réel) avant
  d'ouvrir le rythme 30-50/jour en continu.
- Vérification que le webhook `unsubscribed`/`hard_bounce` Brevo est bien
  reçu et déclenche la mise à jour attendue (test avec une adresse de
  test connue pour bounce).
