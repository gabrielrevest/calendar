# Plan de Tests Complet

## 🧪 Tests à Exécuter

### 1. Tests d'Authentification
```bash
# Test inscription
- Créer un compte
- Vérifier validation email
- Vérifier mot de passe fort

# Test connexion
- Se connecter avec email/mot de passe
- Vérifier "Rester connecté"
- Vérifier déconnexion
```

### 2. Tests Calendrier
```bash
# Création événements
- Créer événement simple
- Créer événement récurrent
- Créer événement avec rappels multiples
- Créer événement avec saisie langage naturel

# Vues calendrier
- Vue Mois
- Vue Semaine
- Vue Jour
- Vue Agenda
- Timeline view
- Time blocking

# Modifications
- Modifier événement
- Supprimer événement
- Dupliquer événement
- Déplacer événement
```

### 3. Tests Projets
```bash
# Création projets
- Créer projet simple
- Créer projet Livre avec chapitres
- Créer projet avec tâches
- Créer projet avec milestones

# Vues projets
- Vue Liste
- Vue Kanban
- Gantt chart
- Corkboard chapitres
- Outline view

# Fonctionnalités
- Timer intégré
- Sous-tâches hiérarchiques
- Dépendances
- Duplication
- Export
```

### 4. Tests Notes
```bash
# Création notes
- Créer note simple
- Créer note avec Markdown
- Créer note avec texte riche
- Ajouter pièces jointes
- Créer liens internes

# Fonctionnalités
- Versioning
- Restauration version
- Catégories
- Recherche
- Export
```

### 5. Tests Recherche & Navigation
```bash
# Recherche globale (Ctrl+K)
- Rechercher événements
- Rechercher projets
- Rechercher notes
- Rechercher dans contenu

# Command Palette (Ctrl+P)
- Ouvrir commandes
- Naviguer vers pages
- Créer nouveaux éléments
```

### 6. Tests Statistiques
```bash
# Page statistiques
- Voir graphiques
- Voir rapports hebdomadaires
- Voir heatmap productivité
- Exporter statistiques
```

### 7. Tests Notifications
```bash
# Notifications push
- Activer notifications
- Tester notification
- Vérifier paramètres

# Notifications email
- Activer notifications email
- Vérifier configuration
```

### 8. Tests Habits Tracker
```bash
# Création habitudes
- Créer habitude
- Cocher habitude
- Voir statistiques
- Supprimer habitude
```

### 9. Tests Export/Import
```bash
# Export
- Export JSON
- Export CSV
- Export iCal
- Export PDF

# Import
- Import iCal
- Import JSON
```

### 10. Tests Gestion
```bash
# Corbeille
- Supprimer élément
- Restaurer élément
- Vider corbeille

# Archives
- Archiver élément
- Désarchiver élément
```

### 11. Tests Personnalisation
```bash
# Thèmes
- Changer thème
- Créer thème personnalisé

# Widgets
- Ajouter widget
- Réorganiser widgets
- Supprimer widget
```

### 12. Tests Backup
```bash
# Backup manuel
- Créer backup
- Télécharger backup

# Backup automatique
- Configurer backup automatique
- Vérifier création automatique
```

---

## 🚀 Commandes de Test

```bash
# Lancer l'application
npm run dev

# Build production
npm run build

# Lancer en production
npm start

# Tests Electron
npm run electron

# Build Electron
npm run build:exe
```

---

## ✅ Checklist Complète

- [ ] Authentification fonctionne
- [ ] Toutes les vues calendrier fonctionnent
- [ ] Création/modification/suppression événements
- [ ] Événements récurrents
- [ ] Rappels multiples
- [ ] Toutes les vues projets fonctionnent
- [ ] Création/modification/suppression projets
- [ ] Sous-tâches hiérarchiques
- [ ] Timer fonctionne
- [ ] Gantt chart fonctionne
- [ ] Kanban fonctionne
- [ ] Création/modification/suppression notes
- [ ] Markdown fonctionne
- [ ] Texte riche fonctionne
- [ ] Pièces jointes fonctionnent
- [ ] Liens internes fonctionnent
- [ ] Recherche globale fonctionne
- [ ] Command Palette fonctionne
- [ ] Statistiques s'affichent
- [ ] Notifications fonctionnent
- [ ] Habits tracker fonctionne
- [ ] Export/Import fonctionnent
- [ ] Corbeille fonctionne
- [ ] Archives fonctionnent
- [ ] Thèmes fonctionnent
- [ ] Backup fonctionne
- [ ] Synchronisation iPhone fonctionne
- [ ] Tous les raccourcis clavier fonctionnent
- [ ] Application Electron fonctionne
- [ ] Build production fonctionne

---

**Tests à effectuer maintenant ! 🧪**

