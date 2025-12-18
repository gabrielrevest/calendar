import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

// Générer ou récupérer le token de calendrier
export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { calendarToken: true },
    })

    if (user?.calendarToken) {
      return NextResponse.json({ token: user.calendarToken })
    }

    // Générer un nouveau token
    const token = randomBytes(32).toString('hex')
    
    try {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { calendarToken: token },
      })
    } catch (error: any) {
      // Si l'utilisateur n'existe pas, retourner quand même le token
      if (error.code === 'P2025') {
        console.log('User not found, token will be created on next user update')
      } else {
        throw error
      }
    }

    return NextResponse.json({ token })
  } catch (error) {
    console.error('Error getting calendar token:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Régénérer le token (invalide l'ancien)
export async function POST() {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const token = randomBytes(32).toString('hex')
    
    try {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { calendarToken: token },
      })
    } catch (error: any) {
      if (error.code === 'P2025') {
        console.log('User not found')
      } else {
        throw error
      }
    }

    return NextResponse.json({ token })
  } catch (error) {
    console.error('Error regenerating calendar token:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}




