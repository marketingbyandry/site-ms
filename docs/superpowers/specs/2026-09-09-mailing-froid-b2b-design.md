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

Faire remonter des PME/ETI vers le formulaire Tally existant
« Transmettre ma facture » (b2b.html), qui alimente le pipeline HubSpot
« Dossier facture » déjà en place. Aucun nouveau funnel de conversion à
construire — seule la partie acquisition (sourcing → envoi) est nouvelle.

## Architecture

Cycle quotidien orchestré par Composio, déclenché par une session planifiée
Claude Code (`/schedule` — pas de nouvelle infra Vercel Cron/GitHub Action) :

```
recherche-entreprises.api.gouv.fr (recherche NAF)
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
        ├──► Clic lien attribué (camp=mail-{chr,ind,tert,agri,log}) → b2b.html → Tally →
        │    HubSpot "Dossier facture"
        │
        └──► Liste de suppression Brevo interrogée à chaque envoi
             (GET /v3/smtp/blockedContacts du jour) → mise à jour Google
             Sheet + garde-fou pause automatique si le taux dépasse 5 %
```

Interrogation directe plutôt que webhook entrant : évite de construire un
nouvel endpoint Vercel pour recevoir des webhooks Brevo (aucun endpoint de
ce type n'existe encore sur ce repo) alors que la liste de suppression est
déjà accessible en lecture à la demande, avec le même contenu.

## Composants

### 1. Sourcing & enrichissement (recherche-entreprises.api.gouv.fr)

- Recherche d'entreprises par code NAF sur **5 segments**, réunion des deux
  segmentations déjà utilisées ailleurs sur le projet (décision utilisateur
  du 2026-09-09, correction d'une confusion initiale avec le ciblage
  Solarair) :
  - Précédent **Waalaxy** (`content/cold-outreach-waalaxy/`, déjà en prod) :
    `chr` hôtellerie-restauration (NAF section I), `ind` industrie/
    production (NAF section C), `tert` tertiaire — écoles, associations,
    santé/EHPAD (NAF sections P/Q/S).
  - Positionnement **cabinet d'expertise énergie** (2026-08-03) :
    `agri` agriculture (NAF section A), `log` logistique (NAF section H).
    `ind` est commun aux deux et n'est pas dupliqué.
  - Filtré sur la taille PME/ETI (effectif) via `recherche-entreprises.api.gouv.fr`
    (API publique gratuite, sans clé, confirmée en session — paramètres
    `section_activite_principale`, `tranche_effectif_salarie`).
- Pour chaque entreprise : raison sociale, SIREN, nom du dirigeant, site web
  si disponible (données publiques légales, aucune collecte via LinkedIn).
- Email en cascade, jamais de pure supposition :
  1. **Nominatif** — uniquement si un pattern d'email est confirmé par un
     exemple déjà visible publiquement sur le site de l'entreprise (page
     équipe/mentions légales/contact nommé). Le nom du dirigeant
     (`recherche-entreprises.api.gouv.fr`, champ `dirigeants`)
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
  l'émetteur (M&S Strategy, SIREN 752 139 477, 1366 Av. des Platanes 34970
  Lattes), motif de pertinence professionnelle (lien avec la gestion de
  l'énergie de l'entreprise destinataire), opt-out. **Mécanisme d'opt-out :
  "répondez STOP"**, identique au précédent déjà établi et documenté pour la
  séquence Waalaxy (`docs/attribution-commerciaux.md`) — pas de lien de
  désinscription Brevo natif (`{{ unsubscribe }}`), dont le comportement sur
  un envoi `htmlContent` brut hors template Brevo n'est pas confirmé avec
  certitude. Un lien `mailto:` pré-rempli complète le texte pour le confort
  (un clic plutôt qu'à retaper), sans dépendre de ce mécanisme incertain.
- Corps HTML : angle "transmettez votre facture, on regarde s'il y a des
  économies" — cohérent avec le funnel Tally existant.
- Ton et structure alignés sur les 9 templates HubSpot déjà écrits pour la
  séquence post-facture (cohérence de marque).

### 5. Attribution (réutilisation du système existant)

- 5 nouveaux codes `camp` ajoutés à la whitelist `CAMPAIGNS` de
  `middleware.js` : `mail-chr`, `mail-ind`, `mail-tert`, `mail-agri`,
  `mail-log` — un par segment (cf. section précédente), même préfixe `mail-`
  pour les distinguer des codes `chr-e1`/`ind-e1`/`tert-e1` du cold outreach
  Waalaxy et `soc-li`/`soc-fb`/`soc-ig`/`soc-x` du levier social B2B (cf.
  `docs/superpowers/specs/2026-09-07-leviers-social-b2b-design.md`).
- Chaque lien dans l'email pointe vers `b2b.html?camp=mail-<segment>` →
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
  5 % (contacts bloqués du jour via `GET /v3/smtp/blockedContacts`, comptés
  contre le volume déjà envoyé ce jour-là) — reprise seulement après revue
  manuelle.
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

- **Code** (`dev-builder`, repo SITE MS) : ajout des 5 codes `mail-*` à
  `CAMPAIGNS` dans `middleware.js` + test dédié (même pattern que les codes
  `soc-*`) ; intégration Brevo API pour l'envoi (clé API en variable
  d'environnement, jamais commitée) ; logique de plafond/vérification
  suppression/arrêt automatique bounce.
- **Contenu** (`content-builder`) : template HTML de l'email (corps + pied
  de page CNIL), aligné sur le ton des 9 templates HubSpot existants.
- **Configuration/orchestration** (Composio, ce chantier) : requêtes
  recherche-entreprises.api.gouv.fr, écriture/lecture du Google Sheet, appels Brevo API,
  planification `/schedule`.

## Action utilisateur restante (hors périmètre code)

- ~~Création du compte Brevo + clé API~~ **Fait** — compte Brevo connecté à
  Composio (`composio link brevo`, statut `ACTIVE`), la clé n'est jamais
  manipulée par le code ni par l'agent, Composio la porte pour les appels
  `composio proxy`.
- Boîte mail `prospection@mail.cabinetms.fr` (ou alias existant) à créer et
  surveillable — c'est l'adresse d'expédition, et l'opt-out du template
  (section suivante) repose sur "répondez STOP" comme la séquence Waalaxy
  déjà en prod (cf. `docs/attribution-commerciaux.md`), donc les réponses à
  cette boîte doivent être relevées régulièrement.
- Configuration DNS du sous-domaine d'envoi `mail.cabinetms.fr` (SPF/
  DKIM) chez le registrar/hébergeur DNS de cabinetms.fr.
- ~~Accès Pappers/Infogreffe~~ **Sans objet** — sourcing fait via
  `recherche-entreprises.api.gouv.fr`, API publique gratuite sans clé
  (confirmée en session le 2026-09-09), pas Pappers.
- Compte Google Sheets connecté à Composio (`composio link googlesheets`) —
  lien envoyé à l'utilisateur, connexion à confirmer.

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
