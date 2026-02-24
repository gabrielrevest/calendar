import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth-clerk'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { date } = body

    // Pour l'instant, on retourne juste un succès
    return NextResponse.json({ success: true, date })
  } catch (error) {
    console.error('Error toggling habit:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

