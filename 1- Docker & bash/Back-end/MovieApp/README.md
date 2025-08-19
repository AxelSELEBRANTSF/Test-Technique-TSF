# MovieApp – Exercice de Dockerisation et Scripting Bash

Ce projet est une application web composée de :  
- un backend Symfony (PHP),  
- un frontend Svelte (TypeScript + Vite),  
- une base MySQL.  

L’objectif est de montrer la conteneurisation complète de l’application avec Docker Compose, la persistance des données, l’initialisation automatique de la base et l’utilisation de scripts Bash pour simplifier les actions courantes.

---

## Structure du projet
1- Docker & bash/
├── Back-End/MovieApp # Application backend Symfony (PHP)
├── Front-end/MovieApp # Application frontend Svelte (TypeScript)
├── compose.yaml # Fichier principal Docker Compose
├── scripts/ # Scripts Bash pour automatiser les tâches
│ ├── start.sh # Démarrer le projet complet
│ ├── run_tests.sh # Lancer les tests PHPUnit du backend
│ └── init_db.sh # (optionnel) Réinitialiser la base de données
├── db/ # Scripts SQL d’initialisation
│ └── init.sql

## Lancement du projet

### 1. Prérequis
Assurez-vous d’avoir installé :
- [Docker](https://docs.docker.com/get-docker/)  
- [Docker Compose](https://docs.docker.com/compose/)  
- Un terminal compatible (Git Bash, WSL ou autre)

### 2. Cloner le dépôt
```bash
git clone <url-du-repo>
cd "1- Docker & bash"
./scripts/start.sh

Ce script :

construit et démarre les containers (mysql-db, movieapp-backend, movieapp-frontend),

installe les dépendances (composer install et npm install),

initialise la base MovieApp avec db/init.sql.

Accès aux applications

Backend Symfony : http://localhost:8000

Frontend Svelte : http://localhost:5173

Base de données MySQL :

Hôte : localhost

Port : 3306

Base : MovieApp

Utilisateur : user

Mot de passe : user

Root : root / root

Les données de la base sont persistées dans le volume Docker db_data, même après un docker compose down.

Commandes utiles
Arrêter l’environnement
docker compose down

Réinitialiser complètement (containers + volumes)
docker compose down -v
./scripts/start.sh

Lancer les tests unitaires du backend
./scripts/run_tests.sh


Cela exécute PHPUnit à l’intérieur du conteneur Symfony.
Les tests se trouvent dans Back-End/MovieApp/tests.

Initialisation des bases de données

Au premier démarrage, la base MovieApp est créée automatiquement avec ses tables et données factices grâce à db/init.sql.

Une base MovieApp_test peut aussi être générée (optionnel), via le script scripts/init_db.sh, avec les mêmes données que la base principale.

Dépendances et installation
Backend Symfony

Installation des dépendances via Composer (fait automatiquement par le container) :

composer install


Lancement manuel (hors Docker, pour développement local) :

symfony server:start

Frontend Svelte

Installation des dépendances via npm (fait automatiquement par le container) :

npm install


Lancement manuel (hors Docker, pour développement local) :

npm run dev

Points respectés pour l’évaluation

Conteneurisation complète du backend (Symfony), du frontend (Svelte) et de MySQL.

Communication inter-services via Docker Compose (backend <-> frontend <-> DB).

Persistance des données MySQL grâce au volume db_data.

Initialisation automatique de la base MovieApp avec données factices.

Option de création d’une base de test (MovieApp_test).

Tests unitaires backend exécutables avec php bin/phpunit ou ./scripts/run_tests.sh.

Installation automatique des dépendances (composer install et npm install).

Dépannage
Erreur : ports are not available: 3306

Cela signifie qu’un autre service MySQL tourne déjà sur votre machine.
Solutions possibles :

arrêter le service MySQL local (net stop mysql ou via services.msc sous Windows),

ou modifier le port exposé dans compose.yaml, par exemple :

ports:
  - "3307:3306"

Erreur : vite: not found

Cela veut dire que le frontend n’a pas correctement installé ses dépendances.
Solution : supprimer node_modules et package-lock.json puis relancer :

docker compose build frontend --no-cache

Erreur lors des tests Symfony : framework.test non activé

Ajoutez dans Back-End/MovieApp/config/packages/test/framework.yaml :

framework:
  test: true


Puis relancez :

./scripts/run_tests.sh

Résumé rapide

Clonez le repo

Placez-vous dans 1- Docker & bash

Lancez ./scripts/start.sh

Ouvrez :

http://localhost:5173
 pour le frontend

http://localhost:8000
 pour le backend