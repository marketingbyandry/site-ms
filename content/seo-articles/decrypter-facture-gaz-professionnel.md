# Facture de gaz professionnel : la lire et la contrôler ligne par ligne

Une facture de gaz se contrôle en vingt minutes avec la grille de distribution, le taux d'accise et vos index. Les erreurs à chercher en premier portent sur le relevé, le coefficient de conversion, l'option d'acheminement et les taxes. Le contrôle ci-dessous refait une facture mensuelle complète, du mètre cube au total TTC.

## Les identifiants à vérifier avant les montants

Le haut de la facture dit à quel site et à quel contrat elle se rapporte. Une erreur ici rend tout le reste faux, surtout dans une entreprise multi-sites.

- **PCE** : le numéro du point de comptage, à comparer à celui du compteur.
- **CAR** : la consommation annuelle de référence, exprimée en kWh.
- **Option d'acheminement** : T1, T2, T3, T4 ou TP, qui commande l'abonnement réseau.
- **Contrat** : la référence, la date de fin et la formule de prix.
- **Période** : les dates de début et de fin, et la mention relevé ou estimé.

Notez le numéro de PCE, la CAR et la date de fin dans un tableau interne. Ce sont les trois informations qu'un fournisseur ou un courtier vous demandera. L'article sur la [CAR et les options T1 à T4](car-profil-consommation-gaz-entreprise.md) aide à juger si l'option paraît cohérente.

## Du mètre cube au kilowattheure

Le compteur mesure des mètres cubes, la facture vend des kilowattheures. Le passage de l'un à l'autre utilise un coefficient de conversion, qui tient compte de l'énergie contenue dans le gaz livré et des conditions de livraison. Il figure sur la facture et varie d'une période à l'autre.

Prenons un index passé de 42 310 à 43 110, soit 800 m³. Avec un coefficient supposé de 11,20, la consommation vaut 800 × 11,20 = 8 960 kWh, ou 8,96 MWh. Si le résultat affiché s'éloigne de votre calcul, demandez le détail du coefficient.

Une consommation estimée se repère à la mention correspondante ou à un index qui ne correspond pas à votre photo du compteur. L'écart se corrige souvent plus tard, par une [régularisation](regularisation-facture-energie-entreprise.md). Relevez vous-même l'index à chaque fin de mois si la facture reste estimée.

## Recalculer une facture d'un mois

Prenons ce site de 8,96 MWh en option T2, en octobre 2026. Le prix de fourniture, transport et stockage inclus, est supposé à 75 €/MWh. La distribution vient de la [grille au 1er juillet 2026](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054152920) et l'accise du [formulaire fiscal officiel](https://www.impots.gouv.fr/sites/default/files/formulaires/2040-tic-era-g-sd/2026/2040-tic-era-g-sd_5369.pdf).

| Ligne | Calcul | Montant HT |
| --- | --- | --- |
| Fourniture (hypothèse) | 8,96 × 75 € | 672,00 € |
| Distribution, part fixe | 196,68 € / 12 | 16,39 € |
| Distribution, part variable | 8,96 × 12,79 € | 114,60 € |
| CTA | 16,39 € × 24,72 % | 4,05 € |
| Accise | 8,96 × 16,66 € | 149,27 € |
| Total HT | somme | 956,31 € |
| TVA 20 % | 956,31 € × 20 % | 191,26 € |
| Total TTC | HT + TVA | 1 147,57 € |

Un écart de quelques centimes vient des arrondis ou du nombre de jours. Un écart de plusieurs euros demande une explication. Attention aux factures à cheval sur deux barèmes : une période du 15 juillet au 15 août 2026 comporte deux taux d'accise, 16,39 puis 16,66 €/MWh, à répartir selon les dates.

## La partie fourniture : la ligne qui porte votre contrat

