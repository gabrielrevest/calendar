import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth-clerk'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const projects = await prisma.project.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        status: true,
        progress: true,
        startDate: true,
        endDate: true,
        priority: true,
        wordCount: true,
        targetWords: true,
        pageCount: true,
        targetPages: true,
        coverColor: true,
        genre: true,
        author: true,
        isbn: true,
        userId: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
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
        tasks: {
          select: {
            id: true,
            title: true,
            completed: true,
            order: true,
          },
          orderBy: { order: 'asc' },
        },
        chapters: {
          select: {
            id: true,
            title: true,
            order: true,
            wordCount: true,
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    // S'assurer de retourner un tableau même si vide
    return NextResponse.json(Array.isArray(projects) ? projects : [])
  } catch (error: any) {
    console.error('Error fetching projects:', error)
    console.error('Error details:', error.message, error.stack)
    // Retourner un tableau vide en cas d'erreur pour éviter les crashes
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { tagIds, categoryId, ...projectData } = body

    // Vérifier que l'utilisateur existe (getCurrentUserId le crée automatiquement)
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

    // Valider les champs requis
    if (!projectData.name || projectData.name.trim() === '') {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 })
    }

    // Préparer les données sans les champs optionnels problématiques
    const projectDataToCreate: any = {
      name: projectData.name.trim(),
      description: projectData.description || null,
      type: projectData.type || 'PERSONAL',
      status: projectData.status || 'PLANNING',
      priority: projectData.priority || 'NORMAL',
      progress: projectData.progress || 0,
      wordCount: projectData.wordCount !== undefined ? Number(projectData.wordCount) : 0,
      targetWords: projectData.targetWords !== undefined ? Number(projectData.targetWords) : null,
      pageCount: projectData.pageCount !== undefined ? Number(projectData.pageCount) : 0,
      targetPages: projectData.targetPages !== undefined ? Number(projectData.targetPages) : null,
      coverColor: projectData.coverColor || null,
      genre: projectData.genre || null,
      author: projectData.author || null,
      isbn: projectData.isbn || null,
      startDate: projectData.startDate ? new Date(projectData.startDate) : null,
      endDate: projectData.endDate ? new Date(projectData.endDate) : null,
      userId,
    }

    // Ajouter categoryId seulement si valide
    if (validCategoryId) {
      projectDataToCreate.categoryId = validCategoryId
    }

    // Ajouter tags seulement si valides et non vide
    if (validTagIds && validTagIds.length > 0) {
      projectDataToCreate.tags = {
        connect: validTagIds.map((id: string) => ({ id })),
      }
    }

    const project = await prisma.project.create({
      data: projectDataToCreate,
      include: {
        category: true,
        tags: true,
        tasks: true,
      },
    })

    return NextResponse.json(project)
  } catch (error: any) {
    console.error('Error creating project:', error)
    // Si c'est une erreur de validation Prisma, retourner 400
    if (error.code === 'P2002' || error.code === 'P2003') {
      return NextResponse.json({ error: 'Erreur de validation', details: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erreur lors de la création', details: error.message }, { status: 500 })
  }
}

