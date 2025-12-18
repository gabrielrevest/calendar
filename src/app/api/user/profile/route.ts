import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name },
    })

    return NextResponse.json({ name: user.name })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}


