# 🔒 Commandes pour installer SSL sur le serveur

## ✅ DNS déjà configuré !

Le sous-domaine `calendar.gabrielrevest.software` pointe vers `157.245.69.178`.

## 🚀 Commandes à exécuter sur le serveur

### 1. Installer Certbot

```bash
apt update
apt install -y certbot python3-certbot-nginx
```

### 2. Obtenir le certificat SSL

```bash
certbot --nginx -d calendar.gabrielrevest.software
```

**Réponses aux questions de Certbot :**
- **Email** : Entrer votre email (pour notifications de renouvellement)
- **Terms of Service** : Tapez `A` pour accepter
- **Share email with EFF** : `Y` ou `N` (au choix)
- **Redirect HTTP to HTTPS** : Tapez `2` pour rediriger automatiquement

Certbot va automatiquement :
- Obtenir le certificat SSL
- Configurer Nginx pour HTTPS
- Configurer le renouvellement automatique

### 3. Vérifier la configuration Nginx

```bash
# Vérifier que la configuration est correcte
cat /etc/nginx/sites-available/calendar

# Tester la configuration
nginx -t

# Si tout est OK, redémarrer Nginx
systemctl restart nginx
```

### 4. Mettre à jour ecosystem.config.js

```bash
cd /var/www/calendar
nano ecosystem.config.js
```

Mettre à jour les variables d'environnement pour utiliser HTTPS :

```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3000,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_bW9kZXN0LXJlZGJpcmQtMjAuY2xlcmsuYWNjb3VudHMuZGV2JA',
  CLERK_SECRET_KEY: 'sk_test_VFN0XYMl2fqTFRTrGYyUDDq5YVzObBsnNR5eF6LDYr',
  DATABASE_URL: 'file:./prisma/database.db',
  // Mettre à jour avec HTTPS
  AUTH_URL: 'https://calendar.gabrielrevest.software',
  AUTH_TRUST_HOST: 'true',
  NEXTAUTH_URL: 'https://calendar.gabrielrevest.software'
}
```

Sauvegarder : `Ctrl+O`, `Enter`, puis `Ctrl+X`

### 5. Redémarrer PM2

```bash
pm2 stop calendar-app
pm2 delete calendar-app
pm2 start ecosystem.config.js
pm2 save
pm2 logs calendar-app --lines 20
```

### 6. Vérifier que HTTPS fonctionne

```bash
# Tester depuis le serveur
curl -I https://calendar.gabrielrevest.software

# Vérifier le certificat
openssl s_client -connect calendar.gabrielrevest.software:443 -servername calendar.gabrielrevest.software
```

### 7. Configurer Clerk Dashboard

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

### 8. Ouvrir dans le navigateur

Ouvrir : **https://calendar.gabrielrevest.software**

Vous devriez voir :
- ✅ Le cadenas vert (certificat SSL valide)
- ✅ L'application qui se charge
- ✅ Plus d'erreurs Clerk

## 🔄 Renouvellement automatique

Le certificat SSL est valide pour 90 jours et se renouvelle automatiquement. Vérifier :

```bash
# Tester le renouvellement
certbot renew --dry-run

# Vérifier le timer systemd
systemctl status certbot.timer
```

## ⚠️ En cas de problème

### Si Certbot échoue

```bash
# Vérifier que le DNS est bien propagé
nslookup calendar.gabrielrevest.software

# Vérifier que Nginx écoute sur le port 80
netstat -tulpn | grep :80

# Vérifier les logs Certbot
tail -f /var/log/letsencrypt/letsencrypt.log
```

### Si Nginx ne démarre pas

```bash
# Vérifier la configuration
nginx -t

# Voir les erreurs
journalctl -u nginx -n 50
```

### Si l'application ne charge pas

```bash
# Vérifier que PM2 tourne
pm2 status

# Voir les logs
pm2 logs calendar-app --lines 50

# Vérifier que le port 3000 écoute
netstat -tulpn | grep :3000
```

## ✅ Checklist finale

- [ ] Certbot installé
- [ ] Certificat SSL obtenu
- [ ] Nginx configuré pour HTTPS
- [ ] ecosystem.config.js mis à jour avec HTTPS
- [ ] PM2 redémarré
- [ ] Clerk Dashboard configuré avec le domaine
- [ ] Application accessible sur https://calendar.gabrielrevest.software
- [ ] Cadenas vert visible dans le navigateur

