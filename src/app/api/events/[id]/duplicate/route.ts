import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth-clerk'
import { prisma } from '@/lib/prisma'

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
    const { title, includeRelations } = body

    const original = await prisma.event.findUnique({
      where: { id: params.id },
      include: { tags: true, reminders: true },
    })

    if (!original || original.userId !== userId) {
      return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })
    }

    const duplicated = await prisma.event.create({
      data: {
        title: title || `${original.title} (Copie)`,
        description: original.description,
        startDate: original.startDate,
        endDate: original.endDate,
        allDay: original.allDay,
        location: original.location,
        userId,
        categoryId: original.categoryId,
        ...(includeRelations && {
          tags: {
            connect: original.tags.map((tag) => ({ id: tag.id })),
          },
        }),
      },
    })

    return NextResponse.json(duplicated)
  } catch (error) {
    console.error('Error duplicating event:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

