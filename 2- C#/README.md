# Exercice : CRUD en C# avec Docker

L'objectif de cet exercice est de développer une application web CRUD (Create, Read, Update, Delete) complète en utilisant C# et .NET. L'application et sa base de données seront conteneurisées à l'aide de Docker et orchestrées avec Docker Compose.

## 🛠️ Technologies utilisées
- **Langage**: C# (.NET)
- **Framework** : ASP.NET Core MVC
- **Base de données**: SQL Server/PostgreSQL/MySQL
- **Conteneurisation**: Docker & Docker Compose

## Structure du projet
```bash
projet-crud-csharp/
├── src/
│   └── CrudApp/                 # C# Application
├── compose.yml                  # Docker services configuration
├── scripts/ (facultatif)        # Script additionnel
└── README.md                    # Ce fichier
```

## Critères de validation
- ✅ L'application C# implémente les fonctionnalités CRUD (Create, Read, Update, Delete).
- ✅ Les données sont stockées et lues depuis la base de données conteneurisée.
- ✅ L'application ASP.NET et la base de données sont conteneurisées.
- ✅ Les deux applications se lancent grâce à docker compose.
- ✅ La base de données et l'application peuvent communiquer entre eux
- ✅ Les données persistent même après redémmarage des conteneurs.
- ✅ Un README.md complet pour mettre à une personne tierce de lancer et reprendre le projet.

## Accéder à l'application
L'application est disponible sur:
- http://localhost:5000 ou
- https://localhost:5001 (SSL)

## Lien utile

Documentation C# conteneurisation : https://learn.microsoft.com/fr-fr/dotnet/core/docker/build-container?tabs=linux&pivots=dotnet-9-0

Documentation Docker : https://docs.docker.com/

## Livrable attendu
- L'application complète du CRUD
- Le Dockerfile associé à l'application
- Le compose.yaml
- Un README clair, permettant à une personne tierce de lancer et reprendre le projet.