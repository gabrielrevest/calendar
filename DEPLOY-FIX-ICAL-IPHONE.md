# 🔧 Correction : Safari ne peut pas télécharger le fichier iCal

## ⚠️ Problème

Safari sur iPhone affiche : "Safari ne peut pas télécharger ce fichier" quand on essaie d'abonner au calendrier.

## ✅ Solution

Le problème vient des headers HTTP de l'endpoint iCal. Safari/iPhone a besoin de :
- `Content-Disposition: inline` (pas `attachment`)
- Headers CORS corrects

## 🔄 Mise à jour sur le serveur

```bash
cd /var/www/calendar
git pull
npm run build
pm2 restart calendar-app
```

## 📱 Comment abonner sur iPhone

### Méthode 1 : Via Réglages (Recommandé)

1. Ouvrez **Réglages** sur iPhone
2. Allez dans **Calendrier** → **Comptes**
3. Appuyez sur **Ajouter un compte**
4. Sélectionnez **Autre**
5. Choisissez **Ajouter un calendrier avec abonnement**
6. Collez l'URL : `https://calendar.gabrielrevest.software/api/calendar/ical?token=VOTRE_TOKEN`
7. Appuyez sur **Suivant**
8. Le calendrier sera ajouté

### Méthode 2 : Via Safari (si la méthode 1 ne fonctionne pas)

1. Ouvrez **Safari** sur iPhone
2. Collez l'URL dans la barre d'adresse
3. Appuyez sur **Entrée**
4. Si Safari demande, appuyez sur **Abonner** ou **Télécharger**
5. Le calendrier sera ajouté à l'app Calendrier

### Méthode 3 : Via l'app Mail (alternative)

1. Envoyez-vous l'URL par email
2. Ouvrez l'email sur iPhone
3. Cliquez sur le lien
4. iPhone proposera d'ajouter le calendrier

## 🔍 Vérification

Après avoir ajouté le calendrier :
1. Ouvrez l'app **Calendrier** sur iPhone
2. Vérifiez que le calendrier "Mon Calendrier" apparaît
3. Les événements de votre application web devraient apparaître

## ⚠️ Si ça ne fonctionne toujours pas

1. **Vérifier que l'URL est accessible** :
   - Ouvrir l'URL dans un navigateur desktop
   - Le fichier iCal devrait se télécharger ou s'afficher

2. **Vérifier le token** :
   - Le token doit être valide
   - Régénérer le token si nécessaire depuis `/settings/sync`

3. **Vérifier les headers** :
   ```bash
   curl -I "https://calendar.gabrielrevest.software/api/calendar/ical?token=VOTRE_TOKEN"
   ```
   Doit retourner `Content-Type: text/calendar`

## 📝 Note

L'URL de synchronisation est personnelle et unique. Ne la partagez pas avec d'autres personnes.

