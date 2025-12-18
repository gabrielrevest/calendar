# 🔧 Correction de la configuration Nginx après Certbot

## ✅ Certificat SSL obtenu avec succès !

Certbot a installé le certificat SSL, mais il a configuré le site par défaut. Il faut s'assurer que Nginx pointe vers votre application.

## 🔍 Vérifier la configuration actuelle

```bash
# Voir la configuration créée par Certbot
cat /etc/nginx/sites-enabled/default
```

Certbot a probablement créé une configuration HTTPS, mais elle pointe peut-être vers la page par défaut de Nginx au lieu de votre application.

## ✅ Solution : Configurer Nginx pour pointer vers l'application

### Option 1 : Modifier le fichier default (si Certbot l'a configuré)

```bash
cat > /etc/nginx/sites-enabled/default << 'EOF'
server {
    listen 80;
    server_name calendar.gabrielrevest.software;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name calendar.gabrielrevest.software;

    ssl_certificate /etc/letsencrypt/live/calendar.gabrielrevest.software/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/calendar.gabrielrevest.software/privkey.pem;
    
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
```

### Option 2 : Créer un fichier dédié (recommandé)

```bash
# Créer la configuration pour calendar
cat > /etc/nginx/sites-available/calendar << 'EOF'
server {
    listen 80;
    server_name calendar.gabrielrevest.software;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name calendar.gabrielrevest.software;

    ssl_certificate /etc/letsencrypt/live/calendar.gabrielrevest.software/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/calendar.gabrielrevest.software/privkey.pem;
    
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Activer le site
ln -s /etc/nginx/sites-available/calendar /etc/nginx/sites-enabled/

# Désactiver le site par défaut
rm -f /etc/nginx/sites-enabled/default

# Tester la configuration
nginx -t

# Redémarrer Nginx
systemctl restart nginx
```

## 🔄 Mettre à jour ecosystem.config.js avec HTTPS

```bash
cd /var/www/calendar
nano ecosystem.config.js
```

Mettre à jour les variables d'environnement :

```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3000,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_bW9kZXN0LXJlZGJpcmQtMjAuY2xlcmsuYWNjb3VudHMuZGV2JA',
  CLERK_SECRET_KEY: 'sk_test_VFN0XYMl2fqTFRTrGYyUDDq5YVzObBsnNR5eF6LDYr',
  DATABASE_URL: 'file:./prisma/database.db',
  // URLs HTTPS
  AUTH_URL: 'https://calendar.gabrielrevest.software',
  AUTH_TRUST_HOST: 'true',
  NEXTAUTH_URL: 'https://calendar.gabrielrevest.software'
}
```

Sauvegarder : `Ctrl+O`, `Enter`, puis `Ctrl+X`

Redémarrer PM2 :

```bash
pm2 stop calendar-app
pm2 delete calendar-app
pm2 start ecosystem.config.js
pm2 save
pm2 logs calendar-app --lines 20
```

## 🎯 Configurer Clerk Dashboard

1. Aller sur https://dashboard.clerk.com
2. Sélectionner votre application
3. **Settings** > **Domains** :
   - Cliquer sur **Add domain**
   - Entrer : `calendar.gabrielrevest.software`
   - Sauvegarder
4. **Settings** > **Paths** :
   - **After sign-in URL** : `https://calendar.gabrielrevest.software/dashboard`
   - **After sign-up URL** : `https://calendar.gabrielrevest.software/dashboard`
   - Sauvegarder

## ✅ Vérifications

```bash
# Vérifier que Nginx écoute sur HTTPS
netstat -tulpn | grep :443

# Tester HTTPS
curl -I https://calendar.gabrielrevest.software

# Vérifier que l'application répond
curl http://localhost:3000

# Vérifier les logs PM2
pm2 logs calendar-app --lines 20
```

## 🎉 Résultat attendu

- ✅ HTTPS fonctionne (cadenas vert dans le navigateur)
- ✅ L'application se charge correctement
- ✅ Plus d'erreurs Clerk
- ✅ Plus d'erreurs UntrustedHost

Ouvrir dans le navigateur : **https://calendar.gabrielrevest.software**

