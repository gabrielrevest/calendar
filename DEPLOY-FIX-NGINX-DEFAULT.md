# 🔧 Correction : Page par défaut Nginx au lieu de l'application

## ⚠️ Problème

Vous voyez la page "Welcome to nginx!" au lieu de votre application.

Cela signifie que Nginx n'est pas encore configuré pour servir votre application.

## ✅ Solutions

### Solution 1 : Configurer Nginx manuellement (avant SSL)

Si vous n'avez pas encore installé le certificat SSL, configurez Nginx pour HTTP :

```bash
# Créer la configuration
cat > /etc/nginx/sites-available/calendar << 'EOF'
server {
    listen 80;
    server_name calendar.gabrielrevest.software;

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

### Solution 2 : Utiliser Certbot (recommandé - configure automatiquement)

Si vous voulez HTTPS directement :

```bash
# Installer Certbot (si pas déjà fait)
apt install -y certbot python3-certbot-nginx

# Obtenir le certificat SSL (Certbot configurera Nginx automatiquement)
certbot --nginx -d calendar.gabrielrevest.software
```

Certbot va :
- Obtenir le certificat SSL
- Configurer automatiquement Nginx pour HTTPS
- Rediriger HTTP vers HTTPS

### Solution 3 : Vérifier la configuration actuelle

```bash
# Voir les sites activés
ls -la /etc/nginx/sites-enabled/

# Voir la configuration actuelle
cat /etc/nginx/sites-available/calendar

# Vérifier que le site est activé
nginx -t
```

## 🔍 Vérifications

### 1. Vérifier que PM2 tourne

```bash
pm2 status
```

L'application doit être `online` sur le port 3000.

### 2. Vérifier que le port 3000 écoute

```bash
netstat -tulpn | grep :3000
```

Vous devriez voir quelque chose comme :
```
tcp        0      0 127.0.0.1:3000          0.0.0.0:*               LISTEN      12007/node
```

### 3. Tester l'application directement

```bash
curl http://localhost:3000
```

Si cela fonctionne, l'application tourne bien. Le problème est dans la configuration Nginx.

### 4. Vérifier les logs Nginx

```bash
# Logs d'erreur
tail -f /var/log/nginx/error.log

# Logs d'accès
tail -f /var/log/nginx/access.log
```

## 🚀 Commandes complètes (copier-coller)

```bash
# 1. Créer la configuration Nginx
cat > /etc/nginx/sites-available/calendar << 'EOF'
server {
    listen 80;
    server_name calendar.gabrielrevest.software;

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

# 2. Activer le site
ln -s /etc/nginx/sites-available/calendar /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 3. Tester et redémarrer
nginx -t
systemctl restart nginx

# 4. Vérifier
curl -I http://calendar.gabrielrevest.software
```

## 📝 Après la configuration

Une fois que HTTP fonctionne, vous pouvez installer le certificat SSL :

```bash
certbot --nginx -d calendar.gabrielrevest.software
```

Cela ajoutera automatiquement la configuration HTTPS.

## ✅ Checklist

- [ ] Configuration Nginx créée dans `/etc/nginx/sites-available/calendar`
- [ ] Site activé (lien symbolique dans `/etc/nginx/sites-enabled/`)
- [ ] Site par défaut désactivé
- [ ] `nginx -t` ne montre pas d'erreurs
- [ ] Nginx redémarré
- [ ] PM2 tourne et l'application écoute sur le port 3000
- [ ] `curl http://localhost:3000` fonctionne
- [ ] `curl http://calendar.gabrielrevest.software` fonctionne

