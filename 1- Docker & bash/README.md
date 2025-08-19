# Exercice de dockerisation et scripting bash

Cet exercice consiste à conteneuriser une application web composée d'un backend en PHP et d'un frontend en TypeScript, en utilisant Docker Compose.

## Structure du projet

```bash
1- Docker & bash/
├── Back-End/MovieApp              # Application backend PHP
├── Front-end/MovieApp             # Application frontend TypeScript
├── compose.yaml                   # Docker Compose principal (déjà existant avec MySQL)
├── scripts/                       # Scripts Bash (facultatif)
├── db/                            # Commande SQL pour créer les tables et insérer des données factice 
└── README.md                      # Ce fichier
```

## Consignes et spécifications

### Docker Compose :
- Vous avez déjà un compose.yaml existant qui intègre la base de données MySQL ainsi qu'une application complète.
- Ajoutez-y deux nouveaux services :
  - Backend PHP (Dans notre cas Symfony)
  - Frontend TypeScript (Dans notre cas Svelte)

### Communication entre services :
- Le backend et le frontend doivent pouvoir communiquer ensemble via Docker Compose.
### Persistance des données :
- Utilisez des volumes Docker pour garantir que les données de la base MySQL persistent même après un docker compose down.

### Initialisation des bases de données :
- Au premier lancement de Docker Compose, la base de données principale (MovieApp) doit être automatiquement créée avec ses tables et données initiales.
- Une deuxième base de données nommée MovieApp_test doit être créée automatiquement, avec une copie identique des tables et données de la base principale. (facultatif)

### Tests unitaires (facultatif) :
Les tests unitaires du backend doivent fonctionner correctement, avec la commande :
```bash
php bin/phpunit
```

## Scripts et automatisations (Bash)

Vous pouvez inclure des scripts Bash pour simplifier les tâches répétitives :

- `scripts/init_db.sh` : script pour initialiser automatiquement la base de donnée (facultatif pour la base de données test)
- `scripts/run_tests.sh` : script pour lancer facilement les tests unitaires sur le backend (facultatif)
- `scripts/start.sh` : script pour démarrer facilement le projet complet

## Points à respecter pour l'évaluation

- ✅ Conteneurisation complète des applications PHP et Svelte (Typescript)  
- ✅ Communication inter-service fonctionnelle  
- ✅ Persistance des données après extinction des conteneurs  
- ✅ Création automatique des bases de données avec données initiales  
- ✅ Tests unitaires exécutables avec succès (facultatif)
- ✅ Installation correcte des packages (composer install et npm install)  

## Quelques commandes utiles

Pour installer les packages de symfony, il faut passer par composer:
```bash
composer install
```
dans le bon dossier

Pour lancer le serveur symfony: 
```bash
symfony server:start
```

Pour lancer le serveur vite:
```bash
npm run dev
```

La documentation de Symfony: https://symfony.com/doc/current/index.html

La documentation de Svelte: https://svelte.dev/docs/svelte/overview

La documentation de vite: https://vite.dev/guide/

## Livrable attendu

- Code source organisé et clair
- Docker Compose complet et fonctionnel
- Scripts Bash pertinents
- README.md clair, permettant à une personne tierce de lancer le projet

## Notes utiles

### Accès aux applications
- **Backend** : Accessible via http://localhost:8000 
- **Frontend** : Accessible via http://localhost:5173 