import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Pour l'instant, on retourne un tableau vide
    // Plus tard, on pourra stocker les habitudes en base
    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching habits:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    const colors = ['#3B82F6', '#22C55E', '#8B5CF6', '#EC4899', '#F97316', '#EAB308']
    const habit = {
      id: `habit-${Date.now()}`,
      name,
      color: colors[Math.floor(Math.random() * colors.length)],
      completions: [],
    }

    return NextResponse.json(habit)
  } catch (error) {
    console.error('Error creating habit:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

