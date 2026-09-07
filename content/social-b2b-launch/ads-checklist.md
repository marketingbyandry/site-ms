# Checklist campagnes payantes — cycle 1

Budget réparti à parts égales entre LinkedIn Ads et Meta Ads au
lancement (pas de priorisation a priori). X Ads optionnel, enveloppe
mineure seulement — X sert un rôle GEO/citation plus que conversion.

## LinkedIn Campaign Manager

- [ ] Objectif de campagne : génération de leads / trafic vers site.
- [ ] Ciblage :
  - Taille d'entreprise : TPE/PME/ETI (1 à 999 employés).
  - Secteurs : à sélectionner selon les 3 segments déjà travaillés en
    cold outreach (hôtellerie-restauration, industrie/production,
    tertiaire — écoles, associations, santé/EHPAD).
  - Intitulés de poste : dirigeant, gérant, DAF, office manager,
    responsable achats.
- [ ] Créatifs : posts L1 à L6 du brief cycle 1
  (`content/social-b2b-launch/brief-cycle-1.md`), en priorité L1
  (guide courtier) et L2 (Baromètre) pour les premiers tests.
- [ ] Lien de destination : `https://cabinetms.fr/b2b.html?camp=soc-li`
  (même code que l'organique LinkedIn — pas de distinction payant/
  organique dans l'attribution, cf. spec).
- [ ] Budget : moitié de l'enveloppe payante totale du cycle 1.
- [ ] Installer le LinkedIn Insight Tag, ou basculer sur des Lead Gen
  Forms natifs — sans cela, Campaign Manager ne peut pas rapporter de
  coût par lead.

## Meta Ads Manager (Facebook + Instagram)

- [ ] Objectif de campagne : trafic vers site / génération de leads.
- [ ] Ciblage géographique : bassins économiques déjà ciblés en SEO
  local (`docs/strategie-geo-seo/`, pilier B) — Montpellier en
  priorité (proximité), puis Paris, Lyon, Marseille, Toulouse,
  Bordeaux, Lille, Nantes.
- [ ] Ciblage démographique : dirigeants/gérants de TPE, centres
  d'intérêt « petite entreprise », « gestion d'entreprise ».
- [ ] Audience lookalike : ne peut être seedée qu'à partir (a) de leads
  Tally pour lesquels une case de consentement a été ajoutée au
  formulaire `kd15W1` au moment de la collecte — **prérequis non fait
  à ce jour**, ou (b) d'une audience de visiteurs du site basée sur le
  pixel Meta, qui ne nécessite aucun import de liste ni consentement
  supplémentaire au-delà du consentement cookies marketing déjà en
  place. Importer la liste de leads Tally bruts sans (a) violerait la
  limite RGPD documentée dans `docs/attribution-commerciaux.md`
  (section « Hors périmètre »). Non disponible au lancement du cycle 1
  dans tous les cas (volume insuffisant).
- [ ] Créatifs : posts F1-F6 (Facebook) et I1-I4 (Instagram) du brief
  cycle 1.
- [ ] Lien de destination : `https://cabinetms.fr/b2b.html?camp=soc-fb`
  pour les créatifs Facebook, `https://cabinetms.fr/b2b.html?camp=soc-ig`
  pour les créatifs Instagram.
- [ ] Budget : moitié de l'enveloppe payante totale du cycle 1, répartie
  entre Facebook et Instagram selon le volume de créatifs disponibles
  (Facebook a 6 posts contre 4 pour Instagram sur ce cycle).

## X Ads (optionnel)

- [ ] Enveloppe mineure uniquement si budget restant après LinkedIn et
  Meta — X sert un rôle GEO/citation, pas de conversion directe.
- [ ] Lien de destination si activé : `https://cabinetms.fr/b2b.html?camp=soc-x`.

## Jalon de décision (8 à 12 semaines)

- [ ] Calculer le coût par lead par plateforme de façon agnostique à
  l'outil de tracking de chaque régie : dépense publicitaire (relevée
  dans l'ads manager de chaque plateforme) ÷ nombre de leads Tally
  attribués au code `camp` de cette plateforme (`soc-li`, `soc-fb`,
  `soc-ig`, `soc-x`) sur la même période. Ce calcul fonctionne
  uniformément sur les 4 plateformes sans dépendre du tracking de
  conversion côté régie.
- [ ] Note : les conversions rapportées côté plateforme (Meta Ads
  Manager notamment) liront systématiquement bas — le pixel Meta est
  soumis au consentement cookies marketing, alors que le cookie `camp`
  est posé côté serveur pour chaque visiteur, consentement ou non. Ne
  pas comparer les deux chiffres entre eux ; utiliser uniquement le
  calcul par `camp` ci-dessus pour le coût par lead.
- [ ] Réallouer le budget et la cadence de publication vers la ou les
  plateformes qui convertissent réellement, pas vers celle qui engage
  le plus.
