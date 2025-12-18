# 🖥️ Commandes à exécuter sur le serveur DigitalOcean

## ⚠️ Problème détecté

Node.js 12 a été installé au lieu de Node.js 20. Il faut corriger cela.

## 🔧 Correction et installation complète

### 1. Désinstaller Node.js 12 et installer Node.js 20

```bash
# Désinstaller Node.js 12
apt remove -y nodejs npm

# Installer Node.js 20.x correctement
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Vérifier l'installation
node --version
npm --version
```

Vous devriez voir :
- `node --version` : v20.x.x
- `npm --version` : 10.x.x

### 2. Installer PM2

```bash
npm install -g pm2
```

### 3. Cloner le repository

```bash
cd /var/www
git clone https://github.com/gabrielrevest/calendar.git
cd calendar
```

### 4. Installer les dépendances

```bash
npm install
```

### 5. Configurer l'environnement

```bash
# Créer le fichier .env
nano .env
```

Coller ce contenu (remplacer avec vos vraies clés Clerk) :
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bW9kZXN0LXJlZGJpcmQtMjAuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_VFN0XYMl2fqTFRTrGYyUDDq5YVzObBsnNR5eF6LDYr

# Database
DATABASE_URL="file:./prisma/database.db"

# Next.js
NODE_ENV=production
PORT=3000
```

Sauvegarder : `Ctrl+O`, `Enter`, `Ctrl+X`

### 6. Générer Prisma et créer la base de données

```bash
npx prisma generate
npx prisma db push
```

### 7. Build l'application

```bash
npm run build
```

### 8. Configurer PM2

```bash
# Créer le fichier ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
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

### 9. Configurer Nginx

```bash
# Créer la configuration
cat > /etc/nginx/sites-available/calendar << 'EOF'
server {
    listen 80;
    server_name _;

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

# Tester et redémarrer
nginx -t
systemctl restart nginx
```

### 10. Configurer le firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 11. Vérifier que tout fonctionne

```bash
# Vérifier PM2
pm2 status

# Vérifier Nginx
systemctl status nginx

# Voir les logs
pm2 logs calendar-app
```

### 12. Accéder à l'application

Ouvrir dans le navigateur : `http://VOTRE_IP_DROPLET`

## 🔍 Commandes utiles

```bash
# Voir les logs en temps réel
pm2 logs calendar-app

# Redémarrer l'application
pm2 restart calendar-app

# Arrêter l'application
pm2 stop calendar-app

# Mettre à jour le code
cd /var/www/calendar
git pull
npm install
npm run build
pm2 restart calendar-app
```

## ⚠️ Si vous avez des erreurs

```bash
# Vérifier les logs
pm2 logs calendar-app --lines 50

# Vérifier que le port 3000 est utilisé
netstat -tulpn | grep 3000

# Vérifier Nginx
nginx -t
systemctl status nginx
```

