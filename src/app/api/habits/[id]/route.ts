import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth-clerk'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting habit:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

