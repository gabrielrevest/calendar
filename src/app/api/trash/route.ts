import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Pour l'instant, on retourne un tableau vide
    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching trash:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

