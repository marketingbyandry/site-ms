# Positionnement "rébellion tarifaire" + architecture CTA/maillage — design

## Contexte

Le Baromètre M&S Strategy (PR #13, en cours de finalisation) donne au site un premier outil de preuve concrète (données de marché vérifiées). Ce document cadre l'étape suivante : un discours de marque qui exploite cette preuve pour inciter le lecteur à agir, plus une architecture de CTA et de maillage interne plus dense pour convertir cette conviction en contact commercial (formulaire `b2b.html#upload`).

Ce n'est pas une refonte de contenu : il s'agit d'ajouts ciblés (positionnement, blocs CTA, liens contextuels) sur des pages existantes, pas de réécriture intégrale.

## Objectif

- Donner à M&S Strategy un **positionnement d'entreprise** explicite, répondant au "pourquoi" qu'un client B2B se pose avant de faire confiance à un cabinet plutôt qu'à son fournisseur ou son courtier actuel.
- Décliner ce positionnement pour des segments prioritaires (agriculture, industrie, plateformes logistiques) sans dupliquer un message générique.
- Densifier les CTA (bouton + hypertexte, toutes les 2-3 sections, aux moments stratégiques) sans saturer la lecture.
- Ajouter un maillage interne contextuel vers les pages villes, `b2b.html` et `blog.html`.

## Périmètre

**Pages concernées** : `b2b.html`, `index.html`, `ms-blog-article-1.html`, `ms-blog-article-2.html`, `comment-ca-marche.html`. Les 10 pages villes (`courtier-energie-{ville}.html`) et `blog.html` sont des **cibles** de maillage, pas des pages à réécrire dans ce chantier.

**Hors périmètre** : refonte visuelle, nouveau formulaire ou tunnel de conversion (le CTA continue de pointer vers `b2b.html#upload`, déjà existant), liens article-à-article chronologiques entre les 7 rétrospectives du Baromètre.

## Ton

Ferme et porteur de convictions, jamais virulent : pas d'accusation nominative de fournisseur ou de courtier concurrent, pas de sensationnalisme. La fermeté vient de faits de marché vérifiables (opacité tarifaire, reconduction tacite, asymétrie d'information), pas d'attaque personnelle. Le vocabulaire "cabinet" est mis en avant, "courtier/courtage" reste présent mais en retrait (utile SEO et crédibilité réglementaire), pour permettre au discours de questionner la neutralité des courtiers déjà en place sans paraître juge et partie.

## Positionnement (le "pourquoi")

**Manifeste long** (page dédiée ou section `b2b.html`/`index.html`) :

> Les fournisseurs d'énergie ont un objectif : leur rentabilité. Le vôtre n'entre pas dans l'équation — sauf comme ligne de marge à optimiser. Grilles tarifaires opaques, reconductions tacites, contrats pensés pour décourager la comparaison : ce n'est pas un hasard, c'est un modèle. Et la plupart des entreprises françaises paient ce prix sans jamais savoir qu'un autre était possible.
>
> Nous pensons que ce rapport de force ne devrait pas exister. Une PME n'a ni le temps ni les moyens de décortiquer un marché de gros pensé pour des traders, mais elle a le droit de payer un prix juste. C'est tout l'objet du Baromètre : rendre visible ce qui reste sciemment illisible, et vous donner, gratuitement, l'information que votre fournisseur espère que vous n'irez jamais chercher.
>
> Nous ne sommes pas neutres. Nous sommes du côté de l'entreprise qui paie la facture, pas de celui qui l'envoie.

**Version courte (accroche/CTA)** : *"Votre fournisseur regarde sa rentabilité. Nous regardons la vôtre."*

**Formule de positionnement générale (déclinable en balise meta, footer, intro de page)** : *"M&S Strategy — cabinet d'expertise énergie pour les entreprises."*

**Volet "second avis" (face au courtier déjà en place)** :

