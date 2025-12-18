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

    const project = await prisma.project.findFirst({
      where: { id, userId },
      include: {
        category: true,
        tags: true,
        tasks: { orderBy: { order: 'asc' } },
        notes: true,
        chapters: { orderBy: { order: 'asc' } },
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
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

    const existingProject = await prisma.project.findFirst({
      where: { id, userId },
    })

    if (!existingProject) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
    }

    const { tagIds, categoryId, ...projectData } = body

    const project = await prisma.project.update({
      where: { id },
      data: {
        name: projectData.name,
        description: projectData.description || null,
        type: projectData.type,
        status: projectData.status,
        priority: projectData.priority,
        progress: projectData.progress,
        targetWords: projectData.targetWords || null,
        wordCount: projectData.wordCount || 0,
        pageCount: projectData.pageCount || 0,
        targetPages: projectData.targetPages || null,
        coverColor: projectData.coverColor || null,
        genre: projectData.genre || null,
        author: projectData.author || null,
        isbn: projectData.isbn || null,
        content: projectData.content || null,
        startDate: projectData.startDate ? new Date(projectData.startDate) : null,
        endDate: projectData.endDate ? new Date(projectData.endDate) : null,
        categoryId: categoryId || null,
        tags: tagIds ? {
          set: tagIds.map((tagId: string) => ({ id: tagId })),
        } : { set: [] },
      },
      include: {
        category: true,
        tags: true,
        tasks: true,
      },
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
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

    const existingProject = await prisma.project.findFirst({
      where: { id, userId },
    })

    if (!existingProject) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
    }

    await prisma.project.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}

