# 🔧 Configuration des Paths dans Clerk Dashboard

## 📍 Navigation

1. Aller sur https://dashboard.clerk.com
2. Sélectionner votre application
3. **Developers** > **Paths**

## ⚙️ Configuration des Paths

### 1. Development host

**Fallback development host** :
```
https://calendar.gabrielrevest.software
```

⚠️ **Note** : Même si c'est appelé "development host", c'est utilisé comme fallback pour la production aussi.

### 2. Application paths

**Home URL** :
```
/dashboard
```
ou laisser vide si votre homepage est à la racine `/`

**Unauthorized sign in URL** (optionnel) :
```
/auth/signin
```
ou laisser vide

### 3. Component paths

#### SignIn (<SignIn />)

**Sign-in page on development host** :
```
/auth/signin
```

#### SignUp (<SignUp />)

**Sign-up page on development host** :
```
/auth/signin
```
(ou `/auth/signup` si vous avez une page séparée)

#### Signing Out

**Page on development host** (après déconnexion) :
```
/auth/signin
```

## 📝 Résumé de la configuration

```
Development host:
  Fallback development host: https://calendar.gabrielrevest.software

Application paths:
  Home URL: /dashboard
  Unauthorized sign in URL: /auth/signin (optionnel)

Component paths:
  SignIn - Sign-in page on development host: /auth/signin
  SignUp - Sign-up page on development host: /auth/signin
  Signing Out - Page on development host: /auth/signin
```

## ✅ Vérification

Après avoir sauvegardé ces configurations :

1. Ouvrir `https://calendar.gabrielrevest.software`
2. Cliquer sur "Sign in"
3. Vérifier que vous êtes redirigé vers `/auth/signin`
4. Après connexion, vérifier que vous êtes redirigé vers `/dashboard`

## 🔄 Si vous avez plusieurs environnements

Si vous avez un environnement de développement local ET production :

- **Development host** : `http://localhost:3000` (pour le dev local)
- **Fallback development host** : `https://calendar.gabrielrevest.software` (pour la production)

Clerk utilisera automatiquement le bon host selon le contexte.

## ⚠️ Important

Assurez-vous que :
- Les chemins correspondent à vos routes Next.js (`/auth/signin`, `/dashboard`)
- Le fallback development host utilise `https://` (pas `http://`)
- Tous les chemins commencent par `/` (chemins relatifs)

