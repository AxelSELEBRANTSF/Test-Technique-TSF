# MovieApp – Application fullstack conteneurisée

![Docker](https://img.shields.io/badge/Docker-ready-blue?logo=docker)
![Symfony](https://img.shields.io/badge/Symfony-6.x-black?logo=symfony)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![MySQL](https://img.shields.io/badge/MySQL-8-orange?logo=mysql)
![License](https://img.shields.io/badge/license-MIT-green)

Cette application web gère un catalogue de films avec des fonctionnalités avancées :  
- **Backend** : Symfony (PHP) avec API REST, authentification JWT, gestion des rôles, logging des actions.  
- **Frontend** : React + TypeScript (Vite).  
- **Base de données** : MySQL.  
- **Infra** : Docker Compose pour lancer l’ensemble, scripts Bash pour automatiser les tâches.  

Fonctionnalités principales :  
- Authentification avec création de compte (JWT).  
- Gestion des rôles : lecteur, éditeur, administrateur.  
- CRUD complet sur les films avec suivi du créateur et du dernier modificateur.  
- Logs d’activité (connexion, création, modification, suppression) avec interface de recherche.  
- Interface administrateur pour gérer les utilisateurs et leur rôle.  
- Recherche dynamique avec autocomplétion sur films et logs.  

---

## Structure du projet

```
3- Cas concret/
├── Back-End/MovieApp        # Backend Symfony (API REST)
├── Front-end/MovieApp       # Frontend React + TypeScript (Vite)
├── compose.yaml             # Docker Compose (MySQL + backend + frontend)
├── scripts/                 # Scripts Bash
│   ├── start.sh             # Démarrer l’environnement
│   ├── run_tests.sh         # Lancer les tests PHPUnit du backend
│   └── init_db.sh           # Réinitialiser la base de données
├── db/                      # Scripts SQL pour initialisation et indexes
└── README.md                # Documentation du projet
```

---

## Prérequis

- [Docker](https://docs.docker.com/get-docker/)  
- [Docker Compose](https://docs.docker.com/compose/)  
- Terminal compatible (Git Bash, WSL, etc.)

---

## Installation et lancement

Cloner le dépôt et démarrer les conteneurs :

```bash
git clone <url-du-repo>
cd "3- Cas concret"
./scripts/start.sh
```

Ce script :  
- construit et démarre les conteneurs (`mysql-db`, `movieapp-backend`, `movieapp-frontend`),  
- installe automatiquement les dépendances (Composer + npm),  
- initialise la base avec les scripts SQL du dossier `db/`.  

---

## Accès aux services

- **Frontend (React)** : http://localhost:5173  
- **Backend (Symfony API)** : http://localhost:8000  
- **Base MySQL** :  
  - hôte : `localhost`  
  - port : `3306`  
  - base : `MovieApp`  
  - user/pass : `user / user`  
  - root/root pour administrer  

Les données sont persistées via le volume Docker `db_data`.  

---

## Comptes de test

Trois rôles sont disponibles :

- **Administrateur** (peut tout gérer, y compris les utilisateurs et les logs)  
  - email : `admin@movieapp.com` / mot de passe : `admin`  

- **Éditeur** (peut créer/modifier des films sauf ceux créés par un admin)  
  - email : `editor@movieapp.com` / mot de passe : `editor`  

- **Lecteur** (accès en lecture seule)  
  - email : `reader@movieapp.com` / mot de passe : `reader`  

---

## Commandes utiles

Arrêter l’environnement :  
```bash
docker compose down
```

Réinitialiser complètement (conteneurs + volumes) :  
```bash
docker compose down -v
./scripts/start.sh
```

Lancer les tests unitaires backend :  
```bash
./scripts/run_tests.sh
```

---

## Fonctionnalités implémentées

- Authentification sécurisée avec JWT  
- Création de compte et gestion des rôles (lecteur/éditeur/admin)  
- CRUD films avec attribution créateur/modificateur  
- Logs d’activité complets (connexion, films, gestion utilisateurs)  
- Interface d’administration (gestion utilisateurs + contenus)  
- Recherche dynamique avec autocomplétion films et logs  
- Optimisation requêtes (pagination, debounce côté front, index SQL)  

---

## Dépannage courant

**Erreur `CORS` au login** : le backend peut mettre quelques secondes à être prêt. Attendre ou vérifier avec :  
```bash
docker compose logs -f backend
```

**Port 3306 déjà utilisé** : modifier dans `compose.yaml`  
```yaml
ports:
  - "3307:3306"
```

**Frontend ne se lance pas (`vite: not found`)** : relancer la build sans cache.  
```bash
docker compose build frontend --no-cache
```

---

## Résumé rapide

1. Clonez le repo  
2. Placez-vous dans `3- Cas concret`  
3. Lancez `./scripts/start.sh`  
4. Ouvrez :  
   - Frontend : http://localhost:5173  
   - Backend : http://localhost:8000  
