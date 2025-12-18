# 🔧 Correction erreur 401 sur /api/calendar/token

## ⚠️ Problèmes

1. **401 Unauthorized** sur `/api/calendar/token`
2. **MissingSecret** pour NextAuth
3. Le lien de synchronisation ne s'affiche pas

## ✅ Solutions

### 1. Ajouter NEXTAUTH_SECRET dans .env

```bash
cd /var/www/calendar
nano .env
```

Ajouter cette ligne :
```env
NEXTAUTH_SECRET=change-me-in-production-secret-key-here
```

Ou générer un secret aléatoire :
```bash
openssl rand -base64 32
```

Puis l'ajouter dans `.env` :
```env
NEXTAUTH_SECRET=<le-secret-genere>
```

### 2. Vérifier que les clés Clerk sont correctes

```bash
cat .env | grep CLERK
```

Doit contenir :
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 3. Redémarrer PM2 avec --update-env

**IMPORTANT** : Utiliser `--update-env` pour charger les nouvelles variables d'environnement depuis `.env` :

```bash
pm2 stop calendar-app
pm2 delete calendar-app
pm2 start ecosystem.config.js --update-env
pm2 save
```

### 4. Vérifier que l'application fonctionne

```bash
# Vérifier les logs
pm2 logs calendar-app --lines 30

# Tester l'endpoint (depuis le serveur, devrait retourner 401 car pas de session)
curl http://localhost:3000/api/calendar/token
```

### 5. Vérifier dans le navigateur

1. Ouvrir `https://calendar.gabrielrevest.software/settings/sync`
2. Vérifier la console du navigateur (F12)
3. Le lien devrait s'afficher si l'authentification Clerk fonctionne

## 🔍 Si ça ne fonctionne toujours pas

### Vérifier que Clerk fonctionne

```bash
# Vérifier les logs pour les erreurs Clerk
pm2 logs calendar-app --err --lines 50 | grep -i clerk
```

### Vérifier que l'utilisateur est bien authentifié

Dans la console du navigateur, vérifier :
- Les cookies Clerk sont présents
- Pas d'erreurs de redirection infinie
- L'utilisateur est bien connecté

### Tester l'authentification directement

Ouvrir dans le navigateur :
- `https://calendar.gabrielrevest.software/dashboard` (doit fonctionner si connecté)
- `https://calendar.gabrielrevest.software/api/calendar/token` (doit retourner 401 si pas connecté, ou JSON avec token si connecté)

## 📝 Note importante

Le problème peut venir du fait que :
1. Les variables d'environnement ne sont pas chargées correctement par PM2
2. Clerk n'est pas configuré correctement dans le Dashboard
3. Le middleware Clerk bloque l'accès à l'API

Vérifier que le middleware Clerk autorise l'accès à `/api/calendar/token` pour les utilisateurs authentifiés.

