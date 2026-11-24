# Budget énergie d'une entreprise : construire un prévisionnel qui tient

Un budget énergie prévisionnel se construit en multipliant un volume corrigé par un prix décomposé en quatre lignes : fourniture, acheminement, taxes et abonnement. Chaque ligne suit son propre calendrier, et c'est ce calendrier qui détermine quand le budget doit être révisé. Comptez une demi-journée pour un site si vous disposez des factures des douze derniers mois.

## Partir de kWh corrigés, pas du total payé l'an dernier

Le montant de l'an dernier mélange trois choses : ce que vous avez consommé, le prix du moment et les régularisations d'une autre période. Repartez donc des kWh réellement mesurés, mois par mois, sur douze mois complets. Si une facture repose sur un index estimé, remplacez-la par le relevé du compteur ou par les données de consommation disponibles auprès du gestionnaire de réseau.

Corrigez ensuite ce qui ne se reproduira pas : une fermeture pour travaux, une machine remplacée, un atelier ouvert en cours d'année. Pour le chauffage, un hiver doux fausse la base. La méthode consiste à isoler la part chauffage et à la ramener à un climat normal avec les degrés-jours unifiés (DJU) de votre station météo.

Exemple de calcul, avec des valeurs inventées : un site a consommé 180 MWh de gaz, dont 150 MWh de chauffage. L'hiver a compté 2 300 DJU, contre 2 500 pour une année normale. La part chauffage devient 150 × 2 500 / 2 300, soit 163 MWh. On ajoute les 30 MWh d'eau chaude, qui ne dépendent pas du froid : le volume à budgéter est de 193 MWh.

## Découper le prix en quatre lignes qui ne bougent pas ensemble

Une hausse « de l'énergie » ne s'applique jamais à toute la facture. Séparez les postes avant d'appliquer la moindre hypothèse, en vous aidant de notre guide pour [décrypter une facture d'électricité professionnelle](decrypter-facture-electricite-pro.md).

| Ligne | Ce qui la fait bouger | Hypothèse de budget |
|---|---|---|
| Fourniture | Votre contrat, puis le marché à l'échéance | Prix signé, puis trois scénarios |
| Acheminement | Décisions de la CRE, puissance souscrite | Dernier tarif publié, plus une marge |
| Taxes et contributions | Textes fiscaux | Taux en vigueur, révisés à chaque changement |
| Abonnement | Conditions du contrat | Montant contractuel |

Deux repères récents montrent pourquoi les dates comptent. Le TURPE 7 des réseaux HTA-BT a augmenté de 3,04 % en moyenne au 1er août 2026, selon la [délibération de la CRE](https://www.cre.fr/fileadmin/Documents/Deliberations/2026/260521_2026-105_Evolution_TURPE_7_HTA-BT.pdf). Pour le gaz combustible, l'[accise est passée à 16,66 €/MWh](https://www.edf.fr/entreprises/faq-entreprises/facture/les-taxes-evolutions-tarifaires-en-gaz/qu-est-ce-que-l-accise-sur-les-gaz-naturels-ex-ticgn) à la même date : sur les 193 MWh de l'exemple, cela représente 3 215 € par an.

## Repérer les mois où votre prix peut changer

Un budget annuel uniforme cache la date la plus importante, celle de la fin de votre prix. Placez sur une ligne de temps l'échéance de chaque contrat, la fin du préavis de résiliation et les mois d'évolution tarifaire réglementée.

1. **Échéance du prix** : le premier mois où la fourniture cesse d'être connue. Tout ce qui suit est une hypothèse et doit être marqué comme tel.
2. **Fin du préavis** : la date limite pour dénoncer le contrat. Elle figure dans les conditions particulières ou générales.
3. **Révisions réglementées** : les mois où l'acheminement et les taxes sont susceptibles d'évoluer. Prévoyez un contrôle du budget à ces dates.
4. **Mois de forte consommation** : janvier pèse plus que mai dans un bâtiment chauffé. Un prix qui change en novembre touche donc un gros volume.

Si vos contrats sont indexés, la première étape disparaît : le prix bouge chaque mois. Le choix entre les deux formules est détaillé dans notre comparaison du [prix fixe et du prix indexé](prix-fixe-vs-indexe-electricite-pro.md).

## Calculer trois scénarios plutôt qu'une moyenne

Prenons un site hypothétique de 120 MWh d'électricité par an. Son prix de fourniture est de 85 €/MWh jusqu'au 30 juin, puis le contrat se termine. Il consomme 62 MWh au premier semestre et 58 MWh au second. L'acheminement de l'année écoulée, 5 400 €, est majoré de 3 % par prudence, soit 5 562 €. Les taxes sont retenues à 26 €/MWh, taux lu sur sa facture pour l'exemple, soit 3 120 €. L'abonnement coûte 360 €.

| Poste | Scénario bas | Scénario central | Scénario haut |
|---|---|---|---|
| Fourniture 1er semestre (85 €/MWh) | 5 270 € | 5 270 € | 5 270 € |
| Fourniture 2e semestre (80, 100 ou 130 €/MWh) | 4 640 € | 5 800 € | 7 540 € |
| Acheminement, taxes, abonnement | 9 042 € | 9 042 € | 9 042 € |
| Total hors TVA | 18 952 € | 20 112 € | 21 852 € |

L'enseignement du tableau tient en une phrase : entre le bas et le haut, tout l'écart de 2 900 € vient de 58 MWh non encore achetés. Vous savez ainsi quel volume sécuriser pour resserrer la fourchette. Pour choisir les trois prix, partez d'offres reçues ou du [baromètre de l'énergie](barometre-energie.md), et datez toujours l'hypothèse.