> Vous avez déjà un courtier, et c'est une bonne chose : gérer seul un contrat d'énergie pro est un métier à part entière. Mais un courtier reste un intermédiaire commercial — et comme toute relation commerciale, elle mérite d'être vérifiée de temps en temps, pas par méfiance, mais par bon sens de gestion.
>
> M&S Strategy n'est pas un courtier de plus. Nous sommes un cabinet d'expertise énergie : notre rôle n'est pas de vous vendre un contrat, mais de vous dire, avec les chiffres du marché de gros sous les yeux, si celui que vous avez déjà est le bon. Le Baromètre est le premier niveau de cette expertise, gratuit et sans engagement — un point de comparaison indépendant, pas une nouvelle offre commerciale à évaluer.

CTA associé : *"Faites vérifier votre contrat par un cabinet d'expertise indépendant — pas par un courtier de plus. Gratuit, en 2 minutes."*

**Point ouvert à confirmer avant rédaction finale** : si M&S Strategy est rémunérée par honoraires client plutôt que par commission fournisseur, c'est un argument de neutralité vérifiable à ajouter explicitement ("nous sommes payés par vous, pas par le fournisseur que nous vous recommandons"). Non confirmé à ce stade — la copy ci-dessus fonctionne sans ce point, à enrichir si confirmé.

## Déclinaisons sectorielles

Même structure (douleur reconnue → rôle du Baromètre → CTA), douleur concrète différente par secteur. Trois secteurs prioritaires pour ce chantier :

**Agriculture** :
> Vous connaissez déjà ce rapport de force. C'est celui que vous vivez avec vos acheteurs, vos coopératives, vos distributeurs — des prix qui vous échappent, fixés ailleurs, sans que vous ayez le pouvoir de les discuter. Sur l'énergie, c'est pareil, sauf que personne ne vous le dit : irrigation, séchage du grain, chambres froides, serres chauffées — vos postes énergétiques pèsent lourd, et votre fournisseur le sait très bien.
>
> Le Baromètre vous donne en deux minutes ce qu'il faudrait normalement un service achats pour obtenir. Et si votre facture dépasse ce prix, on vous le dit — gratuitement, sans engagement, sans jargon d'énergéticien.

CTA : *"Votre exploitation n'a pas de service achats dédié à l'énergie. Nous, si — et c'est gratuit."*

**Industrie** :
> Vous pilotez votre production au centime près. Un poste continue d'échapper à ce contrôle : l'énergie. Four, compresseurs, process thermique, ligne continue — ce sont souvent vos plus gros volumes de consommation, et pourtant le contrat qui les couvre a probablement été signé une fois, il y a plusieurs années, sans jamais être rediscuté depuis.
>
> Le Baromètre vous montre où se situe réellement le marché de gros aujourd'hui, gratuitement, sans code d'accès.

CTA : *"Un contrat énergie qui n'a pas été renégocié depuis 3 ans coûte presque toujours plus cher que le marché. Vérifiez le vôtre — c'est gratuit."*

**Plateformes logistiques** :
> Froid, éclairage, quais, manutention électrique, bornes de recharge en expansion : l'énergie n'est plus une ligne annexe, c'est un poste de coût qui grossit plus vite que le reste. Si vous gérez plusieurs sites, la difficulté double — chaque entrepôt a son propre contrat, ses propres conditions, presque impossibles à comparer entre eux.
>
> Le Baromètre vous donne un point de repère unique, valable pour tous vos sites.

CTA : *"Un entrepôt sur trois paie l'énergie au-dessus du marché sans le savoir. Envoyez vos factures, on compare — gratuitement."*

## Architecture des CTA

**Cadence** : un CTA (bouton ou hypertexte) toutes les 2-3 sections de contenu, plus systématiquement à trois moments : après le premier point de douleur reconnu par le lecteur, après une preuve chiffrée (Baromètre, stat sectorielle), et en fin de page/article.

**Bouton vs hypertexte** :
- Bouton (fort contraste visuel) aux moments de haute intention : fin de section pain-point, fin d'article, après une preuve chiffrée. Toujours verbe d'action + bénéfice, jamais "En savoir plus".
- Hypertexte (inline, dans le corps du texte) en milieu de paragraphe, pour ne pas casser la lecture — notamment dans les articles rétrospectifs et les sections informatives.

