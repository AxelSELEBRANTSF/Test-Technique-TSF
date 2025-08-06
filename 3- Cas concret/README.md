# Cas concret

Cet exercice consiste à ingétrer de nouvelles fonctionnalités dans la première applications.

## Structure du projet

```bash
projet/
├── Back-End/MovieApp              # Application backend PHP
├── Front-end/MovieApp             # Application frontend TypeScript
├── compose.yaml                   # Docker Compose principal (déjà existant avec MySQL et ce que vous avez pu faire précédemment)
├── scripts/                       # Scripts Bash 
├── db/                            # Commande SQL pour créer les tables et insérer des données factice 
└── README.md                      # Ce fichier
```

## Consignes et spécifications

### Complétion :
- Mettre en place un système d'édition des films.
- Pensez au feedback utilisateur.

### Authentification :
- Vous avez déjà l'application qui fonctionne sous Docker et avec une base de données qui se lance.
- On vous demande de rajouter une création de compte et une authentification de compte à cette application.

### Log des activités des utilisateurs :
- Chaque actions des utilisateurs doivent être inscrite sur la base de données.
- Le nom de l'utilisateur ayant crée et modifié en dernier un film doit être sauvegarder et apparaitre dans le front-end.

### Récupération des données
- Les données doivent être récupérer dès que l'utilisateur tape du texte dans le champ de recherche.
- La recherche doit être optimiser pour éviter les requêtes trop longue.
- Prennez en compte le temps de réponse pour des volumes de données important.

### Partie admin & gestion de rôles :
- Une interface admin doit permettre aux utilisateurs autoriser de gérer les comptes utilisateurs ainsi que le contenu qui a été crée.
- Il doit y avoir trois rôle: lecteur, qui permet de lire uniquement, éditeur, qui permet de lire et écrire (sauf si le film a été crée par un admin) et administrateur qui a tout les droits + peut supprimer les comptes utilisateurs (sauf ceux des autres admins).

### Bonus
- Mettre en place un système d'autocomplétion lors de la recherche dans les logs + recherche de film. 
- Une recherche dans les logs doit pouvoir être fait sur n'importe mot-clés. 

## Points à respecter pour l'évaluation

✅ Authentification sécurisée des utilisateurs  
✅ Logs des actions des utilisateurs  
✅ Nom des utilisateurs ayant crée le film ainsi que le nom du dernier utilisateur ayant modifier le film  
✅ Mise en place d'une recherche dynamic lors de la sasie dans les champs de recherche

✅ Mise en place de technique d'optimisation des requêtes.
✅ Une partie administrateur doit pouvoir permettre la gestion du contenu et des comptes de l'application

✅ Gestion des rôles + sécurisation des rôles
✅ Auto complétion lors de la recherche de logs et film (bonus)
✅ Recherche sur n'importe mot-clés (bonus)
✅ Claireté et simplicité du code
✅ Livraison d'une documentation pour permettre de reprendre le projet plus tard.

## Livrable attendu

- Code source organisé et clair dans un autre git.
- README.md clair, permettant à une personne tierce de lancer et reprendre le projet.

## Notes utiles

- Vous pouvez modifier ce qui a été déjà mis en place, si vous estimez que cela est necessaire.
- Les commentaires sont bienvenue, avec modération.
- Le typages des variables et functions est fortement recommendé (si ce n'est pas obligatoire).
- Pensez à respecter la structure que les technologies utiliser.