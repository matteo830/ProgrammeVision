# Synthèse du projet Vision — Plateforme de coaching

> Document de reprise de session. Dernière mise à jour : 13/05/2026.

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

### Variables d'environnement actuelles (`.env` sur le serveur)

```
DATABASE_URL="postgresql://n8n:****@postgres:5432/vision"
NEXTAUTH_SECRET="****"
NEXTAUTH_URL="https://programme.methode-vision.com"
GHL_WEBHOOK_SECRET="vision-ghl-secret-2024"
```

### Variables d'env à ajouter au prochain sprint

```
RESEND_API_KEY=          # À créer sur resend.com (gratuit)
RESEND_FROM="noreply@methode-vision.com"
GOOGLE_CLIENT_ID=        # Google Cloud Console
GOOGLE_CLIENT_SECRET=    # Google Cloud Console
GHL_API_TOKEN=           # Private Integration GHL (régénérer après partage en chat)
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
/(app)/audit              — Audit d'onboarding (À IMPLÉMENTER)
/(app)/coaching           — Notes de coaching (client)
/(app)/questions          — Q&A / tickets
/(app)/calendrier         — Calendriers (Google collectif + GHL individuel)
/(app)/profil             — Profil utilisateur
/coach/clients            — Liste clients (coach)
/coach/clients/[id]       — Détail client (coach)
/coach/modules            — Gestion vidéos/exercices (coach)
/admin                    — Dashboard admin (À IMPLÉMENTER)
/admin/setup              — Création premier admin (À IMPLÉMENTER)
/reset-password           — Reset mot de passe via token email (À IMPLÉMENTER)
```

### Modèle de données (Prisma — `prisma/schema.prisma`)

**Modèles existants** :
- `User` — CLIENT / COACH / ADMIN — avec `firstName`, `lastName`, `email`, `password`, `role`, `avatarUrl`
- `ClientProfile` — `programStartDate`, `programEndDate`, `objective6months`, `currentRevenue`, `targetRevenue`, `ghlBookingUrl`
- `Phase` (4 phases : 0 à 3) → `Module` (23 modules au total)
- `ModuleProgress` — progression par client/module, `videoWatched`, `exerciseDone`, `coachValidated`, `coachComment`
- `CoachingNote` — visibilité `CLIENT_VISIBLE` ou `TEAM_ONLY`
- `Question` + `QuestionReply` — système de tickets
- `DailyAction`, `Gratitude`, `WeeklyVictory` — journal quotidien client
- `Inspiration` — citations affichées sur le dashboard
- `CoachClientAssignment` — assignation coach↔client (prévu, V2)

**À AJOUTER au prochain sprint** :
- Champ `isActive Boolean @default(true)` sur `User`
- Modèle `PasswordResetToken` — `id`, `token`, `userId`, `expiresAt`, `usedAt`
- Modèle `Account` — requis par NextAuth pour Google OAuth
- Modèle `AuditResponse` — voir section 5.4 ci-dessous

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
- URL : `/admin` (protégée par login admin)
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

