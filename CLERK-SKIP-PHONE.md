# Comment désactiver la demande de numéro de téléphone dans Clerk

## 🔧 Configuration dans Clerk Dashboard

Le formulaire de continuation qui demande le numéro de téléphone peut être désactivé dans le dashboard Clerk :

### Étapes :

1. **Aller sur https://dashboard.clerk.com**
2. **Sélectionner votre application** (modest-redbird-20)
3. **Aller dans :** `User & Authentication` > `Email, Phone, Username`
4. **Dans la section "Phone number" :**
   - Décocher **"Require phone number"** pour le rendre optionnel
   - Ou désactiver complètement **"Enable phone number"** si vous ne voulez pas du tout cette fonctionnalité

### Alternative : Rendre le téléphone optionnel

Si vous voulez garder la possibilité d'ajouter un numéro mais ne pas le rendre obligatoire :

1. Dans `User & Authentication` > `Email, Phone, Username`
2. Cocher **"Enable phone number"**
3. **Décocher** **"Require phone number"**
4. Sauvegarder

## 📝 Configuration dans le code

J'ai déjà configuré :
- `afterSignInUrl="/dashboard"` - Redirection après connexion
- `afterSignUpUrl="/dashboard"` - Redirection après inscription
- `forceRedirectUrl="/dashboard"` - Force la redirection vers le dashboard

## ⚠️ Important

La page `/sign-up/continue` apparaît parce que Clerk détecte que certains champs optionnels ne sont pas remplis. Une fois que vous aurez désactivé le téléphone comme requis dans le dashboard, cette page ne s'affichera plus.

## 🚀 Après la configuration

1. Redémarrer le serveur : `npm run dev`
2. Tester la création d'un nouveau compte
3. Vous devriez être redirigé directement vers `/dashboard` sans la page de continuation

