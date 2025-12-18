import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
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

