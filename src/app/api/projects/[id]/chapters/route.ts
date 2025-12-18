import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const chapters = await prisma.chapter.findMany({
      where: {
        projectId: params.id,
        project: {
          userId: session.user.id,
        },
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(chapters)
  } catch (error) {
    console.error('Error fetching chapters:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { title, order } = body

    // Vérifier que le projet appartient à l'utilisateur
    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
    }

    const chapter = await prisma.chapter.create({
      data: {
        title,
        order: order ?? 0,
        projectId: params.id,
      },
    })

    return NextResponse.json(chapter)
  } catch (error) {
    console.error('Error creating chapter:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}


