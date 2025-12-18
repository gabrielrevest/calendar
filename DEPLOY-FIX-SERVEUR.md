# 🔧 Corrections à faire sur le serveur

## ⚠️ Problèmes détectés

1. **Conflit Git** : `ecosystem.config.js` existe déjà sur le serveur
2. **Lien manquant** : La page de synchronisation ne charge pas le lien
3. **Erreurs NextAuth** : `MissingSecret` (mais on utilise Clerk maintenant)

## ✅ Solutions

### 1. Résoudre le conflit Git

```bash
cd /var/www/calendar

# Sauvegarder le fichier local
cp ecosystem.config.js ecosystem.config.js.backup

# Supprimer le fichier local (il sera recréé depuis git)
rm ecosystem.config.js

# Faire le pull
git pull

# Si besoin, restaurer les modifications locales
# (mais normalement le fichier dans git devrait être bon)
```

### 2. Vérifier que le fichier .env contient les bonnes variables

```bash
cat .env
```

Doit contenir au minimum :
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
DATABASE_URL="file:./prisma/database.db"
NODE_ENV=production
PORT=3000
AUTH_URL=https://calendar.gabrielrevest.software
AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://calendar.gabrielrevest.software
```

### 3. Redémarrer PM2 avec les nouvelles variables

```bash
pm2 stop calendar-app
pm2 delete calendar-app
pm2 start ecosystem.config.js
pm2 save
pm2 logs calendar-app --lines 20
```

### 4. Vérifier que l'application fonctionne

```bash
# Tester l'endpoint de token
curl http://localhost:3000/api/calendar/token

# Devrait retourner un JSON avec un token
```

## 🔍 Si le lien ne s'affiche toujours pas

Vérifier les logs pour voir s'il y a des erreurs :

```bash
pm2 logs calendar-app --err --lines 50
```

Vérifier que l'endpoint `/api/calendar/token` fonctionne en accédant directement à :
`https://calendar.gabrielrevest.software/api/calendar/token`

Si cela retourne une erreur 401, c'est que l'authentification Clerk ne fonctionne pas correctement.

