# Calendrier & Projets - Application Desktop

## 📦 Application Finale

**Version:** 1.0.0  
**Plateforme:** Windows 64-bit  
**Taille:** ~169 MB  
**Emplacement:** `release/Calendrier & Projets-win32-x64/Calendrier & Projets.exe`

## ✨ Fonctionnalités

### 📅 Calendrier
- Visualisation mensuelle interactive
- Gestion complète des événements
- Événements récurrents
- Localisation et description
- Vue par jour/semaine/mois

### 🗓️ Rendez-vous
- Création rapide de rendez-vous
- Notifications et rappels
- Catégorisation par couleur
- Recherche et filtres

### 📊 Projets
**Trois types de projets :**
- **📚 Livre** : Écriture avec éditeur riche, compteur de mots, objectifs
- **💼 Professionnel** : Gestion de projets pro avec tâches
- **👤 Personnel** : Projets personnels et loisirs

**Fonctionnalités :**
- Suivi de progression (%)
- Gestion des tâches
- Dates de début/fin
- Statuts : Planification, En cours, Terminé, Archivé

### 📝 Notes
- Notes avec catégories personnalisables
- Couleurs pour l'organisation
- Tags pour la recherche
- Filtre par catégorie
- Éditeur de texte enrichi

### 📱 Synchronisation iPhone
- **Système d'abonnement au calendrier**
- Lien unique sécurisé
- Instructions pas à pas intégrées
- Envoi par email simplifié
- Mise à jour automatique

### 🔐 Sécurité
- Authentification locale sécurisée
- Base de données SQLite chiffrée
- Données stockées localement
- Pas de cloud, confidentialité totale

## 🎨 Améliorations Apportées

### UX/UI
- ✅ Composants de chargement (Skeleton, Spinners)
- ✅ États vides informatifs
- ✅ Dialogues de confirmation
- ✅ Toasts pour les actions
- ✅ Design moderne et cohérent
- ✅ Responsive (adaptation mobile/tablette)

### Technique
- ✅ Next.js 15 (App Router)
- ✅ Prisma avec SQLite
- ✅ NextAuth v5 sécurisé
- ✅ TanStack Query pour le cache
- ✅ Tailwind CSS + Shadcn/ui
- ✅ Mode standalone optimisé

### Build
- ✅ Electron packagé sans signature
- ✅ Base de données template pré-initialisée
- ✅ Variables d'environnement configurées
- ✅ Portable (pas d'installation requise)

## 🚀 Utilisation

### Premier Lancement
1. Double-cliquer sur `Calendrier & Projets.exe`
2. Créer un compte (local)
3. Commencer à utiliser !

### Base de Données
- Emplacement : `%APPDATA%/calendar-app/database.db`
- Sauvegarde automatique
- Persistante entre les sessions

### Synchronisation iPhone

#### Méthode Rapide
1. Ouvrir l'application
2. Cliquer sur "Synchroniser iPhone" dans la sidebar
3. Cliquer sur "M'envoyer par email"
4. Ouvrir l'email sur l'iPhone
5. Cliquer sur le lien → Safari propose de s'abonner

#### Méthode Manuelle
1. Copier le lien d'abonnement
2. Sur iPhone : **Réglages** → **Calendrier** → **Comptes**
3. **Ajouter un compte** → **Autre**
4. **Ajouter un cal. avec abonnement**
5. Coller le lien et enregistrer

## 📋 Prochaines Améliorations (Phase 2)

### Fonctionnalités Avancées
- [ ] Système de notifications push
- [ ] Export/Import CSV/JSON
- [ ] Recherche globale dans le header
- [ ] Dashboard avec graphiques (Charts.js)
- [ ] Mode hors-ligne avancé
- [ ] Impression des calendriers/projets
- [ ] Thème sombre/clair personnalisable

### Performance
- [ ] Pagination des listes longues
- [ ] Cache optimisé
- [ ] Chargement différé des images

### Qualité
- [ ] Tests automatisés
- [ ] Documentation utilisateur complète
- [ ] Guide de prise en main

## 🛠️ Développement

### Scripts Disponibles
```bash
npm run dev              # Mode développement
npm run build            # Build Next.js
npm run build:exe        # Build application .exe
npm run electron         # Lancer Electron en dev
```

### Structure
```
calendrier/
├── src/
│   ├── app/           # Pages Next.js (App Router)
│   ├── components/    # Composants React
│   └── lib/           # Utilitaires
├── prisma/            # Schéma base de données
├── scripts/           # Scripts de build
├── electron-main.js   # Point d'entrée Electron
└── release/           # Application finale
```

## 📄 Technologies

- **Framework:** Next.js 15
- **UI:** React 18 + Tailwind CSS + Shadcn/ui
- **Base de données:** Prisma + SQLite
- **Auth:** NextAuth v5
- **Desktop:** Electron 28
- **État:** TanStack Query
- **Validation:** Zod + React Hook Form
- **Calendrier:** FullCalendar
- **Dates:** date-fns

## 🎯 Résumé

Application de calendrier et gestion de projets complète, moderne et performante :

✅ **Fonctionnelle** - Toutes les features implémentées  
✅ **Performante** - Mode standalone optimisé  
✅ **Sécurisée** - Données locales, auth robuste  
✅ **Intuitive** - UX soignée, feedback visuel  
✅ **Synchronisée** - iPhone via abonnement calendrier  
✅ **Portable** - Pas d'installation, juste lancer le .exe  

**Prête à l'emploi !** 🚀


