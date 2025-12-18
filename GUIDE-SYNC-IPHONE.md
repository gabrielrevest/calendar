# 📱 Guide de synchronisation iPhone

## ✅ Fonctionnalité disponible

Votre application peut maintenant être synchronisée avec l'application Calendrier de l'iPhone !

## 🚀 Comment configurer

### Étape 1 : Obtenir votre URL de synchronisation

1. Connectez-vous à votre application
2. Allez dans **Synchronisation** dans le menu de gauche
3. Copiez l'URL de synchronisation affichée

### Étape 2 : Ajouter le calendrier sur iPhone

#### Méthode 1 : Via Safari (Recommandé - Plus simple)

1. Ouvrez **Safari** sur votre iPhone
2. Collez l'URL de synchronisation dans la barre d'adresse
3. Appuyez sur **Entrée**
4. Safari vous demandera si vous voulez **Abonner** au calendrier
5. Appuyez sur **Abonner**
6. Le calendrier sera ajouté automatiquement à l'application Calendrier

#### Méthode 2 : Via Réglages (CalDAV)

1. Ouvrez l'application **Réglages** sur votre iPhone
2. Allez dans **Calendrier** → **Comptes**
3. Appuyez sur **Ajouter un compte**
4. Sélectionnez **Autre**
5. Choisissez **Ajouter un compte CalDAV**
6. Entrez les informations :
   - **Serveur** : Collez l'URL de synchronisation
   - **Nom d'utilisateur** : (peut être laissé vide)
   - **Mot de passe** : (peut être laissé vide)
7. Appuyez sur **Suivant**
8. Le calendrier sera ajouté

## 🔄 Synchronisation

### Synchronisation automatique

L'iPhone synchronise automatiquement le calendrier :
- Toutes les 15 minutes environ
- Lors de l'ouverture de l'application Calendrier
- Lors d'un rafraîchissement manuel

### Synchronisation manuelle

Pour forcer une synchronisation :
1. Ouvrez **Réglages** → **Calendrier** → **Comptes**
2. Sélectionnez votre compte
3. Appuyez sur **Synchroniser maintenant**

## 📝 Notes importantes

### Sécurité

- **Ne partagez pas votre URL de synchronisation** : Elle contient un token unique qui vous identifie
- Si vous pensez que votre token a été compromis, régénérez-le depuis la page de synchronisation
- L'URL est personnelle et unique à votre compte

### Limitations

- **Synchronisation en lecture seule** : Pour l'instant, les événements créés sur iPhone ne sont pas synchronisés vers l'application web
- **Synchronisation unidirectionnelle** : Les événements de l'application web → iPhone sont synchronisés, mais pas l'inverse
- **Fréquence** : La synchronisation peut prendre quelques minutes

### Fonctionnalités futures

- Synchronisation bidirectionnelle (iPhone ↔ Application web)
- Support CalDAV complet
- Synchronisation en temps réel
- Support des modifications et suppressions

## 🔧 Dépannage

### Le calendrier n'apparaît pas

1. Vérifiez que l'URL est correcte
2. Vérifiez votre connexion Internet
3. Essayez de régénérer le token
4. Vérifiez que l'application est accessible (https://calendar.gabrielrevest.software)

### Les événements ne se mettent pas à jour

1. Forcez une synchronisation manuelle
2. Vérifiez que les événements existent dans l'application web
3. Attendez quelques minutes (synchronisation automatique)

### Erreur "Impossible de se connecter"

1. Vérifiez que l'application est en ligne
2. Vérifiez que l'URL utilise HTTPS
3. Vérifiez que le token est valide

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez que l'application est déployée et accessible
2. Vérifiez les logs de l'application
3. Régénérez le token si nécessaire

## 🎉 C'est tout !

Votre calendrier est maintenant synchronisé avec votre iPhone. Les événements créés dans l'application web apparaîtront automatiquement dans l'application Calendrier de l'iPhone.

