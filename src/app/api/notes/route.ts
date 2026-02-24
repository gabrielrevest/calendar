import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth-clerk'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const notes = await prisma.note.findMany({
      where: { userId },
      include: {
        category: true,
        tags: true,
        project: true,
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(Array.isArray(notes) ? notes : [])
  } catch (error) {
    console.error('Error fetching notes:', error)
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
    const { tagIds, categoryId, projectId, ...noteData } = body

    // Vérifier que l'utilisateur existe (PrismaAdapter le crée automatiquement lors de la connexion)
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

    // Valider projectId si fourni
    let validProjectId: string | null = null
    if (projectId && projectId !== '' && projectId !== 'null' && projectId !== 'undefined') {
      try {
        const project = await prisma.project.findFirst({
          where: { 
            id: projectId, 
            userId 
          },
          select: { id: true },
        })
        if (project) {
          validProjectId = projectId
        } else {
          console.log(`Project ${projectId} not found for user ${userId}`)
        }
      } catch (error) {
        console.error('Error validating project:', error)
        // Continuer sans projectId si erreur
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

    // Valider les champs requis
    if (!noteData.title || noteData.title.trim() === '') {
      return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 })
    }

    // Préparer les données sans les champs optionnels problématiques
    const noteDataToCreate: any = {
      title: noteData.title.trim(),
      content: noteData.content || '',
      linkedDate: noteData.linkedDate ? new Date(noteData.linkedDate) : null,
      userId,
    }

    // Ajouter categoryId seulement si valide
    if (validCategoryId) {
      noteDataToCreate.categoryId = validCategoryId
    }

    // Ajouter projectId seulement si valide
    if (validProjectId) {
      noteDataToCreate.projectId = validProjectId
    }

    // Ajouter tags seulement si valides et non vide
    if (validTagIds && validTagIds.length > 0) {
      noteDataToCreate.tags = {
        connect: validTagIds.map((id: string) => ({ id })),
      }
    }

    const note = await prisma.note.create({
      data: noteDataToCreate,
      include: {
        category: true,
        tags: true,
        project: true,
      },
    })

    return NextResponse.json(note)
  } catch (error: any) {
    console.error('Error creating note:', error)
    // Si c'est une erreur de validation Prisma, retourner 400
    if (error.code === 'P2002' || error.code === 'P2003') {
      return NextResponse.json({ error: 'Erreur de validation', details: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erreur lors de la création', details: error.message }, { status: 500 })
  }
}




