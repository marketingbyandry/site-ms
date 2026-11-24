# Énergie réactive sur la facture : comprendre la pénalité et la supprimer

L'énergie réactive sert aux moteurs, transformateurs et éclairages à créer leur champ magnétique, sans produire de travail utile. Depuis l'entrée en vigueur du TURPE 7, elle est facturée aux sites raccordés en haute tension (HTA) quand elle dépasse 40 % de l'énergie active pendant les heures surveillées ; les clients en basse tension ne paient plus cette ligne.

## Ce que mesure la tangente phi

La tangente phi est le rapport entre l'énergie réactive et l'énergie active : kvarh divisés par kWh. Le seuil à retenir est 0,4, ce qui équivaut à un facteur de puissance (cosinus phi) d'environ 0,93.

Un exemple fixe les idées : 10 000 kWh actifs et 6 500 kvarh réactifs donnent une tangente phi de 0,65, au-dessus du seuil. Avec 3 500 kvarh, elle tombe à 0,35 et rien n'est dû. Aucun équipement ne consomme uniquement du réactif, mais certains en demandent beaucoup à faible charge.

- **Moteurs sous-chargés** : pompes, compresseurs, ventilation surdimensionnés.
- **Transformateurs à vide** : présents la nuit et le week-end.
- **Éclairage ancien** : ballasts ferromagnétiques non compensés.
- **Postes de soudure et fours à induction** : appels irréguliers.

## Quand l'énergie réactive est facturée

