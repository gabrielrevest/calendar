import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format, startOfYear, endOfYear, eachDayOfInterval } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year') || format(new Date(), 'yyyy')

    const yearStart = startOfYear(new Date(`${year}-01-01`))
    const yearEnd = endOfYear(new Date(`${year}-12-31`))
    const days = eachDayOfInterval({ start: yearStart, end: yearEnd })

    const activityData = await Promise.all(
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

        const notes = await prisma.note.count({
          where: {
            userId: session.user.id,
            createdAt: { gte: dayStart, lte: dayEnd },
          },
        })

        const total = events + tasks + notes
        let level = 0
        if (total > 0) level = 1
        if (total > 3) level = 2
        if (total > 6) level = 3
        if (total > 10) level = 4

        return {
          date: format(day, 'yyyy-MM-dd'),
          level,
          count: total,
        }
      })
    )

    return NextResponse.json(activityData)
  } catch (error) {
    console.error('Error generating heatmap:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

