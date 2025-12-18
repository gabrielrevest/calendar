# 🔑 Ajouter une clé SSH à DigitalOcean

## ✅ Votre clé SSH a été créée

La clé a été déplacée vers :
- **Clé privée** : `C:\Users\lerev\.ssh\id_ed25519` (ne JAMAIS partager)
- **Clé publique** : `C:\Users\lerev\.ssh\id_ed25519.pub` (à ajouter à DigitalOcean)

## 📋 Étapes pour ajouter la clé à DigitalOcean

### 1. Copier le contenu de la clé publique

Le contenu de votre clé publique est affiché ci-dessus. Il ressemble à :
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... votre-email@example.com
```

### 2. Aller sur DigitalOcean

1. Aller sur https://cloud.digitalocean.com/account/security
2. Cliquer sur **"Add SSH Key"** ou **"Add New SSH Key"**
3. Dans le champ **"SSH Key Content"** :
   - Coller TOUT le contenu de `id_ed25519.pub`
   - Format attendu : `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... comment`
4. Dans le champ **"SSH Key Name"** :
   - Donner un nom (ex: "Mon PC Windows")
5. Cliquer sur **"Add SSH Key"**

### 3. Vérifier le format

DigitalOcean attend le format :
```
type key [comment]
```

Par exemple :
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... lerev@Mattéo_Camorra
```

⚠️ **Important** :
- Copier TOUTE la ligne (depuis `ssh-ed25519` jusqu'à la fin)
- Ne pas ajouter d'espaces ou de retours à la ligne
- Le commentaire à la fin (après l'espace) est optionnel mais recommandé

### 4. Utiliser la clé lors de la création du Droplet

Lors de la création du Droplet :
1. Dans la section **"Authentication"**
2. Sélectionner **"SSH keys"**
3. Cocher votre clé (celle que vous venez d'ajouter)
4. Créer le Droplet

## 🔍 Vérification

Pour vérifier que votre clé est correcte :
```bash
# Afficher la clé publique
cat C:\Users\lerev\.ssh\id_ed25519.pub
```

La ligne doit commencer par `ssh-ed25519` et contenir une longue chaîne de caractères.

## ⚠️ Erreur "Key invalid"

Si DigitalOcean affiche "Key invalid, key should be of the format `type key [comment]`" :

1. **Vérifier que vous copiez TOUTE la ligne** (depuis le début jusqu'à la fin)
2. **Ne pas ajouter d'espaces** au début ou à la fin
3. **Vérifier qu'il n'y a pas de retours à la ligne** dans le champ
4. **Le format doit être** : `ssh-ed25519 [longue-chaîne] [commentaire-optionnel]`

## 🚀 Après l'ajout

Une fois la clé ajoutée, vous pourrez vous connecter au serveur avec :
```bash
ssh root@VOTRE_IP_DROPLET
```

Sans avoir besoin de mot de passe !

