import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth-clerk'
import { prisma } from '@/lib/prisma'
import { eventSchema } from '@/lib/validations/event'

export async function GET() {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const events = await prisma.event.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        allDay: true,
        location: true,
        userId: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        reminders: {
          select: {
            id: true,
            minutesBefore: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
    })

    return NextResponse.json(Array.isArray(events) ? events : [])
  } catch (error) {
    console.error('Error fetching events:', error)
    // Retourner un tableau vide en cas d'erreur pour éviter les crashes
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    
    // Convertir les dates ISO en objets Date
    const dataToValidate = {
      ...body,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    }

    const validatedData = eventSchema.parse(dataToValidate)
    const { tagIds, reminders, categoryId, ...eventData } = validatedData

    // Vérifier que l'utilisateur existe (Clerk le crée automatiquement lors de la connexion)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé. Veuillez vous reconnecter.' }, { status: 404 })
    }

    // Valider categoryId si fourni
    let validCategoryId: string | null = null
    if (categoryId && categoryId !== '' && categoryId !== 'null' && categoryId !== 'undefined') {
      try {
        const category = await prisma.category.findFirst({
          where: { id: categoryId, userId },
        })
        if (category) {
          validCategoryId = categoryId
        } else {
          console.log(`Category ${categoryId} not found for user ${userId}`)
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
        if (validTagIds.length !== tagIds.length) {
          console.log(`Some tags not found. Requested: ${tagIds.length}, Found: ${validTagIds.length}`)
        }
      } catch (error) {
        console.error('Error validating tags:', error)
      }
    }

    // Préparer les données sans les champs optionnels problématiques
    const eventDataToCreate: any = {
      title: eventData.title,
      description: eventData.description || null,
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      allDay: eventData.allDay || false,
      location: eventData.location || null,
      userId,
    }

    // Ajouter categoryId seulement si valide
    if (validCategoryId) {
      eventDataToCreate.categoryId = validCategoryId
    }

    // Ajouter tags seulement si valides et non vide
    if (validTagIds && validTagIds.length > 0) {
      eventDataToCreate.tags = {
        connect: validTagIds.map((id) => ({ id })),
      }
    }

    // Ajouter reminders seulement si valides
    if (reminders && Array.isArray(reminders) && reminders.length > 0) {
      eventDataToCreate.reminders = {
        create: reminders.map((minutes: number) => ({ 
          minutesBefore: minutes,
          userId,
        })),
      }
    }

    const event = await prisma.event.create({
      data: eventDataToCreate,
      include: {
        category: true,
        tags: true,
        reminders: true,
      },
    })

    return NextResponse.json(event)
  } catch (error: any) {
    console.error('Error creating event:', error)
    // Si c'est une erreur de validation Prisma, retourner 400
    if (error.code === 'P2002' || error.code === 'P2003') {
      return NextResponse.json({ error: 'Erreur de validation', details: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erreur lors de la création', details: error.message }, { status: 500 })
  }
}




