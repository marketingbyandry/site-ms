# Différence entre GTB et GTC : le test pour savoir ce que vous avez

La GTC supervise un lot technique, par exemple la chaufferie ; la GTB réunit plusieurs lots du bâtiment et les fait travailler ensemble. Dans la pratique commerciale, les deux sigles sont employés l'un pour l'autre, si bien que le nom inscrit sur votre devis ne prouve rien. Seules les fonctions disponibles permettent de trancher.

## Ce que recouvrent les deux sigles

La gestion technique centralisée (GTC) rassemble sur un poste les informations d'un domaine : chauffage, ventilation, électricité ou ascenseurs. La gestion technique du bâtiment (GTB) ajoute des règles communes entre ces domaines, par exemple couper la climatisation d'une zone dont l'alarme est armée.

| Question | GTC, au sens usuel | GTB, au sens usuel |
|---|---|---|
| Combien de lots sont réunis ? | Un, parfois deux | Plusieurs |
| Les lots échangent-ils entre eux ? | Rarement | Oui, par des règles communes |
| Que fait l'opérateur ? | Lit, acquitte, commande à distance | Lit, règle des scénarios, compare |
| À quoi sert l'historique ? | Retrouver un défaut | Suivre l'énergie par zone et corriger |

Ces définitions décrivent un usage professionnel. Elles ne correspondent pas à deux catégories juridiques séparées. Il existe des GTC très complètes et des GTB qui se contentent d'afficher des températures.

## La réglementation parle de fonctions

Les textes BACS n'utilisent ni GTB ni GTC comme critère de conformité : ils décrivent un système d'automatisation et de contrôle et ce qu'il doit savoir faire. La [fiche officielle](https://www.justice.fr/fiche/systemes-gestion-technique-batiment-gtb) cite le suivi au pas horaire par zone fonctionnelle, l'ajustement des systèmes techniques, la détection des pertes d'efficacité, l'interopérabilité, l'arrêt manuel et la gestion autonome.

Une GTC qui lit la chaufferie sans enregistrer les consommations par zone laissera donc des cases vides. À l'inverse, un système appelé GTC par son installateur peut remplir toutes les exigences. Pour savoir si votre bâtiment entre dans le champ, consultez les seuils et dates du [décret BACS](decret-bacs-obligations.md).

## Le test en dix questions

Répondez devant l'écran de supervision, avec la personne qui s'en sert. Comptez un point par réponse positive que vous pouvez démontrer en moins de deux minutes.

1. **Lots** : le poste affiche-t-il au moins chauffage et froid, ou chauffage et ventilation ?
2. **Zones** : peut-on lire la consommation d'une zone sans lire tout le bâtiment ?
3. **Pas de temps** : existe-t-il une courbe heure par heure ?
4. **Mémoire** : retrouve-t-on les consommations mensuelles des années passées ?
5. **Commande** : un changement de planning à l'écran modifie-t-il vraiment l'équipement ?
6. **Scénario** : un lot réagit-il à l'état d'un autre lot ?
7. **Dérive** : une consommation anormale déclenche-t-elle une alerte ?
8. **Main humaine** : chaque équipement peut-il être arrêté manuellement ?
9. **Autonomie** : continue-t-il de fonctionner si le poste central est éteint ?
10. **Ouverture** : une autre entreprise peut-elle récupérer les points et les programmes ?

De 0 à 3 points, vous avez une supervision simple. De 4 à 7, une base à compléter. À partir de 8, l'outil se rapproche d'une GTB complète. Ce barème est un outil de tri interne, sans valeur de certificat : seule une vérification fonction par fonction permet de conclure sur la conformité.

Notez les deux questions auxquelles personne ne sait répondre. Elles révèlent souvent un défaut de formation ou de documentation, plus facile à corriger qu'un manque de matériel.

## Faire évoluer une GTC sans tout remplacer

Une GTC existante peut servir de socle si ses automates communiquent et si ses programmes sont récupérables. Commencez par l'inventaire des marques, des protocoles et des versions, puis testez la lecture d'un point sur chaque automate.

