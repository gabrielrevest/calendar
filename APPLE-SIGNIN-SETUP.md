# Configuration Sign in with Apple

## Étapes pour configurer Sign in with Apple

### 1. Créer un App ID sur Apple Developer

1. Aller sur [Apple Developer](https://developer.apple.com/)
2. Se connecter avec votre compte Apple
3. Aller dans **Certificates, Identifiers & Profiles**
4. Cliquer sur **Identifiers** → **+** pour créer un nouvel identifiant
5. Sélectionner **App IDs** → **Continue**
6. Choisir **App** → **Continue**
7. Remplir :
   - **Description** : Calendrier & Projets
   - **Bundle ID** : com.votredomaine.calendrier (doit être unique)
8. Cocher **Sign In with Apple** dans les services
9. **Continue** → **Register**

### 2. Créer un Service ID

1. Dans **Identifiers**, créer un nouveau **Services IDs**
2. **Description** : Calendrier Web
3. **Identifier** : com.votredomaine.calendrier.web
4. Cocher **Sign In with Apple**
5. **Configure** → **Primary App ID** : sélectionner votre App ID
6. **Domains and Subdomains** : votre-domaine.com
7. **Return URLs** : 
   - `https://votre-domaine.com/api/auth/callback/apple`
   - `http://localhost:3000/api/auth/callback/apple` (pour dev)
8. **Save** → **Continue** → **Register**

### 3. Créer une Key

1. Dans **Keys** → **+**
2. **Key Name** : Calendrier Sign In Key
3. Cocher **Sign In with Apple**
4. **Configure** → sélectionner votre App ID
5. **Continue** → **Register**
6. **Download** la clé (.p8) - **IMPORTANT** : vous ne pourrez la télécharger qu'une seule fois !
7. Noter le **Key ID**

### 4. Créer un Client Secret

Utiliser ce script Node.js pour générer le client secret :

```javascript
const jwt = require('jsonwebtoken');
const fs = require('fs');

const teamId = 'VOTRE_TEAM_ID'; // Trouvable dans Membership
const clientId = 'com.votredomaine.calendrier.web'; // Votre Service ID
const keyId = 'VOTRE_KEY_ID'; // Le Key ID de l'étape 3
const privateKey = fs.readFileSync('./AuthKey_XXXXXXXXXX.p8'); // Le fichier .p8 téléchargé

const token = jwt.sign(
  {
    iss: teamId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 180, // 6 mois
    aud: 'https://appleid.apple.com',
    sub: clientId,
  },
  privateKey,
  {
    algorithm: 'ES256',
    keyid: keyId,
  }
);

console.log(token);
```

### 5. Configurer les variables d'environnement

Ajouter dans `.env` :

```env
APPLE_ID=com.votredomaine.calendrier.web
APPLE_SECRET=<le token généré à l'étape 4>
```

### 6. Notes importantes

- Le client secret expire après 6 mois, il faudra le régénérer
- Pour la production, utiliser votre domaine réel
- Pour le développement local, utiliser `localhost:3000`
- Le Service ID doit être configuré avec les bonnes URLs de callback

### Alternative : Utiliser un service tiers

Si la configuration Apple est trop complexe, vous pouvez utiliser :
- **Auth0** (supporte Apple)
- **Firebase Auth** (supporte Apple)
- **Supabase Auth** (supporte Apple)

Ces services gèrent la complexité de Sign in with Apple pour vous.

---

**Le code est déjà prêt !** Il suffit d'ajouter les variables d'environnement.