## Suivre l'écart volume et l'écart prix séparément

Un dépassement de 8 % ne dit rien tant qu'on ignore s'il vient des kWh ou du prix. Chaque mois, calculez les deux effets. L'écart de volume vaut la différence de MWh multipliée par le prix prévu. L'écart de prix vaut la différence de prix multipliée par les MWh réels. Leur somme donne l'écart total.

Exemple : vous aviez prévu 10 MWh à 160 €/MWh, soit 1 600 €. Vous consommez 11 MWh à 165 €/MWh, soit 1 815 €. L'écart de volume est de 160 €, l'écart de prix de 55 €, et le total de 215 € est entièrement expliqué. Le premier concerne l'exploitation du site, le second le contrat : ce ne sont pas les mêmes personnes qui doivent répondre.

- **Seuil d'alerte** : fixez à l'avance l'écart mensuel qui déclenche une recherche, par exemple 5 % sur le volume.
- **Facture estimée** : signalez-la dans le tableau pour ne pas commenter un écart fictif.
- **Régularisation** : rattachez-la aux mois qu'elle concerne, sinon elle déforme le mois de réception.

## Transformer le budget en décision d'achat

Le prévisionnel sert surtout à lancer la consultation au bon moment. Quand l'écart entre le scénario bas et le scénario haut dépasse ce que votre trésorerie peut absorber, il devient raisonnable de figer une partie du volume. L'[achat par clics ou par tranches](achat-energie-par-clics-tranches.md) permet de le faire en plusieurs fois, si votre volume et votre contrat l'autorisent.

Pour un volume plus modeste, il est souvent plus simple de [comparer les fournisseurs d'électricité](comparatif-fournisseurs-electricite-pro.md) quelques mois avant l'échéance, sur la même courbe de consommation et le même périmètre de prix. Demandez toujours si la capacité et les garanties d'origine sont incluses : une offre qui les refacture à part sort du budget dès la première facture.

## Questions fréquentes

### Faut-il budgéter hors taxes ou TTC ?

Hors TVA si votre entreprise la récupère, car elle n'est alors qu'un décalage de trésorerie. Une structure qui ne la récupère pas, ou seulement en partie, doit budgéter la TVA non déductible comme une charge.

### Combien de scénarios faut-il présenter à une direction ?

Trois suffisent dans la plupart des cas. Précisez pour chacun le prix retenu, sa date et sa source, puis indiquez la dépense maximale que l'entreprise accepte avant de revoir sa stratégie d'achat.

### Que faire si un nouveau site ouvre en cours d'année ?

Estimez ses kWh à partir de la puissance des équipements et de leurs heures de fonctionnement, dans une ligne distincte. Remplacez l'estimation par les mesures dès le troisième mois complet et gardez la trace de l'écart.

### Peut-on faire un seul budget pour plusieurs compteurs ?

Oui pour la synthèse, à condition de conserver une feuille par point de livraison. Les puissances, les échéances et les profils peuvent différer, et une moyenne masquerait le site qui dérive.

## Chiffrer votre prochaine échéance

Envoyez votre dernière facture à M&S Strategy : nous relevons vos échéances et comparons les offres disponibles pour nourrir votre scénario central. L'étude est gratuite, avec une réponse sous 24h.
