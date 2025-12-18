# 🔒 Installation du certificat SSL avec Let's Encrypt (Certbot)

## 📋 Prérequis

- Un domaine pointant vers votre IP serveur (ou utiliser l'IP directement)
- Nginx installé et configuré
- Port 80 ouvert dans le firewall

## 🚀 Installation de Certbot

### 1. Installer Certbot

```bash
apt update
apt install -y certbot python3-certbot-nginx
```

### 2. Obtenir un certificat SSL

**Option A : Avec un domaine**
```bash
certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

**Option B : Sans domaine (IP uniquement)**
⚠️ Let's Encrypt ne peut pas émettre de certificat pour une IP seule. Vous avez deux options :

1. **Utiliser un domaine gratuit** (recommandé) :
   - Utiliser un service comme DuckDNS, No-IP, ou Freenom
   - Ou acheter un domaine (environ 10€/an)

2. **Utiliser un certificat auto-signé** (pour le développement uniquement) :
   ```bash
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout /etc/nginx/ssl/nginx-selfsigned.key \
     -out /etc/nginx/ssl/nginx-selfsigned.crt \
     -subj "/CN=157.245.69.178"
   ```

## 🔧 Configuration Nginx avec SSL

### Avec Certbot (recommandé)

Certbot va automatiquement modifier votre configuration Nginx. Vérifiez après :

```bash
cat /etc/nginx/sites-available/calendar
```

### Configuration manuelle (si nécessaire)

```bash
cat > /etc/nginx/sites-available/calendar << 'EOF'
server {
    listen 80;
    server_name 157.245.69.178;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name 157.245.69.178;

    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;
    
    # Configuration SSL recommandée
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

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

# Tester la configuration
nginx -t

# Redémarrer Nginx
systemctl restart nginx
```

## 🔄 Renouvellement automatique

Certbot configure automatiquement le renouvellement. Vérifier :

```bash
# Tester le renouvellement
certbot renew --dry-run

# Vérifier le timer systemd
systemctl status certbot.timer
```

## 🔥 Configuration du firewall

```bash
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

## ✅ Vérification

1. **Tester HTTPS** :
   ```bash
   curl -I https://votre-domaine.com
   ```

2. **Vérifier le certificat** :
   ```bash
   openssl s_client -connect votre-domaine.com:443 -servername votre-domaine.com
   ```

## 🎯 Mise à jour de Clerk avec HTTPS

Une fois le SSL configuré, mettre à jour Clerk Dashboard :

1. Aller sur https://dashboard.clerk.com
2. **Settings** > **Domains** : Ajouter votre domaine HTTPS
3. **Settings** > **Paths** :
   - After sign-in URL : `https://votre-domaine.com/dashboard`
   - After sign-up URL : `https://votre-domaine.com/dashboard`

## ⚠️ Note importante

Si vous n'avez pas de domaine, vous pouvez :
1. Utiliser un service gratuit (DuckDNS, No-IP)
2. Acheter un domaine (environ 10€/an)
3. Utiliser un certificat auto-signé (⚠️ avertissement navigateur)

