# Handoff Design → Claude Code · Programme Vision

Package de référence pour implémenter/maintenir l'UI dans le projet Next.js.

## Contenu
- **`DESIGN-SPECS.md`** — document maître : direction, système visuel, specs de tous les écrans. À lire en premier.
- **`DESIGN-TOKENS.md`** — couleurs, typo, formes, motifs. La source de vérité visuelle.
- **`AUDIT-SPECS.md`** — specs complètes du nouvel écran Audit (modèle Prisma, 3 écrans, API). **Pas encore implémenté côté code.**
- **`SCREENS.md`** — inventaire de tous les écrans designés + leur fichier maquette.

## Comment utiliser ces maquettes
Les maquettes sont des fichiers HTML/JSX (React inline via Babel) — c'est du **prototype visuel**, pas le code de prod. Chaque composant porte en tête un objet `C = { … }` avec les couleurs : ce sont les mêmes valeurs que `DESIGN-TOKENS.md`.

Pour implémenter dans le vrai projet (Next.js + Tailwind v4 + shadcn) :
1. Lire le token correspondant dans `DESIGN-TOKENS.md`.
2. Reproduire la structure visuelle de la maquette (`.html` + `.jsx` associés).
3. Traduire le style inline en classes Tailwind / composants existants, **sans toucher à la logique métier**.

## État d'intégration (au 06/06/2026)
Claude Code a déjà intégré le design system sur la plupart des écrans existants :
- ✅ Dashboard, Formation (Cours→Modules→Leçons), Coaching (sessions), Documents, Profil, Calendrier, Questions, Victoires
- ✅ Admin (dashboard, formations), Coach
- ⏳ **À implémenter : Audit** (voir `AUDIT-SPECS.md`)
- 🔧 **À rafraîchir : bottom-nav mobile** (encore en gris/vert Tailwind d'origine, pas dans la palette — et ne reflète pas les sections Formation/Documents/Coaching)

## Maquettes de référence (à la racine du projet design)
| Écran | Fichier |
|---|---|
| Index visuel de tout | `Index.html` |
| Dashboard client | `Dashboard - 3 directions.html` |
| Formation | `Formation - 2 directions.html` |
| Authentification | `Authentification.html` |
| Calendrier | `Calendrier.html` |
| Coaching | `Coaching.html` |
| Questions | `Questions.html` |
| Victoires | `Victoires.html` |
| Profil | `Profil.html` |
| Audit (nouveau) | `Audit.html` |
| Coach (3 écrans) | `Coach.html` |
| Admin (3 écrans) | `Admin.html` |

## Direction visuelle retenue
**Corail vibrant + vert sapin** (palette issue du logo VISION). CTA en dégradé corail, hero en vert sapin avec montagne, accents or. Chaleureux, motivant, premium.