**Banque de copy** :

| Contexte | Bouton | Hypertexte |
|---|---|---|
| Générique / b2b.html | "Vérifiez votre contrat — gratuit, en 2 minutes" | "envoyez votre facture pour comparaison gratuite" |
| Agriculture | "Votre exploitation n'a pas de service achats énergie. Nous, si." | "comparez votre contrat au prix du marché" |
| Industrie | "Un contrat non renégocié coûte cher. Vérifiez le vôtre." | "vérifiez si votre contrat a décroché du marché" |
| Logistique | "Un entrepôt sur trois paie au-dessus du marché. Vérifiez le vôtre." | "comparez vos contrats multi-sites gratuitement" |
| Second avis / courtier existant | "Faites vérifier votre contrat par un cabinet indépendant" | "faites vérifier ce que votre courtier vous a obtenu" |
| Articles rétrospectifs (fin d'article) | "Voir si votre contrat suit ce marché" | "consultez le Baromètre en temps réel" |

**Placement par type de page** :
- `b2b.html` / `index.html` : bouton après la section pain-point, bouton après la section preuve/Baromètre, bouton final en bas de page. Hypertextes dans les paragraphes descriptifs entre ces points.
- Articles rétrospectifs (`ms-blog-article-1.html`, `ms-blog-article-2.html`) : un hypertexte à mi-article, un bouton en fin d'article — jamais de bouton en milieu d'article pour ne pas casser la lecture longue.
- `comment-ca-marche.html` : un bouton par étape du parcours décrite (3-4 boutons), cohérent avec le format "processus" de la page.

Toutes les cibles pointent vers `b2b.html#upload` (formulaire existant), sauf les liens internes à `b2b.html` elle-même qui scrollent vers l'ancre directement.

## Maillage interne

**Règle générale** : liens contextuels dans le corps du texte, pas de blocs de liens génériques en fin de page — l'objectif est un maillage à l'air éditorial, pas mécanique. Pas de liens article-à-article entre les 7 rétrospectives du Baromètre.

**Vers les pages villes** : déclenché quand une section ou un article mentionne une réalité géographique/locale pertinente au secteur traité. Ancre descriptive et contextuelle (ex. *"comme pour les entreprises de la région lyonnaise"*), jamais générique. Une ancre par section maximum. Sélection des 2-3 villes les plus pertinentes par contenu, pas de liste exhaustive des 10.

**Vers `b2b.html` et `blog.html`** :
- Depuis les articles rétrospectifs : un hypertexte à mi-article vers `b2b.html` (ex. *"comme détaillé sur notre page dédiée aux entreprises"*), distinct du CTA de fin d'article qui pointe vers `#upload`.
- Depuis `b2b.html` : hypertexte vers `blog.html` dans la section preuve/Baromètre (ex. *"retrouvez l'historique complet des prix sur notre blog"*).

**Convention d'ancre (règle transversale)** : toujours descriptive et contextuelle, jamais "cliquez ici"/"en savoir plus", intégrée naturellement à la phrase, cohérente avec le vocabulaire "cabinet".

## Contraintes globales (pour le plan d'implémentation)

- Vocabulaire "cabinet" en avant, "courtier/courtage" en retrait mais jamais supprimé, sur toutes les pages concernées.
- Aucun fournisseur ni courtier concurrent nommé, à aucun endroit.
- Aucun lien article-à-article chronologique entre les 7 rétrospectives Baromètre.
- Tous les CTA d'action pointent vers `b2b.html#upload` (tunnel existant), sauf ancres internes à `b2b.html`.
- Anti-antidatage : sans objet ici (pas de nouvel article rétrospectif dans ce chantier), mais toute nouvelle date affichée doit rester réelle.
- Le point de rémunération (honoraires client vs commission fournisseur) reste à confirmer avant d'être ajouté à la copy — ne pas l'affirmer sans validation explicite.
