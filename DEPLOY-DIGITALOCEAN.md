# 🚀 Guide de Déploiement DigitalOcean

## Prérequis

- Compte DigitalOcean avec crédits gratuits
- Domaine (optionnel, peut utiliser IP)
- Accès SSH

## Étape 1 : Créer un Droplet

1. Aller sur [DigitalOcean](https://www.digitalocean.com/)
2. Créer un nouveau Droplet
3. Configuration recommandée :
   - **Image** : Ubuntu 22.04 LTS
   - **Plan** : Basic - $6/mois (1GB RAM, 1 vCPU)
   - **Datacenter** : Proche de vous
   - **Authentication** : SSH keys (recommandé)
4. Créer le Droplet

## Étape 2 : Configuration Initiale

```bash
# Se connecter au serveur
ssh root@VOTRE_IP

# Mettre à jour le système
apt update && apt upgrade -y

# Installer Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Vérifier l'installation
node --version
npm --version

# Installer PM2 (gestionnaire de processus)
npm install -g pm2

# Installer Nginx
apt install -y nginx

# Installer Git
apt install -y git
```

## Étape 3 : Déployer l'Application

```bash
# Créer un utilisateur pour l'application
adduser calendrier
usermod -aG sudo calendrier
su - calendrier

# Cloner le repository (ou transférer les fichiers)
git clone VOTRE_REPO calendrier
cd calendrier

# Installer les dépendances
npm install

# Build l'application
npm run build

# Créer un fichier .env
nano .env
```

Contenu du `.env` :
```env
DATABASE_URL="file:./prisma/database.db"
NEXTAUTH_URL="http://VOTRE_IP:3000"
NEXTAUTH_SECRET="GENERER_UNE_CLE_SECRETE"
NODE_ENV=production
PORT=3000
```

```bash
# Initialiser la base de données
npx prisma db push

# Démarrer avec PM2
pm2 start npm --name "calendrier" -- start
pm2 save
pm2 startup
```

## Étape 4 : Configurer Nginx

```bash
# Créer la configuration Nginx
nano /etc/nginx/sites-available/calendrier
```

Contenu :
```nginx
server {
    listen 80;
    server_name VOTRE_IP_OU_DOMAINE;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activer le site
ln -s /etc/nginx/sites-available/calendrier /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Tester la configuration
nginx -t

# Redémarrer Nginx
systemctl restart nginx
```

## Étape 5 : SSL avec Let's Encrypt (Optionnel mais Recommandé)

```bash
# Installer Certbot
apt install -y certbot python3-certbot-nginx

# Obtenir un certificat SSL
certbot --nginx -d VOTRE_DOMAINE

# Renouvellement automatique
certbot renew --dry-run
```

## Étape 6 : Configuration Firewall

```bash
# Autoriser SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

## Étape 7 : Monitoring

```bash
# Voir les logs PM2
pm2 logs calendrier

# Voir le statut
pm2 status

# Redémarrer l'application
pm2 restart calendrier

# Voir les logs Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Étape 8 : Backup Automatique

```bash
# Créer un script de backup
nano /home/calendrier/backup.sh
```

Contenu :
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/calendrier/backups"
mkdir -p $BACKUP_DIR
cp /home/calendrier/calendrier/prisma/database.db $BACKUP_DIR/database_$DATE.db
# Garder seulement les 7 derniers backups
ls -t $BACKUP_DIR/database_*.db | tail -n +8 | xargs rm -f
```

```bash
# Rendre exécutable
chmod +x /home/calendrier/backup.sh

# Ajouter au crontab (backup quotidien à 2h du matin)
crontab -e
# Ajouter : 0 2 * * * /home/calendrier/backup.sh
```

## Commandes Utiles

```bash
# Redémarrer l'application
pm2 restart calendrier

# Voir les logs en temps réel
pm2 logs calendrier

# Arrêter l'application
pm2 stop calendrier

# Redémarrer Nginx
systemctl restart nginx

# Voir le statut Nginx
systemctl status nginx
```

## Mise à Jour de l'Application

```bash
cd /home/calendrier/calendrier
git pull
npm install
npm run build
npx prisma db push
pm2 restart calendrier
```

## Coûts Estimés

- **Droplet Basic** : $6/mois
- **Domaine** : ~$10/an (optionnel)
- **Total** : ~$6-7/mois

## Support

En cas de problème :
1. Vérifier les logs : `pm2 logs calendrier`
2. Vérifier Nginx : `systemctl status nginx`
3. Vérifier les ports : `netstat -tulpn | grep :3000`
4. Vérifier les permissions : `ls -la /home/calendrier/calendrier`

---

**Déploiement prêt ! 🚀**

