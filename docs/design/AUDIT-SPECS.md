# Audit d'onboarding — Spécifications pour implémentation

> À destination de Claude Code. Maquette de référence : `Audit.html` (+ `audit-data.jsx`, `audit-screens.jsx`, `audit-evolution.jsx`).
> Route cible : `/(app)/audit`. Design system : voir `DESIGN-TOKENS.md`.

## Vue d'ensemble

L'audit remplace le formulaire Tally. Le client le remplit **3 fois** au cours du programme, et peut **comparer l'évolution** de ses réponses.

- **3 types** : `INITIAL` (S1, départ) · `MID` (S13, mi-parcours) · `FINAL` (S26, fin)
- **7 sections**, ~45 questions, reprises **à l'identique du Tally** (voir `audit-data.jsx` → `AUDIT_SECTIONS` pour le texte exact)
- **9 curseurs 0-10** servent d'axe de comparaison quantitatif
- Statuts : `DRAFT` → `SUBMITTED` (le coach peut rouvrir en `DRAFT`)
- Le coach peut commenter **par section** (7 sections)

## Modèle de données (Prisma — à ajouter)

```prisma
model AuditResponse {
  id          String   @id @default(cuid())
  clientId    String
  client      User     @relation(fields: [clientId], references: [id])
  type        AuditType            // INITIAL | MID | FINAL
  status      AuditStatus @default(DRAFT)  // DRAFT | SUBMITTED
  responses   Json                 // { questionId: valeur }  (number pour sliders, string pour texte, 0|1 pour A/B)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  submittedAt DateTime?
  comments    AuditSectionComment[]
  @@unique([clientId, type])       // un seul audit par type par client
}

model AuditSectionComment {
  id              String   @id @default(cuid())
  auditResponseId String
  audit           AuditResponse @relation(fields: [auditResponseId], references: [id], onDelete: Cascade)
  coachId         String
  section         Int      // 1-7
  content         String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum AuditType { INITIAL MID FINAL }
enum AuditStatus { DRAFT SUBMITTED }
```

Les IDs de questions (clés du JSON `responses`) sont définis dans `audit-data.jsx` (`AUDIT_SECTIONS[].questions[].id`). **Réutiliser exactement ces IDs** pour que la comparaison fonctionne.

## Les 3 écrans

### 1. Hub (`/audit`)
- Hero vert "Mon bilan VISION" + compteur d'audits réalisés.
- Bouton **"Voir mon évolution"** (corail) — visible dès que ≥ 2 audits `SUBMITTED`.
- Timeline verticale des 3 passages. Pour chaque :
  - `SUBMITTED` → "Terminé" ✓ + bouton "Revoir mes réponses" + badge "N retour coach" si commentaires.
  - `AVAILABLE` (déblocable selon la semaine de programme) → "À remplir" + CTA "Commencer l'audit".
  - `LOCKED` → grisé "Se débloque à la fin du programme".
- **Logique de déblocage** : INITIAL dès l'inscription ; MID à partir de S13 (≈ mi-parcours, à confirmer : milieu de `programStartDate`→`programEndDate`) ; FINAL à partir de S24-26.

### 2. Wizard de remplissage
- **Une section visible à la fois** (7 sections), barre de progression segmentée en haut.
- Auto-save en `DRAFT` à chaque changement (debounce ~800ms) → indicateur "Brouillon enregistré".
- Types de questions :
  - `slider` : sélecteur 0-10 (11 boutons), valeur stockée en `number`.
  - `text` : textarea, stockée en `string`.
  - `ab` : 2 options radio, stockée en `0` (option A) ou `1` (option B).
- Navigation Précédent / Suivant ; dernière section → "Valider mon audit" (passe en `SUBMITTED`, set `submittedAt`).
- **Champs contact de la section 7 du Tally (email/téléphone/nom) : OMIS** — le client est déjà authentifié, on récupère ces infos depuis `User`. (Validé avec le client.)
- En mode "Revoir mes réponses" (audit `SUBMITTED`) : champs en lecture seule + affichage des **commentaires coach par section** (encart or, ★ Retour coach).

### 3. Évolution (comparaison)
- Hero : **score global de confiance** = moyenne des 9 curseurs, affiché Départ → Mi-parcours (→ Final) avec delta (`+2.2 ↑`).
- **9 curseurs** affichés en barres 0-10, un point par passage (gris=INITIAL, or=MID, corail=FINAL), reliés, + badge de delta par dimension. Les 9 métriques : voir `SLIDER_METRICS` dans `audit-data.jsx` (clarte, confiance, vente, communication, gestion, alignementViePro, alignementAmbition, epanoui, courage).
- **Comparaison textuelle** : sélecteur de question (pills) → réponses INITIAL / MID / FINAL empilées (carte avec liseré coloré par passage). Gère l'état "pas encore renseigné".

## API routes suggérées
```
GET    /api/client/audit                 → liste des 3 AuditResponse du client (ou null)
POST   /api/client/audit                 → crée/upsert un DRAFT { type }
PATCH  /api/client/audit/[id]            → save responses (autosave DRAFT)
POST   /api/client/audit/[id]/submit     → passe en SUBMITTED
GET    /api/client/audit/evolution       → agrège les 3 pour la vue comparaison

// côté coach
GET    /api/coach/audit/[clientId]       → voit les audits d'un client
POST   /api/coach/audit/[id]/comment     → ajoute/maj un AuditSectionComment { section, content }
POST   /api/coach/audit/[id]/reopen      → repasse SUBMITTED → DRAFT
```

## Notes
- Le texte exact de toutes les questions est dans `audit-data.jsx`. Ne pas paraphraser.
- Les questions MID et FINAL utilisent **les mêmes questions que INITIAL** pour permettre la comparaison (le client l'a demandé). Si des variantes MID/FINAL sont voulues plus tard, le modèle (responses JSON + type) le permet sans migration.
- Garder les IDs de questions stables dans le temps — c'est la clé de la comparaison.
