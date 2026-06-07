# Synthèse du projet Vision — Plateforme de coaching

> Document de reprise de session. Dernière mise à jour : **07/06/2026**.

---

## 1. Contexte

Application web de suivi de programme d'accompagnement entrepreneurial sur 6 mois (Méthode VISION). 3 rôles : **CLIENT · COACH · ADMIN**.

**Stack** : Next.js 16.2.4 (App Router) · TypeScript · Tailwind CSS v4 · Prisma v5 (PostgreSQL) · NextAuth v5 beta  
**Repo GitHub** : `matteo830/ProgrammeVision`  
**Branche de dev** : `claude/plan-web-app-project-7vZ8V`  
**URL prod** : `https://programme.methode-vision.com`

---

## 2. Infrastructure déployée

| Élément | Valeur |
|---|---|
| Serveur | Ubuntu 24.04 LTS — `46.224.86.181` (Hetzner) |
| Hostname | `mindparachutes-n8n` |
| Accès SSH | `ssh -i ~/.ssh/hetzner-n8n root@46.224.86.181` |
| App path | `/opt/vision/` |
| Docker network | `n8n_n8nnet` (partagé avec n8n et Caddy) |
| Container app | `vision-app` (port 3000 interne) |
| Base de données | PostgreSQL — container `postgres` — DB `vision` |

### Commandes de déploiement

```bash
cd /opt/vision
git pull origin claude/plan-web-app-project-7vZ8V
docker compose build --no-cache && docker compose up -d
# Si le schéma Prisma a changé :
docker exec vision-app ./node_modules/.bin/prisma db push
```

### Variables d'environnement (`.env` sur le serveur — ne pas versionner)

```
DATABASE_URL="postgresql://n8n:****@postgres:5432/vision"
NEXTAUTH_SECRET="****"
NEXTAUTH_URL="https://programme.methode-vision.com"
GHL_WEBHOOK_SECRET="vision-ghl-secret-2024"
```

### Variables à ajouter (non configurées)

```
RESEND_API_KEY=          # Pour reset de mot de passe par email
RESEND_FROM="noreply@methode-vision.com"
GOOGLE_CLIENT_ID=        # Google OAuth
GOOGLE_CLIENT_SECRET=
GOOGLE_CALENDAR_API_KEY= # Google Agenda (lecture seule)
NEXT_PUBLIC_GOOGLE_CALENDAR_ID=496c09...@group.calendar.google.com
GHL_API_TOKEN=           # GHL Private Integration (régénérer)
```

---

## 3. Architecture

### Routes applicatives

```
/(app)/dashboard          — Dashboard client
/(app)/formation          — Parcours Cours → Modules → Leçons
/(app)/audit              — Hub des 3 bilans VISION          ✅ (sprint 2)
/(app)/audit/[id]         — Wizard de remplissage            ✅ (sprint 2)
/(app)/audit/evolution    — Comparaison des 3 passages       ✅ (sprint 2)
/(app)/coaching           — Sessions & notes (côté client)
/(app)/questions          — Q&A avec le coach
/(app)/calendrier         — Calendrier GHL + Google
/(app)/profil             — Profil utilisateur
/(app)/victoires          — Victoires & gratitudes
/(app)/documents          — Templates Google Drive par cours
/coach/clients            — Liste des clients (coach)
/coach/clients/[id]       — Détail client (coach)
/coach/coaches            — Liste coaches & admins
/coach/modules            — Gestion contenu GHL
/coach/settings           — Paramètres coach (calendrier GHL)
/admin                    — Dashboard admin (coaches/clients/inactifs)
/admin/setup              — Création premier admin (one-time)
/login                    — Authentification
/reset-password           — Reset mot de passe (token email)
```

### API routes

```
/api/auth/[...nextauth]            — NextAuth
/api/client/audit                  — GET liste | POST créer DRAFT       ✅
/api/client/audit/[id]             — GET | PATCH autosave               ✅
/api/client/audit/[id]/submit      — POST soumettre                     ✅
/api/client/audit/evolution        — GET agrégat comparaison            ✅
/api/coach/audit/[id]              — GET audits d'un client             ✅
/api/coach/audit/[id]/comment      — POST ajouter commentaire section   ✅
/api/coach/audit/[id]/reopen       — POST rouvrir audit                 ✅
/api/admin/users                   — GET liste | POST créer compte
/api/admin/users/[id]              — PATCH modifier (nom, email, mdp, ghlCalendarSlug, isActive)
/api/coach/settings                — PATCH calendrier GHL coach
/api/coach/settings/me             — GET slug GHL actuel
/api/client/sessions               — GET sessions coaching
/api/client/progress               — GET progression formation
/api/client/lesson-progress        — PATCH statut leçon
/api/client/victories              — GET | POST victoires/gratitudes
/api/client/actions                — GET | POST | PATCH actions quotidiennes
/api/client/documents              — GET documents Google Drive
/api/webhook/ghl                   — POST création compte client depuis GHL
```

