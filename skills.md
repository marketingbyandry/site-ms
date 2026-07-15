# skills.md — méthode de travail sur site-ms

Comment travailler sur ce projet : quel pipeline suivre, quels skills et
agents mobiliser, quels outils sont sous-exploités. Le contexte projet
lui-même est dans `CLAUDE.md` ; l'état de la dernière session dans
`handoff.md`.

## Pipeline (obligatoire pour toute tâche substantielle)

1. **Cadrage** — `superpowers:brainstorming` avant toute création. C'est le
   point d'entrée explicitement requis pour le chantier "V2 sous-domaine"
   (voir `handoff.md`).
2. **Plan** — `superpowers:writing-plans`, plan déposé dans
   `docs/superpowers/plans/`.
3. **Exécution** — déléguer via l'outil Agent :
   - `dev-builder` : **agent par défaut pour ce projet** (le site est du
     logiciel — HTML/CSS/JS + middleware Vercel — malgré la nature business
     du client). TDD quand c'est pertinent, worktree git systématique.
   - `content-builder` : uniquement pour les supports hors code (plaquettes,
     copywriting, supports B2B/B2C/RGPD).
4. **Relecture** — `quality-reviewer` avant livraison. Pour les changements
   qui touchent la prod, l'utilisateur peut aussi lancer `/code-review ultra`
   sur la branche avant merge.
5. **Livraison** — PR draft, jamais de push direct sur `main`. Mettre à jour
   `handoff.md` + la note Obsidian `Agents HQ/Projets/MS Strategy.md`.

Tâche courte et bien définie (correction triviale, question) : ne pas forcer
les 5 étapes — jugement.

## Skills à invoquer selon la situation

| Situation | Skill |
|---|---|
| Nouvelle fonctionnalité / page / chantier | `superpowers:brainstorming` puis `superpowers:writing-plans` |
| Bug (rendu, tracking, middleware…) | `superpowers:systematic-debugging` — **avant** d'empiler des scripts de diagnostic |
| Continuer un agent déjà lancé | `SendMessage` vers l'agent existant plutôt qu'un nouveau `Agent` (garde son contexte, moins cher) |
| Retrouver du travail passé | skill `mem-search` / `get_observations` (claude-mem) |

Leçon apprise sur ce projet : le débogage PostHog a coûté cinq scripts de
diagnostic en headless Chrome avant de découvrir le filtrage anti-bot
(`navigator.webdriver`). `systematic-debugging` invoqué d'emblée force à
questionner l'environnement de test avant d'itérer.

## Outils sous-exploités, pertinents pour ce projet

- **Artifact** : publier specs, maquettes et comparatifs comme pages web
  privées hébergées (URL stable, mise à jour au même lien). Remplace les
  viewers HTML construits à la main avec fonts embarquées.
- **Cron + PushNotification** : vérification quotidienne que les événements
  `cta_click` remontent bien dans PostHog, alerte seulement si ça casse —
  plutôt que de re-vérifier manuellement à chaque session.
- **Monitor** : attendre en arrière-plan qu'un déploiement Vercel se
  stabilise au lieu de revenir vérifier.
- **Gmail (connecté)** : retrouver le fil d'un prospect et préparer un
  brouillon de relance pointant vers sa page de suivi personnalisée
  (`ms-strategy-suivi-*.html?prenom=…&conseiller=…`) une fois le chantier
  "pages de suivi" livré.
- **Mémoire persistante** : y consigner les décisions stables non déductibles
  du code (préférences de style M&S, région PostHog une fois confirmée,
  stratégie Basic Auth…).

## Vérifications avant toute livraison

- Tester sur la **vraie preview Vercel** (bypass token, jamais commité),
  desktop + mobile — les deux bugs de la variante B (fonds sombres codés en
  dur, texte clair-sur-clair) n'étaient visibles qu'en réel.
- L'analytics ne se teste **jamais** en navigateur headless (filtrage
  anti-bot PostHog) : `curl` sur l'API d'ingestion ou clic réel en prod.
- Toute modification commune (nav, footer, fonts) doit être répercutée
  **fichier par fichier** — pas de composants partagés.
- Repo public : relire le diff pour vérifier qu'aucun secret/token n'y figure.
