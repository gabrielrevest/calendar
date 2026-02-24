import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth-clerk'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const calendars = await prisma.calendar.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    })

    // Si aucun calendrier, créer les calendriers par défaut
    if (calendars.length === 0) {
      const defaultCalendars = [
        { name: 'Personnel', color: '#3B82F6', isDefault: true },
        { name: 'Professionnel', color: '#22C55E', isDefault: true },
        { name: 'Famille', color: '#EC4899', isDefault: true },
      ]

      const created = await Promise.all(
        defaultCalendars.map((cal) =>
          prisma.calendar.create({
            data: {
              ...cal,
              userId,
            },
          })
        )
      )

      return NextResponse.json(created)
    }

    return NextResponse.json(calendars)
  } catch (error) {
    console.error('Error fetching calendars:', error)
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
    const { name, color } = body

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 })
    }

    const calendar = await prisma.calendar.create({
      data: {
        name: name.trim(),
        color: color || '#3B82F6',
        userId,
      },
    })

    return NextResponse.json(calendar)
  } catch (error) {
    console.error('Error creating calendar:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}


