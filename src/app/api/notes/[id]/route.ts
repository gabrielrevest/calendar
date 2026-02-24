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

    const note = await prisma.note.findFirst({
      where: { id, userId },
      include: {
        category: true,
        tags: true,
        project: true,
      },
    })

    if (!note) {
      return NextResponse.json({ error: 'Note non trouvée' }, { status: 404 })
    }

    return NextResponse.json(note)
  } catch (error) {
    console.error('Error fetching note:', error)
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

    const existingNote = await prisma.note.findFirst({
      where: { id, userId },
    })

    if (!existingNote) {
      return NextResponse.json({ error: 'Note non trouvée' }, { status: 404 })
    }

    const { tagIds, categoryId, projectId, ...noteData } = body

    const note = await prisma.note.update({
      where: { id },
      data: {
        ...noteData,
        linkedDate: noteData.linkedDate ? new Date(noteData.linkedDate) : null,
        categoryId: categoryId || null,
        projectId: projectId || null,
        tags: tagIds ? {
          set: tagIds.map((tagId: string) => ({ id: tagId })),
        } : { set: [] },
      },
      include: {
        category: true,
        tags: true,
        project: true,
      },
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error('Error updating note:', error)
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

    const existingNote = await prisma.note.findFirst({
      where: { id, userId },
    })

    if (!existingNote) {
      return NextResponse.json({ error: 'Note non trouvée' }, { status: 404 })
    }

    await prisma.note.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}




