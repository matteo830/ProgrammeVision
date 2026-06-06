# DESIGN-SPECS — Programme Vision

> Document maître de design. À lire en premier par Claude Code.
> Compléments : `DESIGN-TOKENS.md` (valeurs exactes), `AUDIT-SPECS.md` (modèle + API de l'Audit), `SCREENS.md` (inventaire court).

---

## 1. Vision produit & direction

Plateforme d'accompagnement entrepreneurial sur 6 mois (Méthode VISION). 3 rôles : **CLIENT · COACH · ADMIN**. Mobile-first.

**Direction visuelle : corail vibrant + vert sapin** (palette du logo VISION).
- **Vert sapin** (`#0E3D34` → `#07251F`) : fonds hero, autorité, ancrage. Décor "montagne" = le sommet/l'objectif.
- **Or** (`#D4A047`) : accent premium, parole du coach.
- **Corail** (dégradé `#FF8A6B → #E8527D`) : énergie, CTA, état "actif/à faire", parole du client.
- **Crème** (`#FAF6EB`) : fond. Tuiles pastel (mauve/rose/pêche/bleu/sauge) pour la rubrique dashboard.

Ton : chaleureux, motivant, premium. Pas corporate, pas froid.

---

## 2. Système visuel (résumé — détails dans DESIGN-TOKENS.md)

- **Police** : Inter (400→800). Titres hero 25-26px/800. Eyebrows 10-11px/700/UPPERCASE/letter-spacing.
- **Hero type** : `linear-gradient(160deg, #0E3D34, #07251F)` + eyebrow or + titre blanc + montagne SVG en bas-droite (opacity .25).
- **CTA principal** : `linear-gradient(135deg, #FF8A6B, #E8527D)`, blanc, radius 12-14, weight 700, ombre `0 10px 24px -10px #E8527D80`.
- **Cartes** : fond blanc, radius 16-20, bordure `#E8DFC8`. Largeur max mobile 640px.
- **Liserés signifiants** : or à gauche = note coach ; corail = élément actif/client.
- **Statuts** : vert (`#3FA88E`) actif/terminé · or attention · corail à-faire/en-cours · rouge inactif.
- **Chiffres** : toujours `tabular-nums`.

---

## 3. Écrans (structure + interactions)

> Chaque écran a une maquette HTML de référence à la racine du projet design.

### Authentification — `Authentification.html`
Login (hero corail, Google OAuth, email/mdp, mot de passe oublié) · écran "lien envoyé" (expire 1h) · nouveau mot de passe (checklist live : 8 car. / majuscule / chiffre / correspondance).

### Dashboard client — `Dashboard - 3 directions.html`
Ordre vertical : header → **objectif 6 mois** (hero vert + montagne) → **formation** (% global + phases + étape suivante) → **action du jour** (UNE seule, carte corail très visible, CTA "Je m'y mets") → **prochains coachings** (sync Google Calendar) → gratitude + victoire (tuiles) → **tableau de bord** (grille 6 tuiles colorées vers les sous-sections) → inspiration. Direction validée : "corail vibrant".

### Formation — `Formation - 2 directions.html`
Structure réelle = **Cours GHL → Modules → Leçons** (statuts NOT_STARTED/IN_PROGRESS/DONE), déjà implémentée dans `formation-view.tsx`. Hero vert, cartes cours avec vignette + barre de progression, accordéon modules→leçons, CTA "Accéder au cours" (corail). La maquette "2 directions" documente l'intention ; **suivre le code en place**, qui est déjà au design system.

### Calendrier — `Calendrier.html`
Prochain RDV en hero corail (compte à rebours + "Rejoindre la visio") · filtres individuel(or)/collectif(vert) · mini-calendrier mensuel à pastilles · liste RDV avec source (GHL Booking / Google Calendar) · CTA réserver. NB : la réservation réelle se fait via l'iframe GHL (`ghlCalendarSlug`), voir `coaching-client-view.tsx`.

### Coaching — `Coaching.html`
Hero coach (séances faites, prochaine) · prochaine séance + **réservation GHL** · historique des séances (résumé, décisions, replay Fireflies, actions cochables + bouton "ajouter au dashboard", commentaires par séance) · journal de notes (or = coach, corail = client). Déjà implémenté et stylé.

### Questions — `Questions.html`
Hero CTA "Pose ta question sous 24h" + stats (en attente / répondues) · filtres · cartes question (liseré corail si en attente) avec aperçu de la dernière réponse coach (liseré or).

### Victoires — `Victoires.html`
Hero avec composer à onglets **Victoire 🏆 / Gratitude 💝** + stats + série · filtres · timeline groupée par semaine · tuiles pêche/rose.

### Profil — `Profil.html`
Hero avatar + **objectif 6 mois** (CA actuel → cible avec barre) · infos perso · sécurité (mdp + compte Google) · notifications (toggles vert sapin) · déconnexion (corail outline).

### Documents — (déjà implémenté, `documents-view.tsx`)
Hero vert "Mes templates" · liste de documents Google Drive groupés par cours · état vide soigné. Pas de maquette séparée (déjà au design system).

### Audit d'onboarding — `Audit.html` ⏳ **à implémenter**
LE chantier ouvert. Voir `AUDIT-SPECS.md` (modèle Prisma, routes, logique de déblocage). 3 écrans : Hub (3 passages INITIAL/MID/FINAL) · Wizard 7 sections (sliders 0-10, textes, A/B, autosave DRAFT) · **Évolution** (score global + 9 curseurs comparés sur les 3 passages + comparaison textuelle). Questions exactes dans `audit-data.jsx`.

### Côté coach — `Coach.html`
Dashboard clients (stats, recherche, filtres À traiter/Inactifs, cartes avec badges d'action + statut activité + position "P2 · étape 3/8") · Détail client (3 onglets : Formation validation inline / Notes toggle visible-privé / Questions réponse rapide) · Gestion modules. Gestion de contenu réelle = `formation-admin-view.tsx` (déjà en place).

### Côté admin — `Admin.html`
Setup premier admin (one-time, vert) · Dashboard (onglets Coaches/Clients/Désactivés, badges de rôle, réactivation soft-delete `isActive`) · Création de compte (sélecteur de rôle + champs dynamiques).

### Bottom-nav mobile — `Bottom Nav.html` 🔧 **à rafraîchir**
Refonte au design system : 5 onglets (Accueil · Formation · Coaching · Agenda · Profil), actif en vert sapin sur pastille `greenSoft`, fond blanc translucide + flou, sans bouton "+" central. Remplacer `src/components/layout/bottom-nav.tsx` en gardant `usePathname()` + `<Link>`.

---

## 4. État d'intégration (06/06/2026)
- ✅ Déjà au design system : Dashboard, Formation, Coaching, Documents, Profil, Calendrier, Questions, Victoires, Admin (dashboard + formations), Coach.
- ⏳ À implémenter : **Audit** (`AUDIT-SPECS.md`).
- 🔧 À rafraîchir : **bottom-nav mobile**.

## 5. Principes à respecter
1. Ne jamais paraphraser les contenus métier (questions d'audit, libellés) — reprendre le texte exact.
2. Traduire le style inline des maquettes en Tailwind/shadcn **sans toucher à la logique métier**.
3. Garder les couleurs centralisées (tokens) — ne pas réintroduire de gris/vert Tailwind par défaut.
4. Cibles tactiles mobiles ≥ 44px ; texte courant ≥ 13px.
