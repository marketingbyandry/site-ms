# Segments C1, C2, C3, C4, C5 en électricité : à quoi correspond le vôtre ?

Les segments C1 à C5 classent les points de connexion selon la tension, la puissance et le type de contrat de réseau. Un petit commerce est presque toujours en C5, une PME équipée d'une puissance supérieure à 36 kVA en C4, un site raccordé en moyenne tension en C2.

## Les cinq définitions d'Enedis en un tableau

Deux critères suffisent : la tension de raccordement et le contrat. Le tableau reprend les [définitions d'Enedis](https://www.enedis.fr/faq/glossaire/quoi-correspondent-les-points-de-connexion-c1-c5).

| Segment | Raccordement | Contrat | Suivi de la consommation |
|---|---|---|---|
| C1 | Selon le site | Contrat d'accès au réseau distinct (CARD) | Selon le contrat |
| C2 | HTA (moyenne tension) | Contrat unique | Courbe de charge mesurée |
| C3 | HTA (moyenne tension) | Contrat unique | Courbe de charge profilée |
| C4 | Basse tension, plus de 36 kVA | Contrat unique | Non précisé par la définition |
| C5 | Basse tension, 36 kVA ou moins | Contrat unique | Non précisé par la définition |

Le contrat unique signifie que le fournisseur vous facture en une fois l'énergie et l'acheminement. Avec un CARD, l'entreprise signe directement son contrat d'accès avec le gestionnaire de réseau : elle reçoit l'acheminement à part et négocie la fourniture seule. Pour le segment C3, le [guide de flux d'Enedis](https://www.enedis.fr/media/3751/download) le donne comme obsolète depuis janvier 2023. Si un ancien document vous classe en C3, faites confirmer le segment actuel.

## Où lire son segment sur la facture

Cherchez d'abord la puissance souscrite et la tension, puis le nom du tarif d'acheminement. La mention « C5 » n'apparaît pas toujours en clair, mais ces indices la remplacent.

- **Puissance en kVA, 36 ou moins** : segment C5.
- **Puissance en kVA, au-dessus de 36, basse tension** : segment C4.
- **Mention HTA ou moyenne tension, facture unique** : segment C2.
- **Facture d'énergie d'un fournisseur et facture d'accès au réseau séparée** : segment C1 probable.

Un autre indice vient des plages horaires. Les sites C4 et HTA sont facturés sur des plages combinant saison haute et saison basse, alors qu'un C5 peut être resté sur une base unique ou sur heures pleines et heures creuses. Notre guide sur les [tarifs horosaisonniers](tarifs-horosaisonniers-electricite-pro.md) décrit ces plages. Pour un doute, demandez au fournisseur de confirmer le segment par mail avec le numéro de point de livraison.

## Ce que change le segment dans votre contrat

Le segment fixe le socle de règles que vous pouvez négocier. Plus il monte, plus le prix devient personnalisé et plus vos données de consommation pèsent dans l'offre.

- **C5** : offres proches du catalogue, protections légales étendues aux professionnels jusqu'à 36 kVA, peu de paramètres à régler.
- **C4** : prix par plage horaire et puissances souscrites différenciées.
- **C2** : prix construit sur la courbe de charge, énergie réactive et dépassements de puissance suivis de près.
- **C1** : deux négociations séparées, utiles quand les volumes justifient une équipe ou un conseil.

Le C4 et le passage à la moyenne tension ont leurs propres arbitrages de coût, que nous traitons à part dans la page [compteur C4 et tarif HTA](compteur-c4-tarif-hta-entreprise.md).

## Changer de segment : quand cela devient possible

On ne choisit pas son segment sur un formulaire, on change la situation technique qui le détermine. Trois évolutions reviennent régulièrement.

1. **Passer de C4 à C5** : réduire la puissance jusqu'à 36 kVA, si vos pointes réelles le permettent.
2. **Passer de C5 à C4** : demander une puissance supérieure à 36 kVA, avec parfois un changement de comptage et des travaux.
3. **Passer de C2 à C1** : séparer fourniture et acheminement par un CARD, en contrepartie de deux factures et d'un suivi plus technique.

Prenons un magasin souscrit à 48 kVA dont la pointe mesurée sur un an ne dépasse pas 31 kVA. Avec une marge de 10 %, le besoin serait de 31 × 1,10 = 34,1 kVA : le passage en C5 à 36 kVA est envisageable. Si la pointe monte à 34 kVA, la même marge donne 37,4 kVA et le raisonnement s'arrête. Le choix de la marge dépend de vos équipements et de la saison ; faites-la valider par un électricien avant la demande.

## Segment et mise en concurrence

Comparer deux offres n'a de sens que pour le même segment et le même profil. Un prix moyen annoncé pour un C5 ne dit rien d'un C2, dont l'acheminement et la forme de consommation diffèrent.

Avant de lancer la consultation, rassemblez une fiche par site : segment, point de livraison, puissance par plage, volume annuel par plage, date d'échéance. Cette fiche permet de [comparer plusieurs fournisseurs d'électricité](comparatif-fournisseurs-electricite-pro.md) sur les mêmes bases et évite qu'un prix d'appel masque une hypothèse de volume irréaliste. Pour un groupe de plusieurs établissements, triez les sites par segment : un lot homogène reçoit de meilleures réponses qu'un mélange de bureaux en C5 et d'usines en C2.

## Trois confusions à éviter

Le segment se mélange souvent avec d'autres classements, ce qui fausse les demandes de prix. Corrigez ces raccourcis avant d'envoyer vos documents.

- **Segment et ancien tarif** : les noms jaune et vert désignent des tarifs réglementés, supprimés fin 2015 et rouverts depuis février 2025 aux petites entreprises éligibles ; les segments décrivent le raccordement, pas une offre.
- **C5 et tarif bleu** : un site C5 peut être en offre de marché ou, si l'entreprise est éligible, au tarif réglementé.
- **Puissance et consommation** : un site C4 peut consommer peu s'il appelle des pointes brèves, et un C5 bien occupé toute la nuit peut consommer davantage.

Cette distinction sert surtout à ne pas payer pour des options inutiles. Un comptage évolué, une puissance modulée et un suivi de l'énergie réactive n'ont d'intérêt que si le segment les rend applicables.

## Questions fréquentes

### Un site solaire change-t-il de segment ?
La consommation garde le segment de son point de connexion. La production raccordée au réseau suit d'autres règles et peut disposer d'un contrat d'injection, à examiner avec l'installateur.

### Pourquoi mon fournisseur parle-t-il de C4 alors que je consomme peu ?
Parce que le critère est la puissance souscrite, pas les kWh. Une puissance héritée d'un ancien locataire peut vous classer en C4 bien au-delà de votre besoin.

### Les segments existent-ils aussi pour le gaz ?
Le gaz utilise d'autres classements, fondés notamment sur la consommation annuelle de référence et les options tarifaires T1 à T4. Les lettres C1 à C5 ne concernent que l'électricité.

### Un contrat unique est-il obligatoire pour une PME ?
Non, mais il reste le choix le plus simple. Le CARD convient plutôt aux sites qui savent suivre deux factures et veulent comparer la fourniture sans le réseau.

## Retrouver votre segment en une facture

Transmettez-nous une facture complète de chaque site : M&S Strategy identifie gratuitement le segment, vérifie la puissance et vous indique les leviers ouverts. Vous recevez notre retour sous 24h.
