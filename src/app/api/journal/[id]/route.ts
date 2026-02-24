import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth-clerk'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: params.id,
        userId,
      },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Entrée non trouvée' }, { status: 404 })
    }

    await prisma.journalEntry.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting journal entry:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}


