import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const now = new Date()
    const startOfCurrentMonth = startOfMonth(now)
    const endOfCurrentMonth = endOfMonth(now)

    // Total events
    const totalEvents = await prisma.event.count({
      where: { userId: session.user.id },
    })

    // Events this month
    const eventsThisMonth = await prisma.event.count({
      where: {
        userId: session.user.id,
        startDate: {
          gte: startOfCurrentMonth,
          lte: endOfCurrentMonth,
        },
      },
    })

    // Events by month (last 6 months)
    const eventsByMonth = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i))
      const monthEnd = endOfMonth(subMonths(now, i))
      const count = await prisma.event.count({
        where: {
          userId: session.user.id,
          startDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      })
      eventsByMonth.push({
        month: format(monthStart, 'MMM yyyy'),
        count,
      })
    }

    // Projects
    const totalProjects = await prisma.project.count({
      where: { userId: session.user.id },
    })

    const activeProjects = await prisma.project.count({
      where: {
        userId: session.user.id,
        status: { in: ['PLANNING', 'IN_PROGRESS'] },
      },
    })

    // Projects by type
    const projectsByType = await prisma.project.groupBy({
      by: ['type'],
      where: { userId: session.user.id },
      _count: true,
    })

    // Notes
    const totalNotes = await prisma.note.count({
      where: { userId: session.user.id },
    })

    const notesThisMonth = await prisma.note.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startOfCurrentMonth,
          lte: endOfCurrentMonth,
        },
      },
    })

    // Words written (from projects and journal)
    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      select: { wordCount: true, content: true },
    })

    // Journal entries - vérifier si la table existe
    let journalEntries: any[] = []
    try {
      journalEntries = await prisma.journalEntry.findMany({
        where: { userId: session.user.id },
        select: { content: true },
      })
    } catch (error) {
      // Table n'existe pas encore, ignorer
      console.log('JournalEntry table not found, skipping')
    }

    const projectWords = projects.reduce((sum, p) => sum + (p.wordCount || 0), 0)
    const journalWords = journalEntries.reduce(
      (sum, e) => sum + (e.content?.split(/\s+/).length || 0),
      0
    )
    const totalWords = projectWords + journalWords

    const projectsThisMonth = await prisma.project.findMany({
      where: {
        userId: session.user.id,
        updatedAt: {
          gte: startOfCurrentMonth,
          lte: endOfCurrentMonth,
        },
      },
      select: { wordCount: true },
    })

    const journalThisMonth = await prisma.journalEntry.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startOfCurrentMonth,
          lte: endOfCurrentMonth,
        },
      },
      select: { content: true },
    })

    const wordsThisMonth =
      projectsThisMonth.reduce((sum, p) => sum + (p.wordCount || 0), 0) +
      journalThisMonth.reduce((sum, e) => sum + (e.content?.split(/\s+/).length || 0), 0)

    // Book progress
    const books = await prisma.project.findMany({
      where: {
        userId: session.user.id,
        type: 'BOOK',
        targetWords: { not: null },
      },
      select: {
        id: true,
        name: true,
        wordCount: true,
        targetWords: true,
      },
    })

    const bookProgress = books.map((book) => ({
      id: book.id,
      name: book.name,
      wordCount: book.wordCount || 0,
      targetWords: book.targetWords || 0,
      progress: book.targetWords
        ? Math.min(100, Math.round(((book.wordCount || 0) / book.targetWords) * 100))
        : 0,
    }))

    return NextResponse.json({
      totalEvents,
      eventsThisMonth,
      eventsByMonth,
      totalProjects,
      activeProjects,
      projectsByType: projectsByType.map((p) => ({
        type: p.type,
        count: p._count,
      })),
      totalNotes,
      notesThisMonth,
      totalWords,
      wordsThisMonth,
      bookProgress,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}


