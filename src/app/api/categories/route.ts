import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth-clerk'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(Array.isArray(categories) ? categories : [])
  } catch (error) {
    console.error('Error fetching categories:', error)
    // Retourner un tableau vide en cas d'erreur pour éviter les crashes
    return NextResponse.json([])
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

    if (!body.type) {
      return NextResponse.json({ error: 'Le type est requis' }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name: body.name.trim(),
        type: body.type,
        color: body.color || null,
        userId,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
  }
}




