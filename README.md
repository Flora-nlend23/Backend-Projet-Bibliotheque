# Bibliothèque Universitaire – Projet Fullstack

## Présentation

Ce projet (que j'ai nommé Flora'sLibrary) est une application web complète de gestion de bibliothèque universitaire, pensée pour les étudiants et le personnel. Elle permet de rechercher, réserver, emprunter, rendre et noter des livres, tout en offrant une expérience utilisateur moderne, responsive et accessible (mode sombre inclus). L’API backend gère l’ensemble des opérations métiers : gestion des utilisateurs, livres, emprunts, réservations, avis, favoris, notifications et historique d’activité.

---

## Fonctionnalités principales

- **Recherche de livres** : par titre, auteur, catégorie, etc.
- **Réservation et emprunt** : réservation en ligne, gestion des dates d’emprunt et de retour, historique complet.
- **Gestion des retours** : suivi des retards, notifications automatiques par email en cas de retard.
- **Favoris** : possibilité d’ajouter des livres en favoris pour les retrouver facilement.
- **Avis et notes** : chaque utilisateur peut laisser un avis/commentaire et une note sur un livre.
- **Notifications** : emails automatiques pour confirmation d’emprunt, rappel de retour, notification de retard, etc.
- **Gestion des utilisateurs** : inscription, connexion sécurisée (JWT), édition du profil, réinitialisation du mot de passe, rôles (admin/étudiant).
- **Interface moderne** : design harmonisé, palette beige/gris/marron, composants réutilisables, mode sombre/clair, navigation fluide.
- **API REST sécurisée** : toutes les routes protégées par JWT, vérification des rôles, validation des entrées.
- **Historique d’activité** : chaque action (emprunt, retour, avis, etc.) est tracée et consultable par l’utilisateur.
- **Administration** : interface dédiée pour la gestion des utilisateurs, des livres, des emprunts, des retards, etc.
- **Dockerisation complète** : déploiement facile en local ou sur serveur (Docker Compose).

---

## Structure du projet

```
/Projet
│
├── Backend/                      # API Express.js (Node.js)
│   ├── config/                   # Fichiers de configuration (dont .env, database.js)
│   ├── middlewares/              # Middlewares Express (auth, gestion, sécurité, etc.)
│   ├── routes/                   # Routes API REST (auth, users, livres, emprunts, etc.)
│   ├── index.js                  # Point d’entrée serveur
│   ├── package.json              # Dépendances backend
│   ├── schema-bibliotheque.sql   # Schéma SQL complet de la base
│  
│
├── bibliotheque-frontend/        # Frontend Next.js (React + Tailwind CSS)
│   ├── app/                      # Pages et routes Next.js (profil, livres, favoris, etc.)
│   ├── components/               # Composants réutilisables (UI, cartes, formulaires)
│   ├── public/                   # Images, logos, assets statiques
│   ├── styles/                   # Feuilles de style globales
│   ├── package.json              # Dépendances frontend
│   └── hooks/
│   └── lib/
│

```

---

## Prérequis

- Node.js 18+ (pour développement local)
- npm (inclus avec Node.js)
- Nodemailer, cron
- Docker & Docker Compose (pour déploiement tout-en-un)
- MySQL 8+

---

## Installation & Lancement

### 1. **Via Docker (recommandé)**

```bash
git clone <url-du-repo>
cd Projet
docker-compose up --build
```

- Frontend accessible sur : http://localhost:3000
- Backend API sur : http://localhost:4000
- MySQL sur : localhost:3306 (par défaut, modifiable dans docker-compose.yml)

### 2. **En local (développement sans Docker)**

#### Backend

```bash
cd Backend
npm install
npm start
```

#### Frontend

```bash
cd bibliotheque-frontend
npm install
npm run dev
```

#### Base de données

- Installer MySQL 8+ localement
- Créer la base et les tables avec le script `docs/schema-bibliotheque.sql`
- Adapter le fichier `.env` avec vos identifiants MySQL

---

## Variables d’environnement

Le fichier `.env` à la racine du projet Backend contient toutes les variables nécessaires :

```
NODE_ENV=production
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=bibliotheque
JWT_SECRET=votre_secret_jwt_super_securise_ici
PORT=3306
MAIL_USER=florilonaflorilona@gmail.com
MAIL_PASS=afcunsipsalenneg
```


