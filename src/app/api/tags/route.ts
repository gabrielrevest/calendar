import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth-clerk'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const tags = await prisma.tag.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()

    if (!body.name || body.name.trim() === '') {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 })
    }

    const tag = await prisma.tag.create({
      data: {
        name: body.name.trim(),
        color: body.color || null,
        userId,
      },
    })

    return NextResponse.json(tag)
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
  }
}