**Provider** : **Resend** (resend.com — gratuit jusqu'à 3000 emails/mois)  
**Setup requis** :
1. Créer compte sur resend.com
2. Ajouter 2 enregistrements DNS dans OVH (SPF + DKIM pour `methode-vision.com`) — Claude guide pas à pas
3. Récupérer la clé API → `RESEND_API_KEY` dans `.env`

**Pourquoi pas MailerLite** : leur API est pour les campagnes/newsletters, pas pour le transactionnel. Leur token ne permet pas l'envoi d'emails arbitraires.  
**Pourquoi pas GHL** : API conçue pour CRM, complexe pour du transactionnel pur.

**Flow** :
1. Lien "Mot de passe oublié" sur la page `/login`
2. Lien "Changer mon mot de passe" dans le profil utilisateur
3. Email envoyé avec lien tokenisé (`/reset-password?token=xxx`)
4. Token stocké dans `PasswordResetToken` (expiration 1h, usage unique)

### 5.3 Google OAuth

**Pour** : clients, coaches ET admins  
**Comportement** :
- Utilisateur existant → connexion Google liée automatiquement par email
- Email inconnu → refus : "Aucun compte n'existe pour cet email, contactez votre coach"
- Bouton "Se connecter avec Google" sur `/login`

**Setup requis (à faire ensemble)** :
1. Google Cloud Console → nouveau projet
2. Activer Google Identity API
3. OAuth 2.0 Credentials → Web application
4. Redirect URI : `https://programme.methode-vision.com/api/auth/callback/google`
5. Récupérer `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`

**Modifications code** :
- `prisma/schema.prisma` : ajouter modèle `Account` (requis NextAuth OAuth)
- `src/lib/auth.ts` : provider Google + logique liaison compte existant

### 5.4 Audit d'onboarding (remplace Tally)

**Concept** :
- S'appelle "Audit" dans l'interface (pas "sondage")
- Première étape obligatoire pour tout nouveau client
- 3 types : `INITIAL` (début) · `MID` (mi-parcours) · `FINAL` (fin de programme)
- Questions MID et FINAL à définir ultérieurement — le modèle est flexible
- Statuts : `DRAFT` → `SUBMITTED` (coach peut remettre en DRAFT pour réouverture)
- Le client remplit, le coach peut rouvrir mais c'est toujours le client qui répond
- Coach peut commenter par section (7 sections)
- Import manuel possible pour clients existants (copier/coller depuis Tally)

**7 sections de l'audit INITIAL** :
1. Où j'en suis aujourd'hui (1 texte libre + 7 sliders 0-10 + 1 texte "pourquoi" + 1 texte "ce qui pèse")
2. Mes objectifs et attentes (6 questions texte libre)
3. Mes blocages actuels (4 questions texte libre)
4. Mon business aujourd'hui (10 questions texte libre)
5. Mon état personnel (3 textes + 1 slider 0-10 + 1 texte)
6. Mon engagement (3 questions texte libre)
7. Notre accompagnement (3 textes + 1 choix A/B + 1 slider 0-10 + 1 texte + email/téléphone)

**Modèle de données** :
```
AuditResponse {
  id, clientId, type (INITIAL/MID/FINAL)
  status (DRAFT/SUBMITTED)
  responses Json   // structure par section
  createdAt, updatedAt, submittedAt
}
AuditSectionComment {
  id, auditResponseId, coachId
  section (1-7), content
  createdAt, updatedAt
}
```

### 5.5 Google Agenda (section Calendrier)

**Agenda** : public, ID extrait de l'URL partagée  
**Calendar ID** : `496c09db271a2acb70467e55d23fcb3ac3cbd9795cfa6a4dcadc7a4d55b52369@group.calendar.google.com`  
**Implémentation** : API Google Calendar (lecture seule, clé API publique) ou iframe embed  
**Affichage** : liste des prochains événements de groupe dans la section Calendrier

**Variable d'env à ajouter** :
```
NEXT_PUBLIC_GOOGLE_CALENDAR_ID=496c09db271a2acb70467e55d23fcb3ac3cbd9795cfa6a4dcadc7a4d55b52369@group.calendar.google.com
GOOGLE_CALENDAR_API_KEY=   # clé API publique Google (lecture seule, sans OAuth)
```

### 5.6 GHL Booking (iframe)

Déjà prévu via `ghlBookingUrl` sur `ClientProfile`. À configurer par le coach dans le profil client.  
**Token GHL Private Integration** : à régénérer (partagé en chat) → `GHL_API_TOKEN` dans `.env`

### 5.7 Design — Refonte UI

Des fichiers HTML de design seront fournis section par section (générés via Claude Design sur claude.ai/design). Intégration dans les composants React/Tailwind existants sans toucher à la logique métier.

### 5.8 Fireflies (sprint suivant — V2)

**API Key** : à régénérer (partagé en chat)  
**Concept** : afficher transcripts + résumés + actions dans l'onglet client du coach  
**Matching** : par nom du meeting (convention : "Coaching – Prénom Nom") ou par email du participant  
**Prérequis** : définir convention de nommage des réunions dans GHL avant d'implémenter

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

- [ ] Régénérer le token GHL Private Integration (partagé en chat)
- [ ] Régénérer la clé API Fireflies (partagée en chat)
- [ ] Régénérer le token API MailerLite (partagé en chat — non utilisé finalement)
- [ ] Changer le mot de passe du compte coach de démo après les premiers tests
- [ ] Configurer les URLs vidéo et exercice dans le manager de modules coach
- [ ] Configurer `ghlBookingUrl` sur les profils clients pour le calendrier individuel

---

## 8. Pour reprendre dans une nouvelle conversation

Coller ce message en début de session :

> "Je reprends le projet Vision — plateforme de coaching Next.js déployée sur mon serveur Hetzner (`46.224.86.181`). Le repo est `matteo830/programmevision`, branche de dev `claude/plan-web-app-project-7vZ8V`. Lis le fichier `SYNTHESE.md` à la racine du projet pour le contexte complet. On démarre le sprint 2 : système admin + audit d'onboarding + reset mdp (Resend) + Google OAuth + Google Agenda + refonte UI."