- **Conserver** : les automates accessibles, documentés et encore pourvus de pièces.
- **Passerelle** : les équipements fonctionnels dont le langage diffère, avec un traducteur à maintenir.
- **Remplacer** : les équipements muets, verrouillés ou sans pièces disponibles.
- **Ajouter** : les compteurs par usage et par zone, souvent absents d'une GTC ancienne.

Le choix du langage commun compte pour la suite. Notre article sur les [protocoles BACnet, KNX et Modbus](gtb-protocoles-bacnet-knx-modbus.md) précise ce que chacun fait le mieux. Le budget se compare ensuite poste par poste, comme expliqué dans la page sur le [prix d'une GTB](gtb-prix-cout-installation.md).

Prenons un cas fictif : 60 points sont lus par l'ancienne GTC et 25 doivent être ajoutés. Si 45 des 60 sont repris sans intervention, 15 demandent une passerelle. Le devis doit alors montrer 45, 15 et 25 lignes distinctes, soit 85 points au total. Une offre qui facture 85 points neufs mérite d'être discutée.

## Ce que le sigle change pour les aides

Pour la prime CEE BAT-TH-116, le mot GTB ne suffit pas non plus. La [fiche d'opération](https://www.ecologie.gouv.fr/sites/default/files/documents/BAT-TH-116%20vA62-6%20%C3%A0%20compter%20du%2001-01-2025_1.pdf) demande un système d'automatisation centralisé assurant des fonctions de classe A ou B pour les usages concernés. Si vous améliorez un système déjà présent, celui-ci doit être au plus de classe C avant l'opération.

Le simple raccordement d'un bâtiment à une GTB existante n'est pas éligible. Une extension qui ajoute un écran sans changer les fonctions ne coche donc pas la case. Avant de commander, faites établir un état initial par écrit, avec la classe de chaque fonction : il sera difficile à reconstituer après travaux.

## Les mots à écrire dans votre cahier des charges

Remplacez « fourniture d'une GTB » par une liste de résultats observables. Vous éviterez un désaccord sur le sigle au moment de la réception.

| Formule floue | Formule vérifiable |
|---|---|
| Supervision du chauffage | Lecture des températures et commande des plannings de 6 zones |
| Suivi énergétique | Enregistrement horaire par zone, export sur fichier lisible |
| Système ouvert | Remise de la table des points, des programmes et des accès administrateur |
| Alarmes intelligentes | Alerte si la consommation de nuit dépasse un seuil fixé par vous |

Prévoyez enfin une séance d'essai avec l'exploitant, où chaque ligne est montrée en conditions réelles. La vue d'ensemble des fonctions et des obligations se trouve dans notre guide de la [gestion technique du bâtiment](gtb-gestion-technique-batiment.md).

## Questions fréquentes

### Une GTC est-elle moins chère qu'une GTB ?

À périmètre réduit, elle demande en général moins de points et donc moins de travaux. Une GTC très instrumentée peut pourtant coûter davantage qu'une GTB limitée à quelques zones. Le sigle renseigne mal sur le budget.

### Que veut dire BACS ?

C'est le sigle anglais de système d'automatisation et de contrôle des bâtiments. Le droit français emploie cette notion, d'où le nom courant de « décret BACS » pour l'obligation qui touche le tertiaire.

### Un thermostat connecté est-il une GTB ?

Seul, il régule une zone ou un appareil. Plusieurs thermostats réunis dans une application offrent une supervision, mais il reste à vérifier les données par zone, l'ajustement des autres systèmes, la reprise manuelle et l'interopérabilité.

### Qui doit avoir les codes d'accès ?

Au minimum le propriétaire du système et l'exploitant désigné, avec des comptes nominatifs. Exigez une copie des droits administrateur à la livraison afin de ne pas dépendre d'un seul prestataire.

## GTB ou GTC, faites parler aussi vos factures

Une supervision montre quand vous consommez, une facture montre à quel prix. Envoyez-nous la vôtre pour une étude gratuite : nous revenons vers vous sous 24h.
