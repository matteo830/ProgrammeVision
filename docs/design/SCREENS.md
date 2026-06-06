# Inventaire des écrans — Programme Vision

Direction visuelle : **corail vibrant + vert sapin** (voir `DESIGN-TOKENS.md`). Mobile-first.

---

## Authentification — `Authentification.html`
- **Login** : hero corail "Bon retour", bouton Google OAuth, email/mdp, lien mot de passe oublié.
- **Mot de passe oublié** : saisie email → état "Vérifie ta boîte mail" (lien 1h).
- **Nouveau mot de passe** : saisie + confirmation avec checklist live (8 car., majuscule, chiffre, correspondance).

## Dashboard client — `Dashboard - 3 directions.html`
Ordre : header → **objectif 6 mois** (vert, montagne) → **formation** (% + phases + étape suivante) → **action du jour** (carte corail, focus, 1 seule action) → **prochains coachings** (sync Google Calendar) → gratitude/victoire (tuiles) → tableau de bord (grille 6 tuiles colorées) → inspiration.

## Formation — `Formation - 2 directions.html`
⚠️ Structure réelle actuelle = **Cours GHL → Modules → Leçons** (statuts À faire/En cours/Terminé), déjà implémentée. La maquette montre la logique de progression ; suivre le code en place.

## Calendrier — `Calendrier.html`
Prochain RDV en hero corail (compte à rebours, "Rejoindre la visio"), filtres individuel/collectif, mini-calendrier mensuel à pastilles, liste des RDV (source GHL / Google Calendar), CTA réserver.

## Coaching — `Coaching.html`
Hero coach (séances faites, prochaine), prochaine séance + **réservation GHL**, historique des séances (résumé, décisions, replay Fireflies, actions cochables + "ajouter au dashboard", commentaires), journal de notes (or = coach, corail = client).

## Questions — `Questions.html`
Hero CTA "Pose ta question" + stats, filtres En attente/Répondues, cartes question avec aperçu de la dernière réponse coach.

## Victoires — `Victoires.html`
Hero avec composer à onglets (Victoire 🏆 / Gratitude 💝) + stats + série, filtres, timeline groupée par semaine, tuiles pêche/rose.

## Profil — `Profil.html`
Hero avatar + objectif 6 mois (CA actuel/cible), infos perso, sécurité (mdp + Google), notifications (toggles), déconnexion.

## Audit d'onboarding — `Audit.html` ⏳ à implémenter
Voir `AUDIT-SPECS.md`. Hub (3 passages) · Wizard 7 sections · Évolution comparée (9 curseurs + textes).

## Côté coach — `Coach.html`
- **Dashboard** : stats, recherche, filtres À traiter/Inactifs, liste clients (badges actions, statut activité, progression, position "P2 · étape 3/8").
- **Détail client** : hero + 3 onglets (Formation avec validation inline, Notes avec toggle visible/privé, Questions avec réponse rapide).
- **Gestion modules** : config vidéo/exercice par module (la gestion de contenu réelle = `formation-admin-view`, déjà en place).

## Côté admin — `Admin.html`
- **Setup** premier admin (one-time, vert sapin).
- **Dashboard** : onglets Coaches/Clients/Désactivés, badges de rôle, réactivation (soft delete `isActive`).
- **Création de compte** : sélecteur de rôle + champs dynamiques (coach assigné/objectif pour client, avertissements coach/admin).