Elle est facturée aux sites en HTA. Pour la basse tension au-dessus de 36 kVA, la CRE a retiré la composante de soutirage dans la [délibération 2025-40](https://www.cre.fr/fileadmin/Documents/Deliberations/2025/250204_2025-40_TURPE_7_HTA-BT.pdf) qui fixe le TURPE 7, applicable depuis le 1er août 2025 : ces clients sont déjà incités par leur puissance souscrite, exprimée en kVA. Un site C5, sous 36 kVA, n'est pas concerné non plus.

Si vous êtes en segment C4 et qu'une ligne de réactif apparaît encore sur une période postérieure à août 2025, demandez au fournisseur sur quelle base elle est calculée. Pour la HTA, la [délibération CRE 2026-105](https://www.cre.fr/fileadmin/Documents/Deliberations/2026/260521_2026-105_Evolution_TURPE_7_HTA-BT.pdf) donne les valeurs en vigueur depuis le 1er août 2026.

| Situation | Tangente phi maximale | Tarif au 1er août 2026 |
|---|---|---|
| HTA, saison haute | 0,4 | 2,51 c€ par kvarh excédentaire |
| HTA, heures creuses de saison basse | 0,6 | 2,46 c€ par kvarh |
| Basse tension au-dessus de 36 kVA | Sans objet | Plus de facturation en soutirage |

La ligne des heures creuses de saison basse est nouvelle. Elle vise les sites qui produisent du réactif quand le réseau est peu chargé, par exemple avec des condensateurs restés en service l'été.

## Calculer sa pénalité en trois lignes

Le calcul porte sur l'excédent, pas sur la totalité du réactif. Prenons une usine en HTA qui consomme, sur les heures surveillées d'un mois de saison haute, 40 000 kWh et 26 000 kvarh.

1. **Part gratuite** : 40 000 × 0,4 = 16 000 kvarh.
2. **Excédent** : 26 000 − 16 000 = 10 000 kvarh.
3. **Pénalité** : 10 000 × 0,0251 = 251 € HT pour le mois.

Répété sur cinq mois identiques, le total atteindrait 251 × 5 = 1 255 € HT. Cet exemple est hypothétique ; remplacez les volumes par ceux de votre facture et utilisez le tarif de votre tension. Le résultat est l'économie maximale à attendre d'une compensation et sert de plafond au budget d'investissement.

## Repérer la ligne et les mauvaises causes

La ligne s'appelle souvent « énergie réactive », « dépassement de réactif » ou « kvarh ». Elle apparaît dans la partie acheminement, surtout en saison haute.

Relevez la tangente phi mois par mois sur deux hivers. Une hausse brutale vient souvent d'une batterie de condensateurs en panne ou d'un fusible ouvert, pas d'un changement d'équipement. Une hausse lente signale plutôt le vieillissement des condensateurs ou l'arrivée de machines peu chargées. Comparez aussi les mois où le site tournait à plein régime et ceux d'activité réduite : un mauvais ratio concentré sur les mois calmes désigne les moteurs trop gros. Pour lire les autres lignes d'acheminement, voyez la [puissance souscrite](puissance-souscrite-entreprise-kva.md) et le [TURPE 2026](turpe-2026-professionnels.md).

## Compenser sans surinvestir

La batterie de condensateurs produit localement le réactif dont vos machines ont besoin, qui n'est plus soutiré du réseau. Sa taille se calcule à partir de la puissance active et de la tangente phi visée.

La formule est : puissance réactive = puissance active × (tangente phi actuelle − tangente phi visée). Pour 150 kW, en passant de 0,65 à 0,35, il faut 150 × (0,65 − 0,35) = 45 kvar. Viser 0,35 laisse une marge sous le seuil de 0,4. Trois options se présentent ensuite :

- **Compensation centrale** : une seule batterie en tête, adaptée à un profil stable.
- **Compensation par atelier** : utile quand les charges sont éloignées ou très variables.
- **Compensation au moteur** : efficace sur quelques gros moteurs qui tournent longtemps.

Les installations avec beaucoup d'électronique (variateurs, chargeurs, informatique) demandent une étude des harmoniques avant tout achat, car des condensateurs mal choisis peuvent vieillir vite ou amplifier le problème. Demandez au moins deux devis qui indiquent la tangente phi garantie. Divisez le prix par l'économie annuelle de l'étape précédente : pour 4 000 € d'installation et 1 255 € évités par an, le temps de retour est d'environ 3,2 ans.

## Ne pas trop compenser

Une batterie trop puissante renvoie du réactif vers le réseau. Depuis le TURPE 7, ce comportement peut se payer en HTA pendant les heures creuses de saison basse : un surdimensionnement crée donc une pénalité d'été là où il supprimait celle d'hiver.

La parade est simple. Choisissez un régulateur qui coupe les gradins à mesure que la charge baisse et vérifiez les réglages après chaque arrêt annuel. Ajoutez un contrôle mensuel du réactif en heures creuses, sur la [courbe de charge](courbe-de-charge-enedis-entreprise.md) ou sur la facture détaillée.

## Questions fréquentes

### La pénalité peut-elle être négociée avec le fournisseur ?
Non. Elle relève du tarif d'utilisation des réseaux fixé par la CRE, que le fournisseur répercute. La marge de manœuvre est technique.

### Faut-il déclarer l'installation de condensateurs ?
Vérifiez d'abord les conditions de votre raccordement avec l'électricien et le gestionnaire de réseau, surtout en HTA. L'installation doit respecter les règles de sécurité, être entretenue et contrôlée.

### Une batterie de condensateurs réduit-elle la consommation en kWh ?
Très peu : elle limite surtout les courants qui circulent en amont, donc des pertes modestes dans vos câbles. Les kWh utiles des machines ne changent pas.

### À quelle fréquence contrôler les condensateurs ?
Une visite annuelle avec mesure de l'intensité de chaque gradin est un bon rythme, à caler avant la saison haute. Un relevé de tangente phi chaque mois d'hiver suffit entre les visites.

## Vérifier votre ligne de réactif

Envoyez une facture d'hiver et une facture d'été : M&S Strategy calcule gratuitement la part de réactif évitable et vous dit si une compensation vaut l'étude. Réponse sous 24h.
