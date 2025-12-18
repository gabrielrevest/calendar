# 🔧 Correction des erreurs Prisma

## ⚠️ Problèmes détectés

1. **Prisma 7.2.0 installé** : Version trop récente, incompatible avec notre schéma
2. **npm install non exécuté** : Les dépendances ne sont pas installées

## ✅ Solutions

### 1. Installer les dépendances d'abord

```bash
cd /var/www/calendar
npm install
```

Cela installera Prisma 5.9.1 (version dans package.json) et toutes les autres dépendances.

### 2. Générer Prisma avec la bonne version

```bash
npx prisma generate
```

Si cela ne fonctionne toujours pas, forcer la version :

```bash
npx prisma@5.9.1 generate
```

### 3. Créer la base de données

```bash
npx prisma db push
```

### 4. Build l'application

```bash
npm run build
```

## 🔍 Vérification

Après `npm install`, vérifiez que Prisma est bien installé :

```bash
npx prisma --version
```

Vous devriez voir `5.9.1` ou similaire (pas 7.x).

## 📝 Ordre correct des commandes

```bash
# 1. Installer PM2 (si pas fait)
npm install -g pm2

# 2. Aller dans le dossier
cd /var/www/calendar

# 3. Installer les dépendances (IMPORTANT - à faire en premier)
npm install

# 4. Vérifier Prisma
npx prisma --version

# 5. Générer Prisma
npx prisma generate

# 6. Créer la base de données
npx prisma db push

# 7. Build
npm run build
```

## ⚠️ Si Prisma 7 est toujours utilisé

Forcer l'utilisation de Prisma 5.9.1 :

```bash
# Désinstaller Prisma 7 globalement
npm uninstall -g prisma

# Utiliser la version locale
npx prisma@5.9.1 generate
npx prisma@5.9.1 db push
```

Ou mettre à jour package.json pour forcer la version :

```bash
npm install prisma@5.9.1 @prisma/client@5.9.1 --save-exact
```

