import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { ids, action, targetCategory } = body

    if (action === 'delete') {
      await prisma.event.deleteMany({
        where: {
          id: { in: ids },
          userId: session.user.id,
        },
      })
    } else if (action === 'move' && targetCategory) {
      await prisma.event.updateMany({
        where: {
          id: { in: ids },
          userId: session.user.id,
        },
        data: {
          categoryId: targetCategory,
        },
      })
    }

    return NextResponse.json({ success: true, count: ids.length })
  } catch (error) {
    console.error('Error performing bulk action:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

