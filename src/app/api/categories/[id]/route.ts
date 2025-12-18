import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    const existingCategory = await prisma.category.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 })
    }

    await prisma.category.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const existingCategory = await prisma.category.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 })
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: body.name,
        color: body.color,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Erreur lors de la modification' }, { status: 500 })
  }
}




