# 📅 Calendrier - Application de Gestion Complète

Application web complète de gestion de calendrier, projets, notes et habitudes avec synchronisation Apple Calendar.

## ✨ Fonctionnalités

### 📆 Calendrier
- Vue mensuelle, hebdomadaire et journalière
- Blocage de temps (Time Blocking)
- Vue timeline
- Événements récurrents
- Rappels multiples
- Import/Export iCal

### 📝 Projets
- Vue Kanban
- Vue Gantt
- Gestion de tâches hiérarchiques
- Suivi de progression
- Milestones
- Timer intégré

### 📄 Notes
- Éditeur Markdown avec prévisualisation
- Liens internes
- Pièces jointes
- Historique des versions
- Snapshots

### 📊 Statistiques
- Rapports hebdomadaires
- Heatmap de productivité
- Suivi des habitudes

### 🔔 Notifications
- Rappels push
- Notifications email
- Mode "Ne pas déranger"

### 🎨 Personnalisation
- Thèmes personnalisables
- Widgets de dashboard
- Filtres sauvegardés
- Vues sauvegardées
- Raccourcis clavier

### 🔄 Synchronisation
- Apple Sign-In
- Synchronisation avec calendrier iPhone (à venir)
- Export/Import (iCal, CSV, JSON, PDF)

## 🚀 Technologies

- **Framework**: Next.js 15
- **Base de données**: SQLite (Prisma)
- **Authentification**: NextAuth.js (Credentials + Apple)
- **UI**: Shadcn/ui + Tailwind CSS
- **Tests**: Vitest
- **Desktop**: Electron (optionnel)

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Configurer la base de données
npx prisma generate
npx prisma db push

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés

# Lancer en développement
npm run dev
```

## 🔐 Configuration Apple Sign-In

1. Créer un App ID sur [Apple Developer](https://developer.apple.com)
2. Configurer les Services ID avec les callback URLs
3. Ajouter `APPLE_ID` et `APPLE_SECRET` dans `.env.local`

Voir `APPLE-SIGNIN-SETUP.md` pour les détails.

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Coverage
npm run test:coverage
```

## 📱 Déploiement

### DigitalOcean

Voir `DEPLOY-DIGITALOCEAN.md` pour le guide complet.

### Build Electron

```bash
npm run build:electron
```

## 📋 Roadmap

- [x] Authentification (Credentials + Apple)
- [x] Calendrier complet
- [x] Gestion de projets
- [x] Notes avec Markdown
- [x] Statistiques et rapports
- [ ] Synchronisation calendrier iPhone
- [ ] Application mobile native
- [ ] Synchronisation multi-appareils

## 📄 Licence

MIT

## 👤 Auteur

Gabriel Revest

