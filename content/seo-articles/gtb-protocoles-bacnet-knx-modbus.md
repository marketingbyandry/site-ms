# Protocoles GTB BACnet, KNX et Modbus : lequel demander au marché ?

BACnet sert surtout à faire dialoguer les automates et la supervision, KNX à piloter l'éclairage, les stores et les pièces, Modbus à lire des compteurs et des machines. La plupart des GTB en combinent plusieurs, reliés par des passerelles. Le choix du protocole compte moins que les droits obtenus : sans la table des points et les programmes, un système « ouvert » reste fermé pour vous.

## À quoi sert chaque langage

Un protocole fixe la façon dont deux appareils échangent une valeur. Il ne dit ni si la valeur est utile, ni si l'entreprise acceptera de partager ses programmes.

| Protocole | Usage fréquent | Question décisive |
|---|---|---|
| BACnet | Automates de chauffage et de climatisation, supervision | Quels objets sont exposés en lecture et en écriture ? |
| KNX | Éclairage, stores, thermostats de pièce | Qui détient le fichier de projet ? |
| Modbus | Compteurs, variateurs, onduleurs, groupes | La table des registres est-elle fournie ? |

BACnet et KNX s'appuient sur des normes internationales, ISO 16484-5 pour le premier et ISO/IEC 14543 pour le second. Modbus est un protocole publié très répandu, sans description normalisée du sens de chaque registre. Deux compteurs Modbus peuvent donc ranger la puissance à deux adresses différentes.

## Ce que la réglementation attend

Pour un système soumis au décret BACS, l'interopérabilité figure parmi les fonctions à remplir, sans qu'une marque ou un protocole soit imposé. La [fiche officielle](https://www.justice.fr/fiche/systemes-gestion-technique-batiment-gtb) ajoute le suivi horaire par zone, la détection des pertes, l'arrêt manuel et la gestion autonome.

L'inspection prévue par l'[arrêté du 7 avril 2023](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000047422562) regarde notamment la connexion des systèmes, l'adéquation des compteurs et l'interopérabilité. Un schéma montrant qui parle à qui fait gagner du temps ce jour-là. Pour vérifier votre situation, relisez les échéances du [décret BACS](decret-bacs-obligations.md).

## Ouvert sur le papier, fermé sur le site

Un appareil peut annoncer BACnet et n'exposer que trois valeurs. Un bus KNX peut fonctionner très bien alors que le seul fichier de programmation se trouve sur l'ordinateur d'un prestataire parti. Un compteur Modbus peut répondre sans que personne ne connaisse l'échelle de la mesure.

- **Lecture seule** : vous voyez la température mais vous ne pouvez pas changer la consigne.
- **Licence par point** : chaque ajout déclenche une facture de logiciel.
- **Passerelle orpheline** : le traducteur fonctionne, mais sa configuration n'a jamais été sauvegardée.
- **Compte unique** : tous les intervenants partagent le même mot de passe administrateur.

Prenons un exemple fictif : 120 points existent dans les automates, 90 sont exposés, 70 arrivent à l'écran et 55 sont commandables. La proportion utile pour agir est de 55 sur 120, soit environ 46 %. C'est cette dernière colonne qu'il faut demander, avec la raison des écarts.

## La clause à recopier dans le cahier des charges

Écrivez ce que vous voulez recevoir, avec un moment de remise. Une phrase comme « protocole ouvert » ne donne aucun droit en cas de départ du prestataire.

1. **Table des points** : nom, adresse, unité, échelle, lecture ou écriture, fréquence.
2. **Programmes sources** : fichiers modifiables des automates, des bus et des vues graphiques.
3. **Accès** : comptes administrateur remis au propriétaire, licences à son nom.
4. **Sauvegarde** : copie complète livrée après réception puis après chaque changement.
5. **Reprise** : aide à la transition avec un autre intégrateur, durée et prix fixés au départ.

Ajoutez une démonstration : un tiers désigné lit dix points et modifie deux consignes avec les documents livrés. Si l'essai échoue, la clause n'est pas remplie. Le coût de ces livrables doit apparaître dans la comparaison de [prix d'une GTB](gtb-prix-cout-installation.md).

## Choisir selon votre site

Partez des équipements installés, puis de ceux que vous garderez dix ans. Remplacer un bus qui fonctionne pour suivre une préférence n'a guère de sens.

| Votre situation | Piste à étudier |
|---|---|
| Plusieurs automates de chauffage et de climatisation | Supervision en BACnet, objets listés au contrat |
| Rénovation des luminaires et stores | KNX, avec fichier de projet remis |
| Suivi d'énergie seul | Compteurs Modbus, registres documentés |
| Parc mélangé | Passerelles testées une par une, sauvegardes comprises |

Une architecture mixte est normale. L'important est de désigner le lieu où la règle est décidée. Si la supervision et l'automate commandent tous deux la même vanne, l'un annulera l'autre. Demandez un schéma avec le maître de chaque commande.

Pour un cabinet ou une boutique, la solution la plus simple suffit souvent : voyez le périmètre proposé dans l'article [GTB pour petit bâtiment tertiaire](gtb-petit-batiment-tertiaire.md). La vue d'ensemble se trouve dans notre guide de la [gestion technique du bâtiment](gtb-gestion-technique-batiment.md).

## Sécuriser les échanges

Une GTB raccordée au réseau de l'entreprise mérite des règles de sécurité écrites. L'ANSSI publie un [guide pour les systèmes GTB et GTC](https://messervices.cyber.gouv.fr/documents-guides/Guide__Systemes_industriels___GTB_GTC_2025.pdf?hl=fr-FR) à transmettre à votre intégrateur et à votre informaticien.

- **Séparer** : placez les automates sur un réseau distinct de la bureautique.
- **Nommer** : créez un compte par personne et fermez-le au départ.
- **Limiter** : ouvrez l'accès distant seulement pendant l'intervention, avec trace.
- **Restaurer** : remontez une sauvegarde sur matériel de test une fois par an.

Vérifiez aussi que l'arrêt du serveur ne coupe pas le chauffage. Les régulations locales doivent rester autonomes et chaque commande sensible disposer d'un mode manuel.

## Questions fréquentes

### Peut-on relier des équipements de marques différentes ?

Oui, si chacun expose les données attendues ou si une passerelle les traduit. Faites tester un exemplaire avant de valider tout le lot, en lecture et en commande.

### BACnet/IP et BACnet MS/TP, est-ce la même chose ?

Ce sont deux façons de transporter BACnet, l'une sur réseau informatique, l'autre sur liaison série. Le langage est commun, les débits, le câblage et les équipements diffèrent.

### KNX est-il réservé aux bâtiments neufs ?

Non, il peut s'installer en rénovation, notamment lors d'un remplacement d'éclairage ou de commandes. Le câblage disponible et la possibilité de passer par radio ou par réseau décident du coût.

### Que faire si le prestataire refuse de donner les programmes ?

Relisez les droits prévus au marché et demandez une remise écrite avant le solde. Pour un système déjà livré, faites chiffrer une reprise par un tiers et négociez la récupération des fichiers existants.

## Vos points parlent, votre contrat aussi

Une GTB vous dit où part l'énergie et votre facture à quel tarif elle arrive. Adressez-nous la dernière : M&S Strategy l'étudie gratuitement et vous répond sous 24h.