### Fichiers clés

| Fichier | Rôle |
|---|---|
| `src/lib/auth.ts` | NextAuth — credentials + Google OAuth, JWT, `trustHost: true` |
| `src/lib/prisma.ts` | Instance Prisma singleton |
| `src/lib/audit-data.ts` | 7 sections, 45 questions exactes, 9 métriques, UNLOCK_WEEKS |
| `src/middleware.ts` | Protection routes |
| `prisma/schema.prisma` | Schéma complet (voir section 4) |
| `prisma/seed.ts` | Données de démo |
| `docs/design/DESIGN-SPECS.md` | Document maître design — **lire en premier** |
| `docs/design/DESIGN-TOKENS.md` | Couleurs, typo, formes |
| `docs/design/AUDIT-SPECS.md` | Specs Audit (référence d'implémentation) |
| `docs/design/reference/audit-data.jsx` | Source des questions (prototype JS) |

---

## 4. Modèle de données (état actuel)

Modèles Prisma en production :

- **`User`** — `id, email, password, firstName, lastName, role, avatarUrl, phone, ghlCalendarSlug, isActive`
- **`ClientProfile`** — `programStartDate, programEndDate, objective6months, currentRevenue, targetRevenue, ghlBookingUrl`
- **`CoachClientAssignment`** — assignation coach ↔ client
- **`GhlCourse → CourseModule → Lesson`** — structure de formation GHL
- **`LessonProgress`** — statut NOT_STARTED / IN_PROGRESS / DONE par leçon
- **`ModuleTemplate → ClientDocument`** — templates Google Drive
- **`CoachingSession → SessionAction, CoachingNote`** — sessions coaching
- **`Question → QuestionReply`** — Q&A
- **`DailyAction, Gratitude, WeeklyVictory`** — journal client
- **`Inspiration`** — citations dashboard
- **`AuditResponse`** — `clientId, type (INITIAL/MID/FINAL), status (DRAFT/SUBMITTED), responses (Json), submittedAt`
- **`AuditSectionComment`** — `auditResponseId, coachId, section (1-7), content`
- **`PasswordResetToken`** — tokens reset email
- **`Account`** — OAuth accounts (NextAuth)

---

## 5. Design system

Direction validée : **corail vibrant + vert sapin** (palette logo VISION).

Tokens CSS définis dans `src/app/globals.css` :
- `--green-deep: #0E3D34` · `--green-soft: #E8EFEC` · `--green-accent: #3FA88E`
- `--gold: #D4A047` · `--gold-soft: #FBF1D8` · `--gold-light: #E8C56F`
- `--coral-start: #FF8A6B` · `--coral-end: #E8527D`
- `--cream: #FAF6EB` · `--ink: #1A1714` · `--ink-mute: #9A9080` · `--border: #E8DFC8`

Classes utilitaires : `.gradient-coral` · `.gradient-green`  
Motif récurrent : hero vert sapin + montagne SVG (opacity 0.25) + eyebrow or

**Tous les écrans sont au design system** (sprint 1 + 2).

---

## 6. Ce qui a été réalisé

### Sprint 1 (avant le 07/06)
- ✅ Auth email/mdp + Google OAuth + reset mdp (Resend)
- ✅ Dashboard client complet (objectif, formation, actions, gratitude, victoire)
- ✅ Formation (GHL Cours → Modules → Leçons, progression)
- ✅ Coaching (sessions, notes, actions, replay Fireflies)
- ✅ Questions/tickets (client pose, coach répond)
- ✅ Calendrier (Google collectif + GHL individuel)
- ✅ Profil client
- ✅ Victoires & gratitudes
- ✅ Documents (templates Drive par cours)
- ✅ Dashboard coach (liste clients, stats, filtres)
- ✅ Détail client coach (3 onglets : Formation / Notes / Questions)
- ✅ Gestion modules et contenu (coach)
- ✅ Admin dashboard (onglets Coaches & Admins / Clients / Désactivés)
- ✅ Admin setup (one-time, premier admin)
- ✅ Webhook GHL création client automatique
- ✅ Design system appliqué sur tous les écrans

### Sprint 2 — session du 07/06/2026

**1. Édition coaches & admins depuis l'admin**
- Champ `ghlCalendarSlug` ajouté dans la modal d'édition pour COACH et ADMIN
- API `PATCH /api/admin/users/[id]` gère désormais `ghlCalendarSlug` (parse iframe ou slug brut)
- Les admins actifs apparaissent maintenant dans l'onglet "Coaches & Admins" (auparavant invisibles)

**2. Docs design intégrées au repo** (`docs/design/`)
- `DESIGN-SPECS.md`, `DESIGN-TOKENS.md`, `AUDIT-SPECS.md`, `SCREENS.md`, `README.md`
- `reference/` : `Audit.html`, `audit-data.jsx`, `audit-screens.jsx`, `audit-evolution.jsx`, `design-canvas.jsx`, `ios-frame.jsx`

**3. Bottom-nav mobile refaite**
- 5 onglets : Accueil · Formation · Coaching · Agenda · Profil (routes correctes)
- Fond blanc translucide + `backdrop-filter: blur`
- Actif : vert sapin sur pastille `--green-soft`
- Suppression du bouton "+" central

**4. Audit d'onboarding — implémentation complète**
- `src/lib/audit-data.ts` : 7 sections, 45 questions (texte exact Tally), 9 métriques
- 7 routes API (client + coach)
- 3 composants : `AuditHub`, `AuditWizard`, `AuditEvolution`
- 3 pages : `/audit`, `/audit/[id]`, `/audit/evolution`
- Autosave debounced 800ms, mode lecture seule avec retours coach, logique de déblocage par semaine

---

## 7. Points d'attention techniques

- **Prisma v5.22.0** — NE PAS upgrader (breaking changes v6/v7)
- **`previewFeatures = ["omitApi"]`** dans schema.prisma — requis pour `omit: { password: true }`
- **`binaryTargets`** : `["native", "linux-musl-openssl-3.0.x"]` — Alpine Linux
- **NextAuth** : `trustHost: true` obligatoire derrière Caddy
- **Dockerfile** : mode non-standalone — ne pas activer `output: "standalone"`
- **Migrations** : `prisma db push` (pas `migrate deploy`)
- **Prisma CLI** : toujours `./node_modules/.bin/prisma` (pas `npx prisma` → télécharge v7)
- **Champs Json Prisma** : caster en `as object` pour les updates (`responses as object`)
- **Next.js 16** : les segments dynamiques au même niveau de route doivent avoir le même nom (`[id]` vs `[clientId]` → conflit)
- **Middleware** : le fichier `middleware.ts` est déprécié au profit de `proxy` en Next.js 16

---

## 8. Ce qui reste à faire

- [ ] **Fireflies** : afficher transcripts/résumés/actions depuis l'API Fireflies dans l'onglet client coach (V2)
- [ ] **Google Agenda** : intégrer l'API Google Calendar (lecture seule) dans la section Calendrier — Calendar ID configuré
- [ ] **GHL Booking import** : importer les réponses Tally existantes dans `AuditResponse` pour les clients déjà dans le programme
- [ ] **Côté coach — vue Audit** : afficher les audits d'un client dans l'onglet Détail client + permettre les commentaires par section et la réouverture
- [ ] **Côté admin** : voir et gérer les audits de tous les clients

---

## 9. Pour reprendre dans une nouvelle session

Coller ce message en début de session Claude Code :

> "Je reprends le projet Vision — plateforme de coaching Next.js déployée sur `programme.methode-vision.com` (Hetzner). Repo `matteo830/ProgrammeVision`, branche `claude/plan-web-app-project-7vZ8V`. Lis `SYNTHESE.md` à la racine du projet pour le contexte complet, et `docs/design/DESIGN-SPECS.md` pour la direction visuelle. [Décrire la tâche du jour]."

### Comptes de test

| Rôle | Email | Mdp |
|---|---|---|
| Coach | `coach@vision.fr` | `coach123` |
| Admin | `matteo@mindparachutes.com` | — (défini sur le serveur) |