Comparez le prix du MWh facturé avec celui de vos conditions particulières, à l'unité près. Un prix fixe doit se retrouver chaque mois. Un prix indexé doit pouvoir être reconstitué à partir de l'indice publié et du terme fixe.

Regardez ensuite les lignes voisines, qui portent des noms différents selon le vendeur. Certaines sont normales si le contrat les prévoit :

1. **Abonnement fournisseur** : un montant mensuel distinct de l'abonnement de distribution.
2. **Transport et stockage** : absents s'ils sont inclus, présents s'ils sont refacturés.
3. **Certificats** : CEE ou certificats de biogaz, inclus ou ajoutés selon la clause.
4. **Services** : gaz vert, gestion, alertes ou assurance, à supprimer s'ils n'ont pas été demandés.

Pour les certificats de biogaz, notre guide des [CPB](certificats-production-biogaz-cpb-entreprise.md) explique ce que le fournisseur est susceptible de répercuter.

## Acheminement et terme de débit : les nouveautés de 2026

Depuis le 1er juillet 2026, certains sites voient apparaître un terme de débit normalisé. Il concerne les points en T1, T2 et T3 dont le compteur dépasse un débit de 40 Nm³/h, soit environ 125 000 consommateurs selon la [délibération de la CRE du 12 juin 2026](https://www.cre.fr/fileadmin/Documents/Deliberations/2026/260612_2026-123_Avis_decret_CTA.pdf). Si vous avez un gros compteur et une faible consommation, cette ligne peut se voir.

La distribution a par ailleurs augmenté de 5,87 % en moyenne à la même date. Une facture de juillet plus chère que celle de juin, à volume égal, n'est donc pas forcément une erreur du fournisseur. Vérifiez la date de la grille appliquée avant de contester.

## Les contrôles à faire chaque mois et chaque année

Un contrôle mensuel de cinq minutes suffit pour attraper la plupart des anomalies. Le contrôle annuel sert à préparer la négociation.

- Chaque mois : index réel, volume cohérent avec la saison, prix de la fourniture, absence de service inconnu.
- Chaque année : option d'acheminement, CAR, total par MWh, date d'échéance et préavis.
- À chaque changement de barème : accise en février et en août selon les textes, transport en avril, distribution en juillet.

Conservez douze factures et un tableau avec les kWh, le montant HT et le prix complet au MWh. Pour interpréter ce prix, reprenez notre méthode du [prix du gaz pro en 2026](prix-gaz-professionnel-2026.md). En cas d'erreur, réclamez par écrit avec le calcul, le relevé photographié et la référence du barème.

## Questions fréquentes

### Pourquoi ma facture affiche-t-elle des kWh différents du compteur ?

Le compteur compte des mètres cubes, puis un coefficient les transforme en énergie. Deux périodes au même nombre de mètres cubes peuvent ainsi produire deux consommations en kWh. Demandez la valeur appliquée si elle n'apparaît pas.

### Que faire si la facture reste estimée plusieurs mois ?

Transmettez un index photographié au fournisseur, puis vérifiez l'état de la communication du compteur. Gardez la date de la photo. Un rattrapage tardif pèse lourd sur la trésorerie.

### La CTA est-elle calculée sur ma consommation ?

Non, elle porte sur une part fixe de l'acheminement. Une économie de gaz ne la réduit pas directement, sauf si l'option ou l'abonnement changent. Elle augmente en revanche avec le tarif du réseau.

### Puis-je contester l'accise prélevée ?

Le taux normal s'impose à votre fournisseur, donc la contestation porte surtout sur l'usage du gaz. Certaines activités relèvent d'un tarif réduit ou d'une exonération et doivent le justifier. Une régularisation se fait alors auprès de l'administration fiscale.

## Faites relire une facture réelle

Envoyez une facture de gaz complète, toutes pages comprises : nous contrôlons les lignes, le prix et l'échéance, puis nous vous signalons ce qui mérite une réclamation ou une renégociation. L'étude est gratuite, avec une réponse sous 24h.
