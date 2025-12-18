# 🚀 Configuration PM2 et Nginx

## ✅ Build terminé avec succès !

L'application est maintenant buildée. Il reste à configurer PM2 et Nginx.

## 📋 Commandes à exécuter

### 1. Installer PM2 (si pas déjà fait)

```bash
npm install -g pm2
```

### 2. Créer le fichier ecosystem.config.js

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
```

### 3. Démarrer l'application avec PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Le dernier (`pm2 startup`) vous demandera de copier-coller une commande. Exécutez-la.

### 4. Vérifier que l'application tourne

```bash
pm2 status
pm2 logs calendar-app --lines 20
```

Vous devriez voir l'application démarrée et les logs.

### 5. Configurer Nginx

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

# Activer le site
ln -s /etc/nginx/sites-available/calendar /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Tester la configuration
nginx -t

# Redémarrer Nginx
systemctl restart nginx
```

### 6. Configurer le firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 7. Vérifier que tout fonctionne

```bash
# Vérifier PM2
pm2 status

# Vérifier Nginx
systemctl status nginx

# Vérifier que le port 3000 écoute
netstat -tulpn | grep 3000
```

### 8. Accéder à l'application

Ouvrir dans le navigateur : `http://VOTRE_IP_DROPLET`

Remplacez `VOTRE_IP_DROPLET` par l'IP de votre serveur DigitalOcean.

## 🔍 Commandes utiles

```bash
# Voir les logs en temps réel
pm2 logs calendar-app

# Redémarrer l'application
pm2 restart calendar-app

# Arrêter l'application
pm2 stop calendar-app

# Voir les logs Nginx
tail -f /var/log/nginx/error.log
```

## ⚠️ En cas d'erreur

Si l'application ne démarre pas :

```bash
# Voir les logs détaillés
pm2 logs calendar-app --lines 50

# Vérifier les erreurs
pm2 logs calendar-app --err

# Vérifier que le port 3000 est libre
netstat -tulpn | grep 3000
```

## 🎉 Après le déploiement

1. **Mettre à jour Clerk Dashboard** :
   - Aller sur https://dashboard.clerk.com
   - **Settings** > **Domains**
   - Ajouter votre IP ou domaine
   - Mettre à jour les URLs de redirection :
     - `afterSignInUrl`: `http://VOTRE_IP/dashboard`
     - `afterSignUpUrl`: `http://VOTRE_IP/dashboard`

2. **Tester l'application** :
   - Ouvrir `http://VOTRE_IP` dans le navigateur
   - Créer un compte
   - Vérifier que tout fonctionne

