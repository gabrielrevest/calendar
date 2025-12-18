# 🌐 Comment ajouter un domaine dans Clerk Dashboard

## 📍 Navigation dans Clerk

1. Aller sur https://dashboard.clerk.com
2. Sélectionner votre application
3. Dans le menu de gauche, aller dans **Developers** (section développeurs)
4. Cliquer sur **Domains**

## ➕ Ajouter un domaine personnalisé

### Option 1 : Domaine personnalisé (recommandé pour production)

1. Dans la page **Domains**, chercher un bouton **"Add domain"** ou **"Add custom domain"**
2. Entrer votre domaine : `calendar.gabrielrevest.software`
3. Clerk va vous donner des instructions DNS à configurer

**Note** : Clerk peut demander de configurer des enregistrements DNS spécifiques (CNAME ou TXT) pour vérifier la propriété du domaine.

### Option 2 : Utiliser le domaine Clerk par défaut (pour développement)

Si vous ne voyez pas l'option pour ajouter un domaine personnalisé, vous pouvez utiliser le domaine Clerk par défaut qui est déjà configuré :
- `modest-redbird-20.clerk.accounts.dev` (visible dans votre interface)

Dans ce cas, il faut configurer les **Paths** pour rediriger vers votre application.

## 🔧 Configuration des Paths (si pas de domaine personnalisé)

1. Dans le menu de gauche, aller dans **Developers** > **Paths**
2. Configurer :
   - **After sign-in URL** : `https://calendar.gabrielrevest.software/dashboard`
   - **After sign-up URL** : `https://calendar.gabrielrevest.software/dashboard`
   - **Sign-in URL** : `https://calendar.gabrielrevest.software/auth/signin`
   - **Sign-up URL** : `https://calendar.gabrielrevest.software/auth/signin`

## ⚠️ Important : Vérifier les clés API

Même sans domaine personnalisé, assurez-vous que les clés API dans votre `.env` correspondent bien à celles de Clerk :

1. Aller dans **Developers** > **API keys**
2. Vérifier que :
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` correspond à la **Publishable key**
   - `CLERK_SECRET_KEY` correspond à la **Secret key**

## 🔄 Alternative : Utiliser le domaine Clerk par défaut

Si vous ne pouvez pas ajouter un domaine personnalisé (plan gratuit), vous pouvez :

1. **Configurer les URLs de redirection** dans **Paths** pour pointer vers votre domaine
2. **Utiliser le domaine Clerk** pour l'authentification, mais rediriger vers votre application après

Clerk redirigera automatiquement vers votre application après l'authentification si les **Paths** sont bien configurés.

## ✅ Vérification

Après configuration, tester :
1. Ouvrir `https://calendar.gabrielrevest.software`
2. Cliquer sur "Sign in"
3. Vérifier que l'authentification fonctionne
4. Vérifier que la redirection vers `/dashboard` fonctionne après connexion

## 📝 Note

Si vous êtes sur le plan gratuit de Clerk, l'ajout de domaines personnalisés peut être limité. Dans ce cas, utilisez les **Paths** pour configurer les redirections vers votre domaine.

