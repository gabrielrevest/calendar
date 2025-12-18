import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

/**
 * Synchronise l'utilisateur Clerk avec Prisma et retourne l'ID Prisma
 * CRITIQUE: Cette fonction garantit que chaque utilisateur Clerk a un User Prisma unique
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return null
    }

    // Récupérer les infos de l'utilisateur Clerk
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return null
    }

    // Chercher ou créer l'utilisateur Prisma correspondant
    const prismaUser = await prisma.user.upsert({
      where: { clerkId: clerkUserId },
      update: {
        // Mettre à jour les infos si elles ont changé
        name: clerkUser.fullName || clerkUser.firstName || null,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        image: clerkUser.imageUrl || null,
        emailVerified: clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.verification?.status === 'verified' 
          ? new Date() 
          : null,
      },
      create: {
        clerkId: clerkUserId,
        name: clerkUser.fullName || clerkUser.firstName || null,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        image: clerkUser.imageUrl || null,
        emailVerified: clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.verification?.status === 'verified' 
          ? new Date() 
          : null,
      },
    })

    return prismaUser.id
  } catch (error) {
    console.error('Error getting/syncing user ID from Clerk:', error)
    return null
  }
}

/**
 * Helper function to get user info (similar to old session)
 */
export async function getCurrentUser() {
  try {
    const prismaUserId = await getCurrentUserId()
    if (!prismaUserId) return null
    
    return {
      id: prismaUserId,
    }
  } catch (error) {
    console.error('Error getting user from Clerk:', error)
    return null
  }
}

