import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format, eachDayOfInterval } from 'date-fns'
import { fr } from 'date-fns/locale'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    if (!start || !end) {
      return NextResponse.json({ error: 'Dates requises' }, { status: 400 })
    }

    const startDate = new Date(start)
    const endDate = new Date(end)

    // Compter les événements
    const eventsCount = await prisma.event.count({
      where: {
        userId: session.user.id,
        startDate: { gte: startDate, lte: endDate },
      },
    })

    // Compter les tâches complétées
    const completedTasks = await prisma.task.count({
      where: {
        project: { userId: session.user.id },
        completed: true,
        updatedAt: { gte: startDate, lte: endDate },
      },
    })

    // Données quotidiennes
    const days = eachDayOfInterval({ start: startDate, end: endDate })
    const dailyData = await Promise.all(
      days.map(async (day) => {
        const dayStart = new Date(day)
        dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(day)
        dayEnd.setHours(23, 59, 59, 999)

        const events = await prisma.event.count({
          where: {
            userId: session.user.id,
            startDate: { gte: dayStart, lte: dayEnd },
          },
        })

        const tasks = await prisma.task.count({
          where: {
            project: { userId: session.user.id },
            completed: true,
            updatedAt: { gte: dayStart, lte: dayEnd },
          },
        })

        return {
          day: format(day, 'EEE', { locale: fr }),
          events,
          tasks,
        }
      })
    )

    // Données par catégorie
    const eventsByCategory = await prisma.event.groupBy({
      by: ['categoryId'],
      where: {
        userId: session.user.id,
        startDate: { gte: startDate, lte: endDate },
      },
      _count: true,
    })

    const categories = await prisma.category.findMany({
      where: { userId: session.user.id },
    })

    const categoryData = eventsByCategory.map((item) => {
      const category = categories.find((c) => c.id === item.categoryId)
      return {
        name: category?.name || 'Sans catégorie',
        value: item._count,
        color: category?.color || '#3B82F6',
      }
    })

    return NextResponse.json({
      eventsCount,
      completedTasks,
      hoursWorked: 0, // À calculer avec le timer
      goalsAchieved: 0, // À implémenter
      dailyData,
      categoryData,
    })
  } catch (error) {
    console.error('Error generating weekly report:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

