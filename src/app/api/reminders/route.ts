import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { eventId, reminders } = body // reminders: [{ minutes: 60 }, { minutes: 1440 }, ...]

    if (!eventId) {
      return NextResponse.json({ error: 'eventId requis' }, { status: 400 })
    }

    // Supprimer les anciens rappels
    await prisma.reminder.deleteMany({
      where: { eventId },
    })

    // Créer les nouveaux rappels seulement si fournis
    let created: any[] = []
    if (reminders && Array.isArray(reminders) && reminders.length > 0) {
      created = await Promise.all(
        reminders.map((reminder: { minutes: number }) =>
          prisma.reminder.create({
            data: {
              eventId,
              minutesBefore: reminder.minutes || reminder,
              userId: session.user.id,
            },
          })
        )
      )
    }

    return NextResponse.json(created)
  } catch (error) {
    console.error('Error creating reminders:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}


