import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth-clerk'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    const event = await prisma.event.findFirst({
      where: { id, userId },
      include: {
        category: true,
        tags: true,
        reminders: true,
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const existingEvent = await prisma.event.findFirst({
      where: { id, userId },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 })
    }

    const { tagIds, reminders, categoryId, ...eventData } = body

    // Supprimer les anciens reminders
    await prisma.reminder.deleteMany({ where: { eventId: id } })

    // Valider categoryId si fourni
    let validCategoryId: string | null = null
    if (categoryId && categoryId !== '' && categoryId !== 'null' && categoryId !== 'undefined') {
      try {
        const category = await prisma.category.findFirst({
          where: { id: categoryId, userId },
        })
        if (category) {
          validCategoryId = categoryId
        }
      } catch (error) {
        console.error('Error validating category:', error)
      }
    }

    // Valider tagIds si fournis
    let validTagIds: string[] = []
    if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
      try {
        const existingTags = await prisma.tag.findMany({
          where: {
            id: { in: tagIds },
            userId,
          },
          select: { id: true },
        })
        validTagIds = existingTags.map(tag => tag.id)
      } catch (error) {
        console.error('Error validating tags:', error)
      }
    }

    // Préparer les données
    const updateData: any = {
      ...eventData,
      startDate: eventData.startDate ? new Date(eventData.startDate) : undefined,
      endDate: eventData.endDate ? new Date(eventData.endDate) : undefined,
    }

    // Ajouter categoryId seulement si valide
    if (validCategoryId !== null) {
      updateData.categoryId = validCategoryId
    } else if (categoryId === null || categoryId === '') {
      updateData.categoryId = null
    }

    // Gérer les tags
    if (validTagIds.length > 0) {
      updateData.tags = {
        set: validTagIds.map((tagId: string) => ({ id: tagId })),
      }
    } else if (tagIds && Array.isArray(tagIds) && tagIds.length === 0) {
      // Si tagIds est un tableau vide, supprimer tous les tags
      updateData.tags = { set: [] }
    }

    // Ajouter reminders seulement si valides
    if (reminders && Array.isArray(reminders) && reminders.length > 0) {
      updateData.reminders = {
        create: reminders.map((minutes: number) => ({ 
          minutesBefore: minutes,
          userId,
        })),
      }
    }

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        tags: true,
        reminders: true,
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ error: 'Erreur lors de la modification' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    const existingEvent = await prisma.event.findFirst({
      where: { id, userId },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 })
    }

    await prisma.event.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}




