# MovieApp

## Description

Application de gestion des films

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** >= 20.0.0
- **npm** >= 9.0.0 (ou **yarn** >= 1.22.0 / **pnpm** >= 8.0.0)
- **TypeScript** >= 5.0.0

### Vérification des versions

```bash
node --version
npm --version
tsc --version
```

## Installation

### 1. Installer les dépendances

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### 2. Configuration de l'environnement

Copiez le fichier d'environnement et configurez vos variables :

```bash
cp .env.example .env.local
```

Éditez `.env.local` avec vos configurations :

```env
# API Configuration
VITE_API_BASE_URL="http://localhost:8000"

# Environnement
VITE_NODE_ENV="development"
```

## Démarrage du serveur de développement

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

L'application sera accessible à l'adresse : `http://localhost:5173`

### Options de développement

```bash
# Démarrer sur un port spécifique
npm run dev -- --port 3000

# Démarrer avec un host spécifique
npm run dev -- --host 0.0.0.0

# Mode debug avec sourcemaps détaillées
npm run dev -- --mode development
```

## Scripts disponibles

```bash
# Développement
npm run dev          # Démarrer le serveur de développement
npm run build        # Construire pour la production
npm run preview      # Prévisualiser le build de production

# Qualité de code
npm run type-check   # Vérification TypeScript
npm run check        # Vérifier la syntaxe Svelte + TypeScript
```

## Structure du projet

```
├── public/                 # Assets statiques
│   ├── favicon.ico
│   └── images/
├── src/
│   ├── types/             # Définitions de types TypeScript
│   ├── App.svelte         # Composant racine
│   ├── main.ts            # Point d'entrée TypeScript
│   └── app.d.ts           # Déclarations de types globaux
├── static/               # Assets statiques
├── .env.example          # Template des variables d'environnement
├── vite.config.ts        # Configuration Vite
├── svelte.config.js      # Configuration Svelte
├── tsconfig.json         # Configuration TypeScript
├── package.json          # Dépendances et scripts
└── README.md
```

## Build et Déploiement

### Build pour la production

```bash
npm run build
```

Le dossier `dist/` contiendra les fichiers optimisés pour la production.

### Prévisualisation du build

```bash
npm run preview
```

## Dépannage

### Problèmes courants

**Port déjà utilisé**
```bash
npm run dev -- --port 3001
```

**Erreur de module non trouvé**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Problème de cache Vite**
```bash
rm -rf .vite
npm run dev
```

**Erreur TypeScript (compilation)**
```bash
npm run type-check
```

**Erreur de types dans les composants**
```bash
# Vérifier la syntaxe Svelte + TypeScript
npm run check
```

**Problème d'alias de modules**
Vérifiez que les alias sont correctement configurés dans `vite.config.ts` et `tsconfig.json`.

## Ressources

- [Documentation Svelte](https://svelte.dev/docs)
- [Documentation Vite](https://vitejs.dev/guide/)
- [Svelte Society](https://sveltesociety.dev/)
- [Awesome Svelte](https://github.com/TheComputerM/awesome-svelte)