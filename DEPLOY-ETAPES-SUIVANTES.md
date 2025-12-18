# 🚀 Étapes suivantes pour le déploiement

## ✅ Étape 1 : Node.js installé

Node.js 20.19.6 et npm 10.8.2 sont maintenant installés. Continuez avec :

## 📋 Commandes à exécuter (dans l'ordre)

### 1. Installer PM2

```bash
npm install -g pm2
```

### 2. Cloner le repository

```bash
cd /var/www
git clone https://github.com/gabrielrevest/calendar.git
cd calendar
```

### 3. Installer les dépendances

```bash
npm install
```

Cela peut prendre quelques minutes.

### 4. Créer le fichier .env

```bash
nano .env
```

Coller ce contenu (appuyer sur `Shift+Insert` pour coller dans nano) :

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bW9kZXN0LXJlZGJpcmQtMjAuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_VFN0XYMl2fqTFRTrGYyUDDq5YVzObBsnNR5eF6LDYr
DATABASE_URL="file:./prisma/database.db"
NODE_ENV=production
PORT=3000
```

Sauvegarder : `Ctrl+O`, `Enter`, puis `Ctrl+X` pour quitter.

### 5. Générer Prisma et créer la base de données

```bash
npx prisma generate
npx prisma db push
```

### 6. Build l'application

```bash
npm run build
```

Cela peut prendre 2-5 minutes.

### 7. Configurer PM2

```bash
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

pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 8. Configurer Nginx

```bash
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

ln -s /etc/nginx/sites-available/calendar /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
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

### 10. Vérifier que tout fonctionne

```bash
# Vérifier PM2
pm2 status

# Vérifier Nginx
systemctl status nginx

# Voir les logs
pm2 logs calendar-app --lines 20
```

### 11. Accéder à l'application

Ouvrir dans le navigateur : `http://VOTRE_IP_DROPLET`

## 🔍 En cas d'erreur

```bash
# Voir les logs détaillés
pm2 logs calendar-app --lines 50

# Vérifier que le port 3000 écoute
netstat -tulpn | grep 3000

# Redémarrer l'application
pm2 restart calendar-app
```

## 📝 Notes importantes

- Remplacez `VOTRE_IP_DROPLET` par l'IP de votre serveur DigitalOcean
- Le build peut prendre quelques minutes
- Si vous avez des erreurs, vérifiez les logs avec `pm2 logs calendar-app`

