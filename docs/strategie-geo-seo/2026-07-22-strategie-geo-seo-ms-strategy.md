# Stratégie GEO + SEO — M&S Strategy

**Objectif** : être la première réponse — sur Google **et** dans les réponses des LLM (ChatGPT, Claude, Perplexity, Gemini) — quand un professionnel pose une question sur ses contrats d'énergie (gaz / électricité).

**Périmètre décidé** : hybride pyramidal (piliers nationaux + pages villes). **Moyens** : ambitieux (budget contenu soutenu, netlinking/RP, outils SEO). **Cible primaire** : décideurs pro (TPE, PME, ETI) ; particuliers en secondaire.

**Auteur** : chef de projet senior — 22 juillet 2026.
**Site** : www.byandry.com · Entité : *M&S Strategy* (courtage en énergie indépendant, Lattes 34, depuis 2012, SIREN 752 139 477).

---

## 0. Thèse stratégique (à lire avant tout le reste)

Un dirigeant qui se demande *« mon contrat d'électricité est trop cher, que faire ? »* ne fait plus un seul geste : il tape sur Google **et** il pose la question à ChatGPT/Claude. Ces deux surfaces convergent (Google déploie AI Overviews, ChatGPT a un moteur de recherche). **Gagner en 2026, c'est gagner les deux en même temps.**

La bonne nouvelle : **ce qui rend une page citable par un LLM et ce qui la fait ranker sur Google reposent sur le même socle** — une entité claire et de confiance, des réponses directes et structurées, des faits vérifiables, et de l'autorité externe (citations, avis, presse). On ne construit donc pas deux stratégies, mais **une seule stratégie, optimisée pour être *extraite* autant que *classée*.**

Notre avantage compétitif décisif : **l'autorité de niche.** Face aux gros comparateurs génériques (Selectra, fournisseurs, agrégateurs), M&S Strategy peut devenir *la* référence experte sur un angle précis — **le courtage en énergie pour professionnels, indépendant, rémunéré par les fournisseurs** — plutôt que de se battre sur les têtes de requêtes ultra-concurrentielles. Les LLM adorent citer la source la plus *spécifiquement pertinente*, pas la plus grosse.

**Ce que nous visons concrètement :**
1. Position 0 / AI Overview Google sur les requêtes « courtier énergie pro » et longue traîne associée.
2. Citation nominative de M&S Strategy dans les réponses ChatGPT/Claude/Perplexity aux questions de dirigeants sur l'énergie.
3. Une entité « M&S Strategy » reconnue par le graphe de connaissance (Google Knowledge Graph + inférence LLM).

---

## 1. Diagnostic express de l'existant

| Élément | État actuel | Impact |
|---|---|---|
| Title / meta description | ✅ Bons, riches en mots-clés | Base saine |
| Balisage structuré (JSON-LD) | ❌ **Aucun** sur tout le site | **Angle mort critique** (Google + LLM) |
| FAQ | ✅ Présentes (index, b2b, b2c) mais ❌ non balisées `FAQPage` | Potentiel de rich results + extraction LLM gaspillé |
| Sitemap | ⚠️ 9 URLs seulement | Couverture faible |
| robots.txt | ⚠️ N'adresse pas les crawlers LLM (GPTBot, ClaudeBot…) | Risque d'invisibilité GEO |
| Blog | ⚠️ 2 articles | Autorité thématique quasi nulle |
| E-E-A-T / entité | ⚠️ Signaux « depuis 2012 » présents mais pas de page auteur, pas de `sameAs`, pas de Wikidata | Confiance sous-exploitée |
| Poids technique | ⚠️ PostHog ~227 Ko chargé sans condition | Nuit aux Core Web Vitals |
| Netlinking / citations tierces | ⚠️ Inconnu / faible | Frein n°1 à l'autorité |

**Les 3 déficits qui coûtent le plus cher aujourd'hui** : (1) zéro donnée structurée, (2) autorité thématique embryonnaire (2 articles), (3) présence tierce/citations non travaillée. La stratégie attaque ces trois-là en priorité.

---

## 2. Les 6 piliers de la stratégie

### Pilier A — Fondations techniques : rendre le site *lisible par les machines*

C'est le socle non négociable, à faible coût et fort effet de levier. **La plupart est livrée en quick wins dès cette session** (voir §7).

