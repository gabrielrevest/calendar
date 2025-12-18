# 🌐 Configuration d'un sous-domaine pour l'application

## 📋 Prérequis

- Nom de domaine : `gabrielrevest.software`
- IP du serveur : `157.245.69.178`
- Accès au panneau DNS de votre domaine

## 🎯 Étape 1 : Choisir le sous-domaine

Suggestions :
- `calendar.gabrielrevest.software`
- `app.gabrielrevest.software`
- `cal.gabrielrevest.software`

**Exemple utilisé dans ce guide : `calendar.gabrielrevest.software`**

## 🔧 Étape 2 : Configurer le DNS

### Option A : Si vous utilisez DigitalOcean DNS

1. Aller sur https://cloud.digitalocean.com/networking/domains
2. Sélectionner `gabrielrevest.software`
3. Ajouter un enregistrement A :
   - **Type** : `A`
   - **Hostname** : `calendar` (ou le nom de votre choix)
   - **Will direct to** : `157.245.69.178`
   - **TTL** : `3600` (ou laisser par défaut)
4. Cliquer sur **Create Record**

### Option B : Si vous utilisez un autre fournisseur DNS

1. Se connecter au panneau DNS de votre fournisseur
2. Ajouter un enregistrement A :
   - **Type** : `A`
   - **Nom/Host** : `calendar` (ou le nom de votre choix)
   - **Valeur/Point vers** : `157.245.69.178`
   - **TTL** : `3600` (ou laisser par défaut)
3. Sauvegarder

### Vérifier la propagation DNS

Attendre 5-10 minutes, puis vérifier :

```bash
# Sur votre machine locale
nslookup calendar.gabrielrevest.software

# Ou
dig calendar.gabrielrevest.software

# Doit retourner : 157.245.69.178
```

## 🔒 Étape 3 : Installer Certbot et obtenir le certificat SSL

```bash
# Installer Certbot
apt update
apt install -y certbot python3-certbot-nginx

# Obtenir le certificat SSL pour le sous-domaine
certbot --nginx -d calendar.gabrielrevest.software

# Certbot va vous demander :
# - Email (pour notifications de renouvellement)
# - Accepter les termes (A)
# - Partager l'email avec EFF (optionnel, Y ou N)
# - Redirection HTTP vers HTTPS (2 - Redirect)
```

Certbot va automatiquement :
- Obtenir le certificat SSL
- Configurer Nginx pour HTTPS
- Configurer le renouvellement automatique

## ⚙️ Étape 4 : Vérifier la configuration Nginx

Certbot a dû créer/modifier `/etc/nginx/sites-available/calendar`. Vérifier :

```bash
cat /etc/nginx/sites-available/calendar
```

La configuration devrait ressembler à :

```nginx
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
    
    # Configuration SSL recommandée (ajoutée par Certbot)
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
```

Si la configuration n'est pas correcte, la créer manuellement :

```bash
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
rm -f /etc/nginx/sites-enabled/default

# Tester la configuration
nginx -t

# Redémarrer Nginx
systemctl restart nginx
```

## 🔄 Étape 5 : Mettre à jour ecosystem.config.js avec HTTPS

```bash
cd /var/www/calendar
nano ecosystem.config.js
```

Mettre à jour les variables d'environnement :

```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3000,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_...',
  CLERK_SECRET_KEY: 'sk_test_...',
  DATABASE_URL: 'file:./prisma/database.db',
  // Mettre à jour avec HTTPS
  AUTH_URL: 'https://calendar.gabrielrevest.software',
  AUTH_TRUST_HOST: 'true',
  NEXTAUTH_URL: 'https://calendar.gabrielrevest.software'
}
```

Redémarrer PM2 :

```bash
pm2 stop calendar-app
pm2 delete calendar-app
pm2 start ecosystem.config.js
pm2 save
```

## 🎯 Étape 6 : Configurer Clerk Dashboard

1. Aller sur https://dashboard.clerk.com
2. Sélectionner votre application
3. **Settings** > **Domains** :
   - Ajouter : `calendar.gabrielrevest.software`
4. **Settings** > **Paths** :
   - **After sign-in URL** : `https://calendar.gabrielrevest.software/dashboard`
   - **After sign-up URL** : `https://calendar.gabrielrevest.software/dashboard`
5. Sauvegarder

## 🔥 Étape 7 : Configurer le firewall

```bash
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

## ✅ Étape 8 : Vérifier que tout fonctionne

1. **Vérifier le DNS** :
   ```bash
   nslookup calendar.gabrielrevest.software
   ```

2. **Tester HTTPS** :
   ```bash
   curl -I https://calendar.gabrielrevest.software
   ```

3. **Vérifier le certificat** :
   ```bash
   openssl s_client -connect calendar.gabrielrevest.software:443 -servername calendar.gabrielrevest.software
   ```

4. **Ouvrir dans le navigateur** :
   - Aller sur `https://calendar.gabrielrevest.software`
   - Vérifier que le cadenas vert apparaît
   - Tester la connexion

## 🔄 Renouvellement automatique du certificat

Certbot configure automatiquement le renouvellement. Vérifier :

```bash
# Tester le renouvellement
certbot renew --dry-run

# Vérifier le timer
systemctl status certbot.timer
```

Le certificat sera automatiquement renouvelé avant expiration (tous les 90 jours).

## 🎉 C'est terminé !

Votre application est maintenant accessible sur :
**https://calendar.gabrielrevest.software**

## 📝 Notes importantes

- Le certificat SSL est valide pour 90 jours et se renouvelle automatiquement
- Si vous changez l'IP du serveur, mettre à jour l'enregistrement DNS A
- Les changements DNS peuvent prendre jusqu'à 48h pour se propager (généralement 5-10 minutes)

