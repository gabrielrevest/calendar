import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
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


