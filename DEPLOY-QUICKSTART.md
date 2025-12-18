# 🚀 Déploiement Rapide sur DigitalOcean

## ✅ Prérequis

1. **Compte DigitalOcean** : https://www.digitalocean.com
2. **GitHub Repository** : Le code est déjà sur GitHub
3. **Clerk Dashboard** : Configuré avec les clés API

## 📋 Étapes de Déploiement

### 1. Créer un Droplet sur DigitalOcean

1. Aller sur https://cloud.digitalocean.com/droplets/new
2. Choisir :
   - **Image** : Ubuntu 22.04 LTS
   - **Plan** : **$24/mo - 4 GB / 2 CPUs, 80 GB SSD** (recommandé pour production)
     - Alternative : $12/mo - 2 GB / 1 CPU (pour tester, peut être limite)
   - **Datacenter** : Choisir le plus proche (Paris, Amsterdam, etc.)
   - **Authentication** : SSH keys (recommandé) ou Password
3. Cliquer sur **Create Droplet**

### 2. Se connecter au serveur

```bash
ssh root@VOTRE_IP_DROPLET
```

### 3. Installer les dépendances

```bash
# Mettre à jour le système
apt update && apt upgrade -y

# Installer Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Installer PM2 (gestionnaire de processus)
npm install -g pm2

# Installer Git
apt install -y git

# Installer Nginx
apt install -y nginx
```

### 4. Cloner le repository

```bash
cd /var/www
git clone https://github.com/gabrielrevest/calendar.git
cd calendar
```

### 5. Configurer l'environnement

```bash
# Créer le fichier .env
nano .env
```

Ajouter :
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bW9kZXN0LXJlZGJpcmQtMjAuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_VFN0XYMl2fqTFRTrGYyUDDq5YVzObBsnNR5eF6LDYr

# Database
DATABASE_URL="file:./prisma/database.db"

# Next.js
NODE_ENV=production
PORT=3000
```

### 6. Installer les dépendances et build

```bash
npm install
npx prisma generate
npx prisma db push
npm run build
```

### 7. Configurer PM2

```bash
# Créer le fichier ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'calendar-app',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/calendar',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Démarrer l'application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 8. Configurer Nginx

```bash
# Créer la configuration Nginx
cat > /etc/nginx/sites-available/calendar << EOF
server {
    listen 80;
    server_name VOTRE_DOMAINE_OU_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Activer le site
ln -s /etc/nginx/sites-available/calendar /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Tester et redémarrer Nginx
nginx -t
systemctl restart nginx
```

### 9. Configurer le firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 10. Mettre à jour Clerk avec l'URL de production

1. Aller sur https://dashboard.clerk.com
2. **Settings** > **Domains**
3. Ajouter votre domaine ou IP
4. Mettre à jour les URLs de redirection :
   - `afterSignInUrl`: `http://VOTRE_IP/dashboard`
   - `afterSignUpUrl`: `http://VOTRE_IP/dashboard`

## 🔒 Sécurité (Optionnel mais recommandé)

### SSL avec Let's Encrypt

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d VOTRE_DOMAINE
```

## 📝 Commandes utiles

```bash
# Voir les logs
pm2 logs calendar-app

# Redémarrer l'application
pm2 restart calendar-app

# Mettre à jour le code
cd /var/www/calendar
git pull
npm install
npm run build
pm2 restart calendar-app
```

## ⚠️ Notes importantes

- Remplacez `VOTRE_IP` ou `VOTRE_DOMAINE` par votre IP ou domaine
- Pour un domaine, configurez un DNS A record pointant vers l'IP du droplet
- Les clés Clerk doivent être mises à jour dans le dashboard pour la production
- La base de données SQLite est locale au serveur

