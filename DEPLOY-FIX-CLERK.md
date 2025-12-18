# 🔧 Correction de l'erreur Clerk (boucle de redirection)

## ⚠️ Problème

```
Clerk: Refreshing the session token resulted in an infinite redirect loop.
This usually means that your Clerk instance keys do not match
```

## ✅ Solutions

### 1. Vérifier le fichier .env sur le serveur

```bash
cd /var/www/calendar
cat .env
```

Vérifiez que les clés sont correctes :
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bW9kZXN0LXJlZGJpcmQtMjAuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_VFN0XYMl2fqTFRTrGYyUDDq5YVzObBsnNR5eF6LDYr
DATABASE_URL="file:./prisma/database.db"
NODE_ENV=production
PORT=3000
```

### 2. Redémarrer PM2 avec les variables d'environnement

```bash
# Arrêter PM2
pm2 stop calendar-app
pm2 delete calendar-app

# Redémarrer avec le fichier .env chargé
cd /var/www/calendar
pm2 start ecosystem.config.js --update-env
pm2 save
```

### 3. Configurer Clerk Dashboard

**IMPORTANT** : Il faut configurer Clerk pour accepter votre IP serveur.

1. Aller sur https://dashboard.clerk.com
2. Sélectionner votre application
3. Aller dans **Settings** > **Domains**
4. Ajouter votre IP serveur (ex: `157.245.69.178`) ou un domaine si vous en avez un
5. Aller dans **Settings** > **Paths**
6. Vérifier/Configurer :
   - **Sign-in URL**: `/auth/signin`
   - **Sign-up URL**: `/auth/signin`
   - **After sign-in URL**: `http://157.245.69.178/dashboard`
   - **After sign-up URL**: `http://157.245.69.178/dashboard`

### 4. Alternative : Utiliser dotenv dans ecosystem.config.js

Si PM2 ne charge pas automatiquement le .env, modifier `ecosystem.config.js` :

```bash
cd /var/www/calendar
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'calendar-app',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/calendar',
    instances: 1,
    exec_mode: 'fork',
    env_file: '/var/www/calendar/.env',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
}
EOF
```

Puis redémarrer :
```bash
pm2 stop calendar-app
pm2 delete calendar-app
pm2 start ecosystem.config.js
pm2 save
```

### 5. Vérifier les logs

```bash
pm2 logs calendar-app --lines 50
```

L'erreur Clerk devrait disparaître.

## 🔍 Vérification

1. **Vérifier que les variables sont chargées** :
```bash
pm2 env 0
```

2. **Tester l'application** :
```bash
curl http://localhost:3000
```

3. **Vérifier dans le navigateur** :
Ouvrir `http://VOTRE_IP` et vérifier qu'il n'y a plus de boucle de redirection.

## ⚠️ Si le problème persiste

1. **Vérifier les clés Clerk** :
   - Aller sur https://dashboard.clerk.com
   - **API Keys** > Vérifier que les clés correspondent

2. **Vérifier le domaine dans Clerk** :
   - Le domaine/IP doit être ajouté dans **Settings** > **Domains**

3. **Vérifier les URLs de redirection** :
   - Dans Clerk Dashboard > **Settings** > **Paths**
   - Les URLs doivent correspondre à votre serveur

4. **Redémarrer complètement** :
```bash
pm2 stop all
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

