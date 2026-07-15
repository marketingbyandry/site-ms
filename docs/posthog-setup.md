# Configurer PostHog pour le test A/B de la home

## 1. Créer le compte

1. Aller sur https://posthog.com, "Get started for free".
2. Au moment de choisir la région, sélectionner **EU** (cohérent avec la
   démarche RGPD du site — les données restent hébergées en Europe).
3. Créer un projet (ex. "M&S Strategy — site").

## 2. Récupérer la clé

1. Dans le projet, aller dans **Project Settings → Install PostHog**.
2. Copier la **Project API Key** (commence par `phc_...`).
3. Transmettre cette clé pour qu'elle soit intégrée dans
   `assets/analytics.js` (elle est publique par nature, pas un secret).

## 3. Vérifier que le tracking fonctionne

1. Une fois le code déployé (push sur `main`, Vercel redéploie
   automatiquement), ouvrir le site en navigation privée.
2. Dans PostHog, aller dans **Activity** (menu de gauche) — les évènements
   `$pageview` puis `cta_click` (au clic sur un bouton) doivent apparaître
   en quelques secondes.

## 4. Créer les Insights de comparaison A/B

Tous les Insights ci-dessous se créent dans **Product Analytics → Insights
→ New Insight**, puis en ajoutant un **Breakdown** sur la propriété
`variant`.

1. **Trafic par variante** — Insight de type "Trends", évènement
   `$pageview`, breakdown par `variant`. Montre combien de visiteurs ont vu
   A vs B (doit être ~50/50 si le split fonctionne).
2. **Temps passé par variante** — Insight "Trends", évènement `$pageleave`,
   agrégation "Average" sur la propriété `$prev_pageview_duration`,
   breakdown par `variant`.
3. **Clics CTA par variante** — Insight "Trends", évènement `cta_click`,
   breakdown par `variant`, et un second breakdown (ou un filtre) sur la
   propriété `label` pour voir quel bouton précis performe le mieux. C'est
   l'Insight le plus important : il mesure la conversion, pas juste le
   trafic.
4. **Heatmap des clics** — menu **Toolbar** ou l'app mobile PostHog propose
   une vue heatmap par URL ; utile pour une comparaison visuelle rapide
   entre A et B.

Épingler ces 3-4 Insights à un **Dashboard** dédié ("Home A/B test") pour
les retrouver facilement.
