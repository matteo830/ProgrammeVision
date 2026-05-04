# Synthèse du projet Vision — Plateforme de coaching

> Document de reprise de session. Dernière mise à jour : 04/05/2026.

---

## 1. Contexte

Application web de suivi de programme d'accompagnement entrepreneurial sur 6 mois (Méthode VISION). 15 clients actuels, objectif 100.

**Rôles** : CLIENT · COACH · ADMIN  
**Stack** : Next.js 16.2.4 (App Router) · TypeScript · Tailwind CSS v4 · Prisma v5 (PostgreSQL) · NextAuth v5 beta  
**Repo GitHub** : `matteo830/programmevision` — branche de dev : `claude/plan-web-app-project-7vZ8V`

---

## 2. Infrastructure déployée

| Élément | Valeur |
|---|---|
| Serveur | Ubuntu 24.04 LTS — `46.224.86.181` (Hetzner) |
| Hostname | `mindparachutes-n8n` |
| Accès SSH | `ssh -i ~/.ssh/hetzner-n8n root@46.224.86.181` |
| Domaine | `programme.methode-vision.com` (SSL Let's Encrypt via Caddy ✅) |
| App path | `/opt/vision/` |
| Docker network | `n8n_n8nnet` (partagé avec n8n et Caddy) |
| Container app | `vision-app` (port 3000 interne) |
| Container Caddy | `n8n-caddy-1` |
| Base de données | PostgreSQL sur le container `postgres` — DB `vision` |

### Fichiers serveur clés

- `/opt/vision/.env` — variables d'environnement (NE PAS versionner)
- `/opt/vision/docker-compose.yml` — orchestration
- `/opt/vision/Dockerfile` — build non-standalone (inclut `node_modules` complet)
- `/opt/n8n/Caddyfile` — reverse proxy (n8n + vision)

### Variables d'environnement (`.env` sur le serveur)

```
DATABASE_URL="postgresql://n8n:****@postgres:5432/vision"
NEXTAUTH_SECRET="****"
NEXTAUTH_URL="https://programme.methode-vision.com"
GHL_WEBHOOK_SECRET="vision-ghl-secret-2024"
```

### Commandes de déploiement

```bash
cd /opt/vision
git pull origin claude/plan-web-app-project-7vZ8V
docker compose build --no-cache && docker compose up -d
# Migration base de données (si schema modifié) :
docker exec vision-app ./node_modules/.bin/prisma db push
# Re-seed (si nécessaire) :
docker exec vision-app ./node_modules/.bin/prisma db seed
```

---

## 3. Architecture de l'application

### Structure des routes

```
/login                    — Page de connexion (tous rôles)
/(app)/dashboard          — Dashboard client
/(app)/formation          — Parcours / modules
/(app)/coaching           — Notes de coaching (client)
/(app)/questions          — Q&A / tickets
/(app)/calendrier         — Calendriers (Google collectif + GHL individuel)
/(app)/profil             — Profil utilisateur
/coach/clients            — Liste clients (coach)
/coach/clients/[id]       — Détail client (coach)
/coach/modules            — Gestion vidéos/exercices (coach)
/admin                    — Dashboard admin (À IMPLÉMENTER)
/admin/setup              — Création premier admin (À IMPLÉMENTER)
```

### Modèle de données (Prisma — `prisma/schema.prisma`)

**Modèles principaux** :
- `User` — CLIENT / COACH / ADMIN — avec `firstName`, `lastName`, `email`, `password`, `role`, `avatarUrl`
- `ClientProfile` — `programStartDate`, `programEndDate`, `objective6months`, `currentRevenue`, `targetRevenue`, `ghlBookingUrl`
- `Phase` (4 phases : 0 à 3) → `Module` (23 modules au total)
- `ModuleProgress` — progression par client/module, `videoWatched`, `exerciseDone`, `coachValidated`, `coachComment`
- `CoachingNote` — visibilité `CLIENT_VISIBLE` ou `TEAM_ONLY`
- `Question` + `QuestionReply` — système de tickets
- `DailyAction`, `Gratitude`, `WeeklyVictory` — journal quotidien client
- `Inspiration` — citations affichées sur le dashboard
- `CoachClientAssignment` — assignation coach↔client (prévu, pas utilisé en V1)

**À AJOUTER au prochain sprint** :
- Champ `isActive Boolean @default(true)` sur `User`
- Modèle `PasswordResetToken` — `id`, `token`, `userId`, `expiresAt`, `usedAt`

### Fichiers importants

| Fichier | Rôle |
|---|---|
| `src/lib/auth.ts` | Config NextAuth — credentials provider, JWT, `trustHost: true` |
| `src/lib/prisma.ts` | Instance Prisma singleton |
| `src/lib/progress.ts` | `getClientProgress(userId)` — calcul progression |
| `src/middleware.ts` | Protection routes (tout sauf `/login`, `/api/webhook/ghl`, `/api/auth`) |
| `src/types/next-auth.d.ts` | Extension types Session/JWT avec `id` et `role` |
| `prisma/seed.ts` | 4 phases, 23 modules, 5 inspirations, compte coach démo |

### Compte de démo

| Rôle | Email | Mot de passe |
|---|---|---|
| Coach | `coach@vision.fr` | `coach123` |

---

## 4. Fonctionnalités V1 implémentées ✅

- [x] Authentification email/mdp (NextAuth v5 JWT)
- [x] Dashboard client (progression, objectif, actions quotidiennes, gratitude, victoire)
- [x] Formation / parcours — progression phase par phase, modules verrouillés/déverrouillés
- [x] Notes de coaching (client voit CLIENT_VISIBLE, coach voit tout)
- [x] Questions/tickets (client pose, coach répond)
- [x] Calendrier (Google collectif + GHL booking individuel)
- [x] Profil client
- [x] Dashboard coach — liste clients avec stats de progression
- [x] Détail client coach — 3 onglets : Formation / Notes / Questions
- [x] Gestion modules (coach définit videoUrl + exerciseUrl)
- [x] Validation exercices par le coach (avec commentaire)
- [x] Webhook GHL pour création automatique de comptes clients
- [x] Création manuelle de client par le coach

---

## 5. Prochain sprint — Fonctionnalités à implémenter

### 5.1 Système Admin

**Accès** :
- URL : `/admin` (protégée par login)
- Page setup : `/admin/setup` — accessible une seule fois, tant qu'aucun admin n'existe en base

**Fonctionnalités admin** :
- Tableau de bord avec onglets : Coaches | Clients | Désactivés
- Créer un coach, un client, un autre admin
- Modifier les infos d'un coach ou d'un client (nom, email, mdp)
- Désactiver / réactiver un compte (soft delete via `isActive`)
- Voir la progression détaillée d'un client (mêmes droits que coach)
- Faire les actions coach (valider modules, notes, répondre aux questions)
- À terme (V2) : assignation coach↔client via `CoachClientAssignment`

**Comportement désactivation** :
- Utilisateur désactivé → message au login : "Votre compte a été désactivé, contactez votre coach"
- Les données sont conservées
- L'admin voit les comptes désactivés avec badge "Inactif"

### 5.2 Reset de mot de passe par email

**Provider** : OVH SMTP via `nodemailer`  
**Credentials nécessaires au démarrage** : host SMTP OVH, port, user, password  
**Sender** : `noreply@methode-vision.com`

**Flow** :
1. Lien "Mot de passe oublié" sur la page `/login`
2. Lien "Changer mon mot de passe" dans le profil utilisateur
3. Email envoyé avec lien tokenisé (`/reset-password?token=xxx`)
4. Token stocké dans `PasswordResetToken` (expiration 1h, usage unique)

**Variables d'env à ajouter** :
```
SMTP_HOST=
SMTP_PORT=465
SMTP_USER=
SMTP_PASS=
SMTP_FROM="noreply@methode-vision.com"
```

### 5.3 Google OAuth

**Pour** : clients, coaches ET admins  
**Comportement** :
- Un utilisateur existant (créé manuellement) peut se connecter via Google avec le même email → les comptes sont liés automatiquement
- Un email inconnu via Google → refus : "Aucun compte n'existe pour cet email, contactez votre coach"
- Bouton "Se connecter avec Google" sur la page `/login`

**Prérequis à configurer** :
1. Créer un projet sur [Google Cloud Console](https://console.cloud.google.com)
2. Activer l'API "Google+ API" ou "Google Identity"
3. Créer des credentials OAuth 2.0 (Web application)
4. Redirect URI autorisée : `https://programme.methode-vision.com/api/auth/callback/google`
5. Récupérer `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET`

**Variables d'env à ajouter** :
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

**Modifications code** :
- `prisma/schema.prisma` : ajouter modèle `Account` (requis par NextAuth pour OAuth)
- `src/lib/auth.ts` : ajouter provider Google + logique de liaison de compte

---

## 6. Points d'attention techniques

- **Prisma version** : v5.22.0 — NE PAS upgrader vers v6/v7 (breaking changes)
- **`previewFeatures = ["omitApi"]`** dans le schema Prisma — nécessaire pour `omit: { password: true }`
- **`binaryTargets`** : `["native", "linux-musl-openssl-3.0.x"]` — requis pour Alpine Linux
- **NextAuth** : `trustHost: true` obligatoire derrière reverse proxy
- **Dockerfile** : mode non-standalone (copie `node_modules` complet) — ne pas activer `output: "standalone"` dans `next.config.ts`
- **Migrations** : utiliser `prisma db push` (pas `migrate deploy`) car pas de fichiers de migration
- **Prisma CLI sur le serveur** : toujours utiliser `./node_modules/.bin/prisma` (pas `npx prisma` qui télécharge v7)

---

## 7. Sécurité — Actions pendantes

- [ ] Révoquer le token GitHub partagé en conversation (visible dans l'historique du chat) — à faire sur https://github.com/settings/tokens
- [ ] Changer le mot de passe du compte coach de démo après les premiers tests
- [ ] Configurer les URLs vidéo et exercice dans le manager de modules coach
- [ ] Configurer `ghlBookingUrl` sur les profils clients pour le calendrier individuel

---

## 8. Pour reprendre dans une nouvelle conversation

Coller ce message en début de session :

> "Je reprends le projet Vision — plateforme de coaching Next.js déployée sur mon serveur Hetzner (`46.224.86.181`). Le repo est `matteo830/programmevision`, branche de dev `claude/plan-web-app-project-7vZ8V`. Lis le fichier `SYNTHESE.md` à la racine du projet pour le contexte complet. On reprend au sprint suivant : système admin + reset mdp par email OVH SMTP + Google OAuth."
