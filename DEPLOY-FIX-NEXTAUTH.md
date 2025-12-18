# 🔧 Correction de l'erreur UntrustedHost (NextAuth)

## ⚠️ Problème

```
UntrustedHost: Host must be trusted. URL was: http://157.245.69.178:3000/api/auth/session
```

## 🔍 Analyse

Cette erreur indique que NextAuth est encore utilisé quelque part dans le code, alors que nous avons migré vers Clerk. Il faut soit :
1. Désactiver complètement NextAuth
2. Ou configurer NextAuth pour accepter le host

## ✅ Solutions

### Solution 1 : Désactiver NextAuth (recommandé)

Si vous utilisez uniquement Clerk, vous pouvez désactiver NextAuth en ajoutant dans `.env` :

```bash
# Désactiver NextAuth
NEXTAUTH_URL=""
AUTH_URL=""
```

### Solution 2 : Configurer NextAuth pour accepter le host

Si NextAuth est encore nécessaire, ajouter dans `.env` :

```bash
AUTH_URL="http://157.245.69.178"
AUTH_TRUST_HOST=true
NEXTAUTH_URL="http://157.245.69.178"
NEXTAUTH_SECRET="votre-secret-ici"
```

### Solution 3 : Vérifier et supprimer les routes NextAuth inutilisées

Vérifier si `/api/auth/[...nextauth]` est encore utilisé :

```bash
# Sur le serveur
grep -r "next-auth" /var/www/calendar/src
grep -r "useSession" /var/www/calendar/src
grep -r "getSession" /var/www/calendar/src
```

Si ces routes ne sont plus utilisées, vous pouvez les supprimer ou les désactiver.

### Solution 4 : Mettre à jour ecosystem.config.js

Ajouter les variables d'environnement dans `ecosystem.config.js` :

```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3000,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_...',
  CLERK_SECRET_KEY: 'sk_test_...',
  DATABASE_URL: 'file:./prisma/database.db',
  // Désactiver NextAuth
  AUTH_URL: '',
  AUTH_TRUST_HOST: 'true',
  NEXTAUTH_URL: ''
}
```

## 🔄 Redémarrer l'application

```bash
pm2 stop calendar-app
pm2 delete calendar-app
pm2 start ecosystem.config.js
pm2 save
pm2 logs calendar-app --lines 50
```

## 🔍 Vérification

Vérifier que l'erreur `UntrustedHost` a disparu :

```bash
pm2 logs calendar-app --err --lines 20
```

## 📝 Note

Si vous utilisez uniquement Clerk, il est recommandé de :
1. Supprimer les routes NextAuth inutilisées
2. Supprimer les imports NextAuth du code
3. S'assurer que toutes les pages utilisent Clerk

