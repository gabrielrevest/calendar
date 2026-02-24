import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth-clerk'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // TODO: Récupérer le chemin du fichier depuis la base de données
    // Pour l'instant, on retourne juste un succès
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}


