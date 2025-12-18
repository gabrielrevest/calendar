# Guide de Migration vers Clerk

## ✅ Ce qui a été fait

1. ✅ Installation de `@clerk/nextjs`
2. ✅ Création de `src/proxy.ts` avec `clerkMiddleware()`
3. ✅ Wrapper de `app/layout.tsx` avec `<ClerkProvider>`
4. ✅ Migration de la page de connexion vers les composants Clerk
5. ✅ Création de `src/lib/auth-clerk.ts` avec `getCurrentUserId()`
6. ✅ Migration de `src/app/api/events/route.ts` (exemple)

## 🔄 À faire : Migration des routes API

Tous les fichiers API qui utilisent `getSession()` doivent être migrés.

### Pattern de migration

**Avant (NextAuth):**
```typescript
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  // Utilisation: session.user.id
  const data = await prisma.event.findMany({
    where: { userId: session.user.id }
  })
}
```

**Après (Clerk):**
```typescript
import { getCurrentUserId } from '@/lib/auth-clerk'

export async function GET() {
  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  // Utilisation: userId directement
  const data = await prisma.event.findMany({
    where: { userId }
  })
}
```

### Fichiers à migrer

Tous les fichiers dans `src/app/api/` qui contiennent `getSession` doivent être mis à jour :

- `src/app/api/projects/route.ts`
- `src/app/api/notes/route.ts`
- `src/app/api/categories/route.ts`
- `src/app/api/tags/route.ts`
- `src/app/api/reminders/route.ts`
- `src/app/api/journal/route.ts`
- ... et tous les autres fichiers API

### Remplacements à faire

1. Remplacer l'import :
   ```typescript
   // Avant
   import { getSession } from '@/lib/auth'
   
   // Après
   import { getCurrentUserId } from '@/lib/auth-clerk'
   ```

2. Remplacer l'utilisation :
   ```typescript
   // Avant
   const session = await getSession()
   if (!session?.user?.id) { ... }
   const userId = session.user.id
   
   // Après
   const userId = await getCurrentUserId()
   if (!userId) { ... }
   // userId est déjà disponible
   ```

3. Remplacer toutes les occurrences de `session.user.id` par `userId`

## 🔧 Configuration

### Variables d'environnement

Créer `.env.local` avec :
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_SECRET_KEY
```

Obtenir les clés depuis : https://dashboard.clerk.com/last-active?path=api-keys

### Configuration Clerk Dashboard

1. Créer un compte sur [clerk.com](https://clerk.com)
2. Créer une nouvelle application
3. Configurer Apple Sign-In dans le dashboard (si nécessaire)
4. Copier les clés API dans `.env.local`

## 📝 Notes importantes

- Clerk gère automatiquement la création des utilisateurs
- L'ID utilisateur de Clerk est différent de l'ID Prisma
- Il faudra peut-être créer un mapping entre Clerk userId et Prisma User
- Les composants Clerk (`<SignInButton>`, `<UserButton>`, etc.) sont prêts à l'emploi

## 🚀 Prochaines étapes

1. Migrer toutes les routes API restantes
2. Tester l'authentification
3. Configurer Apple Sign-In dans Clerk Dashboard
4. Déployer sur DigitalOcean

