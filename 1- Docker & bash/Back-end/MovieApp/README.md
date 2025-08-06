# MovieApp

## Description

Application de gestion des films

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants :

- **PHP** >= 8.1
- **Composer** (gestionnaire de dépendances PHP)
- **Symfony CLI** (optionnel mais recommandé)
- **Docker**

### Vérification des prérequis Symfony

```bash
symfony check:requirements
```

## Installation

### 1. Installer les dépendances PHP

```bash
composer install
```

### 2. Configuration de l'environnement

Copiez le fichier `.env` et configurez vos variables d'environnement :

```bash
cp .env .env.local
```

Éditez `.env.local` avec vos configurations :

```env
APP_ENV=dev
APP_SECRET=9245461963b0fb0166b826b0ec1829d5
DATABASE_URL="mysql://root:root@127.0.0.1:3306/MovieApp?serverVersion=8.0.32&charset=utf8mb4"
CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$'
KERNEL_CLASS="App\Kernel"
```

### 3. Configuration de la base de données

```bash
# Créer la base de données
php bin/console doctrine:database:create

# Exécuter les migrations
php bin/console doctrine:migrations:migrate
```

## Démarrage du serveur

### Avec Symfony CLI (recommandé)

```bash
symfony server:start
```

Le projet sera accessible à l'adresse : `https://127.0.0.1:8000`

### Avec le serveur PHP intégré

```bash
php -S 127.0.0.1:8000 -t public/
```

## Structure du projet

```
├── bin/                    # Exécutables (console)
├── config/                 # Configuration de l'application
├── migrations/             # Migrations de base de données
├── public/                 # Point d'entrée web et assets publics
├── src/
│   ├── Controller/         # Contrôleurs
│   ├── Entity/            # Entités Doctrine
│   ├── Repository/        # Repositories Doctrine
│   ├── Service/           # Services métier
│   └── ...
├── tests/                 # Tests
├── var/                   # Cache et logs
├── vendor/                # Dépendances Composer
├── .env                   # Variables d'environnement (template)
├── composer.json          # Dépendances PHP
└── package.json           # Dépendances JavaScript
```

## Commandes utiles

### Développement

```bash
# Vider le cache
php bin/console cache:clear

# Déboguer les routes
php bin/console debug:router

# Déboguer le container de services
php bin/console debug:container

# Créer un contrôleur
php bin/console make:controller

# Créer une entité
php bin/console make:entity

# Créer une migration
php bin/console make:migration
```

### Base de données

```bash
# Vérifier le mapping Doctrine
php bin/console doctrine:schema:validate

# Mettre à jour le schéma (développement uniquement)
php bin/console doctrine:schema:update --force

# Créer une migration
php bin/console doctrine:migrations:generate
```

### Tests

```bash
# Exécuter tous les tests
php bin/phpunit

# Exécuter les tests avec couverture
php bin/phpunit --coverage-html var/coverage
```

## Configuration des environnements

### Développement
- Debug activé
- Profiler activé
- Cache désactivé pour les templates

### Production
- Debug désactivé
- Cache optimisé
- Assets minifiés

```bash
# Déploiement en production
composer install --no-dev --optimize-autoloader
php bin/console cache:clear --env=prod
php bin/console cache:warmup --env=prod
```

## Dépannage

### Problèmes courants

**Erreur de permissions sur var/**
```bash
sudo chown -R www-data:www-data var/
sudo chmod -R 775 var/
```

**Problème de cache en développement**
```bash
php bin/console cache:clear
```

**Erreur de base de données**
Vérifiez votre configuration dans `.env.local` et que votre serveur de base de données est démarré.

## Documentation

- [Documentation officielle Symfony](https://symfony.com/doc/current/index.html)
- [Doctrine ORM](https://www.doctrine-project.org/projects/orm.html)