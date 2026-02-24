import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth-clerk'
import { prisma } from '@/lib/prisma'
import { addDays, addWeeks, addMonths, addYears, startOfDay, isSameDay } from 'date-fns'

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { eventId, startDate, endDate } = body

    const parentEvent = await prisma.event.findFirst({
      where: { id: eventId, userId },
    })

    if (!parentEvent || !parentEvent.isRecurring) {
      return NextResponse.json({ error: 'Événement non récurrent' }, { status: 400 })
    }

    const events = []
    let currentDate = new Date(startDate)
    const endRecurrence = endDate 
      ? new Date(endDate) 
      : parentEvent.recurrenceEndDate 
        ? new Date(parentEvent.recurrenceEndDate)
        : null

    let count = 0
    const maxCount = parentEvent.recurrenceCount || 1000

    while (currentDate <= (endRecurrence || new Date('2099-12-31')) && count < maxCount) {
      const eventStart = new Date(parentEvent.startDate)
      eventStart.setFullYear(currentDate.getFullYear())
      eventStart.setMonth(currentDate.getMonth())
      eventStart.setDate(currentDate.getDate())

      const eventEnd = parentEvent.endDate 
        ? (() => {
            const end = new Date(parentEvent.endDate)
            const duration = end.getTime() - parentEvent.startDate.getTime()
            const newEnd = new Date(eventStart)
            newEnd.setTime(newEnd.getTime() + duration)
            return newEnd
          })()
        : null

      events.push({
        title: parentEvent.title,
        description: parentEvent.description,
        startDate: eventStart,
        endDate: eventEnd,
        allDay: parentEvent.allDay,
        location: parentEvent.location,
        userId,
        isRecurring: false,
        parentEventId: parentEvent.id,
      })

      // Calculer la prochaine date
      switch (parentEvent.recurrenceRule) {
        case 'DAILY':
          currentDate = addDays(currentDate, parentEvent.recurrenceInterval || 1)
          break
        case 'WEEKLY':
          currentDate = addWeeks(currentDate, parentEvent.recurrenceInterval || 1)
          break
        case 'MONTHLY':
          currentDate = addMonths(currentDate, parentEvent.recurrenceInterval || 1)
          break
        case 'YEARLY':
          currentDate = addYears(currentDate, parentEvent.recurrenceInterval || 1)
          break
        default:
          currentDate = addDays(currentDate, 1)
      }

      count++
    }

    // Créer tous les événements
    const created = await prisma.event.createMany({
      data: events,
    })

    return NextResponse.json({ created: created.count, events })
  } catch (error: any) {
    console.error('Error generating recurring events:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}