- **Données structurées JSON-LD** (schema.org) — le langage que Google *et* les LLM parsent en priorité :
  - `Organization` / `ProfessionalService` sur la home : nom, logo, NAP, `foundingDate: 2012`, `areaServed: France`, `sameAs` (réseaux, annuaires), zone, contact.
  - `FAQPage` sur index / b2b / b2c (nos FAQ existantes → éligibles rich results + « prêtes à citer » pour les LLM).
  - `Article` + `author` + `datePublished` sur chaque article de blog.
  - `BreadcrumbList` sur les pages profondes.
  - `Service` pour chaque prestation (courtage élec pro, courtage gaz pro, renégociation, groupement d'achat).
- **Accessibilité aux crawlers IA** : autoriser explicitement `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-SearchBot`, `PerplexityBot`, `Google-Extended` dans `robots.txt`. *(Décision assumée : on veut être cité, donc on ouvre. Alternative défensive = bloquer, mais elle nous rend invisibles en GEO — non retenue.)*
- **`llms.txt`** (standard émergent) : un fichier racine qui résume l'entité, l'offre et les pages clés en markdown propre, pensé pour les agents IA.
- **HTML sémantique & extractible** : H1 unique, hiérarchie Hn logique, **tableaux comparatifs** (les LLM extraient remarquablement bien les tableaux), listes, définitions en une phrase.
- **Performance / Core Web Vitals** : différer PostHog (chargement conditionnel au consentement — déjà identifié), lazy-load images, viser LCP < 2,5 s. Google et les moteurs génératifs pénalisent la lenteur.
- **Sitemap enrichi** : toutes les pages, `lastmod` réels, extension au fil des publications piliers/villes.

### Pilier B — Architecture de contenu pyramidale (autorité thématique)

Le cœur du dispositif. On construit une **pyramide** : au sommet, des **pages piliers** nationales qui font autorité ; en dessous, des **clusters** d'articles qui répondent à chaque question précise ; à la base, des **pages villes** qui captent le local. Tout est maillé en interne (hub-and-spoke) pour concentrer l'autorité.

**Pages piliers (nationales, ~2 000–3 000 mots, la « source de vérité » sur leur sujet) :**
1. *Courtier en énergie pour professionnels : le guide complet 2026* — la page-mère, cible la requête reine.
2. *Renégocier son contrat d'électricité professionnel : quand, comment, combien économiser.*
3. *Groupement d'achat d'énergie pour entreprises : fonctionnement et intérêt.*
4. *Prix de l'énergie pour les entreprises en 2026 : comprendre, anticiper, sécuriser.*
5. *Courtier vs comparateur vs achat en direct : quel canal pour quelle entreprise.*

**Clusters (articles satellites, une question = un article, format « réponse d'abord ») — exemples :**
- « Un courtier en énergie est-il vraiment gratuit ? » (notre modèle de commission = un différenciateur, on le documente à fond)
- « Comment lire et décrypter sa facture d'électricité professionnelle »
- « ARENH, marché de gros, TURPE, CEE : le lexique énergie du dirigeant »
- « Prix fixe ou prix indexé pour mon entreprise : comment choisir »
- « Résiliation / changement de fournisseur d'énergie pro : y a-t-il une coupure ? »
- « Mon entreprise a plusieurs sites : comment mutualiser mes contrats d'énergie »
- « Contrat en cours : à quel moment (re)négocier — la fenêtre 12–24 mois »
- « Courtier en énergie : quelles obligations, quelle indépendance, quels pièges à éviter »

**Pages villes (SEO local, base de la pyramide) :**
- Template déjà en cours. Modèle : *Courtier en énergie à [Ville] — professionnels & entreprises.*
- Prioriser les bassins économiques : Montpellier (proximité), puis grandes métropoles (Paris, Lyon, Marseille, Toulouse, Bordeaux, Lille, Nantes…).
- **Anti-« doorway pages »** : chaque page ville doit apporter du *vrai* contenu local (tissu économique local, cas d'usage sectoriels du bassin, mention d'intervention réelle) — pas un simple copier-coller avec le nom de ville échangé. Google sanctionne les pages villes vides ; les LLM les ignorent.

**Principe de maillage** : chaque cluster pointe vers sa pilier ; la pilier pointe vers ses clusters ; les pages villes pointent vers les piliers pertinentes. Ancres descriptives (« renégocier un contrat d'électricité pro »), jamais « cliquez ici ».

### Pilier C — GEO : être *cité* par les LLM (spécifique, au-delà du SEO classique)

Les LLM ne « classent » pas des pages, ils **synthétisent une réponse et citent des sources**. Optimiser pour ça :

- **Structure « réponse d'abord » (answer-first)** : chaque page/section commence par une réponse directe et autonome de 2–3 phrases, *avant* le développement. C'est ce fragment que le LLM extrait et cite.
- **H2/H3 formulés comme les questions réelles** des dirigeants (« Combien coûte un courtier en énergie ? », « Un courtier peut-il intervenir si mon contrat est en cours ? »). On calque la façon dont les gens *parlent* à un chatbot, pas seulement dont ils tapent sur Google.
- **Faits citables** : chiffres, fourchettes d'économies, délais (« premier retour sous 48 h »), dates, **avec source**. Les LLM privilégient et reproduisent les affirmations quantifiées et sourçables. *(NB : les stats non sourcées de la home restent un risque de crédibilité — cf. §8.)*
- **Tableaux comparatifs** systématiques (courtier vs comparateur, prix fixe vs indexé, etc.) : format idéal pour l'extraction.
- **Définitions canoniques** : une phrase nette qui définit chaque terme (« Un courtier en énergie est… »). C'est ce que les LLM reprennent quasi mot pour mot.
- **Cohérence de l'entité partout** : même nom, même NAP, même description « courtier indépendant depuis 2012, rémunéré par les fournisseurs » sur le site *et* sur toutes les sources tierces. La cohérence renforce la confiance qu'un LLM accorde à l'entité.
- **Être présent là où les LLM puisent** (déterminant — voir Pilier D) : les modèles s'appuient massivement sur des sources tierces (annuaires, avis, articles « meilleur courtier énergie », forums, Reddit/Quora, presse). **Notre site seul ne suffit pas à être cité ; il faut être *cité ailleurs*.**

### Pilier D — Autorité externe & E-E-A-T (le vrai facteur différenciant, « ambitieux »)

C'est ici que le budget « ambitieux » se déploie. Sans autorité externe, ni Google ni les LLM ne nous mettront devant les gros acteurs.

- **RP digitale / netlinking éditorial** :
  - **Étude data propriétaire** = notre meilleur actif : un *« Baromètre M&S Strategy des prix de l'énergie pour les entreprises »* (trimestriel/annuel). Une donnée originale et chiffrée attire des liens de presse éco/BFM/Les Échos/PME.fr **et** devient une source directement citable par les LLM. C'est l'investissement au plus fort ROI.
  - Outreach journalistes (plateformes type *SourceBottle/HARO-like*, Ressources presse françaises), tribunes d'expert, interviews de dirigeant.
  - Backlinks depuis médias énergie / gestion d'entreprise / annuaires B2B qualifiés.
- **Signaux d'entité & confiance** :
  - Fiche **Google Business Profile** optimisée (catégorie « Courtier en énergie », zone, photos, posts, Q&A) — pilier du SEO local *et* signal d'entité.
  - **Wikidata** (créer/consolider l'entité), présence cohérente sur **Societe.com, PagesJaunes, annuaires courtiers énergie, LinkedIn entreprise**.
  - **Avis** : campagne structurée d'avis Google + Trustpilot (les LLM lisent le sentiment et la réputation). Objectif : volume + fraîcheur + réponses aux avis.
  - **Page « À propos » / auteur E-E-A-T** : histoire depuis 2012, expertise, mandats, éventuelles adhésions pro / certifications. Google et LLM cherchent le *qui est derrière*.
- **Présence communautaire** : réponses expertes (jamais spam, toujours signées M&S Strategy) sur forums de dirigeants, LinkedIn, Quora FR, sous-reddits pertinents. Les LLM pondèrent fortement Reddit/forums dans leurs réponses.

### Pilier E — Copywriting & persuasion : convertir *et* être extrait

Une page peut être n°1 et ne rien vendre. Notre contenu doit **gagner la machine et convaincre l'humain** en même temps.

- **Double lecture** : le *premier paragraphe answer-first* sert le LLM ; le *reste* (preuve, histoire, bénéfice, CTA) sert la conversion.
- **Angle éditorial directeur** (aligné sur la campagne social existante) : *« Vous ne changez pas votre énergie parce que ça semble compliqué. Notre métier, c'est de rendre ça simple — et gratuit pour vous. »* La gratuité (rémunération par les fournisseurs) et la simplicité sont les deux leviers de persuasion à marteler.
- **Cadres de copywriting à appliquer sur les piliers/landing** :
  - **PAS** (Problème – Agitation – Solution) : « Votre facture énergie grimpe. Chaque mois d'attente = de l'argent perdu. M&S Strategy renégocie à votre place, gratuitement. »
  - **Preuve avant promesse** : chiffres d'économies réels, nombre de contrats négociés, ancienneté « depuis 2012 », logos secteurs.
  - **Réduction du risque** : « gratuit, sans engagement, vous ne payez rien même si vous ne signez pas » → répété comme un mantra (c'est l'objection n°1).
  - **CTA unique et à faible friction** : « Transmettez votre facture, recevez votre analyse sous 48 h. » (converge vers le formulaire Tally existant).
- **Cohérence terminologique** : « groupement d'achat » (aligné site), « courtier en énergie indépendant », « rémunéré par les fournisseurs ». Un vocabulaire stable = une entité claire pour les LLM.
- **Ton** : expert, direct, rassurant, sans jargon non glosé (chaque terme technique défini en une phrase — bon pour l'humain *et* pour l'extraction LLM).

### Pilier F — Mesure & pilotage

On ne pilote que ce qu'on mesure. Double tableau de bord : SEO classique **et** visibilité LLM.

- **SEO** : Google Search Console (impressions, position, CTR par requête), Ahrefs/Semrush (positions, backlinks, autorité), trafic organique (analytics respectueux du consentement).
- **GEO / visibilité LLM** : suivi des citations dans ChatGPT/Claude/Perplexity/Gemini via outils dédiés (Profound, Otterly.ai, Peec.ai ou équivalent) **et** un protocole manuel : une batterie de ~20 prompts types de dirigeants, testés chaque mois, on note si/comment M&S Strategy apparaît.
- **KPIs cibles (12 mois)** :
  - Top 3 Google sur « courtier en énergie professionnels » + 15 requêtes longue traîne.
  - Citation de M&S Strategy dans ≥ 40 % des réponses LLM à notre batterie de prompts.
  - +X leads organiques /mois (formulaire Tally) — la seule métrique business qui compte au final.
  - Autorité de domaine en progression continue ; ≥ 25 backlinks éditoriaux qualifiés.

---

## 3. Cartographie des requêtes & intentions (extrait de référence)

| Intention | Requête / prompt type | Réponse actif cible |
|---|---|---|
| Définition (haut de tunnel) | « c'est quoi un courtier en énergie » | Pilier 1 + FAQ index |
| Défiance / objection | « un courtier en énergie est-il gratuit / arnaque ? » | Cluster « vraiment gratuit » |
| Comparaison | « courtier ou comparateur d'énergie pour entreprise » | Pilier 5 (tableau) |
| Action (bas de tunnel) | « renégocier contrat électricité entreprise » | Pilier 2 → CTA |
| Local | « courtier en énergie [ville] » | Pages villes |
| Situation précise | « changer de fournisseur énergie pro contrat en cours » | Cluster fenêtre 12–24 mois |
| Multi-sites | « mutualiser contrats énergie plusieurs sites » | Cluster multi-sites |

*(À étendre en atelier keyword research avec Ahrefs/Semrush : volumes, difficulté, priorisation.)*

---

## 4. Feuille de route (90 jours puis récurrent)

### Phase 0 — Fondations techniques (Semaine 1–2) — *quick wins de cette session*
- [x/en cours] JSON-LD `Organization`/`ProfessionalService`, `FAQPage`, `Article`, `BreadcrumbList`.
- [x/en cours] `robots.txt` ouvert aux crawlers IA + `llms.txt`.
- [x/en cours] Sitemap enrichi.
- [ ] Différer PostHog / Core Web Vitals (chantier séparé déjà identifié).
- [ ] Google Business Profile optimisé + lancement collecte d'avis.

### Phase 1 — Autorité de base (Mois 1–2)
- [ ] Rédiger + publier les **5 pages piliers** (answer-first, tableaux, maillage, copywriting Pilier E).
- [ ] Page « À propos / expertise » E-E-A-T + `sameAs` complets + Wikidata.
- [ ] Keyword research approfondi (Ahrefs/Semrush) → backlog de clusters priorisé.
- [ ] Cohérence NAP sur annuaires (Societe.com, PagesJaunes, LinkedIn, annuaires courtiers).

### Phase 2 — Volume & local (Mois 2–4)
- [ ] 8–12 articles **clusters** (rythme soutenu, ambitieux).
- [ ] Déploiement des **pages villes** (contenu local réel, pas de doorway).
- [ ] Lancement du **Baromètre M&S Strategy** (étude data) + campagne RP/outreach.
- [ ] Présence communautaire (LinkedIn, forums, Quora) — cadence régulière.

### Phase 3 — Autorité & citations LLM (Mois 4+, récurrent)
- [ ] Netlinking éditorial continu (objectif backlinks qualifiés).
- [ ] Mise à jour trimestrielle du Baromètre (fraîcheur = citations LLM récurrentes).
- [ ] Suivi mensuel visibilité LLM (batterie de prompts) → itération contenu sur les angles où l'on n'est pas cité.
- [ ] Rafraîchissement des piliers (les LLM et Google favorisent le contenu à jour).

---

## 5. Ce qui nous fera gagner (et les pièges à éviter)

**Leviers gagnants :**
1. **Spécificité de niche** > généralité : « le courtier énergie *pro, indépendant, gratuit* » est un angle défendable face aux mastodontes.
2. **Donnée propriétaire** (Baromètre) : le seul actif qui génère backlinks *et* citations LLM à la fois.
3. **Answer-first + structured data** : le combo qui rend chaque page extractible.
4. **Cohérence d'entité obsessionnelle** : même nom, mêmes faits, partout.

**Pièges à éviter :**
- Pages villes vides (doorway) → pénalité + zéro citation.
- Sur-optimisation / bourrage de mots-clés → Google Helpful Content sanctionne.
- Stats non sourcées présentées comme des faits → risque de crédibilité côté LLM (les modèles se méfient des chiffres invérifiables) — **cf. §8**.
- Négliger l'externe en croyant que « bien écrire le site suffit » → l'autorité se gagne *hors* du site.
- Bloquer les crawlers IA « par prudence » → invisibilité GEO.

---

## 6. Gouvernance & rôles (pipeline agents)

- **Cadrage / arbitrages stratégiques** : chef de projet (cette note).
- **Production de contenu** (piliers, clusters, villes, Baromètre) : `content-builder`.
- **Implémentation technique** (JSON-LD, robots, llms.txt, sitemap, perf) : `dev-builder` — en worktree + PR.
- **Relecture** avant livraison : `quality-reviewer`.
- **Suivi** : mise à jour de la note projet Obsidian `Agents HQ/Projets/MS Strategy.md` à chaque changement d'étape.

---

## 7. Quick wins livrés dans cette session

Voir la PR draft associée (`worktree-geo-seo-strategy`) :
1. **JSON-LD `ProfessionalService`/`Organization`** injecté sur `index.html` (entité, NAP, foundingDate 2012, areaServed France, sameAs, services).
2. **JSON-LD `FAQPage`** sur `index.html`, `b2b.html`, `b2c.html` (reprise fidèle des FAQ existantes).
3. **JSON-LD `Article`** sur les deux articles de blog.
4. **`robots.txt`** mis à jour : autorisation explicite des crawlers IA (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, Google-Extended…).
5. **`llms.txt`** créé à la racine.
6. **`sitemap.xml`** complété (pages manquantes : calculateur, landing, articles) avec `lastmod`.

Ces éléments sont sans risque fonctionnel (métadonnées et fichiers annexes ; aucun changement de rendu visible) et posent le socle des Piliers A et C.

---

## 8. Points d'attention / décisions restées ouvertes

- **Statistiques non sourcées de la home** (« 19 % d'économies moyennes », etc.) : laissées telles quelles par décision utilisateur passée, mais **elles brident la citabilité LLM et la conformité DGCCRF**. Recommandation forte : les sourcer (méthodo interne datée) ou les nuancer. À trancher.
- **Poids PostHog (~227 Ko)** : rappel déjà en attente ; impact Core Web Vitals réel. À planifier.
- **Outils SEO/GEO** (budget ambitieux) : choisir Ahrefs *ou* Semrush + un tracker de visibilité LLM (Profound/Otterly). Décision d'achat à valider.
- **Ressource rédactionnelle** : le rythme « ambitieux » (5 piliers + 8–12 clusters + villes + Baromètre) suppose soit `content-builder` à cadence élevée, soit un rédacteur externe. À arbitrer.
- **Baromètre** : nécessite une source de données (données internes de contrats négociés, anonymisées, ou données publiques CRE/marché). À cadrer dans une session dédiée — c'est le chantier à plus fort ROI.

---

*Prochaine étape recommandée : valider cette note, puis lancer `superpowers:writing-plans` sur la Phase 1 (pages piliers + entité E-E-A-T), et cadrer séparément le Baromètre.*
