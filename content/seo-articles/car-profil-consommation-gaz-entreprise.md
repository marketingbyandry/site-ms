# CAR gaz et options T1, T2, T3, T4 : lire le profil de votre site

La CAR, consommation annuelle de référence, estime ce que votre point de livraison consomme en un an dans des conditions climatiques moyennes. Elle sert à classer le site dans une option d'acheminement de T1 à T4 et à préparer les offres. Une CAR fausse se paie deux fois, sur le réseau et dans la cotation du fournisseur.

## Ce que mesure la CAR, et ce qu'elle ignore

La CAR est une estimation corrigée du climat, pas la somme brute de vos dernières factures. GRDF la décrit dans son [guide des données de consommation](https://sites.grdf.fr/documents/44859/0/GRDF_EC_Guide_Utilisateur_28012026.pdf/6d2ca79f-bd81-acd1-5b2b-a2a79f70ef97?version=1.0&t=1769606570704&download=true) : elle s'applique du 1er avril d'une année au 31 mars de la suivante, et le distributeur la met à jour.

Ce décalage explique de nombreux malentendus. Après un hiver doux, la consommation facturée peut être inférieure à la CAR sans que celle-ci soit fausse. Après le remplacement d'une chaudière, la CAR peut rester élevée parce qu'elle s'appuie sur l'ancien fonctionnement.

| Indicateur | Ce qu'il décrit | À quoi il sert |
| --- | --- | --- |
| Consommation facturée | Le gaz réellement livré sur la période | Payer et contrôler |
| CAR | L'année moyenne du site | Choisir l'option, coter le contrat |
| Profil | La répartition dans l'année | Estimer les besoins d'hiver |
| Capacité journalière | Le besoin maximal souscrit | Dimensionner les gros sites T4 |

## Les options T1 à T4 et leurs seuils

L'option se déduit en principe de la consommation annuelle. GRDF présente [quatre tranches](https://sites.grdf.fr/web/etude-adequation/comprendre-le-terme-normalis%C3%A9) et un tarif de proximité pour certains gros consommateurs. Les prix figurent dans la [grille du 1er juillet 2026](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054152920).

| Option | Consommation annuelle | Abonnement | Part variable |
| --- | --- | --- | --- |
| T1 | moins de 4 MWh | 57,48 € | 47,57 €/MWh |
| T2 | 4 à 300 MWh | 196,68 € | 12,79 €/MWh |
| T3 | 300 à 5 000 MWh | 1 858,68 € | 7,57 €/MWh |
| T4 | plus de 5 000 MWh | 22 973,52 € | 1,25 €/MWh plus capacité |

Une cuisine de petit bureau peut rester en T1, un restaurant tombe souvent en T2, une blanchisserie importante passe en T3. Ce sont des repères, le classement se vérifie sur le volume. De vieux documents placent la frontière entre T1 et T2 à 6 MWh : elle a été abaissée à 4 MWh.

## Calculer le point de bascule entre deux options

Le point de bascule est la consommation pour laquelle deux options coûtent le même prix. Il se calcule en divisant la différence d'abonnement par la différence de prix variable.

Entre T1 et T2, l'écart d'abonnement est de 139,20 € et l'écart de prix de 34,78 €/MWh : 139,20 / 34,78 = 4,0 MWh. Le seuil officiel et le calcul se rejoignent. Entre T2 et T3, l'écart vaut 1 662,00 € pour 5,22 €/MWh, soit 318 MWh environ. Ces calculs portent sur la seule distribution, hors CTA et terme de débit.

Prenons un site classé en T2 qui consomme 450 MWh. Sa distribution vaut 196,68 + 450 × 12,79 = 5 952,18 €. En T3, elle vaudrait 1 858,68 + 450 × 7,57 = 5 265,18 €. L'écart est de 687 € par an. La CTA, elle, augmente avec l'abonnement : 24,72 % de 1 662 €, soit environ 410,85 €. Le gain net sur ces deux postes tombe donc à environ 276 €.

À 320 MWh, l'avantage apparent du réseau en T3 se réduit à 8,40 €, inférieur à la CTA supplémentaire. Ne demandez pas un changement sans compter cette contribution, dont le calcul complet figure dans notre guide de la [CTA](cta-contribution-tarifaire-acheminement.md).

## Le profil : pourquoi deux sites de 200 MWh coûtent différemment

Le profil décrit la place de la consommation dans l'année. Le distributeur en attribue un à chaque point de livraison à partir de la CAR ou de la part hivernale mesurée. Les cotations s'appuient dessus, parce que le gaz d'hiver se négocie et se stocke autrement que le gaz d'été.

- **Profil de cuisson et d'eau chaude** : la consommation varie peu d'un mois à l'autre, typique de certains commerces.
- **Profil de chauffage** : le besoin se concentre de novembre à mars et dépend de la température.
- **Profil de procédé** : un atelier ou une blanchisserie suit l'activité plus que la météo.
- **Profil mixte** : le chauffage des locaux s'ajoute à un procédé stable.

Calculez votre part hivernale : divisez les kWh de novembre à mars par ceux de l'année. Un site de 200 MWh qui en consomme 150 pendant ces cinq mois a une part hiver de 75 %. S'il en consomme 90, elle tombe à 45 %. Le premier est plus exposé aux mois chers et au terme de stockage. Ce point complète notre guide de l'[acheminement ATRD et ATRT](atrd-atrt-acheminement-gaz-entreprise.md).

## Vérifier une CAR en quatre étapes

Le contrôle demande une facture et douze mois de relevés. Il faut surtout distinguer un hiver atypique d'un vrai changement d'activité.

1. **Relever la CAR** : elle figure sur la facture ou dans l'espace du distributeur, en kWh.
2. **Additionner douze mois réels** : corriger les factures estimées avec vos index.
3. **Expliquer l'écart** : météo, fermeture, chaudière, extension ou erreur de relevé.
4. **Demander une révision** : transmettre les preuves au fournisseur et au distributeur si le changement est durable.

Prenons une CAR de 340 MWh alors que les douze derniers mois donnent 240 MWh, après une isolation. L'écart de 29 % n'est pas un simple effet de température. Si la CAR ne bouge pas, les offres seront construites sur 100 MWh de trop et une clause de volume deviendra dangereuse. La [clause take or pay](clause-take-or-pay-contrat-energie.md) mérite alors une lecture avant signature.

## Utiliser la CAR au bon moment

Le meilleur moment est avant la consultation, pas au moment de signer. Un fournisseur qui reçoit une CAR erronée fait un prix pour un site qui n'existe pas. Donnez-lui le volume réel, le volume prévu et l'explication de la différence.

Surveillez aussi la fin mars, puisque la nouvelle période démarre le 1er avril. Un site transformé pendant l'été doit avoir des preuves prêtes avant cette date. Reportez enfin la CAR retenue dans votre calcul de [prix du gaz pro](prix-gaz-professionnel-2026.md), afin que chaque poste utilise le même volume.

Pour un site dont la consommation frôle 4, 300 ou 5 000 MWh, refaites le calcul chaque année. Un seuil franchi à cause d'un hiver froid ne signifie pas que le nouveau niveau durera.

## Questions fréquentes

### Où trouver la CAR de mon site ?

Elle est indiquée sur la facture de gaz, près de l'option ou du PCE, selon les fournisseurs. L'espace client du distributeur peut aussi la donner. Notez l'unité et la période d'application.

### Peut-on choisir librement son option T1, T2, T3 ou T4 ?

Le classement s'appuie sur la consommation et sur les règles du tarif. Une demande de changement passe par le fournisseur, qui gère le contrat d'acheminement. Vérifiez la date d'effet et les conditions avant de valider.

### La CAR baisse-t-elle après des travaux d'isolation ?

Elle finit par refléter la nouvelle consommation lors des mises à jour. Ce délai peut poser problème si vous négociez entre-temps. Fournissez une estimation technique et vos relevés depuis la fin des travaux.

### Une CAR trop haute fait-elle payer plus de gaz ?

Elle ne change pas les kWh facturés, mesurés au compteur. Elle peut influer sur l'option, le prix proposé, le stockage et les volumes contractuels. Le surcoût se trouve souvent dans le contrat plutôt que dans la consommation.

## Faites vérifier la CAR avant la négociation

Envoyez une facture et douze mois de consommations : nous comparons la CAR, l'option et le profil au fonctionnement réel du site avant de consulter les fournisseurs. L'étude est gratuite, avec une réponse sous 24h.
