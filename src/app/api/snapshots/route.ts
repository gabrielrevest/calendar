import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth-clerk'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'

export async function GET() {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Pour l'instant, on retourne un tableau vide
    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching snapshots:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Créer un snapshot de l'état actuel
    const snapshot = {
      id: `snapshot-${Date.now()}`,
      date: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      data: {}, // À remplir avec les données actuelles
    }

    return NextResponse.json(snapshot)
  } catch (error) {
    console.error('Error creating snapshot:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

