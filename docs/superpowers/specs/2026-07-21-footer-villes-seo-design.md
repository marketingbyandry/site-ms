# Footer villes & pages SEO locales — design

Date : 2026-07-21
Inspiration : architecture de prestigeassurance.fr (pages villes, maillage footer, plan du site)

## Contexte

Le site M&S Strategy (courtier en énergie, gaz/électricité, B2B/B2C, basé à Lattes 34,
intervention France entière) est un site statique multi-pages HTML servi par Vercel
(pas de SSG, pas de templating serveur ; le thème jour/nuit vit directement dans
`index.html` via `:root[data-theme="light"]`). Le footer (`<footer class="sfooter">`)
est dupliqué tel quel dans 9 fichiers : `index.html`, `b2b.html`, `b2c.html`,
`comment-ca-marche.html`, `resultats.html`, `blog.html`, `mentions-legales.html`,
`cgv.html`, `politique-confidentialite.html`.

Objectif : reprendre les éléments utiles de prestigeassurance.fr — pages villes dédiées
au SEO local, maillage footer vers ces pages, plan du site, données structurées — adaptés
au métier réel de M&S Strategy (courtage énergie, pas assurance).

## Scope

### Inclus

1. **10 pages villes**, une métropole par page : Paris, Lyon, Marseille, Toulouse,
   Bordeaux, Lille, Nantes, Montpellier, Strasbourg, Rennes.
   - Fichier : `courtier-energie-{ville}.html` (slug minuscule sans accent, ex.
     `courtier-energie-strasbourg.html`).
   - Template commun : héro, section "pourquoi M&S Strategy", rappel du
     fonctionnement (renvoi vers `comment-ca-marche.html`), CTA vers `b2b.html` /
     `b2c.html`.
   - 2-3 blocs **réellement différenciés par ville** pour éviter le duplicate content :
     - Profil économique local : faits génériques et vérifiables sur le tissu
       économique de la ville (ex. Toulouse = aéronautique/spatial, Lille =
       logistique/tertiaire, Montpellier = santé/numérique). Aucune statistique
       chiffrée inventée, aucun nombre de clients ou de témoignage fabriqué pour
       cette ville.
     - Zones/villes environnantes couvertes (longue traîne SEO — ex. pour Lyon :
       Villeurbanne, Vénissieux, Bron).
   - JSON-LD `Service` avec `areaServed` = la ville, `provider` = M&S Strategy.
     Le site n'a aujourd'hui aucune donnée structurée : ajout net, aucun risque de
     régression.

2. **Footer** (9 fichiers existants + 10 nouvelles pages villes) :
   - Nouvelle colonne "Villes" listant les 10 pages villes.
   - Nouveau lien "Plan du site" vers `plan-du-site.html`.
   - Vérifier le CSS de `.sfooter` (grid/flex) pour absorber une 4e colonne sans
     casser le responsive.

3. **`plan-du-site.html`** (nouvelle page) : liste complète des pages du site,
   groupées par catégorie (navigation principale, villes, blog, légal), sur le
   modèle du "plan du site" de prestigeassurance.fr. Sert le maillage interne et
   la profondeur de crawl.

4. **`sitemap.xml`** : ajout des 10 URLs villes + `plan-du-site.html`, même format
   que l'existant (`changefreq: monthly`, `priority: 0.7`, cohérent avec les pages
   secondaires actuelles).

### Explicitement hors scope

- Bloc avis clients / note Google Business — pas de fiche existante, on ne fabrique
  pas de note. À ajouter dans une itération future quand une fiche existera.
- Horaires d'ouverture dans le footer.
- Génération dynamique / SSG — le site reste des fichiers HTML statiques.
- Modification du système de thème jour/nuit (`:root[data-theme="light"]` dans
  `index.html`) — les pages villes ne sont pas concernées.

## Architecture

```
/courtier-energie-{ville}.html   (×10, nouveau)
/plan-du-site.html               (nouveau)
/sitemap.xml                     (modifié — +11 <url>)
/index.html, b2b.html, b2c.html,
 comment-ca-marche.html, resultats.html, blog.html,
 mentions-legales.html, cgv.html,
 politique-confidentialite.html  (modifiés — footer + colonne Villes + lien plan du site)
```

Pas de nouvelle dépendance, pas de build step : chaque page ville est un fichier
HTML autonome copiant la structure `<head>`/CSS/scripts des pages existantes
(cohérence visuelle avec `index.html`).

## Contenu — garde-fous anti-fabrication

Pour chaque ville, le contenu différenciant se limite à des faits publics et
largement connus (secteurs économiques dominants, communes limitrophes). Aucun
chiffre precis (nombre d'entreprises, économies moyennes locales, témoignages
attribués à une ville) n'est inventé. Si une information chiffrée est nécessaire
(ex. économies moyennes constatées), elle reprend le chiffre déjà utilisé sur le
site national (`resultats.html`) sans le décliner par ville.

## Vérification avant livraison

- Chaque page ville : HTML valide, JSON-LD valide (pas de faute de syntaxe), liens
  internes fonctionnels (b2b/b2c/comment-ca-marche/calculateur), footer identique
  aux autres pages.
- `plan-du-site.html` : tous les liens résolvent vers un fichier existant.
- `sitemap.xml` : XML valide, toutes les URLs en `https://www.byandry.com/...`
  (domaine de production actuel, cf. entrées existantes).
- Vérification visuelle du footer à 4 colonnes en desktop et mobile (pas de
  débordement).
