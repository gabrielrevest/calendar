# Tests Unitaires

## Structure

```
tests/
├── api/              # Tests des API routes
│   ├── events.test.ts
│   ├── projects.test.ts
│   └── notes.test.ts
├── utils/            # Tests des utilitaires
│   ├── array-validation.test.ts
│   └── foreign-key-validation.test.ts
├── integration/      # Tests d'intégration
│   └── api-flow.test.ts
└── setup.ts          # Configuration des tests
```

## Commandes

```bash
# Lancer tous les tests
npm test

# Lancer les tests en mode watch
npm run test:watch

# Lancer les tests avec interface graphique
npm run test:ui

# Générer un rapport de couverture
npm run test:coverage
```

## Problèmes identifiés

Les tests vont révéler :
- ✅ Erreurs de foreign key
- ✅ Problèmes de validation
- ✅ Gestion d'erreurs manquante
- ✅ Retours non-array
- ✅ IDs invalides non filtrés

## Configuration

Les tests utilisent :
- **Vitest** : Framework de test rapide
- **Prisma** : Base de données de test SQLite
- **Mocks** : NextAuth et autres dépendances

