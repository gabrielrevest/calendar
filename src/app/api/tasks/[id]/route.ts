import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth-clerk'
import { prisma } from '@/lib/prisma'

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

    const existingTask = await prisma.task.findFirst({
      where: { id },
      include: { project: true },
    })

    if (!existingTask || existingTask.project.userId !== userId) {
      return NextResponse.json({ error: 'Tâche non trouvée' }, { status: 404 })
    }

    const { tagIds, ...taskData } = body

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...taskData,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        tags: tagIds ? {
          set: tagIds.map((tagId: string) => ({ id: tagId })),
        } : { set: [] },
      },
      include: { tags: true },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
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

    const existingTask = await prisma.task.findFirst({
      where: { id },
      include: { project: true },
    })

    if (!existingTask || existingTask.project.userId !== userId) {
      return NextResponse.json({ error: 'Tâche non trouvée' }, { status: 404 })
    }

    await prisma.task.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}




