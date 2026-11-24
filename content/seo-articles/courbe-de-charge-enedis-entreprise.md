# Courbe de charge Enedis : la lire et s'en servir en entreprise

La courbe de charge montre la puissance appelée par votre site, intervalle après intervalle, jour et nuit. Vous la récupérez dans l'espace client d'Enedis et elle révèle ce qu'une facture mensuelle cache : le talon nocturne, les pointes et les équipements oubliés.

## Ce que contient une courbe de charge

C'est une suite de valeurs de puissance moyenne, chacune liée à une date et une heure. Plus le pas est court, plus la lecture est fine : un pas de 30 minutes décrit une journée en 48 points, un pas de 10 minutes en 144.

La puissance moyenne d'un pas se transforme en énergie par une simple multiplication. Un point à 24 kW sur 30 minutes représente 24 × 0,5 = 12 kWh. La somme des 48 points d'une journée donne l'énergie quotidienne, ce qui permet de rapprocher la courbe de la facture. Vérifiez la première fois que les totaux concordent à quelques pour cent près : un écart plus large signale une période manquante ou un autre point de livraison.

## L'obtenir : le chemin selon le compteur

L'historique est proposé aux sites jusqu'à 36 kVA équipés d'un compteur Linky et aux sites au-dessus équipés d'un compteur ICE, PME-PMI ou SAPHIR, sous réserve de disponibilité selon [Enedis](https://www.enedis.fr/faq/gerer-sa-consommation-delectricite/quelles-donnees-de-comptage-obtenir-aupres-denedis). Les accès sont l'espace client, le portail de données et les services de données d'Enedis.

| Cas | Point d'attention | Action |
|---|---|---|
| Linky jusqu'à 36 kVA | Enregistrement au pas de 60 minutes par défaut | Activer la collecte pour un pas de 30 minutes |
| Compteur au-dessus de 36 kVA | Pas plus fin, variable selon le flux | Demander le format et le pas livrés |
| Nouveau site | Historique limité à la mise en service | Attendre un an complet ou extrapoler |
| Données confiées à un tiers | Accord du titulaire requis | Signer une autorisation écrite |

Les notes de service d'Enedis indiquent que la collecte activée sur un compteur Linky déclenche un enregistrement au pas de 30 minutes, que l'historique remonte à 24 mois au plus et que des données transmises à un tiers nécessitent une autorisation ([référentiel Enedis](https://www.enedis.fr/media/2127/download)). Vérifiez la version en ligne, car ces documents sont mis à jour. Activez la collecte dès la reprise d'un site : le passé non collecté ne se reconstitue pas.

## Lire une courbe en cinq minutes

Commencez par quatre repères, dans cet ordre. Chacun désigne une décision possible.

1. **Le talon** : puissance appelée quand rien ne devrait fonctionner, la nuit ou le dimanche.
2. **La pointe** : la valeur la plus haute de l'année, à comparer à la puissance souscrite.
3. **L'heure de démarrage** : une hausse brutale à heure fixe révèle un programme horaire.
4. **La saison** : l'écart entre semaine d'hiver et semaine d'été sépare chauffage, climatisation et activité.

Regardez ensuite deux semaines ordinaires, une de vacances et une de forte activité. Trois images côte à côte en disent plus qu'une moyenne annuelle.

## Calculer le coût du talon

Le talon est le premier gisement à contrôler car il tourne sans vous. Prenons un site qui appelle 6 kW toute la nuit, de 21 h à 6 h, soit 9 heures par nuit, alors que son inventaire justifie 2 kW (réfrigération et alarme).

L'excédent est de 4 kW. Sur 365 nuits, il représente 4 × 9 × 365 = 13 140 kWh. À un prix complet d'exemple de 0,16 €/kWh, cela donnerait 2 102 € HT par an. Le chiffre ne garantit rien : il vous dit jusqu'où va l'effort raisonnable pour trouver les coupables, souvent la ventilation en marche forcée, l'éclairage, un compresseur qui fuit ou un ballon d'eau chaude mal réglé. Coupez un circuit à la fois pendant deux nuits et observez la baisse de la courbe.

## Utiliser la courbe pour acheter

Un fournisseur qui connaît votre profil ajoute moins de marge d'incertitude à son prix. Deux sites qui consomment 200 MWh par an peuvent coûter différemment si l'un les consomme la nuit et l'autre à 19 h en hiver.

Transmettez une année complète, au pas le plus fin disponible, avec un mot sur les changements à venir (atelier fermé, nouvelle machine, télétravail). Comparez ensuite les offres sur ce profil et pas sur un prix moyen. Si vous déplacez une partie des usages vers les heures creuses, la courbe sert aussi de preuve, comme l'explique notre page sur les [tarifs horosaisonniers](tarifs-horosaisonniers-electricite-pro.md). Pour les sites capables de réduire leur puissance sur demande, elle mesure la part pilotable : voyez l'[effacement électrique](effacement-electrique-nebef-entreprise.md).

## Vérifier la puissance et le réactif

La courbe répond à deux questions de réseau : ma puissance est-elle juste, et, en HTA, mon réactif est-il sous le seuil ? Comptez le nombre d'intervalles au-dessus de 90 % de la puissance souscrite. Ce seuil est un repère de travail : zéro sur douze mois invite à étudier une baisse, plusieurs dizaines invitent à étaler les démarrages.

- **Pointe isolée** : un seul intervalle dans l'année, souvent un redémarrage après coupure, à étaler.
- **Pointe quotidienne** : deux équipements se lancent à la même heure, un décalage de 30 minutes suffit parfois.
- **Réactif élevé en charge faible (HTA)** : moteurs surdimensionnés, à croiser avec la page sur l'[énergie réactive](energie-reactive-facture-entreprise.md).

Attention au pas : une pointe de quelques minutes disparaît dans une moyenne de 30 minutes. Pour un sujet de dépassement, demandez le pas le plus fin, ou installez une mesure ponctuelle sur l'équipement suspect. La puissance à souscrire se choisit ensuite avec la méthode de notre guide sur les [kVA](puissance-souscrite-entreprise-kva.md).

## Questions fréquentes

### La courbe de charge est-elle gratuite ?
L'espace client d'Enedis donne accès à vos données, mais certains services de transmission ou de fréquence élevée relèvent d'un catalogue tarifé. Demandez le prix avant de souscrire un envoi récurrent.

### Mon fournisseur peut-il la demander à ma place ?
Oui, avec votre autorisation, qui doit être formelle pour une personne morale. Précisez l'objet, la période et la durée de l'accord, et révoquez-le quand il n'a plus d'utilité.

### Quelle période choisir pour une étude ?
Douze mois glissants, en vérifiant que l'année n'a pas connu de fermeture inhabituelle. Deux années aident à séparer une hausse d'activité d'un effet météo.

### Puis-je analyser le fichier dans un tableur ?
Oui : un tableau croisé par heure et par jour de la semaine suffit pour les premiers constats. Vérifiez le fuseau horaire et le changement d'heure, qui décalent les points deux fois par an.

## Faire analyser votre courbe

Envoyez la courbe de charge avec une facture récente : M&S Strategy repère gratuitement le talon, les pointes et la puissance à revoir. La réponse arrive sous 24h.
