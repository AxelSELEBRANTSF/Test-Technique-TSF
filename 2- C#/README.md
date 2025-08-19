# Exercice 2 — CRUD en C# avec Docker

Cette application est un exemple de **CRUD complet** (Create, Read, Update, Delete) en **ASP.NET Core MVC (.NET 8)**.  
Elle gère des produits simples (nom, prix, stock, description) et persiste les données dans une base **SQL Server** conteneurisée.  
Le tout est orchestré avec **Docker Compose** et les données survivent aux redémarrages grâce à un volume.

---

## Structure du projet

2- C#/
├── CrudApp/ # Application ASP.NET Core MVC
├── 2- C#.sln # Fichier solution Visual Studio
├── Dockerfile # Image de l'application
└── compose.yaml # Orchestration app + base de données

---

## Prérequis
- [.NET 8 SDK](https://dotnet.microsoft.com/download) (facultatif si usage uniquement via Docker)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) avec Docker Compose

---

## Démarrage rapide avec Docker
Depuis la racine du dossier `2- C#` :

```bash
docker compose up --build
Ensuite, ouvre ton navigateur à l’adresse :
http://localhost:5000

Le conteneur web écoute en HTTP (port 5000).
Pas d’HTTPS dans Docker pour simplifier l’exercice.

Persistance des données

La base SQL Server utilise un volume nommé mssqldata.

Les données restent disponibles même après un docker compose down.

Pour tout réinitialiser (vider la base) :

docker compose down -v

Configuration base de données

Image utilisée : mcr.microsoft.com/mssql/server:2022-latest

Utilisateur admin : sa

Mot de passe : Your_strong_password123 (à modifier en production)

Chaîne de connexion appli (via variable d’environnement dans compose.yaml) :

Server=db,1433;Database=CrudAppDb;User Id=sa;Password=Your_strong_password123;TrustServerCertificate=True;


En exécution locale (hors Docker), appsettings.json contient une chaîne vers localhost,1433.

Fonctionnalités CRUD

Index : liste tous les produits

Create : ajoute un produit

Edit : modifie un produit existant

Details : affiche les détails d’un produit

Delete : supprime un produit

Les vues Razor sont disponibles dans CrudApp/Views/Products/.

Implémentation technique

Modèle : Product (Id, Name, Price, Stock, Description)

DbContext : AppDbContext (EF Core, SQL Server)

Contrôleur : ProductsController (actions CRUD complètes)

Seed : 3 produits insérés au démarrage (Keyboard, Mouse, Monitor)

Initialisation : Database.EnsureCreated() au démarrage pour générer la base

Exécution locale sans Docker (optionnel)

Depuis CrudApp/ :

dotnet run


Par défaut, l’application s’exécute sur :

https://localhost:5001

http://localhost:5000

⚠ Nécessite un SQL Server local disponible sur localhost,1433.

Tests manuels

Lancer l’application (Docker ou local).

Aller sur /Products.

Créer un produit.

Le modifier, consulter les détails.

Le supprimer.

Redémarrer les conteneurs pour vérifier la persistance.

Dépannage

Le site ne répond pas :

docker compose logs -f web


SQL Server pas prêt :

docker compose logs -f db


Port 1433 déjà utilisé :
Modifier le mapping 1433:1433 dans compose.yaml et adapter la chaîne de connexion.

Sécurité

Le mot de passe sa est en clair dans compose.yaml pour simplifier l’exercice.

En production : utiliser un mot de passe robuste, des secrets Docker, et un compte non-admin pour l’application.