import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth-clerk'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name },
    })

    return NextResponse.json({ name: user.name })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}