---

## Schéma de la base de données

Le schéma SQL complet se trouve dans `docs/schema-bibliotheque.sql`.

### Tables principales

- `utilisateurs` : infos personnelles, rôle, mot de passe hashé, tokens, etc.
- `livres` : titre, auteur, catégorie, couverture, disponibilité, etc.
- `emprunts` : gestion des emprunts, dates, statut, utilisateur, livre.
- `reservations` : réservations de livres à l’avance.
- `avis_livres` : avis/commentaires et notes sur les livres.
- `favoris` : gestion des favoris par utilisateur.
- `notifications` : notifications système (retard, confirmation, etc.).
- `historique_emprunts` : historique détaillé des actions utilisateur.

Toutes les relations, clés étrangères et contraintes sont définies dans le script SQL.

---

## API REST – Endpoints principaux


### Authentification & Utilisateurs

- `POST   /api/auth/login`                 : Connexion utilisateur (JWT)
- `POST   /api/auth/register`              : Inscription nouvel utilisateur
- `POST   /api/auth/reset-password`        : Réinitialisation du mot de passe
- `POST   /api/auth/reset-password-request`: Demande de lien de réinitialisation
- `GET    /api/users/profile/me`           : Profil de l’utilisateur connecté
- `GET    /api/users/:id`                  : Détail d’un utilisateur (admin ou soi-même)
- `GET    /api/users`                      : Liste de tous les utilisateurs (admin)
- `PUT    /api/users/:id`                  : Modifier un utilisateur (admin ou soi-même)
- `DELETE /api/users/:id`                  : Supprimer un utilisateur (admin)
- `POST   /api/users`                      : Ajouter un utilisateur (admin)

### Livres

- `GET    /api/livres`                     : Liste de tous les livres (avec filtres)
- `GET    /api/livres/:id`                 : Détail d’un livre
- `POST   /api/livres`                     : Ajouter un livre (admin)
- `PUT    /api/livres/:id`                 : Modifier un livre (admin)
- `DELETE /api/livres/:id`                 : Supprimer un livre (admin)

### Emprunts

- `POST   /api/emprunts`                   : Emprunter un livre
- `PUT    /api/emprunts/:id/retour`        : Retourner un livre
- `PUT    /api/emprunts/:id/prolonger`     : Prolonger un emprunt
- `GET    /api/emprunts/user/:userId`      : Emprunts d’un utilisateur (admin ou soi-même)
- `GET    /api/emprunts`                   : Liste de tous les emprunts (admin)
- `POST   /api/emprunts/notifications/retard` : Envoyer les notifications de retard (admin)

### Réservations

- `GET    /api/reservations/me`            : Réservations de l’utilisateur connecté
- `GET    /api/reservations`               : Liste de toutes les réservations (admin)
- `POST   /api/reservations`               : Créer une réservation
- `DELETE /api/reservations/:id`           : Annuler une réservation (admin ou soi-même)

### Favoris

- `GET    /api/favoris`                    : Liste des favoris de l’utilisateur
- `POST   /api/favoris`                    : Ajouter un livre aux favoris

### Avis

- `GET    /api/avis`                       : Liste des avis sur les livres
- `POST   /api/avis`                       : Ajouter un avis
- `DELETE /api/avis/:id`                   : Supprimer un avis (admin ou auteur)

### Notifications

- `GET    /api/notifications`              : Notifications de l’utilisateur
- `PUT    /api/notifications/:id/lue`      : Marquer une notification comme lue
- `DELETE /api/notifications/:id`          : Supprimer une notification

### Historique

- `GET    /api/historique_emprunts`        : Historique des actions (admin = tout, utilisateur = ses actions)
- `GET    /api/historique_emprunts/user/:userId` : Historique d’un utilisateur (admin ou soi-même)

Toutes les routes sont sécurisées par JWT et vérification des rôles.

---

## Démo / Hébergement

Le projet peut être déployé sur n’importe quel serveur compatible Docker (Vercel, Render, Railway, etc.).

- Frontend (Next.js) : déployable sur Vercel, Netlify, etc.
- Backend (Express.js) : déployable sur Render, Railway, etc.
- Base de données : MySQL 8+ (hébergée)

---

## Auteurs

- Flora NLEND [floranlend23@gmail.com]
- Projet de fin : Intégration FRontend Backend


