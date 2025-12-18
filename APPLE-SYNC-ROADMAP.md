# 🍎 Roadmap Synchronisation Apple Calendar

## Objectifs

1. **Apple Sign-In** ✅ (Déjà implémenté)
2. **Synchronisation Calendrier iPhone** (À faire)
3. **Déploiement pour accès HTTPS** (Nécessaire pour Apple)

## Étapes

### Phase 1: Déploiement (Priorité 1)

Pour que la synchronisation Apple fonctionne, l'application doit être accessible via HTTPS.

**Options de déploiement:**
- DigitalOcean (recommandé - crédits gratuits disponibles)
- Vercel
- Railway

**Checklist déploiement:**
- [ ] Configurer le domaine
- [ ] SSL/HTTPS
- [ ] Variables d'environnement
- [ ] Base de données en production
- [ ] Tests en production

### Phase 2: Configuration Apple Developer

1. **Calendrier (CalDAV)**
   - Créer un Service ID pour CalDAV
   - Configurer les permissions
   - Obtenir les certificats

2. **Push Notifications**
   - Configurer APNs (Apple Push Notification service)
   - Certificats de développement et production

### Phase 3: Implémentation CalDAV

**Bibliothèques nécessaires:**
- `node-caldav` ou `ical.js` pour parser/générer iCal
- Serveur CalDAV pour synchronisation bidirectionnelle

**Fonctionnalités:**
- [ ] Endpoint CalDAV `/caldav/`
- [ ] PROPFIND pour découvrir les calendriers
- [ ] GET pour récupérer les événements
- [ ] PUT pour créer/modifier
- [ ] DELETE pour supprimer
- [ ] REPORT pour les requêtes complexes

### Phase 4: Synchronisation Bidirectionnelle

- [ ] Pull: Récupérer les événements iPhone
- [ ] Push: Envoyer les événements vers iPhone
- [ ] Résolution des conflits
- [ ] Gestion des modifications simultanées

### Phase 5: Tests

- [ ] Tests unitaires CalDAV
- [ ] Tests d'intégration
- [ ] Tests avec iPhone réel
- [ ] Tests de performance

## Ressources

- [CalDAV RFC 4791](https://tools.ietf.org/html/rfc4791)
- [Apple Calendar Server](https://developer.apple.com/documentation/calendarserver)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## Notes

- La synchronisation nécessite un serveur accessible en HTTPS
- Apple Calendar utilise CalDAV (pas iCal simple)
- Besoin de gérer les tokens d'authentification Apple
- Synchronisation en temps réel possible avec WebSockets

