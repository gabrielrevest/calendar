import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Pour l'instant, on retourne juste un succès
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting time block:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

